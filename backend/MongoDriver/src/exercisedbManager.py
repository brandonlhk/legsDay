import os
from pymongo import MongoClient

def connect_exercise_db():
    mongo_uri = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
    client = MongoClient(mongo_uri)
    exercise_db = client['exercise_database']
    return client, exercise_db

def upload_test_collection(mydb):
    test_col = mydb["upper_body"]
    return test_col

def upload_test_record(test_col):
    mydict = [{ "name": "pushups", "demo_link": "http://youtube.com/pushup_video" }]

    x = test_col.insert_many(mydict)

    return x


if __name__ == "__main__":
    client, ex_db = connect_exercise_db()
    test_col = upload_test_collection(ex_db)
    x = upload_test_record(test_col)

    print(client.list_database_names())
    print(ex_db.list_collection_names())
    print(x.inserted_ids)