from fastapi.testclient import TestClient
from backend_system.main import app

client = TestClient(app)

def test_read_main():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Welcome to the Backend Management System"}

def test_create_user():
    # Use a unique email for testing to avoid conflicts if run multiple times
    import time
    email = f"test_{int(time.time())}@example.com"
    response = client.post(
        "/users/",
        json={"email": email, "password": "password"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == email
    assert "id" in data

def test_read_users():
    response = client.get("/users/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)
