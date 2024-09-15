import random
import numpy as np
from pymongo import MongoClient

class Recommender:
    def __init__(self):
        self.mongo_uri = 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay'
        self.client = MongoClient(self.mongo_uri)
        self.exercise_db = self.client['exercise_database']
        self.upper_body = self.exercise_db['upper_body']
        self.lower_body = self.exercise_db['lower_body']
        self.abs = self.exercise_db['abs']
        self.user_db = self.client['user_db']

    def softmax(self, weights):
        # Use numpy's softmax to normalize the weights
        exp_weights = np.exp(weights - np.max(weights))  # Subtract max to avoid overflow
        return exp_weights / exp_weights.sum()

    def fetch_user_file(self, userid):
        # user_file = self.user_db.find_one(userid)
        # Simulate a hard-coded user file for local testing
        user_file = {'status': 'advanced'}
        status = user_file['status']
        
        # Fetch exercises based on the user's status level
        upper = [(i['_id'], random.uniform(0, 1)) for i in self.upper_body.find({}) if i.get(f'{status}_status')]
        lower = [(i['_id'], random.uniform(0, 1)) for i in self.lower_body.find({}) if i.get(f'{status}_status')]
        abdominals = [(i['_id'], random.uniform(0, 1)) for i in self.abs.find({}) if i.get(f'{status}_status')]
        
        # Store preferences back into the user_file
        user_file['preferences'] = {'upper_body': upper, 'lower_body': lower, 'abs': abdominals}

        return user_file

    def recommend_program(self, user_file):
        # Fetch user's preferences for the given body part
        preferences = user_file['preferences']

        recommended = {'upper_body': None, 'lower_body': None, 'abs': None}

        for body_part, pref in preferences.items():
            exercises, weights = zip(*pref)

            # Softmax the weights
            normalized_weights = self.softmax(weights)

            # Randomly choose 1 exercise id based on weights
            ex_id = random.choices(exercises, weights=normalized_weights, k=1)[0]

            # Fetch the full exercise document from the database for each chosen ID
            exercise = self.exercise_db[body_part].find_one({"_id": ex_id})
            recommended[body_part] = exercise

        return recommended

if __name__ == "__main__":
    recommender = Recommender()
    user_file = recommender.fetch_user_file('238hwbus324')

    program = recommender.recommend_program(user_file)

    for p in program:
        if program[p]:  # Make sure the exercise was found
            print(p, program[p].get('name', 'Unknown Exercise'))
