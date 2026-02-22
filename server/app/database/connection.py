import os
import psycopg

def get_db_connection():
    database_url = os.getenv("DATABASE_URL")

    if not database_url:
        raise ValueError("DATABASE_URL is not set")

    return psycopg.connect(database_url, sslmode="require")