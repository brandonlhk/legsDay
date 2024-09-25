import os
from pymongo import MongoClient

# MongoDB connection
mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay')
client = MongoClient(mongo_uri)
client.server_info()
user_db = client.user
user_collection = user_db.users

# user input 
class User:
    def __init__(self, email: str,username: str, password: str, height: float, weight: float, gender: str, frequency: str, duration: str, status: str, injury: str, level: str, core: str, upper_body: str, lower_body: str):
        # self.email = email
        # self.username = username
        # self.password = generate_password_hash(password)
        # self.height = height
        # self.weight = weight
        # self.gender = gender
        self.frequency = frequency
        self.duration = duration
        self.status = status
        self.injury = injury
        self.level = level
        self.core = core
        self.upper_body = upper_body
        self.lower_body = lower_body

    def to_dict(self):
        return {
            # "email": self.email,
            # "username": self.username,
            # "password": self.password,
            # "height": self.height,
            # "weight": self.weight,
            # "gender": self.gender,
            "frequency": self.frequency,
            "duration": self.duration,
            "status": self.status,
            "injury": self.injury,
            "level": self.level,
            "core_strength": self.core,
            "upper_body_strength": self.upper_body,
            "lower_body_strength": self.lower_body
        }
        
    
