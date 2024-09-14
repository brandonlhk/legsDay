from pymongo import MongoClient

client = MongoClient()
client.server_info()
user_db = client.user
