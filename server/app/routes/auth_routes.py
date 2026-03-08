from flask import Blueprint
from app.controllers.auth_controller import log_in, log_out

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/login", methods=["post"])
def auth():
    return log_in()

@auth_bp.route("/logout", methods=["post"])
def logout():
    return log_out()