from services.db_service import get_db


def get_user_by_email(email: str):
    with get_db() as conn:
        row = conn.execute(
            "SELECT id, email, password_hash, created_at FROM users WHERE email = ?",
            (email,),
        ).fetchone()
        return dict(row) if row else None


def create_user_record(email: str, password_hash: str):
    with get_db() as conn:
        cursor = conn.execute(
            "INSERT INTO users (email, password_hash) VALUES (?, ?)",
            (email, password_hash),
        )
        conn.commit()
        return cursor.lastrowid
