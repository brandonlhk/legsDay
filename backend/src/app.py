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
from datetime import datetime
from geopy.distance import geodesic
import pytz

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
    email: str
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
    age: Optional[int] = Field(0, description="Optional age")
    gender: Optional[str] = Field("", description="Optional gender")
    race: Optional[str] = Field("", description="Optional race")
    workoutFreq: Optional[str] = Field("", description="Optional workout frequency")
    injuries: Optional[List[str]] = Field([], description="Optional injuries")
    core: Optional[List[str]] = Field([], description="Optional responses for core strength")
    upperBody: Optional[List[str]] = Field([], description="Optional responses for upp body strength")
    lowerBody: Optional[List[str]] = Field([], description="Optional responses for lower body strength")
    email: Optional[str] = Field("")
    password: Optional[str] = Field("")

class DistanceRequest(BaseModel):
    address: str
    '''date needs to be in yyyy-mm-dd format. time needs to be in xx:xx:xx format'''
    date: str
    time: str

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

class WorkoutCounter(BaseModel):
    user_id: str
    date: str
    counter: int

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
    
class TimeslotRequest(BaseModel):
    '''date needs to be in yyyy-mm-dd format. time needs to be in xx:xx:xx format'''
    date: str
    time: str

class JoinUserGroupRequest(BaseModel):
    '''date needs to be in yyyy-mm-dd format. time needs to be in xx:xx:xx format'''
    date : str
    time : str
    user_id : str
    user_group : str
    location_id : str
    location_type: str

class GetUserGroupRequest(BaseModel):
    '''current datetime needs to be in yyyy-mm-ddTxx:xx:xx format, which is ISO format'''
    user_id : str

class SaveChatRequest(BaseModel):
    '''timeslot and msg_timestamp strings need to be in yyyy-mm-ddYxx:xx:xx format'''
    timeslot : str
    msg_timestamp: str
    user_id: str
    user_group: str
    location_type: str
    location_id: str
    msg_content: str

def calculate_distance(lat1, lon1, lat2, lon2):
    return geodesic((lat1, lon1), (lat2, lon2)).km

# Function to fetch location data from the databases
def get_locations(timeslot):
    location_data = {
        'gym': [],
        'parks': [],
        'fitness_corner': []
    }

    # Fetch gym data
    all_gyms = timeslot["gym"]
    for gym_id, gym_data in all_gyms.items():
        coordinates= gym_data['coordinates']
        location_data['gym'].append({
            'id': gym_id,
            'coordinates': coordinates,
            'user_groups': gym_data['user_groups']
        })

    # Fetch park data
    all_parks = timeslot["parks"]
    for _id, data in all_parks.items():
        coordinates= data['coordinates']
        location_data['parks'].append({
            'id': _id,
            'coordinates': coordinates,
            'user_groups': data['user_groups']
        })


    # Fetch fitness corner data
    all_fitness_corners = timeslot["fitness_corner"]
    for _id, data in all_fitness_corners.items():
        coordinates= data['coordinates']
        location_data['fitness_corner'].append({
            'id': _id,
            'coordinates': coordinates,
            'user_groups': data['user_groups']
        })

    return location_data

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
    core_strength = request_data.core
    upper_body_strength = request_data.upperBody
    lower_body_strength = request_data.lowerBody
    email = request_data.email
    password = request_data.password
    
    user_id = uuid.uuid4().hex
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256', salt_length=16)

    # Create the user object
    new_user = {
        "user_id": user_id,
        "email": email,
        "password": hashed_password,
        "name": name,
        "age": age,
        "gender": gender,
        "race": race,
        "frequency": frequency,
        "upper_body_strength": upper_body_strength,
        "lower_body_strength": lower_body_strength,
        "core_strength": core_strength,
        "workout_counter": 0,
        "user_groups": []
    }

    # Insert the new user into the database
    result = user_collection.insert_one(new_user)

    return {
        "message": "User created successfully"
    }

@app.post("/login")
async def login(request_data: LoginRequest):
    email = request_data.email
    password = request_data.password

    # Find the user in the database
    user = user_collection.find_one({"email": email})
    print(user)

    # Check if user exists and password is correct
    if user and check_password_hash(user['password'], password):
        return {
            "message": "Login successful",
            "userid": str(user['_id']),
            "workoutFreq": str(user["frequency"]),
            "workoutCounter" : str(user["workout_counter"]),
            "gender" : str(user['gender']),
            "age": str(user['age'])
        }
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

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
    date = request_data.date
    time = request_data.time

    schedule_collection = client['events_collection']['schedule_database']
    date_time_str = f"{date} {time}"
    timeslot_time = datetime.strptime(date_time_str, "%Y-%m-%d %H:%M:%S").isoformat()
    timeslot = schedule_collection.find_one({"date": date, "hour": timeslot_time})

    try:
        # Fetch location data for the provided address
        url = f"https://www.onemap.gov.sg/api/common/elastic/search?searchVal={add}&returnGeom=Y&getAddrDetails=Y&pageNum=1"
        headers = {
            "Authorization": os.environ['TOKEN']
        }
        res = requests.get(url, headers=headers).json()
        lat, lon = res['results'][0]['LATITUDE'], res['results'][0]['LONGITUDE']
    except Exception as e:
        return {"message": "Error fetching location data", "error": str(e)}

    # Get all locations (gyms, parks, fitness corners)
    location_data = get_locations(timeslot)
    # print(location_data)

    # Dictionary to hold locations within 1km
    locations_within_1km = {
        'gym': {},
        'parks': {},
        'fitness_corner': {}
    }

    # Iterate through all locations and filter by distance
    for location_type, locations in location_data.items():
        for location in locations:
            loc_id = location['id']
            loc_coordinates = location['coordinates']
            distance = calculate_distance(lat, lon, loc_coordinates[1], loc_coordinates[0])

            if distance <= 1:  # Only consider locations within 1km
                locations_within_1km[location_type][loc_id] = {
                    'coordinates': loc_coordinates,
                    'user_groups': location['user_groups']  # Assuming user_groups is a dictionary
                }
    return {
        "message": "Fetched locations within 1km",
        "locations": locations_within_1km
    }

@app.get("/get_fitness_corners")
async def fitness():
    all_fitness_corners = list(client['events_collection']['fitness_corner_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched fitness corners",
        "fitness_corners": all_fitness_corners
    }

@app.get("/get_parks")
async def parks():
    all_fitness_corners = list(client['events_collection']['parks_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched parks",
        "parks": all_fitness_corners
    }

@app.get("/get_gyms")
async def fitness():
    all_fitness_corners = list(client['events_collection']['gym_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched gyms",
        "gyms": all_fitness_corners
    }

@app.delete("/workout_reset/{user_id}")
async def reset_workout_counter(user_id: str):
    try:
        # Delete existing counter
        user_collection.update_one(
            {"_id": ObjectId(user_id)},
            {"$unset": {"workout_counter": ""}}
        )
        
        # Create new counter
        today = datetime.now().strftime("%Y-%m-%d")
        new_counter = WorkoutCounter(
            user_id=user_id,
            date=today,
            counter=0
        )
        
        user_collection.update_one(
            {"_id": user_id},
            {"$set": {"workout_counter": new_counter.model_dump()}}
        )
        
        return {"message": "Workout counter reset successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/workout_increment/{user_id}")
async def increment_workout_counter(user_id: str):
    try:
        # Get current counter
        user = user_collection.find_one({"_id": ObjectId(user_id)})
        if not user or "workout_counter" not in user:
            raise HTTPException(status_code=404, detail="Workout counter not found")
            
        counter = user["workout_counter"]
        today = datetime.now().strftime("%Y-%m-%d")
        
        # Verify date is current
        if counter["date"] != today:
            raise HTTPException(status_code=400, detail="Counter needs to be reset for today")
        
        # Increment counter
        user_collection.update_one(
            {"_id": user_id},
                {"$inc": {"workout_counter.counter": 1}}
            )
        
        return {"message": "Counter incremented successfully"}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@app.get("/get_all_locations")
async def all_locations():
    all_gyms = list(client['events_collection']['gym_database'].find({})) 
    for i, fc in enumerate(all_gyms):
        _id = str(fc['_id'])
        all_gyms[i]['_id'] = _id

    all_parks = list(client['events_collection']['parks_database'].find({})) 
    for i, fc in enumerate(all_parks):
        _id = str(fc['_id'])
        all_parks[i]['_id'] = _id

    all_fitness_corners = list(client['events_collection']['fitness_corner_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched all locations",
        "gyms": all_gyms,
        "fitness_corners": all_fitness_corners,
        "parks": all_parks
    }

@app.post("/join_user_group")
async def join_user_group(request_data: JoinUserGroupRequest):
    date = request_data.date
    time = request_data.time
    user_id = request_data.user_id
    user_group = request_data.user_group
    location_type = request_data.location_type
    location_id = request_data.location_id

    # Fetch the document based on the date and time
    schedule_collection = client['events_collection']['schedule_database']
    date_time_str = f"{date} {time}"
    timeslot_time = datetime.strptime(date_time_str, "%Y-%m-%d %H:%M:%S").isoformat()
    timeslot = schedule_collection.find_one({"date": date, "hour": timeslot_time})

    # Add the user to the appropriate user group
    location_data = timeslot[location_type][location_id]
    location_data['user_groups'][user_group]['users'].append(user_id)

    # Now update the MongoDB document with the new data
    result = schedule_collection.update_one(
        {
            "date": date, 
            "hour": timeslot_time # Match the exact datetime for the update
        },
        {"$set": {f"{location_type}.{location_id}": location_data}},  # Update the specific location data
        upsert=False  # Do not create a new document; we're updating an existing one
    )

    location_collection = client['events_collection'][f'{location_type}_database']
    user = user_collection.find_one({'_id': ObjectId(user_id)})
    loc = location_collection.find_one({'_id': ObjectId(location_id)})

    if not user:
        return {"message": f"Invalid UserID"}

    existing_user_groups = user['user_groups']
    existing_user_groups.append({timeslot_time: {'user_group': user_group, 'location': loc}})

    user_result = user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {f"user_groups": existing_user_groups}},  
        upsert=False  # Do not create a new document; we're updating an existing one}
    )

    if result.modified_count == 0 and result.upserted_id:
        return {"message": f"User {user_id} already in {user_group} for {date}T{time}."}
    elif result.modified_count > 0:
        return {"message": f"User {user_id} successfully added to {user_group} for {date}T{time}."}
    else:
        raise HTTPException(status_code=500, detail="Error updating the document in MongoDB.")


@app.post("/save_chat")
async def save_chat(request_data: SaveChatRequest):
    timeslot = request_data.timeslot
    msg_timestamp = request_data.msg_timestamp
    user_id = request_data.user_id
    user_group = request_data.user_group
    location_type = request_data.location_type
    location_id = request_data.location_id
    msg_content = request_data.msg_content

    # Fetch the document based on the date and time
    date = timeslot.split("T")[0].strip()
    schedule_collection = client['events_collection']['schedule_database']
    timeslot_data = schedule_collection.find_one({"date": date, "hour": timeslot})

    location_data = timeslot_data[location_type][location_id]
    location_data['user_groups'][user_group]['chat'].append({msg_timestamp: {user_id: msg_content}})
    # print(location_data['user_groups'][user_group]['chat'], timeslot)
    # Now update the MongoDB document with the new data
    result = schedule_collection.update_one(
        {
            "date": date, 
            "hour": timeslot # Match the exact datetime for the update
        },
        {"$set": {f"{location_type}.{location_id}": location_data}},  # Update the specific location data
        upsert=False  # Do not create a new document; we're updating an existing one
    )

    # print(result)

    if result.modified_count == 0 and result.upserted_id:
        return {"message": f"{msg_timestamp} already exists in {timeslot}'s {user_group} chat."}
    elif result.modified_count > 0:
        return {"message": f"User {user_id} successfully added to {timeslot}'s {user_group} chat.."}
    else:
        raise HTTPException(status_code=500, detail="Error updating the document in MongoDB.")

@app.post("/get_user_groups")
async def get_user_groups(request_data: GetUserGroupRequest):
    user_id = request_data.user_id
    current_datetime = datetime.now(pytz.timezone('Asia/Singapore'))

    user = user_collection.find_one({'_id': ObjectId(user_id)})
    all_user_groups = user['user_groups']
    user_groups = []

    for group_dict in all_user_groups:
        for timestamp_str, group_data in group_dict.items():
            # Convert ObjectId to string for the location field
            if isinstance(group_data['location'], dict):
                group_data['location']['_id'] = str(group_data['location']['_id'])
            
            # Check if the timestamp is after the current datetime
            timestamp = datetime.fromisoformat(timestamp_str).replace(tzinfo=pytz.timezone('Asia/Singapore'))
            if timestamp > current_datetime:
                user_groups.append(group_dict)
    return {
        "message": f"Fetched user groups for user {user_id}",
        "user_groups": user_groups
    }