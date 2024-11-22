import os
from collections import defaultdict
from datetime import datetime, timedelta
from pymongo import MongoClient
from tqdm import tqdm
import json
from bson.objectid import ObjectId

# MongoDB connection setup
mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay')
client = MongoClient(mongo_uri)
collection = client['events_collection']
client.server_info()

# Define the databases and collections
databases = ['gym_database', 'parks_database', 'fitness_corner_database']
collections = ['events_collection']  # Assuming 'events_collection' holds the location info

def get_location_ids():
    location_ids = defaultdict(list)

    # Retrieve the location _id, latitude, and longitude from each database
    for db_name in databases:
        locations = collection[db_name].find({}, {'_id': 1, 'coordinates': 1})  # Retrieve _id, latitude, and longitude
        
        # Append the location _id along with latitude and longitude to the list
        for location in locations:
            location_data = {
                'id': str(location['_id']),  # Stringify the _id
                'coordinates': location['coordinates']  # Assuming 'latitude' field exists
            }
            location_ids[db_name.split('_')[0]].append(location_data)
    
    return location_ids

def generate_empty_dict(location_ids):
    
    current_date = datetime.now()
    days_to_next_monday = (7 - current_date.weekday()) % 7  # Days until the next Monday
    next_week_start = current_date + timedelta(days=days_to_next_monday)
    
    # Prepare the list to store MongoDB documents
    documents = []
    
    # Define the user groups for each location type
    gym_user_groups = {
        'general_strength_training_ladies': [],
        'general_strength_training_parents': [],
        'general_strength_training_seniors': [],
        'general_strength_training_general': [],
        'powerlifting_ladies': [],
        'powerlifting_parents': [],
        'powerlifting_seniors': [],
        'powerlifting_general': [],
        'functional_mobility_training_ladies': [],
        'functional_mobility_training_parents': [],
        'functional_mobility_training_seniors': [],
        'functional_mobility_training_general': []
    }

    fitness_user_groups = {
        'calisthenics_cardio_ladies': [],
        'calisthenics_cardio_parents': [],
        'calisthenics_cardio_seniors': [],
        'calisthenics_cardio_general': [],
        'calisthenics_strength_ladies': [],
        'calisthenics_strength_parents': [],
        'calisthenics_strength_seniors': [],
        'calisthenics_strength_general': []
    }

    park_user_groups = {
        'calisthenics_ladies': [],
        'calisthenics_parents': [],
        'calisthenics_seniors': [],
        'calisthenics_general': [],
        '2.4k_ladies': [],
        '2.4k_parents': [],
        '2.4k_seniors': [],
        '2.4k_general': [],
        '5k_ladies': [],
        '5k_parents': [],
        '5k_seniors': [],
        '5k_general': [],
        'brisk_walk_ladies': [],
        'brisk_walk_parents': [],
        'brisk_walk_seniors': [],
        'brisk_walk_general': []
    }

    # Loop through each day of the next week (7 days)
    current_day = next_week_start
    for _ in tqdm(range(7)):  # A week has 7 days
        for hour in range(7, 23):  # Restrict to hours between 7 AM (inclusive) and 10 PM (inclusive)
            # Generate the current hour key (in datetime format)
            hour_time = current_day.replace(hour=hour, minute=0, second=0, microsecond=0)
            
            # Prepare the structure for the hour with dynamic location ids and lat/lon as a tuple
            hourly_data = {
                'date': current_day.date().isoformat(),
                'hour': hour_time.isoformat(),
                'gym': {
                    location_data['id']: {
                        'user_groups': gym_user_groups,  # Add user groups for gym
                        'coordinates': location_data['coordinates']  # Tuple (lat, lon)
                    }
                    for location_data in location_ids['gym']
                },
                'fitness_corner': {
                    str(location_data['id']): {
                        'user_groups': fitness_user_groups,  # Add user groups for fitness corner
                        'coordinates': location_data['coordinates']  # Tuple (lat, lon)
                    }
                    for location_data in location_ids['fitness']
                },
                'parks': {
                    str(location_data['id']): {
                        'user_groups': park_user_groups,  # Add user groups for park
                        'coordinates': location_data['coordinates']  # Tuple (lat, lon)
                    }
                    for location_data in location_ids['parks']
                }
            }
            
            documents.append(hourly_data)
        
        # Move to the next day
        current_day += timedelta(days=1)
    
    return documents

# Get the location _ids, latitude, and longitude from MongoDB
location_ids = get_location_ids()

# Generate the empty dictionary for the whole month ahead using the location _ids
documents = generate_empty_dict(location_ids)

# Insert data into MongoDB
col = client['events_collection']['schedule_database']
col.insert_many(documents)
