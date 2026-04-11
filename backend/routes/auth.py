from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from services.auth_service import authenticate_user, create_user
from models.user_model import get_user_by_email

auth_bp = Blueprint("auth", __name__)


def find_user_by_email(email):
    return get_user_by_email(email)


@auth_bp.route("/register", methods=["POST"])
def register():
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400

    email = request.json.get("email", "").strip().lower()
    password = request.json.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    if find_user_by_email(email):
        return jsonify({"error": "A user with that email already exists"}), 409

    create_user(email, password)

    return jsonify({"message": "User created successfully"}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    if not request.is_json:
        return jsonify({"error": "Request body must be JSON"}), 400

    email = request.json.get("email", "").strip().lower()
    password = request.json.get("password", "")

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    user = authenticate_user(email, password)
    if not user:
        return jsonify({"error": "Invalid email or password"}), 401

    # Ensure user_id is a valid string
    user_id = user.get("id")
    if user_id is None or user_id == "":
        print(f"ERROR: User has no ID - user dict: {user}")
        return jsonify({"error": "User record is invalid"}), 500
    
    # Convert to string - must be a string for JWT subject
    user_id_str = str(user_id).strip()
    if not user_id_str or user_id_str == "None" or user_id_str == "null":
        print(f"ERROR: Invalid user ID: {user_id_str}")
        return jsonify({"error": "Invalid user record"}), 500
    
    print(f"DEBUG: Creating token for user_id: {user_id_str} (type: {type(user_id_str).__name__})")
    
    try:
        access_token = create_access_token(
            identity=user_id_str,
            additional_claims={"email": user["email"]}
        )
    except Exception as token_error:
        print(f"ERROR: Failed to create access token: {token_error}")
        return jsonify({"error": "Authentication failed"}), 500

    return (
        jsonify(
            {
                "access_token": access_token,
                "user": {"id": user_id, "email": user["email"]},
            }
        ),
        200,
    )
