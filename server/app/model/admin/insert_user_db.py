from app.database.connection import get_db_connection

def insert_user(user):
    try: 
        db = get_db_connection()
        cursor = db.cursor()
        query = """
            INSERT INTO users 
            (username, password, role, full_name, position, role, is_active) 
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        cursor.execute(query, (user['username'], user['password'], user['role'], user['full_name'], user['position'], user['role'], user['is_active']))
        db.commit()
        db.close()
        return True
    except Exception as e:
        print(e)
        return False