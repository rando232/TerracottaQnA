import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from auth import get_password_hash
from database import execute_query

# New password
new_password = "MegaMeg"
hashed_password = get_password_hash(new_password)

print(f"New hashed password for 'MegaMeg': {hashed_password}")

# Update admin user password
try:
    execute_query(
        "UPDATE users SET password_hash = %s WHERE username = 'admin'",
        (hashed_password,)
    )
    print(f"[SUCCESS] Password updated successfully for user 'admin'")
    print(f"   New password: MegaMeg")
    
    # Verify the update
    result = execute_query("SELECT username, email FROM users WHERE username = 'admin'")
    if result:
        print(f"   User found: {result[0][0]} ({result[0][1]})")
    
except Exception as e:
    print(f"[ERROR] Error updating password: {e}")
