import sys
import os
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from database import get_db_connection

def run_migration():
    """Run the flags table migration"""
    
    migration_file = Path(__file__).parent / 'add_flags_table.sql'
    
    with open(migration_file, 'r') as f:
        sql = f.read()
    
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            
            # Execute the migration
            for statement in sql.split(';'):
                statement = statement.strip()
                if statement:
                    cursor.execute(statement)
            
            conn.commit()
            print("[SUCCESS] Flags table migration completed successfully!")
            
    except Exception as e:
        print(f"[ERROR] Migration failed: {e}")
        raise

if __name__ == "__main__":
    run_migration()
