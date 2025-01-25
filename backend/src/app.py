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
    '''date needs to be in yyyy-mm-dd format'''
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
    
class CheckInRequest(BaseModel):
    user_id: str
    date: str
    time: str
    location_type: str
    location_id: str
    booking_name: str

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
    booking_name: str
    user_id : str
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
    location_type: str
    location_id: str
    msg_content: str
    booking_name: str


def calculate_distance(lat1, lon1, lat2, lon2):
    return geodesic((lat1, lon1), (lat2, lon2)).km

def parks():
    all_fitness_corners = list(client['events_collection']['parks_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched parks",
        "parks": all_fitness_corners
    }

def gyms():
    all_fitness_corners = list(client['events_collection']['gym_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched gyms",
        "gyms": all_fitness_corners
    }

def fitness():
    all_fitness_corners = list(client['events_collection']['fitness_corner_database'].find({})) 
    for i, fc in enumerate(all_fitness_corners):
        _id = str(fc['_id'])
        all_fitness_corners[i]['_id'] = _id

    return {
        "message": "Fetched fitness corners",
        "fitness_corners": all_fitness_corners
    }

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
        # coordinates= gym_data['coordinates']
        location_data['gym'].append({
            'id': gym_id,
            'location_data': gym_data['location_data'],
            'user_groups': gym_data['user_groups']
        })

    # Fetch park data
    all_parks = timeslot["parks"]
    for _id, data in all_parks.items():
        # coordinates= data['coordinates']
        location_data['parks'].append({
            'id': _id,
            'location_data': data['location_data'],
            'user_groups': data['user_groups']
        })


    # Fetch fitness corner data
    all_fitness_corners = timeslot["fitness_corner"]
    for _id, data in all_fitness_corners.items():
        # coordinates= data['location_data']['coordinates']
        location_data['fitness_corner'].append({
            'id': _id,
            'location_data': data['location_data'],
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

    # Initialize the nearest locations dictionary
    nearest = {}
    all_gyms = gyms()['gyms']  # Assuming this fetches a list of gyms from your MongoDB
    all_fitness = fitness()['fitness_corners']  # Assuming this fetches fitness locations
    all_parks = parks()['parks']  # Assuming this fetches parks locations

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

    # Access the schedule collection and find events for the specific date
    schedule_collection = client['events_collection']['schedule_database']
    events = schedule_collection.find({
    "datetime": {"$regex": f"^{date}", "$options": "i"}}, {"_id": 0})
    visited = set()

    # Iterate through all events and locations, integrating them into the nearest dictionary
    for entry in events:
        loc_coordinates = entry['location_data']['coordinates']
        loc_name = entry['location_data']['name']
        location_id = entry['location_id']

        # Calculate the distance from the provided coordinates
        distance = calculate_distance(lat, lon, loc_coordinates[1], loc_coordinates[0])

        # If the location is within 1 km, add it to the nearest dictionary
        if distance <= 1:
            booking_dict = {entry['datetime']: {'user_ids': entry['user_ids'], 'chat_id': entry['chat_id'], 'checked_in': entry['checked_in']}}
            if nearest.get(location_id):
                nearest[location_id]['bookings'].append(booking_dict)

            else:
                visited.add(loc_name)
                nearest[location_id] = {
                    'location_type':entry['location_type'],
                    'location_data': entry['location_data'],
                    'bookings': [booking_dict]
                }
                
    
    # Now include the locations from gyms, fitness, and parks that are within 1 km
    for location_type, all_locations in {'gym': all_gyms, 'fitness_corner': all_fitness, 'parks': all_parks}.items():
        for loc in all_locations:
            loc_coordinates = loc['coordinates']
            location_name = loc['name']
            if location_name not in visited:
                # Calculate the distance from the provided coordinates
                distance = calculate_distance(lat, lon, loc_coordinates[1], loc_coordinates[0])

                # If the location is within 1 km, add it to the nearest dictionary
                if distance <= 1:
                    loc_id = str(loc['_id'])  # Assuming the ID is stored like this in MongoDB
                    del loc['_id']
                    nearest[loc_id] = {
                        'location_data': loc,
                        'location_type': location_type,
                        'bookings': []
                    }

    return {
        "message": "Fetched locations within 1km",
        "locations": nearest  # Returning the nearest locations
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
    booking_name = request_data.booking_name
    user_id = request_data.user_id
    location_type = request_data.location_type
    location_id = request_data.location_id

    '''
    Sample Schema:
    datetime: 'yyyy-mm-ddThh:mm:ss'
    location_type: 'gym',
    location_id: 'xxxxxxxx'
    location_data: {},
    booking_name: str,
    user_ids: [user_id],
    chat_id: 'xxxxxxx',
    checked_in: {user_id: False}
    '''

    # Convert the date and time to a datetime string
    date_time_str = f"{date} {time}"
    timeslot_time = datetime.strptime(date_time_str, "%Y-%m-%d %H:%M:%S").isoformat()

    # Initialize the chat collection
    chat_collection = client['events_collection']['chats']

    # Check if the user exists
    user = user_collection.find_one({'_id': ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Look for an existing chat
    chat = chat_collection.find_one({
        "timeslot": timeslot_time,
        "location_type": location_type,
        "location_id": location_id,
        "booking_name": booking_name
    })

    # If no chat exists, create a new one
    if not chat:
        chat_result = chat_collection.insert_one({
            "timeslot": timeslot_time,
            "location_type": location_type,
            "location_id": location_id,
            "booking_name": booking_name,
            "messages": [],  # Empty message list initially
        })
        chat_id = str(chat_result.inserted_id)
    else:
        chat_id = str(chat["_id"])

    # Update user's booking_names
    existing_booking_names = user.get('booking_names', [])

    # Create the user group entry (simplified)
    booking_name_entry = {
                'datetime': timeslot_time,
                'location_type': location_type,
                'location_id': location_id,
                'booking_name': booking_name,
                'location_data': client['events_collection'][f'{location_type}_database'].find_one(
                            {'_id': ObjectId(location_id)}, 
                            {'_id': 0}  # Exclude the _id field
                        ),
                'chat_id': chat_id,
                'checked_in': False
            }

    # Check if the user is already in the group
    is_group_present = False

    for group in existing_booking_names:
        if group.get('datetime', '') == timeslot_time:
            is_group_present = True
            return {'message': f'{user_id} already joined {booking_name} at {timeslot_time} at {location_id}'}

    # Add the user group entry
    existing_booking_names.append(booking_name_entry)

    # Update the user's booking_names in the user collection
    user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"booking_names": existing_booking_names}},
        upsert=False
    )

    result_message = f"User {user_id} successfully added to the group {booking_name} at {location_id} for timeslot {timeslot_time}."

    # Initialize the schedule collection
    schedule_collection = client['events_collection']['schedule_database']

    # Try to find the existing timeslot, if it exists
    query = {
    "datetime": timeslot_time,
    "location_type": location_type,
    "location_id": location_id,
    "booking_name": booking_name
    }

    # Find the timeslot document based on the query
    timeslot = schedule_collection.find_one(query)
    
    if not timeslot:
        # If the timeslot for the date doesn't exist, create it dynamically with the new schema
        timeslot = {
            "datetime": timeslot_time,  # Use the timeslot_time as datetime
            "location_type": location_type,
            "location_id": location_id,
            "booking_name": booking_name,
            "location_data": client['events_collection'][f'{location_type}_database'].find_one(
                            {'_id': ObjectId(location_id)}, 
                            {'_id': 0}  # Exclude the _id field
                        ),
            "user_ids": [user_id],  # Start with the user in the group
            "chat_id": chat_id,
            "checked_in": {user_id: False}
        }
        # Insert the new timeslot for the date
        schedule_result = schedule_collection.insert_one(timeslot)
        if schedule_result.acknowledged:
            result_message = f"Timeslot created for user {user_id} at {date}T{time}."
        else:
            result_message = "Error in creating timeslot"
    else:
        if user_id not in timeslot['user_ids']:
            timeslot['user_ids'].append(user_id)
            timeslot['checked_in'][user_id] = False

        schedule_result = schedule_collection.update_one(
        {
            "datetime": timeslot_time,  # Match the timeslot datetime
            "location_type": location_type,
            "location_id": location_id,
            "booking_name": booking_name,
        },
        {
            "$set": {
                "user_ids": timeslot['user_ids'],
                "checked_in": timeslot['checked_in']
            }
        },
        upsert=False  # Do not insert a new document, just update the existing one
    )

        if schedule_result.modified_count > 0:
            result_message = f"Timeslot {date}T{time} successfully updated for user {user_id}."
        else:
            result_message = f"User {user_id} is already in the group for the given timeslot."

    return {"message": result_message}


@app.delete("/exit_user_group")
async def exit_user_group(request_data: JoinUserGroupRequest):
    date = request_data.date
    time = request_data.time
    user_id = request_data.user_id
    booking_name = request_data.booking_name
    location_type = request_data.location_type
    location_id = request_data.location_id

    # Convert the date and time to a datetime string
    date_time_str = f"{date} {time}"
    timeslot_time = datetime.strptime(date_time_str, "%Y-%m-%d %H:%M:%S").isoformat()

    # Fetch the document based on the date and time
    schedule_collection = client['events_collection']['schedule_database']

    # Try to find the existing timeslot, if it exists
    query = {
        "datetime": timeslot_time,
        "location_type": location_type,
        "location_id": location_id,
        "booking_name": booking_name
    }

    # Find the timeslot document based on the query
    timeslot = schedule_collection.find_one(query)

    if not timeslot:
        raise HTTPException(status_code=404, detail="Timeslot or user group not found.")

    # Remove the user from the user group in the schedule database
    user_list = timeslot["user_ids"]
    print(user_list, user_id, user_id in user_list)
    
    if user_id in user_list:
        user_list.remove(user_id)
        timeslot["user_ids"] = user_list
    else:
        raise HTTPException(status_code=404, detail="User not found in the user group.")

    # Update the schedule database to reflect the changes
    schedule_result = schedule_collection.update_one(
        {
            "datetime": timeslot_time,  # Match the timeslot datetime
            "location_type": location_type,
            "location_id": location_id,
            "booking_name": booking_name
        },
        {
            "$set": {
                "user_ids": timeslot['user_ids'],
                "checked_in": timeslot['checked_in']
            }
        },
        upsert=False  # Do not insert a new document, just update the existing one
    )

    print(schedule_result.modified_count)

    # Fetch the user document
    user = user_collection.find_one({'_id': ObjectId(user_id)})

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Remove the user from their booking_names in the user collection
    existing_booking_names = user['booking_names']
    updated_booking_names = []

    for group_dict in existing_booking_names:
        if not group_dict['datetime'] == timeslot_time:
            updated_booking_names.append(group_dict)
    print(existing_booking_names, updated_booking_names)
    # Update the user document with the new booking_names list
    user_result = user_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"booking_names": updated_booking_names}},
        upsert=False  # Do not create a new document; we are updating an existing one
    )

    # Check if the schedule document was modified
    if user_result.modified_count == 0:
        return {"message": f"User {user_id} was not found for {booking_name} in {location_id} for {date}T{time}."}
    elif user_result.modified_count > 0:
        return {"message": f"User {user_id} successfully removed from {booking_name} in {location_id} for {date}T{time}."}
    else:
        raise HTTPException(status_code=500, detail="User DB was not updated correctly.")

        
@app.post("/save_chat")
async def save_chat(request_data: SaveChatRequest):
    # Retrieve the necessary fields from the request data
    timeslot = request_data.timeslot  # In the format "yyyy-mm-ddTxx:xx:xx"
    booking_name = request_data.booking_name
    user_id = request_data.user_id
    location_type = request_data.location_type
    location_id = request_data.location_id
    msg_content = request_data.msg_content
    msg_timestamp = request_data.msg_timestamp

    # Convert the timeslot to ISO format (ensure consistency)
    try:
        datetime_obj = datetime.strptime(timeslot, "%Y-%m-%dT%H:%M:%S")
        timeslot_iso = datetime_obj.isoformat()  # Standard ISO format: "yyyy-mm-ddTHH:MM:SS"
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid date or time format.")

    # Fetch the chat document for the given timeslot, location, and user group
    chat_collection = client['events_collection']['chats']
    chat = chat_collection.find_one({
        "timeslot": timeslot_iso,
        "location_type": location_type,
        "location_id": location_id,
        "booking_name": booking_name
    })

    # If the chat doesn't exist, we cannot save a message, so return an error
    if not chat:
        raise HTTPException(status_code=404, detail="Chat not found for this user group.")

    # Create the new chat message object
    chat_message = {
        "timestamp": msg_timestamp,
        "user_id": user_id,
        "message": msg_content,
        "name": ""  # Placeholder for user name, will be fetched below
    }

    # Fetch the user's name based on user_id
    user = user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Add the user's name to the chat message
    chat_message["name"] = user['name']

    # Update the chat collection by appending the new message to the existing array
    chat_collection.update_one(
        {"_id": chat["_id"]},  # Identify the specific chat document
        {"$push": {"messages": chat_message}}  # Append the new message to the 'messages' array
    )

    return {"message": f"Chat message saved successfully for {user_id} at {timeslot_iso}."}

@app.post("/get_user_groups")
async def get_user_groups(request_data: GetUserGroupRequest):
    user_id = request_data.user_id
    current_datetime = datetime.now(pytz.timezone('Asia/Singapore'))
    chat_collection = client['events_collection']['chats']

    # Fetch the user document
    user = user_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    all_booking_names = user.get('booking_names', [])
    booking_names = []

    # Iterate through each group dictionary in the user's groups
    for group_dict in all_booking_names:
        print(group_dict)
        timestamp_str = group_dict['datetime']
        # Convert the timestamp string to a datetime object
        try:
            timestamp = datetime.fromisoformat(timestamp_str).replace(tzinfo=pytz.timezone('Asia/Singapore'))
        except ValueError:
            continue  # Skip invalid timestamps
        
        # If the timestamp is in the future, process the group
        # if timestamp > current_datetime:
        if timestamp:
            # Fetch additional location data from the schedule database if necessary
            location_data = group_dict.get('location_data', {})
            chat_id = group_dict.get('chat_id', None)
            chat_data = chat_collection.find_one({'_id': ObjectId(chat_id)}, {'_id': 0, 'messages': 1})
            # if isinstance(location_data, dict) and '_id' in location_data:
            #     location_data['_id'] = str(location_data['_id'])

            # Add the group to the booking_names list if it's in the future
            booking_names.append({
                "timestamp": timestamp.isoformat(),
                "location_type": group_dict.get('location_type', ''),
                "location_id": group_dict.get('location_id', ''),
                "booking_name": group_dict.get('booking_name', ''),
                "chat_data": {'chat_id': chat_id,
                                'chat_history': chat_data},
                "checked_in": group_dict.get('checked_in', False),
                "location_data": location_data
            })

    return {
        "message": f"Fetched user groups for user {user_id}",
        "user_groups": booking_names
    }


@app.post("/check_in")
async def check_in(request_data: CheckInRequest):
    user_id = request_data.user_id
    timeslot_time = datetime.strptime(f'{request_data.date} {request_data.time}', "%Y-%m-%d %H:%M:%S").isoformat()
    location_type = request_data.location_type
    booking_name = request_data.booking_name
    location_id = request_data.location_id
    schedule_collection = client['events_collection']['schedule_database']

    # Find the user in the database
    user = user_collection.find_one({'_id': ObjectId(user_id)})
    if not user:
        return {"message": f"Invalid UserID"}

    # Find if the user already has the group entry with the provided timeslot and location
    existing_group_entry = None
    for entry in user['booking_names']:
        timestamp_str = entry['datetime']
        if timestamp_str == timeslot_time:
            if (
                entry.get('location_type') == location_type and
                str(entry.get('location_id')) == location_id):
                existing_group_entry = entry
                break
        if existing_group_entry:
            break

    if existing_group_entry:
        # If an entry exists, update just the `checked_in` field for that timeslot
        result = user_collection.update_one(
            {
                "_id": ObjectId(user_id),
                f"booking_names.{user['booking_names'].index(existing_group_entry)}.location_type": location_type,
                f"booking_names.{user['booking_names'].index(existing_group_entry)}.location_id": location_id,
                f"booking_names.{user['booking_names'].index(existing_group_entry)}.datetime": timeslot_time,
                f"booking_names.{user['booking_names'].index(existing_group_entry)}.booking_name": booking_name,
            },
            {
                "$set": {
                    f"booking_names.{user['booking_names'].index(existing_group_entry)}.checked_in": True  # Update the `checked_in` field
                }
            }
        )

        # Now, also update the check-in status in the schedule collection
        schedule_result = schedule_collection.update_one(
            {
                "datetime": timeslot_time,
                "location_type": location_type,
                "location_id": location_id,
                "booking_name": booking_name,
                "user_ids": {"$in": [user_id]}  # Ensure the user is part of the group
            },
            {
                "$set": {
                    f"checked_in.{user_id}": True  # Update the checked_in status for the user
                }
            }
        )

        if result.modified_count > 0 and schedule_result.modified_count > 0:
            return {"message": "Checked in successfully", "checked_in": True}
        elif result.modified_count > 0:
            return {"message": "Already checked in", "checked_in": True}
        else:
            return {"message": "Failed to update check-in status"}
    else:
        return {"message": f"User {user_id} does not have {booking_name} at {request_data.date}T{request_data.time} with the specified location."}
