from werkzeug.security import check_password_hash, generate_password_hash
from models.user_model import create_user_record, get_user_by_email as find_user_by_email


def create_user(email: str, password: str):
    password_hash = generate_password_hash(password)
    return create_user_record(email, password_hash)


def authenticate_user(email: str, password: str):
    user = find_user_by_email(email)
    if not user:
        return None

    if not check_password_hash(user["password_hash"], password):
        return None

    return user
