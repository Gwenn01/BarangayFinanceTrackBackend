import psycopg
from psycopg.rows import dict_row
from app.database.connection import get_db_connection


def fetch_all(query, params=None):
    conn = get_db_connection()
    try:
        with conn.cursor(row_factory=dict_row) as cursor:
            cursor.execute(query, params or ())
            results = cursor.fetchall()
            return results
    finally:
        conn.close()


def execute_query(query, params=None):
    conn = get_db_connection()
    try:
        with conn.cursor() as cursor:
            cursor.execute(query, params or ())
            conn.commit()
            return cursor.rowcount
    finally:
        conn.close()