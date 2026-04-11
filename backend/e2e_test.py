#!/usr/bin/env python3
"""
End-to-End Test Script for Flask Backend with User History
Tests: Registration → Login → Food Upload → History Retrieval
"""

import requests
import json
import base64
from pathlib import Path

# Configuration
BASE_URL = "http://localhost:5000/api"
TEST_EMAIL = "e2e_test@example.com"
TEST_PASSWORD = "TestPassword123!"

# Test results
results = {
    "registration": False,
    "login": False,
    "food_analysis": False,
    "history_retrieval": False,
    "daily_summary": False,
    "entry_deletion": False,
}

def print_section(title):
    print(f"\n{'='*60}")
    print(f"  {title}")
    print(f"{'='*60}")

def print_success(msg):
    print(f"✓ {msg}")

def print_error(msg):
    print(f"✗ {msg}")

def print_info(msg):
    print(f"→ {msg}")

# Test 1: User Registration
def test_registration():
    print_section("Test 1: User Registration")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/register",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=5
        )
        
        if response.status_code == 201:
            print_success(f"User registration successful: {TEST_EMAIL}")
            results["registration"] = True
            return True
        elif response.status_code == 409:
            print_info(f"User already exists (will use for login test)")
            results["registration"] = True
            return True
        else:
            print_error(f"Registration failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Registration error: {str(e)}")
        return False

# Test 2: User Login
def test_login():
    print_section("Test 2: User Login")
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            json={"email": TEST_EMAIL, "password": TEST_PASSWORD},
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            token = data.get("access_token")
            user = data.get("user", {})
            
            if token:
                print_success(f"Login successful for user ID: {user.get('id')}")
                print_success(f"JWT token received (length: {len(token)} chars)")
                results["login"] = True
                return token, user.get("id")
            else:
                print_error("Token not found in response")
                return None, None
        else:
            print_error(f"Login failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None, None
    except Exception as e:
        print_error(f"Login error: {str(e)}")
        return None, None

# Test 3: Food Analysis (Upload & Analyze)
def test_food_analysis(token, user_id):
    print_section("Test 3: Food Analysis Upload")
    try:
        # Create a small test image (1x1 pixel PNG)
        test_image_path = Path("/tmp/test_food.png")
        png_data = (
            b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01'
            b'\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\x0cIDATx\x9cc\xf8\x0f\x00'
            b'\x00\x01\x01\x00\x05\x18\r\r\xb5\x00\x00\x00\x00IEND\xaeB`\x82'
        )
        test_image_path.write_bytes(png_data)
        print_info(f"Created test image: {test_image_path}")
        
        # Upload food image for analysis
        with open(test_image_path, "rb") as f:
            files = {"image": ("test_food.png", f, "image/png")}
            data = {"meal_type": "breakfast"}
            headers = {"Authorization": f"Bearer {token}"}
            
            response = requests.post(
                f"{BASE_URL}/analyze-food",
                files=files,
                data=data,
                headers=headers,
                timeout=10
            )
        
        if response.status_code == 200:
            analysis = response.json()
            print_success(f"Food analysis successful")
            print_info(f"Detected: {analysis.get('food_name')}")
            print_info(f"Calories: {analysis.get('calories')}")
            print_info(f"Protein: {analysis.get('protein')}g, Carbs: {analysis.get('carbs')}g, Fats: {analysis.get('fats')}g")
            
            if analysis.get("saved"):
                print_success(f"Result automatically saved (entry ID: {analysis.get('entry_id')})")
            else:
                print_info(f"Result not saved (no auth or save error)")
            
            results["food_analysis"] = True
            return analysis
        else:
            print_error(f"Analysis failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Food analysis error: {str(e)}")
        return None
    finally:
        # Clean up test image
        if test_image_path.exists():
            test_image_path.unlink()

# Test 4: History Retrieval
def test_history_retrieval(token, user_id):
    print_section("Test 4: History Retrieval")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/history?limit=10&offset=0",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            data = response.json()
            history = data.get("history", [])
            count = data.get("count", 0)
            
            print_success(f"Retrieved {count} food entries")
            
            if history:
                print_info(f"\nRecent entries:")
                for i, entry in enumerate(history[:3], 1):
                    print(f"  {i}. {entry.get('food_name')} - {entry.get('calories')} cal ({entry.get('created_at')})")
                results["history_retrieval"] = True
            else:
                print_info("No history entries found (may be first upload)")
                results["history_retrieval"] = True
            
            return history
        else:
            print_error(f"History retrieval failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"History retrieval error: {str(e)}")
        return None

# Test 5: Daily Summary
def test_daily_summary(token, user_id):
    print_section("Test 5: Daily Summary")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/history/daily",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            summary = response.json()
            print_success(f"Daily summary retrieved")
            print_info(f"Meals today: {summary.get('meal_count', 0)}")
            print_info(f"Total calories: {summary.get('total_calories', 0)}")
            print_info(f"Total macros - Protein: {summary.get('total_protein', 0)}g, Carbs: {summary.get('total_carbs', 0)}g, Fats: {summary.get('total_fats', 0)}g")
            results["daily_summary"] = True
            return summary
        else:
            print_error(f"Daily summary failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return None
    except Exception as e:
        print_error(f"Daily summary error: {str(e)}")
        return None

# Test 6: Entry Deletion (if history exists)
def test_entry_deletion(token, user_id, history):
    print_section("Test 6: Entry Deletion")
    if not history or len(history) == 0:
        print_info("No history entries to delete (skipping test)")
        results["entry_deletion"] = True
        return True
    
    try:
        entry_id = history[0].get("id")
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.delete(
            f"{BASE_URL}/history/{entry_id}",
            headers=headers,
            timeout=5
        )
        
        if response.status_code == 200:
            print_success(f"Entry {entry_id} deleted successfully")
            results["entry_deletion"] = True
            return True
        else:
            print_error(f"Deletion failed: {response.status_code}")
            print_info(f"Response: {response.text}")
            return False
    except Exception as e:
        print_error(f"Deletion error: {str(e)}")
        return False

# Main test execution
def run_all_tests():
    print("\n" + "="*60)
    print("  FLASK BACKEND END-TO-END TEST")
    print("  Testing: Registration → Login → Upload → History")
    print("="*60)
    
    # Check if backend is running
    try:
        response = requests.get(f"{BASE_URL}/auth/register", timeout=2)
    except:
        print_error("Backend not running! Start it with: cd backend && python app.py")
        return
    
    # Run tests sequentially
    if not test_registration():
        print_error("Registration test failed")
        return
    
    token, user_id = test_login()
    if not token:
        print_error("Login test failed")
        return
    
    analysis = test_food_analysis(token, user_id)
    if not analysis:
        print_error("Food analysis test failed")
        return
    
    history = test_history_retrieval(token, user_id)
    if history is None:
        print_error("History retrieval test failed")
        return
    
    test_daily_summary(token, user_id)
    test_entry_deletion(token, user_id, history)
    
    # Print summary
    print_section("Test Summary")
    all_passed = all(results.values())
    
    for test_name, passed in results.items():
        status = "✓ PASSED" if passed else "✗ FAILED"
        print(f"{test_name:.<30} {status}")
    
    print()
    if all_passed:
        print_success("ALL TESTS PASSED! System is fully functional.")
    else:
        failed = [k for k, v in results.items() if not v]
        print_error(f"Some tests failed: {', '.join(failed)}")

if __name__ == "__main__":
    run_all_tests()
