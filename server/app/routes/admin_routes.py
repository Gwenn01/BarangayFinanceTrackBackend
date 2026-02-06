from flask import Blueprint
from app.controllers.admin_controller import (
    get_all_users_controller,
    add_user_controller,
    edit_user_controller,
    delete_user_controller,
    get_all_docs_controller
)

admin_bp = Blueprint("admin_bp", __name__)

@admin_bp.route("get-all-users", methods=["GET"])
def get_all_users():
    return get_all_users_controller()

@admin_bp.route("add-user", methods=["POST"])
def add_user():
    # {
    #     "username",
    #     "password",
    #     "fullname",
    #     "position",
    #     "role",
    #     "is_active"
    # }
    return add_user_controller()

@admin_bp.route("edit-user", methods=["PUT"])
def edit_user():
    return edit_user_controller()

@admin_bp.route("delete-user", methods=["PUT"])
def delete_user():
    return delete_user_controller()

@admin_bp.route('get-all-docs', methods=['GET'])
def get_all_docs():
    return get_all_docs_controller()