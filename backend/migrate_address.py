import sqlite3
import os

db_path = os.path.join(os.path.dirname(__file__), 'uk_requests.db')

def migrate():
    if not os.path.exists(db_path):
        print(f"Database not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if address already exists
        cursor.execute("PRAGMA table_info(companies)")
        columns = [col[1] for col in cursor.fetchall()]
        
        if 'address' not in columns:
            print("Adding 'address' column to 'companies' table...")
            cursor.execute("ALTER TABLE companies ADD COLUMN address VARCHAR(500)")
            conn.commit()
            print("Migration successful!")
        else:
            print("Column 'address' already exists.")
            
    except Exception as e:
        print(f"Migration failed: {e}")
    finally:
        conn.close()

if __name__ == "__main__":
    migrate()
