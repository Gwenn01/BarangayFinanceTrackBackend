from flask import request, jsonify
from app.model.get_user import get_user_by_username
from app.utils.hash_password import verify_password

def log_in():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"message": "Invalid request"}), 400

        username = data.get("username")
        password = data.get("password")
        #validate user username and password
        if not username or not password:
            return jsonify({"message": "Username and password are required"}), 400

        user = get_user_by_username(username)
        # validate user
        if not user:
            return jsonify({"message": "Invalid username"}), 401

        # validate password
        if not user or not verify_password(password, user["password"]):
            return jsonify({"message": "Invalid password"}), 401

        return jsonify({
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "username": user["username"],
                "role": user["role"]
            }
        }), 200

    except Exception as e:
         return jsonify({
            "message": "An error occurred",
            "error": str(e)
        }), 500
