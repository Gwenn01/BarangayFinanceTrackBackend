from app.utils.execute_query  import execute_query, fetch_all

def insert_activity_logs_db(user_id, activity):

    query = """
        INSERT INTO activity_logs
        (user_id, username, action, module, description, ip_address, user_agent)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
    """

    params = (
        user_id,
        activity.get("username"),
        activity.get("action"),
        activity.get("module"),
        activity.get("description"),
        activity.get("ip_address"),
        activity.get("user_agent")
    )

    execute_query(query, params)
    
def get_activity_logs_db():

    query = """
        SELECT * FROM activity_logs
    """

    return fetch_all(query)