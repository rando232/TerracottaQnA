import pymysql
from contextlib import contextmanager
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', 3306)),
    'user': os.getenv('DB_USER', 'root'),
    'password': os.getenv('DB_PASSWORD', ''),
    'database': os.getenv('DB_NAME', 'terracotta_qna'),
    'charset': 'utf8mb4',
    'cursorclass': pymysql.cursors.DictCursor
}

@contextmanager
def get_db_connection():
    """Context manager for database connections"""
    connection = pymysql.connect(**DB_CONFIG)
    try:
        yield connection
        connection.commit()
    except Exception as e:
        connection.rollback()
        raise e
    finally:
        connection.close()

def get_db_cursor(connection):
    """Get a cursor from a connection"""
    return connection.cursor()

def execute_query(query, params=None, fetch_one=False, fetch_all=False):
    """
    Execute a query and return results
    
    Args:
        query: SQL query string
        params: Query parameters (tuple or dict)
        fetch_one: Return single result
        fetch_all: Return all results
    
    Returns:
        Query results or None
    """
    with get_db_connection() as conn:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            
            if fetch_one:
                return cursor.fetchone()
            elif fetch_all:
                return cursor.fetchall()
            else:
                return cursor.lastrowid
