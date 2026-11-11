import bcrypt
import pymysql
import os

# Database configuration
DB_CONFIG = {
    'host': 'localhost',
    'port': 3306,
    'user': 'root',
    'password': 'admini123jklul@',
    'database': 'terracotta_qna',
    'charset': 'utf8mb4'
}

# Generate new password hash
password = 'admin123'
hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
hashed_str = hashed.decode('utf-8')

print(f"Generated hash: {hashed_str}")

# Connect to database
connection = pymysql.connect(**DB_CONFIG)
cursor = connection.cursor()

# Update all users
usernames = ['admin', 'alice_search', 'bob_backend', 'carol_db', 'dave_frontend', 'eve_devops']

for username in usernames:
    cursor.execute("UPDATE users SET password_hash = %s WHERE username = %s", (hashed_str, username))
    print(f"Updated password for: {username}")

connection.commit()
cursor.close()
connection.close()

print("\n✅ All passwords updated successfully!")
print("Password for all users: admin123")
