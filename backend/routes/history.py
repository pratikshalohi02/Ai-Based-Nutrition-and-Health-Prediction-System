from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.food_history_model import (
    get_user_food_history,
    get_user_daily_summary,
    delete_food_entry,
)
from services.weight_prediction_service import calculate_calorie_surplus_deficit, calculate_weekly_projection

history_bp = Blueprint("history", __name__)


@history_bp.route("/history", methods=["GET"])
@jwt_required()
def get_history():
    """Get user's food history"""
    user_id = get_jwt_identity()
    
    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        limit = request.args.get("limit", 100, type=int)
        offset = request.args.get("offset", 0, type=int)
        
        history = get_user_food_history(user_id, limit, offset)
        
        return jsonify({
            "history": history,
            "count": len(history),
            "limit": limit,
            "offset": offset,
        }), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500


@history_bp.route("/history/daily", methods=["GET"])
@jwt_required()
def get_daily_summary():
    """Get daily summary for a user with weight predictions"""
    user_id = get_jwt_identity()
    
    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        date = request.args.get("date")
        if not date:
            # Use today's date if not provided
            from datetime import datetime
            date = datetime.now().strftime("%Y-%m-%d")
        
        # Get user's daily calorie goal from health profile
        from services.db_service import get_db
        db = get_db()
        cursor = db.cursor()
        cursor.execute("SELECT daily_calorie_goal FROM health_profiles WHERE user_id = ?", (user_id,))
        profile_row = cursor.fetchone()
        daily_goal = profile_row[0] if profile_row else 2000
        
        # Get user's current weight (from most recent food entry or health profile)
        cursor.execute("SELECT user_weight FROM food_history WHERE user_id = ? AND user_weight IS NOT NULL ORDER BY created_at DESC LIMIT 1", (user_id,))
        weight_row = cursor.fetchone()
        current_weight_kg = weight_row[0] if weight_row else 70
        
        summary = get_user_daily_summary(user_id, date)
        total_calories = summary["total_calories"] or 0 if summary else 0
        
        # Calculate weight prediction using user's actual daily goal
        weight_prediction = calculate_calorie_surplus_deficit(total_calories, tdee=daily_goal)
        weekly_projection = calculate_weekly_projection(weight_prediction["difference"], current_weight_kg=current_weight_kg)
        
        if not summary:
            return jsonify({
                "date": date,
                "meal_count": 0,
                "total_calories": 0,
                "total_protein": 0,
                "total_carbs": 0,
                "total_fats": 0,
                "daily_calorie_goal": daily_goal,
                "weight_prediction": weight_prediction,
                "weekly_projection": weekly_projection,
            }), 200
        
        return jsonify({
            "date": date,
            "meal_count": summary["meal_count"],
            "total_calories": total_calories,
            "total_protein": summary["total_protein"] or 0,
            "total_carbs": summary["total_carbs"] or 0,
            "total_fats": summary["total_fats"] or 0,
            "daily_calorie_goal": daily_goal,
            "weight_prediction": weight_prediction,
            "weekly_projection": weekly_projection,
        }), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500


@history_bp.route("/history/<int:entry_id>", methods=["DELETE"])
@jwt_required()
def delete_entry(entry_id: int):
    """Delete a food history entry"""
    user_id = get_jwt_identity()
    
    if not user_id:
        return jsonify({"error": "Invalid token"}), 401

    try:
        success = delete_food_entry(entry_id, user_id)
        
        if not success:
            return jsonify({"error": "Entry not found or unauthorized"}), 404
        
        return jsonify({"message": "Entry deleted successfully"}), 200
    except Exception as err:
        return jsonify({"error": str(err)}), 500
