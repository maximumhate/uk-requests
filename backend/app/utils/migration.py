from sqlalchemy import text
from app.database import engine

async def run_auto_migration():
    """
    Automatic migration to fix schema drift (missing columns) on startup.
    Safe to run multiple times.
    """
    print("STARTING AUTO-MIGRATION checking...")
    
    async with engine.begin() as conn:
        try:
            # 1. Check/Add address column to companies
            # We assume postgresql, but generic SQL for ADD COLUMN works in most
            print("Checking companies.address...")
            
            # This relies on the fact that adding a column that exists throws an error in some SQL dialects
            # OR we can use IF NOT EXISTS syntax for Postgres 9.6+
            
            await conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS address VARCHAR(500);"))
            print("MIGRATION: 'address' column check/add completed.")
            
            # 2. Resize phone column
            # Postgres specific type change
            print("Checking companies.phone...")
            await conn.execute(text("ALTER TABLE companies ALTER COLUMN phone TYPE VARCHAR(255);"))
            print("MIGRATION: 'phone' column resize completed.")

        except Exception as e:
            # Check if error is "duplicate column" (if dialect doesn't support IF NOT EXISTS, e.g. SQLite older)
            # But Railway is Postgres.
            if "duplicate column" in str(e).lower():
                print("MIGRATION: Column already exists (caught exception).")
            else:
                print(f"MIGRATION ERROR (Non-critical if API works): {e}")
    
    print("AUTO-MIGRATION FINISHED.")
