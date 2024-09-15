import os
import re
from pymongo import MongoClient
from flask import Flask, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from bson.objectid import ObjectId

app = Flask(__name__)

# MongoDB connection
mongo_uri = os.getenv('MONGO_URI', 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay')
client = MongoClient(mongo_uri)
client.server_info()
user_db = client.user
user_collection = user_db.users

# function to check if email input is valid 
def is_email_valid(email: str):
    regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    if (re.fullmatch(regex, email)):
        return True
    else:
        return False

# user input 
class User:
    def __init__(self, email: str,username: str, password: str, height: float, weight: float, gender: str, frequency: str, duration: str):
        self.email = email
        self.username = username
        self.password = generate_password_hash(password)
        self.height = height
        self.weight = weight
        self.gender = gender
        self.frequency = frequency
        self.duration = duration

    def to_dict(self):
        return {
            "email": self.email,
            "username": self.username,
            "password": self.password,
            "height": self.height,
            "weight": self.weight,
            "gender": self.gender,
            "frequency": self.frequency,
            "duration": self.duration
        }
        
@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    email = data["email"]
    username = data["username"]
    password = data["password"]
    height = data.get("height", 0.0)
    weight = data.get("weight", 0.0)
    gender = data.get("gender", "")
    frequency = data.get("frequency", "")
    duration = data.get("duration", "")

    if not username or not email or not password:
        return jsonify({"error": "Email, username, and password are required"}), 400

    # Check if email is valid
    if not is_email_valid(email):
        return jsonify({"error": "Invalid email"}), 400
    
    # Check if email already exists when user register 
    if user_collection.find_one({"email": email}):
        return jsonify({"error": "Email already exists"}), 400

    # Hash the password
    hashed_password = generate_password_hash(password)

    # Create new user instance
    new_user = User(email, username, password, height, weight, gender, frequency, duration)

    # Insert the new user into the database
    result = user_collection.insert_one(new_user.to_dict())

    return jsonify({
        "message": "User created successfully",
        "userid": str(result.inserted_id)
    }), 201

@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data('username')
    password = data('password')

    user = user_collection.find_one({"username": username})

    if user and check_password_hash(user['password'], password):
        return jsonify({"message": "Login successful", "userid": str(user['_id'])}), 200
    else:
        return jsonify({"error": "Invalid  username or password"}), 401

if __name__ == '__main__':
    app.run(debug=True)
    
