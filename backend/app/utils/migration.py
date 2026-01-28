from sqlalchemy import text
from app.database import engine
from app.config import settings
import asyncpg

async def run_auto_migration():
    """
    Automatic migration to fix schema drift (missing columns/enum values) on startup.
    Safe to run multiple times. Non-fatal if it fails.
    """
    print("STARTING AUTO-MIGRATION checking...")
    
    # Step 1: Add enum value using raw asyncpg (requires autocommit, can't be in transaction)
    try:
        print("Checking requeststatus enum for 'cancelled' value...")
        # Get database URL and convert to asyncpg format
        db_url = settings.database_url
        if db_url.startswith("postgresql+asyncpg://"):
            db_url = db_url.replace("postgresql+asyncpg://", "postgresql://")
        
        conn = await asyncpg.connect(db_url)
        try:
            # Check if value already exists
            result = await conn.fetch(
                "SELECT enumlabel FROM pg_enum WHERE enumtypid = 'requeststatus'::regtype AND enumlabel = 'CANCELLED'"
            )
            if not result:
                await conn.execute("ALTER TYPE requeststatus ADD VALUE 'CANCELLED'")
                print("MIGRATION: 'CANCELLED' enum value added to requeststatus.")
            else:
                print("MIGRATION: 'cancelled' enum value already exists.")
        finally:
            await conn.close()
    except Exception as enum_err:
        print(f"MIGRATION: enum update skipped: {enum_err}")
    
    # Step 2: Other migrations using SQLAlchemy (these work in transactions)
    try:
        async with engine.begin() as conn:
            try:
                # Add address column to companies
                print("Checking companies.address...")
                await conn.execute(text("ALTER TABLE companies ADD COLUMN IF NOT EXISTS address VARCHAR(500);"))
                print("MIGRATION: 'address' column check/add completed.")
                
                # Resize phone column
                print("Checking companies.phone...")
                try:
                    await conn.execute(text("ALTER TABLE companies ALTER COLUMN phone TYPE VARCHAR(255);"))
                    print("MIGRATION: 'phone' column resize completed.")
                except Exception as phone_err:
                    print(f"MIGRATION: phone resize skipped: {phone_err}")

            except Exception as e:
                print(f"MIGRATION WARNING (Non-critical): {e}")
    except Exception as outer_e:
        print(f"MIGRATION SKIPPED (connection issue): {outer_e}")
    
    print("AUTO-MIGRATION FINISHED.")


