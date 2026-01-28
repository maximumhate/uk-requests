from sqlalchemy import text
from app.database import engine

async def run_auto_migration():
    """
    Automatic migration to fix schema drift (missing columns) on startup.
    Safe to run multiple times. Non-fatal if it fails.
    """
    print("STARTING AUTO-MIGRATION checking...")
    
    try:
        async with engine.begin() as conn:
            try:
                # 1. Check/Add address column to companies
                print("Checking companies.address...")
                await conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS address VARCHAR(500);"))
                print("MIGRATION: 'address' column check/add completed.")
                
                # 2. Resize phone column (may fail if already correct size, that's OK)
                print("Checking companies.phone...")
                try:
                    await conn.execute(text("ALTER TABLE companies ALTER COLUMN phone TYPE VARCHAR(255);"))
                    print("MIGRATION: 'phone' column resize completed.")
                except Exception as phone_err:
                    print(f"MIGRATION: phone resize skipped (probably already correct): {phone_err}")

            except Exception as e:
                if "does not exist" in str(e).lower():
                    print("MIGRATION: Table 'companies' does not exist yet. Skipping migration.")
                elif "duplicate column" in str(e).lower():
                    print("MIGRATION: Column already exists (caught exception).")
                else:
                    print(f"MIGRATION WARNING (Non-critical): {e}")
    except Exception as outer_e:
        print(f"MIGRATION SKIPPED (connection issue or DB not ready): {outer_e}")
    
    print("AUTO-MIGRATION FINISHED.")

