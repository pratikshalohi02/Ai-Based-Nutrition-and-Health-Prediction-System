import os
import sqlite3

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_DIR = os.path.join(BASE_DIR, "..", "data")
DB_PATH = os.path.join(DB_DIR, "app.db")


def get_db():
    os.makedirs(DB_DIR, exist_ok=True)
    connection = sqlite3.connect(DB_PATH, detect_types=sqlite3.PARSE_DECLTYPES)
    connection.row_factory = sqlite3.Row
    return connection


def init_db():
    with get_db() as conn:
        conn.execute(
            """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        """
        )
        
        conn.execute(
            """
        CREATE TABLE IF NOT EXISTS food_history (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            food_name TEXT NOT NULL,
            calories REAL NOT NULL,
            protein REAL DEFAULT 0,
            carbs REAL DEFAULT 0,
            fats REAL DEFAULT 0,
            confidence REAL DEFAULT 0.5,
            ingredients TEXT,
            meal_type TEXT,
            image_reference TEXT,
            user_weight REAL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        )
        
        conn.execute(
            """
        CREATE INDEX IF NOT EXISTS idx_user_created 
        ON food_history(user_id, created_at DESC)
        """
        )
        
        conn.execute(
            """
        CREATE TABLE IF NOT EXISTS health_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL UNIQUE,
            age INTEGER NOT NULL,
            height REAL NOT NULL,
            weight REAL NOT NULL,
            gender TEXT NOT NULL,
            activity_level TEXT NOT NULL,
            bmi REAL,
            bmi_category TEXT,
            daily_calorie_goal INTEGER,
            completed_assessment BOOLEAN DEFAULT 0,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
        )
        
        # Migration: Add user_weight column if it doesn't exist
        try:
            cursor = conn.execute("PRAGMA table_info(food_history)")
            columns = [row[1] for row in cursor.fetchall()]
            if "user_weight" not in columns:
                print("DEBUG: Adding user_weight column to food_history table...")
                conn.execute("ALTER TABLE food_history ADD COLUMN user_weight REAL")
                print("DEBUG: Successfully added user_weight column")
        except Exception as e:
            print(f"DEBUG: Migration check failed (this is OK on fresh DB): {e}")
        
        conn.commit()
