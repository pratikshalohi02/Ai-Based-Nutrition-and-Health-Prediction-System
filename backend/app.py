import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.auth import auth_bp
from routes.analyze import analyze_bp
from routes.history import history_bp
from routes.profile import profile_bp
from services.db_service import init_db

def create_app() -> Flask:
    app = Flask(__name__, instance_relative_config=False)

    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", "replace-this-secret-in-production"
    )
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False

    CORS(app, resources={r"/api/*": {"origins": "*"}})

    jwt = JWTManager(app)

    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_data):
        return jsonify({"error": "Token has expired"}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        error_msg = str(error)
        if "Subject must be a string" in error_msg:
            return jsonify({"error": "Invalid token format. Please login again."}), 401
        return jsonify({"error": "Invalid token. Please login again."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Missing authentication token"}), 401

    @jwt.revoked_token_loader
    def revoked_token_callback(jwt_header, jwt_data):
        return jsonify({"error": "Token has been revoked"}), 401
    
    @jwt.user_lookup_loader
    def user_lookup_callback(_jwt_header, jwt_data):
        identity = jwt_data["sub"]
        return identity

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(analyze_bp, url_prefix="/api")
    app.register_blueprint(history_bp, url_prefix="/api")
    app.register_blueprint(profile_bp, url_prefix="/api")

    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok", "service": "backend"}), 200

    return app


app = create_app()

with app.app_context():
    init_db()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_ENV") == "development"
    print(f"🚀 Backend starting at http://localhost:{port}")
    app.run(host="0.0.0.0", port=port, debug=debug)
