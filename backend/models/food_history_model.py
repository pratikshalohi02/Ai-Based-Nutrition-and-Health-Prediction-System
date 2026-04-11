from services.db_service import get_db


def create_food_entry(
    user_id: int,
    food_name: str,
    calories: float,
    protein: float = 0,
    carbs: float = 0,
    fats: float = 0,
    confidence: float = 0.5,
    ingredients: str = "",
    meal_type: str = "",
    image_reference: str = "",
    user_weight: float = None,
):
    """Create a new food history entry"""
    with get_db() as conn:
        cursor = conn.execute(
            """
            INSERT INTO food_history 
            (user_id, food_name, calories, protein, carbs, fats, confidence, ingredients, meal_type, image_reference, user_weight)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (user_id, food_name, calories, protein, carbs, fats, confidence, ingredients, meal_type, image_reference, user_weight),
        )
        conn.commit()
        return cursor.lastrowid


def get_user_food_history(user_id: int, limit: int = 100, offset: int = 0):
    """Get user's food history"""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT id, user_id, food_name, calories, protein, carbs, fats, confidence, ingredients, meal_type, image_reference, user_weight, created_at
            FROM food_history
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
            """,
            (user_id, limit, offset),
        ).fetchall()
        
        return [dict(row) for row in rows]


def get_food_entry(entry_id: int, user_id: int):
    """Get a specific food entry"""
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT * FROM food_history
            WHERE id = ? AND user_id = ?
            """,
            (entry_id, user_id),
        ).fetchone()
        
        return dict(row) if row else None


def get_user_daily_summary(user_id: int, date: str):
    """Get daily summary for a user"""
    with get_db() as conn:
        row = conn.execute(
            """
            SELECT 
                COUNT(*) as meal_count,
                SUM(calories) as total_calories,
                SUM(protein) as total_protein,
                SUM(carbs) as total_carbs,
                SUM(fats) as total_fats
            FROM food_history
            WHERE user_id = ? AND DATE(created_at) = ?
            """,
            (user_id, date),
        ).fetchone()
        
        return dict(row) if row else None


def delete_food_entry(entry_id: int, user_id: int):
    """Delete a food history entry"""
    with get_db() as conn:
        cursor = conn.execute(
            "DELETE FROM food_history WHERE id = ? AND user_id = ?",
            (entry_id, user_id),
        )
        conn.commit()
        return cursor.rowcount > 0
