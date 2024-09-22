import random
import numpy as np
from pymongo import MongoClient
from bson.objectid import ObjectId

class Recommender:
    def __init__(self):
        self.mongo_uri = 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay'
        self.client = MongoClient(self.mongo_uri)
        self.exercise_db = self.client['exercise_database']
        self.upper_body = self.exercise_db['upper_body']
        self.lower_body = self.exercise_db['lower_body']
        self.abs = self.exercise_db['abs']
        self.user_db = self.client['user']
        self.user = self.user_db['users']

    def softmax(self, weights):
        # Use numpy's softmax to normalize the weights
        exp_weights = np.exp(weights - np.max(weights))  # Subtract max to avoid overflow
        return exp_weights / exp_weights.sum()

    def fetch_user_file(self, userid, substutution=None):
        # print(userid)
        user_file = self.user.find_one(ObjectId(userid))
        # print(user_file)
        # Simulate a hard-coded user file for local testing
        # user_file = {'status': 'advanced'}
        
        # Fetch exercises based on the user's status level
        # upper = [(i['_id'], random.uniform(0, 1)) for i in self.upper_body.find({}) if i.get(f'{status}_status')]
        # lower = [(i['_id'], random.uniform(0, 1)) for i in self.lower_body.find({}) if i.get(f'{status}_status')]
        # abdominals = [(i['_id'], random.uniform(0, 1)) for i in self.abs.find({}) if i.get(f'{status}_status')]
        
        # Store preferences back into the user_file
        # user_file['preferences'] = {'upper_body': upper, 'lower_body': lower, 'abs': abdominals}

        # print(user_file)

        return user_file

    def zero_weight(self, body_part, substitution_id, user_file):
        preferences = user_file['preferences']
        weight = preferences[body_part][substitution_id]
        preferences[body_part][substitution_id] = 0
        return weight


    def restore_and_update_weight(self, body_part, substitution_id, user_file, restored_weight, decay=0.25):
        preferences = user_file['preferences']
        preferences[body_part][substitution_id] = (1-decay)*restored_weight


    def substitute(self, body_part, substitution_id, user_file):
        previous_weight = self.zero_weight(body_part, substitution_id, user_file)
        self.recommend_program(user_file)
        self.restore_and_update_weight(body_part, substitution_id, user_file, previous_weight)


    def recommend_program(self, user_file):
        # Fetch user's preferences for the given body part
        status = user_file['status']
        preferences = user_file['preferences']
        injury_status = user_file['injury']

        recommended = {'upper_body': None, 'lower_body': None, 'abs': None}

        for body_part, pref in preferences.items():
            if body_part == 'lower_body' and 'legs' in injury_status:
                continue

            else:
                # Query to exclude exercises based on injury status
                query = {"muscle_groups": {"$not": {"$regex": "|".join(injury_status), "$options": "i"}},
                status: True}

                # Fetch exercises matching the query
                db_exercises = list(self.exercise_db[body_part].find(query))

                # Create a set of exercise IDs from the query results
                db_exercise_ids = {str(ex['_id']) for ex in db_exercises}

                # Filter preferences to only include exercises that exist in the database query results
                filtered_pref = [(ex_id, weight) for ex_id, weight in pref if ex_id in db_exercise_ids]

                if not filtered_pref:
                    recommended[body_part] = None
                    continue

                # Unzip the filtered preferences into exercises and weights
                exercises, weights = zip(*filtered_pref)

                # Softmax the weights
                normalized_weights = self.softmax(weights)

                # Randomly choose 1 exercise ID based on weights
                ex_id = random.choices(exercises, weights=normalized_weights, k=1)[0]

                # Fetch the full exercise document from the database for the chosen ID
                exercise = self.exercise_db[body_part].find_one({"_id": ObjectId(ex_id)})

                if exercise:
                    # Convert _id to string in the resulting exercise document
                    exercise['_id'] = str(exercise['_id'])
                
                recommended[body_part] = exercise if exercise else None

        return recommended


if __name__ == "__main__":
    recommender = Recommender()
    user_file = recommender.fetch_user_file('238hwbus324')

    program = recommender.recommend_program(user_file)

    for p in program:
        if program[p]:  # Make sure the exercise was found
            print(p, program[p].get('name', 'Unknown Exercise'))
