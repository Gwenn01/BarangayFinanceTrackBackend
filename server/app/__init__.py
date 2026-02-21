from flask import Flask
from flask_cors import CORS
from app.config import Config
from app.extensions import jwt
from dotenv import load_dotenv

load_dotenv()  # load once only

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app, supports_credentials=True)

    jwt.init_app(app)

    from app.routes.db_test_routes import db_test_bp
    from app.routes.tests_routes import test_bp
    from app.routes.auth_routes import auth_bp
    from app.routes.general_routes import general_bp
    from app.routes.admin_routes import admin_bp
    from app.routes.encoder_routes import encoder_bp
    from app.routes.checker_routes import checker_bp
    from app.routes.approver_routes import approver_bp
    from app.routes.viewer_routes import viewer_bp

    app.register_blueprint(db_test_bp, url_prefix="/api")
    app.register_blueprint(test_bp, url_prefix="/api")
    app.register_blueprint(auth_bp, url_prefix="/api")
    app.register_blueprint(general_bp, url_prefix="/api")
    app.register_blueprint(admin_bp, url_prefix="/api")
    app.register_blueprint(encoder_bp, url_prefix="/api")
    app.register_blueprint(checker_bp, url_prefix="/api")
    app.register_blueprint(approver_bp, url_prefix="/api")
    app.register_blueprint(viewer_bp, url_prefix="/api")

    @app.route("/")
    def health():
        return {"status": "running"}

    return app