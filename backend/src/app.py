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
import math
from multiprocessing import Pool
from onemapsg import OneMapClient

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
Client = OneMapClient(os.environ["EMAIL"], os.environ["PASSWORD"])

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
    name : Optional[str] = Field("", description="Optional name")
    age: Optional[float] = Field(0.0, description="Opti@onal age")
    gender: Optional[str] = Field("", description="Optional gender")
    race: Optional[str] = Field("", description="Optional race")
    workoutFreq: Optional[str] = Field("", description="Optional workout frequency")
    duration: Optional[str] = Field("", description="Optional workout duration")
    injuries: Optional[List[str]] = Field([], description="Optional injuries")
    core: Optional[List[str]] = Field([], description="Optional responses for core strength")
    upperBody: Optional[List[str]] = Field([], description="Optional responses for upp body strength")
    lowerBody: Optional[List[str]] = Field([], description="Optional responses for lower body strength")

class DistanceRequest(BaseModel):
    address: str
    topk: int

class ParkRequest(BaseModel):
    _id: str
    name: str
    coordinates: List[float]
    inc_crc: str
    fml_upd_d: str

class GymRequest(BaseModel):
    name: str
    kml_id: str
    coordinates: List[float]
    dinc_crc: str
    fml_upd_d: str
    hyperlink: str
    photo_url: str
    postal_code: str
    street_name: str
    building_number: str
    building_name: str
    unit_number: str
    floor: str
    description: str

class FitnessCornerRequest(BaseModel):
    _id: str
    name:str
    coordinates: List[float]
    global_id: str
    subtype: int
    inc_crc: str
    fml_upd_d: str

class AllGymsRequest(BaseModel):
    data: List[GymRequest]

class AllParksRequest(BaseModel):
    data: List[ParkRequest]

class AllFitnessCornerRequest(BaseModel):
    data: List[FitnessCornerRequest]

# Haversine formula to calculate the great-circle distance
def haversine(lat1, lon1, lat2, lon2):
    R = 6371.0  # Radius of the Earth in kilometers
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)
    
    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad
    
    a = math.sin(dlat / 2)**2 + math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    
    return R * c  # Distance in kilometers

def calculate_distance(pair):
    lat_s, lon_s, event_document = pair
    lat_l = float(event_document['coordinates'][0])
    lon_l = float(event_document['coordinates'][1])
    
    dist = haversine(lat_s, lon_s, lat_l, lon_l)
    
    # Add distance to event document
    event_document['distance'] = dist

    event_document['_id'] = str(event_document['_id'])
    
    return event_document

# Function to parallelize the distance calculation
def calculate_distances(events_cursor, lat_s, lon_s):
    # Prepare the input pairs: (lat_s, lon_s, event_document)
    pairs = [(float(lat_s), float(lon_s), data) for data in events_cursor]
    
    # Use Pool to parallelize the computation
    with Pool() as pool:
        result = pool.map(calculate_distance, pairs)
    
    # Sort events by distance (ascending order)
    sorted_result = sorted(result, key=lambda event: event['distance'])
    
    # Convert the sorted list into a dictionary with _id as the key
    event_dict = {event['_id']: {**event, 'distance': event['distance']} for event in sorted_result}
    
    return event_dict

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
    name = request_data.name
    age = request_data.age
    gender = request_data.gender
    race = request_data.race
    frequency = request_data.workoutFreq
    duration = request_data.duration
    injury = request_data.injuries
    core_strength = request_data.core
    upper_body_strength = request_data.upperBody
    lower_body_strength = request_data.lowerBody
    user_id = uuid.uuid4().hex

    recommender = Recommender()
    upper_body = recommender.upper_body
    lower_body = recommender.lower_body
    abdominals = recommender.abs

    # Initialize preference weights
    preferences = {}
    for col, body_part in zip([upper_body, lower_body, abdominals], ['upper', 'lower', 'abs']):
        preferences[body_part] = initialize_weights([str(i['_id']) for i in col.find({})])

    recommender = Recommender()
    reps_n_sets = calculate_reps_and_sets(preferences, core_strength, upper_body_strength, lower_body_strength)

    # Create the user object
    new_user = {
        "username": user_id,
        "name": name,
        "age": age,
        "gender": gender,
        "race": race,
        "frequency": frequency,
        "duration": duration,
        "injury": injury,
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
                        'injury': injury}
        }
    else:
        raise HTTPException(status_code=401, detail="UserID does not exist")
    
@app.post("/get_nearest")
async def nearest(request_data: DistanceRequest):
    add = request_data.address
    top_k = request_data.topk
    url = f"https://www.onemap.gov.sg/api/common/elastic/search?searchVal={add}&returnGeom=Y&getAddrDetails=Y&pageNum=1"
    headers = {
        "Authorization": os.environ['TOKEN']
    }
    
    # Fetch events from the database
    all_events = list(client['events_collection']['events_database'].find({}))  # Convert cursor to list for processing
    
    # Get coordinates of the address (latitude and longitude)
    try:
        res = requests.get(url, headers=headers).json()
        lat, lon = res['results'][0]['LATITUDE'], res['results'][0]['LONGITUDE']
    except Exception as e:
        return {"message": "Error fetching location data", "error": str(e)}
    
    # Calculate distances and sort by nearest
    ranked_events = calculate_distances(all_events, lat, lon)
    
    sorted_top_k = dict(sorted(ranked_events.items(), key=lambda item: item[1]['distance'])[:top_k])
    
    # Return the top-k events with distance included
    return {
        "message": "Fetched activities",
        "activities": sorted_top_k
    }

@app.post("/get_fitness_corners")
async def fitness():
    all_fitness_corners = list(client['events_collection']['fitness_corner_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched fitness corners",
        "fitness_corners": all_fitness_corners
    }

@app.post("/get_parks")
async def parks():
    all_fitness_corners = list(client['events_collection']['parks_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched parks",
        "parks": all_fitness_corners
    }

@app.post("/get_gyms")
async def fitness():
    all_fitness_corners = list(client['events_collection']['gym_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched gyms",
        "gyms": all_fitness_corners
    }