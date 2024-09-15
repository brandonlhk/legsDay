import requests
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict
from recommendation import Recommender

app = FastAPI()

# Pydantic model for request body validation
class UserIDRequest(BaseModel):
    userid: str

class PasswordRequest(BaseModel):
    password: str

class CreateAccountRequest(BaseModel):
    userid: str
    password: str

@app.post("/recommend")
async def recommend_program(request_data: UserIDRequest):
    userid = request_data.userid

    # Initialize the recommender
    recommender = Recommender()

    # Fetch user data and recommend a program
    try:
        user_file = recommender.fetch_user_file(userid)
        program = recommender.recommend_program(user_file)

        response = {'status': 'successful', 'data': program}

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/login")
# Write login endpoint here
async def login(request_data: CreateAccountRequest):
    userid = request_data.userid
    password = request_data.password

    # Implement your login logic here
    # For example, check if userid and password match an entry in your database
    try:
        # Placeholder for actual login logic
        if userid == "testuser" and password == "testpassword":  # Replace with actual validation
            return {"status": "success", "message": "Login successful"}
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")


@app.post("/create")
async def create_account(request_data: CreateAccountRequest):
    userid = request_data.userid
    password = request_data.password

    # Implement your account creation logic here. This should include some logic to write the new account to userdb in mongo.
    # For example, check if userid already exists and create a new entry in your database
    try:
        # Placeholder for actual account creation logic
        if userid == "testuser":  # Replace with actual check
            raise HTTPException(status_code=400, detail="User already exists")
        else:
            # Create the user in the database
            return {"status": "success", "message": "Account created successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")