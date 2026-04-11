from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from services.food_analysis_service import analyze_food_upload
from services.weight_prediction_service import calculate_calorie_surplus_deficit, calculate_weekly_projection
from models.food_history_model import create_food_entry, get_user_food_history
from utils.image_utils import allowed_file, load_and_prepare_image
from datetime import datetime, date
from io import BytesIO
import base64

analyze_bp = Blueprint("analyze", __name__)


@analyze_bp.route("/analyze-food", methods=["POST"])
@jwt_required()
def analyze_food():
    try:
        # Get authenticated user first - fail fast if there's a JWT issue
        user_id = get_jwt_identity()
        print(f"DEBUG: analyze-food called with user_id: {user_id} (type: {type(user_id).__name__})")
        
        if not user_id:
            print("ERROR: User ID is None or empty")
            return jsonify({"error": "User ID not found in token"}), 401
        
        if "image" not in request.files:
            return jsonify({"error": "Image file is required"}), 400

        image_file = request.files["image"]

        if not image_file.filename:
            return jsonify({"error": "Image file must have a filename"}), 400

        if not allowed_file(image_file.filename):
            return jsonify({"error": "Unsupported image format"}), 400

        food_name = request.form.get("food_name", "").strip()
        meal_type = request.form.get("meal_type", "").strip()
        user_weight = request.form.get("user_weight", type=float)
        
        # Read image data into memory
        image_bytes = image_file.read()
        image_base64 = base64.b64encode(image_bytes).decode('utf-8')
        image_data = f"data:image/jpeg;base64,{image_base64}"
        
        # Analyze food using the image bytes
        try:
            image_stream = BytesIO(image_bytes)
            # Load and prepare image directly
            from services.food_analysis_service import _pick_food_name, _build_confidence, _normalize_text, COMMON_FOODS, DEFAULT_FOOD
            from PIL import Image
            
            img = load_and_prepare_image(image_stream)
            image_pixel_data = img.tobytes()
            selected_key = _pick_food_name(image_file.filename, food_name, image_pixel_data)
            food_spec = COMMON_FOODS.get(selected_key, DEFAULT_FOOD)
            
            result = {
                "food_name": food_spec["food_name"],
                "calories": food_spec["calories"],
                "protein": food_spec.get("protein", 0),
                "carbs": food_spec.get("carbs", 0),
                "fats": food_spec.get("fats", 0),
                "confidence": _build_confidence(_normalize_text(food_name or image_file.filename), image_pixel_data),
                "ingredients": food_spec["ingredients"],
            }
        except Exception as analysis_error:
            print(f"Food analysis error: {str(analysis_error)}")
            import traceback
            traceback.print_exc()
            raise

        # user_id is already obtained at the beginning of the function
        # Save to history
        entry_id = create_food_entry(
            user_id=user_id,
            food_name=result.get("food_name", "Unknown"),
            calories=result.get("calories", 0),
            protein=result.get("protein", 0),
            carbs=result.get("carbs", 0),
            fats=result.get("fats", 0),
            confidence=result.get("confidence", 0.5),
            ingredients=",".join(result.get("ingredients", [])),
            meal_type=meal_type,
            image_reference=image_data,
            user_weight=user_weight,
        )
        
        # Get today's total calories
        today = str(date.today())
        history = get_user_food_history(user_id, limit=100)
        
        today_calories = 0
        for entry in history:
            entry_date = entry['created_at'].split('T')[0] if 'T' in entry['created_at'] else entry['created_at'].split(' ')[0]
            if entry_date == today:
                today_calories += entry['calories']
        
        # Calculate weight prediction
        weight_prediction = calculate_calorie_surplus_deficit(today_calories)
        
        # Add to result with user's current weight
        result["user_log"] = {
            "entry_id": entry_id,
            "logged_at": datetime.now().isoformat(),
            "daily_summary": {
                "date": today,
                "total_calories_today": today_calories,
                **weight_prediction
            },
            "weekly_projection": calculate_weekly_projection(
                weight_prediction["difference"], 
                current_weight_kg=user_weight if user_weight else 70
            )
        }

        return jsonify(result), 200
        
    except ValueError as e:
        import traceback
        print(f"ValueError: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400
    except Exception as e:
        import traceback
        print(f"Error analyzing food: {str(e)}")
        traceback.print_exc()
        return jsonify({"error": f"Failed to analyze food: {str(e)}"}), 500

