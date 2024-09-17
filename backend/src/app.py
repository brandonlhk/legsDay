import os
import re
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Optional
from werkzeug.security import check_password_hash, generate_password_hash
from pymongo import MongoClient
from recommendation import Recommender
from userdbManager import User

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],  
    allow_headers=["*"]
)
# MongoDB connection
mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay')
client = MongoClient(mongo_uri)
client.server_info()
user_db = client.user
user_collection = user_db.users

# Pydantic model for request body validation
class UserIDRequest(BaseModel):
    userid: str

class LoginRequest(BaseModel):
    username: str
    password: str

class CreateAccountRequest(BaseModel):
    email: EmailStr
    username: str
    password: str
    age: Optional[float] = Field(0.0, description="Optional age")
    height: Optional[float] = Field(0.0, description="Optional height")
    weight: Optional[float] = Field(0.0, description="Optional weight")
    gender: Optional[str] = Field("", description="Optional gender")
    frequency: Optional[str] = Field("", description="Optional workout frequency")
    duration: Optional[str] = Field("", description="Optional workout duration")

# function to check if email input is valid 
def is_email_valid(email: str):
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if (re.fullmatch(regex, email)):
        return True
    else:
        return False

@app.post("/recommend")
async def recommend_program(request_data: UserIDRequest):
    userid = request_data.userid

    # Initialize the recommender
    recommender = Recommender()

    # Fetch user data and recommend a program
    try:
        user_file = recommender.fetch_user_file(userid)
        # print(user_file)
        program = recommender.recommend_program(user_file)
        # print(program)
        response = {'message': 'program recommended successfully', 'data': program}

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post('/register')
async def register(request_data: CreateAccountRequest):
    email = request_data.email
    username = request_data.username
    password = request_data.password
    age = request_data.age
    height = request_data.height
    weight = request_data.weight
    gender = request_data.gender
    frequency = request_data.frequency
    duration = request_data.duration

    # Check if email, username, and password are provided (redundant due to Pydantic validation)
    if not username or not email or not password:
        raise HTTPException(status_code=400, detail="Email, username, and password are required")

    # Check if email is valid
    if not is_email_valid(email):
        raise HTTPException(status_code=400, detail="Invalid email")

    # Check if the email already exists in the database
    if user_collection.find_one({"email": email}):
        raise HTTPException(status_code=400, detail="Email already exists")

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Create the user object
    new_user = {
        "email": email,
        "username": username,
        "password": hashed_password,  # Store hashed password
        "age": age,
        "height": height,
        "weight": weight,
        "gender": gender,
        "frequency": frequency,
        "duration": duration
    }

    # Insert the new user into the database
    result = user_collection.insert_one(new_user)

    return {
        "message": "User created successfully",
        "userid": str(result.inserted_id)
    }

@app.post("/login")
async def login(request_data: LoginRequest):
    username = request_data.username
    password = request_data.password

    # Find the user in the database
    user = user_collection.find_one({"username": username})

    # Check if user exists and password is correct
    if user and check_password_hash(user['password'], password):
        return {
            "message": "Login successful",
            "userid": str(user['_id'])
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid username or password")