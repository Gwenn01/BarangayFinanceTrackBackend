from flask import Blueprint
from app.controllers.viewer_controller import (
    insert_comment_controller, 
    get_all_comments_controller
)

viewer_bp = Blueprint('viewer_bp', __name__)

@viewer_bp.route('/insert-comment', methods=['POST'])
def insert_comment():
    return insert_comment_controller()

@viewer_bp.route('/get-all-comments', methods=['GET'])
def get_all_comments():
    return get_all_comments_controller()
