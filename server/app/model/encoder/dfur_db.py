from app.database.connection import get_db_connection
from app.utils.execute_query import execute_query, fetch_all

def insert_dfur_db(data):
    try:
        query = """
            INSERT INTO dfur_projects (
                transaction_id, 
                transaction_date, 
                name_of_collection, 
                project, 
                location,
                total_cost_approved,
                total_cost_incurred,
                date_started,
                target_completion_date,
                stats,
                no_extensions,
                remarks
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """
        params = (
            data['transaction_id'],
            data['transaction_date'],
            data['name_of_collection'],
            data['project'],
            data['location'],
            data['total_cost_approved'],
            data['total_cost_incurred'],
            data['date_started'],
            data['target_completion_date'],
            data['stats'],
            data['no_extensions'],
            data['remarks']
        )
        return execute_query(query, params)
    except Exception as e:
        print("Insert DFRU error:", e)
        return False
