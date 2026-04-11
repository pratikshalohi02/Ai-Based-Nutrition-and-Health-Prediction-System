"""
Weight prediction service based on calorie intake.
Uses basic calorie-to-weight conversion: 3500 calories = ~1 pound (0.453 kg)
"""


def calculate_calorie_surplus_deficit(daily_calories: float, tdee: float = 2000) -> dict:
    """
    Calculate daily calorie surplus/deficit.
    
    Args:
        daily_calories: Total calories consumed today
        tdee: Total Daily Energy Expenditure (default 2000 for average adult)
    
    Returns:
        dict with surplus/deficit and predicted weight change
    """
    difference = daily_calories - tdee
    
    # 3500 calories = 1 pound = 0.453 kg
    # Per day surplus/deficit
    predicted_weight_change_kg = (difference / 3500) * 0.453
    predicted_weight_change_lbs = difference / 3500
    
    return {
        "tdee": tdee,
        "daily_calories": daily_calories,
        "difference": difference,
        "status": "surplus" if difference > 0 else "deficit" if difference < 0 else "maintenance",
        "predicted_weight_change_kg": round(predicted_weight_change_kg, 3),
        "predicted_weight_change_lbs": round(predicted_weight_change_lbs, 3),
        "note": "Note: Based on typical TDEE of 2000 cal/day. Actual results depend on metabolism, activity level, and consistency."
    }


def calculate_weekly_projection(daily_surplus_deficit: float, current_weight_kg: float = 70) -> dict:
    """
    Project weight change over a week based on daily surplus/deficit.
    Shows health status with color indicators (red/green/orange).
    
    Args:
        daily_surplus_deficit: Daily calories above/below TDEE
        current_weight_kg: Current weight in kg (default 70)
    
    Returns:
        dict with 1-week projection, health status, and color indicator
    """
    weekly_change_kg = (daily_surplus_deficit * 7 / 3500) * 0.453
    weekly_change_lbs = (daily_surplus_deficit * 7) / 3500
    predicted_weight_kg = current_weight_kg + weekly_change_kg
    
    # Determine health status with color indicators
    if abs(weekly_change_kg) < 0.25:
        health_status = "good"
        indicator = "✓ Good - Stable weight"
        color_sign = "green"
    elif weekly_change_kg > 0.5:
        health_status = "bad"
        indicator = "✗ Bad - Gaining weight fast"
        color_sign = "red"
    elif weekly_change_kg < -0.5:
        health_status = "bad"
        indicator = "✗ Bad - Losing weight fast"
        color_sign = "red"
    elif weekly_change_kg > 0:
        health_status = "warning"
        indicator = "⚠ Warning - Slight weight gain"
        color_sign = "orange"
    else:
        health_status = "warning"
        indicator = "⚠ Warning - Slight weight loss"
        color_sign = "orange"
    
    return {
        "week": 1,
        "current_weight_kg": current_weight_kg,
        "predicted_weight_kg": round(predicted_weight_kg, 2),
        "weekly_change_kg": round(weekly_change_kg, 2),
        "weekly_change_lbs": round(weekly_change_lbs, 2),
        "health_status": health_status,
        "indicator": indicator,
        "color_sign": color_sign,
        "message": f"If you continue with this diet, you'll be {round(predicted_weight_kg, 2)} kg in 1 week"
    }


def get_calorie_goals(goal: str = "maintenance", tdee: float = 2000) -> dict:
    """
    Get recommended daily calorie intake based on goal.
    
    Args:
        goal: 'weight_loss', 'weight_gain', or 'maintenance'
        tdee: Total Daily Energy Expenditure
    
    Returns:
        dict with calorie recommendations
    """
    if goal == "weight_loss":
        target = tdee - 500  # 500 cal deficit = ~0.5 kg/week loss
    elif goal == "weight_gain":
        target = tdee + 500  # 500 cal surplus = ~0.5 kg/week gain
    else:  # maintenance
        target = tdee
    
    return {
        "goal": goal,
        "tdee": tdee,
        "daily_target": target,
        "weekly_projection": calculate_weekly_projection(target - tdee),
    }
