from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.db_service import get_db

profile_bp = Blueprint("profile", __name__)


@profile_bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Get user health profile"""
    user_id = get_jwt_identity()
    
    try:
        db = get_db()
        cursor = db.cursor()
        
        cursor.execute("""
            SELECT 
                id, user_id, age, height, weight, gender, 
                activity_level, bmi, bmi_category, daily_calorie_goal, 
                completed_assessment, created_at
            FROM health_profiles 
            WHERE user_id = ?
            LIMIT 1
        """, (user_id,))
        
        row = cursor.fetchone()
        
        if not row:
            return jsonify({
                "profile": None,
                "message": "No profile found. Please complete setup."
            }), 200
        
        profile = {
            "id": row[0],
            "user_id": row[1],
            "age": row[2],
            "height": row[3],
            "weight": row[4],
            "gender": row[5],
            "activity_level": row[6],
            "bmi": row[7],
            "bmi_category": row[8],
            "daily_calorie_goal": row[9],
            "completed_assessment": row[10],
            "created_at": row[11],
        }
        
        return jsonify({"profile": profile}), 200
    
    except Exception as e:
        print(f"Error fetching profile: {str(e)}")
        return jsonify({"error": "Failed to fetch profile"}), 500


def calculate_bmi(height_cm: float, weight_kg: float) -> tuple[float, str]:
    """Calculate BMI and category"""
    height_m = height_cm / 100
    bmi = weight_kg / (height_m ** 2)
    
    if bmi < 18.5:
        category = "underweight"
    elif bmi < 25:
        category = "normal"
    elif bmi < 30:
        category = "overweight"
    else:
        category = "obese"
    
    return round(bmi, 1), category


def calculate_daily_calories(age: int, height: float, weight: float, gender: str, activity_level: str) -> int:
    """Calculate daily calorie requirement using Mifflin-St Jeor equation"""
    # BMR calculation
    if gender.lower() == "male":
        bmr = 10 * weight + 6.25 * height - 5 * age + 5
    else:
        bmr = 10 * weight + 6.25 * height - 5 * age - 161
    
    # Activity multipliers
    multipliers = {
        "sedentary": 1.2,
        "light": 1.375,
        "moderate": 1.55,
        "active": 1.725,
        "very_active": 1.9,
    }
    
    activity = activity_level.lower().replace(" ", "_")
    multiplier = multipliers.get(activity, 1.55)
    
    return int(bmr * multiplier)


@profile_bp.route("/profile", methods=["POST"])
@jwt_required()
def create_or_update_profile():
    """Create or update user health profile"""
    user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate required fields
    required_fields = ["age", "height", "weight", "gender", "activity_level"]
    if not all(field in data for field in required_fields):
        return jsonify({"error": "Missing required fields"}), 400
    
    try:
        age = int(data.get("age"))
        height = float(data.get("height"))
        weight = float(data.get("weight"))
        gender = data.get("gender")
        activity_level = data.get("activity_level")
        
        # Validate ranges
        if not (1 <= age <= 150):
            return jsonify({"error": "Age must be between 1 and 150"}), 400
        if not (50 <= height <= 250):
            return jsonify({"error": "Height must be between 50cm and 250cm"}), 400
        if not (20 <= weight <= 500):
            return jsonify({"error": "Weight must be between 20kg and 500kg"}), 400
        if gender.lower() not in ["male", "female", "other"]:
            return jsonify({"error": "Invalid gender"}), 400
        
        # Calculate BMI and calories
        bmi, bmi_category = calculate_bmi(height, weight)
        daily_calories = calculate_daily_calories(age, height, weight, gender, activity_level)
        
        db = get_db()
        cursor = db.cursor()
        
        # Check if profile exists
        cursor.execute("SELECT id FROM health_profiles WHERE user_id = ?", (user_id,))
        existing = cursor.fetchone()
        
        if existing:
            # Update existing profile
            cursor.execute("""
                UPDATE health_profiles
                SET age = ?, height = ?, weight = ?, gender = ?,
                    activity_level = ?, bmi = ?, bmi_category = ?,
                    daily_calorie_goal = ?, completed_assessment = 1
                WHERE user_id = ?
            """, (age, height, weight, gender, activity_level, bmi, bmi_category, daily_calories, user_id))
        else:
            # Create new profile
            cursor.execute("""
                INSERT INTO health_profiles 
                (user_id, age, height, weight, gender, activity_level, bmi, bmi_category, daily_calorie_goal, completed_assessment)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)
            """, (user_id, age, height, weight, gender, activity_level, bmi, bmi_category, daily_calories))
        
        db.commit()
        
        return jsonify({
            "message": "Profile saved successfully",
            "profile": {
                "age": age,
                "height": height,
                "weight": weight,
                "gender": gender,
                "activity_level": activity_level,
                "bmi": bmi,
                "bmi_category": bmi_category,
                "daily_calorie_goal": daily_calories,
                "completed_assessment": True,
            }
        }), 200
    
    except ValueError:
        return jsonify({"error": "Invalid data types"}), 400
    except Exception as e:
        print(f"Error saving profile: {str(e)}")
        return jsonify({"error": "Failed to save profile"}), 500
