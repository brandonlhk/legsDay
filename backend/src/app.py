import os
import re
import uuid
from collections import defaultdict
import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr, Field
from typing import Dict, Optional, List
from werkzeug.security import check_password_hash, generate_password_hash
from pymongo import MongoClient, ReturnDocument
from recommendation import Recommender
from userdbManager import User
from bson.objectid import ObjectId

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
exercise_db = client['exercise_database']

class SubstitutionData(BaseModel):
    exercise_id: str
    name: str
    body_part: str

class SubstitutionRequest(BaseModel):
    userid: str
    substitution: SubstitutionData
    
class RecommendationRequest(BaseModel):
    userid: str
    
class LoginRequest(BaseModel):
    username: str
    password: str

class FrequencyRequest(BaseModel):
    userid: str

class SettingsRequest(BaseModel):
    userid: str
    frequency: Optional[str] = Field("", description="Optional workout frequency")
    duration: Optional[str] = Field("", description="Optional workout duration")
    injury: Optional[List[str]] = Field([], description="Optional injury")

class CreateAccountRequest(BaseModel):
    age: Optional[float] = Field(0.0, description="Optional age")
    gender: Optional[str] = Field("", description="Optional gender")
    frequency: Optional[str] = Field("", description="Optional workout frequency")
    duration: Optional[str] = Field("", description="Optional workout duration")
    status: Optional[str] = Field("", description="Optional status")
    injury: Optional[List[str]] = Field([], description="Optional injury")
    level: Optional[str] = Field("", description="Optional exercise experience")
    core_strength: Optional[List[str]] = Field([], description="Optional responses for core strength")
    upper_body_strength: Optional[List[str]] = Field([], description="Optional responses for upp body strength")
    lower_body_strength: Optional[List[str]] = Field([], description="Optional responses for lower body strength")

# function to check if email input is valid 
def is_email_valid(email: str):
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if (re.fullmatch(regex, email)):
        return True
    else:
        return False

def initialize_weights(ids: list):
    return {id: float(1) for id in ids}

def calculate_reps_and_sets(preferences, core_strength, upper_body_strength, lower_body_strength):
        recommended_reps_and_sets = {'upper': defaultdict(str), 'lower': defaultdict(str), 'abs': defaultdict(str)}

        core_strength = len(core_strength)
        upper_body_strength = len(upper_body_strength)
        lower_body_strength = len(lower_body_strength)
        
        strength_mapping = {0: 'advanced', 1: 'intermediate', 2: 'beginner', 3: 'beginner'}
         
        for body_part, exercises in preferences.items():
            if body_part == 'upper':
                strength_level = strength_mapping[upper_body_strength]
            elif body_part == 'lower':
                strength_level = strength_mapping[lower_body_strength]
            else:
                strength_level = strength_mapping[core_strength]

            for exercise in exercises:
                # Fetch the exercise document
                exercise_data = exercise_db[body_part].find_one(ObjectId(exercise))  # Adjust the query as needed
                
                # Create reps_and_sets dictionary
                recommended_reps = exercise_data[f'recommended_reps_{strength_level}']

                recommended_reps_and_sets[body_part][exercise] = recommended_reps
            
        # print(recommended_reps_and_sets)
        return recommended_reps_and_sets


@app.post("/recommend")
async def recommend_program(request_data: RecommendationRequest):
    userid = request_data.userid

    # Initialize the recommender
    recommender = Recommender()

    # Fetch user data and recommend a program
    # try:
    user_file = recommender.fetch_user_file(userid)
    program = recommender.recommend_program(user_file)
    response = {'message': 'program recommended successfully', 'data': program}

    return response
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post("/substitute")
async def substitute_program(request_data: SubstitutionRequest):
    userid = request_data.userid
    substitution = request_data.substitution

    # Initialize the recommender
    recommender = Recommender()

    # Fetch user data and recommend a program
    try:
        user_file = recommender.fetch_user_file(userid)
        program = recommender.substitute(substitution.body_part, substitution.exercise_id, user_file)
        response = {'message': 'program recommended successfully', 'data': program}

        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.post('/register')
async def register(request_data: CreateAccountRequest):
    age = request_data.age
    gender = request_data.gender
    frequency = request_data.frequency
    duration = request_data.duration
    status = request_data.status
    injury = request_data.injury
    level = request_data.level
    core_strength = request_data.core_strength
    upper_body_strength = request_data.upper_body_strength
    lower_body_strength = request_data.lower_body_strength
    user_id = uuid.uuid4().hex

    recommender = Recommender()
    upper_body = recommender.upper_body
    lower_body = recommender.lower_body
    abdominals = recommender.abs

    # # Check if email, username, and password are provided (redundant due to Pydantic validation)
    # if not username or not email or not password:
    #     raise HTTPException(status_code=400, detail="Email, username, and password are required")

    # # Check if email is valid
    # if not is_email_valid(email):
    #     raise HTTPException(status_code=400, detail="Invalid email")

    # # Check if the email already exists in the database
    # if user_collection.find_one({"email": email}):
    #     raise HTTPException(status_code=400, detail="Email already exists")

    # # Hash the password
    # hashed_password = generate_password_hash(password)

    # Initialize preference weights
    preferences = {}
    for col, body_part in zip([upper_body, lower_body, abdominals], ['upper', 'lower', 'abs']):
        preferences[body_part] = initialize_weights([str(i['_id']) for i in col.find({})])

    recommender = Recommender()
    reps_n_sets = calculate_reps_and_sets(preferences, core_strength, upper_body_strength, lower_body_strength)

    # Create the user object
    new_user = {
        "username": user_id,
        "age": age,
        "gender": gender,
        "frequency": frequency,
        "duration": duration,
        "status": status,
        "injury": injury,
        "level": level,
        "upper_body_strength": upper_body_strength,
        "lower_body_strength": lower_body_strength,
        "core_strength": core_strength,
        "preferences": preferences,
        "reps": reps_n_sets
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

@app.post("/frequency")
async def frequency(request_data: FrequencyRequest):
    userid = request_data.userid

    # Find the user in the database
    user = user_collection.find_one(ObjectId(userid))

    # Check if user exists and password is correct
    if user:
        return {
            "message": "Retrieval successful",
            "frequency": str(user['frequency'])
        }
    else:
        raise HTTPException(status_code=401, detail="UserID does not exist")

@app.post("/settings")
async def settings(request_data: SettingsRequest):
    userid = request_data.userid
    frequency =  request_data.frequency
    duration = request_data.duration
    injury = request_data.injury

    user = user_collection.find_one(ObjectId(userid))

    if user:
        if frequency:
            user_collection.find_one_and_update({'_id': ObjectId(userid)},
                        { '$set': { "frequency" : frequency} }, 
                        return_document = ReturnDocument.AFTER)
        if duration:
            user_collection.find_one_and_update({'_id': ObjectId(userid)},
                        { '$set': { "duration" : duration} }, 
                        return_document = ReturnDocument.AFTER)
        if injury:
            user_collection.find_one_and_update({'_id': ObjectId(userid)},
                        { '$set': { "injury" : injury} }, 
                        return_document = ReturnDocument.AFTER)
        return {
            "message": "Rewrote to db successsfully",
            "amended": {'frequency': frequency,
                        'duration': duration,
                        'weight': weight,
                        'injury': injury}
        }
    else:
        raise HTTPException(status_code=401, detail="UserID does not exist")
    

    
