import os
from collections import defaultdict
from datetime import datetime, timedelta
from pymongo import MongoClient
from tqdm import tqdm
import json

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

    # Retrieve the location _id from each database
    for db_name in databases:
        locations = collection[db_name].find({}, {'_id': 1})  # Retrieve only the _id field for locations
        # print(locations)
        
        # Append the location _id to the list
        for location in locations:
            location_ids[db_name.split('_')[0]].append(str(location['_id']))  # Stringify the _id
    
    return location_ids

def generate_empty_dict(location_ids):
    
    current_date = datetime.now()
    days_to_next_monday = (7 - current_date.weekday()) % 7  # Days until the next Monday
    next_week_start = current_date + timedelta(days=days_to_next_monday)
    
    # Initialize the outer dictionary to store hourly data for the week ahead
    hourly_data = {}
    
    # Loop through each day of the next week (7 days)
    current_day = next_week_start
    for _ in tqdm(range(7)):  # A week has 7 days
        daily_data = {}
        for hour in range(24):
            # Generate the current hour key (in datetime format)
            hour_time = current_day.replace(hour=hour, minute=0, second=0, microsecond=0)
            
            # Prepare the structure for the hour with dynamic location ids
            daily_data[hour_time.isoformat()] = {
                'gym':[
                {
                    str(location_id): {
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
                    'functional_mobility_training_general': [],
                    }
                } for location_id in location_ids['gym']
            ],
            'fitness_corner':[
                {
                    str(location_id): {
                    'calisthenics_cardio_ladies': [],
                    'calisthenics_cardio_parents': [],
                    'calisthenics_cardio_seniors': [],
                    'calisthenics_cardio_general': [],
                    'calisthenics_strength_ladies': [],
                    'calisthenics_strength_parents': [],
                    'calisthenics_strength_seniors': [],
                    'calisthenics_strength_general': [],
                    }
                } for location_id in location_ids['fitness']
            ],
            'parks':[
                {
                    str(location_id): {
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
                    'brisk_walk_general': [],
                    }
                } for location_id in location_ids['parks']
            ]
            }
        
        # Add the daily data to the hourly data
        hourly_data[current_day.date().isoformat()] = daily_data
        
        # Move to the next day
        current_day += timedelta(days=1)
    
    return hourly_data

# Get the location _ids from MongoDB
location_ids = get_location_ids()

# Generate the empty dictionary for the whole month ahead using the location _ids
empty_dict = generate_empty_dict(location_ids)

# # Print the first few items to verify
# for date_key in list(empty_dict.keys())[:3]:  # Show first 3 days
#     print(date_key, ":", empty_dict[date_key])

output_file = 'empty_data.json'
with open(output_file, 'w') as f:
    json.dump(empty_dict, f, indent=4)

print(f"Data has been exported to {output_file}")
