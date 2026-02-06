from app.utils.execute_query import fetch_all

def get_comment_db():
    ...
    try:
        ...
        query = "SELECT id, name, email, comment FROM viewer_comments"
        return fetch_all(query, params=None, dictionary=True)
    except Exception as e:
        ...
        print(e)
        return None