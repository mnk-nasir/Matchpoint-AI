import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def print_step(step_name):
    print(f"\n{'='*50}\nTesting: {step_name}\n{'='*50}")

def test_api():
    session = requests.Session()
    
    # 1. Register User
    print_step("User Registration")
    register_data = {
        "email": "testuser@example.com",
        "password": "Password123!",
        "password_confirm": "Password123!",
        "first_name": "Test",
        "last_name": "Founder"
    }
    
    # Try to register (might fail if already exists, which is fine)
    try:
        response = session.post(f"{BASE_URL}/auth/register/", json=register_data)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.json()}")
    except Exception as e:
        print(f"Registration skipped or failed: {e}")

    # 2. Login
    print_step("User Login")
    login_data = {
        "email": "testuser@example.com",
        "password": "Password123!"
    }
    response = session.post(f"{BASE_URL}/auth/login/", json=login_data)
    if response.status_code != 200:
        print("Login Failed!")
        print(response.json())
        return
    
    tokens = response.json()
    access_token = tokens['access']
    print(f"Login Successful! Token obtained.")
    
    # Set headers for authenticated requests
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json"
    }

    # 3. Create Evaluation Draft
    print_step("Create Evaluation Draft")
    draft_data = {
        "company_name": "NextGen AI",
        "legal_structure": "C-Corp",
        "incorporation_year": 2023,
        "country": "USA",
        "stage": "MVP",
        "funding_raised": 50000.00
    }
    response = session.post(f"{BASE_URL}/evaluations/create/", json=draft_data, headers=headers)
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 4. Submit Full Evaluation (Scoring Engine)
    print_step("Submit Full Evaluation & Scoring")
    full_data = {
        "company_name": "Unicorn Tech",
        "legal_structure": "C-Corp",
        "incorporation_year": 2022,
        "country": "UK",
        "stage": "GROWTH",
        "funding_raised": 1500000.00,  # > 1M -> Strong funding score
        "tam_size": 5000,              # > 1B -> Strong market score
        "active_users": 15000,         # > 10k -> Strong traction
        "mrr": 60000,                  # > 50k -> Strong revenue
        "burn_rate": 20000,            # Healthy burn
        "founders_count": 2,           # Co-founders
        "has_technical_founder": True,
        "exit_strategy": "IPO",
        
        # Step Data (optional JSON storage)
        "steps": [
            {"question_1": "answer_1"},
            {"market_segment": "B2B SaaS"}
        ]
    }
    
    response = session.post(f"{BASE_URL}/evaluations/submit/", json=full_data, headers=headers)
    print(f"Status: {response.status_code}")
    result = response.json()
    print(f"Response: {json.dumps(result, indent=2)}")
    
    if response.status_code == 201:
        eval_id = result.get('evaluation_id')
        
        # 5. Get Evaluation Detail
        print_step(f"Get Evaluation Detail ({eval_id})")
        response = session.get(f"{BASE_URL}/evaluations/{eval_id}/", headers=headers)
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}")

    # 6. List User Evaluations
    print_step("List All User Evaluations")
    response = session.get(f"{BASE_URL}/evaluations/list/", headers=headers)
    print(f"Status: {response.status_code}")
    data = response.json()
    if isinstance(data, dict) and 'count' in data:
        print(f"Count: {data['count']}")
        print(f"Results: {len(data['results'])} items")
    elif isinstance(data, list):
        print(f"Count: {len(data)}")
    else:
        print("Unknown response format")


if __name__ == "__main__":
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("\nERROR: Could not connect to server. Is it running on localhost:8000?")
