import os
from pymongo import MongoClient
import pandas as pd

def connect_exercise_db():
    mongo_uri = 'mongodb+srv://a9542152:qBieNIqZZsRhEzDr@legsday.69mgs.mongodb.net/?retryWrites=true&w=majority&appName=legsDay'
    client = MongoClient(mongo_uri)
    exercise_db = client['exercise_database']
    return client, exercise_db

def upload_test_collection(mydb):
    test_col = mydb["upper_body"]
    return test_col

def upload_test_record(test_col):
    mydict = [{"name": "pushups", "demo_link": "http://youtube.com/pushup_video"}]
    x = test_col.insert_many(mydict)
    return x

def upload_exercise_csv(path, mydb):
    df = pd.read_csv(path)
    df = df.fillna('')  # Fill NaN values with an empty string

    # Filter by body part
    upper_body = df[df["body part"] == 'upper']
    lower_body = df[df["body part"] == 'lower']
    abdominals = df[df["body part"] == 'abs']

    # Remove 'body part' column, as it's redundant now
    upper_body.drop(columns=["body part"], inplace=True)
    lower_body.drop(columns=["body part"], inplace=True)
    abdominals.drop(columns=["body part"], inplace=True)

    # Process each section (upper body, lower body, abs)
    upper_ld = [
        {
            'name': name, 
            'muscle_groups': mg, 
            'link': link, 
            'image_binary': img,
            'recommended_reps_beginner': reps_beg, 
            'recommended_reps_intermediate': reps_int, 
            'recommended_reps_advanced': reps_adv,
            'full_instructions': inst, 
            'form_tips': ft,
            'injury_flag': [i.strip() for i in i_f.split(";")],
            'audio': audio,
            'gif': gif
        }
        for name, mg, link, img, reps_beg, reps_int, reps_adv, inst, ft, i_f, audio, gif
        in zip(upper_body['exercise name'], 
               upper_body['muscle groups'], 
               upper_body['link'], 
               upper_body['image binary'],
               upper_body['beginner'], 
               upper_body['intermediate'], 
               upper_body['advanced'], 
               upper_body['full instructions'], 
               upper_body['form tips'],
               upper_body['injury flag'],
               upper_body['audio'],
               upper_body['gif'])
    ]

    lower_ld = [
        {
            'name': name, 
            'muscle_groups': mg, 
            'link': link, 
            'image_binary': img,
            'recommended_reps_beginner': reps_beg, 
            'recommended_reps_intermediate': reps_int, 
            'recommended_reps_advanced': reps_adv,
            'full_instructions': inst, 
            'form_tips': ft,
            'injury_flag': [i.strip() for i in i_f.split(";")],
            'audio': audio,
            'gif': gif
        }
        for name, mg, link, img, reps_beg, reps_int, reps_adv, inst, ft, i_f, audio, gif
        in zip(lower_body['exercise name'], 
               lower_body['muscle groups'], 
               lower_body['link'], 
               lower_body['image binary'],
               lower_body['beginner'], 
               lower_body['intermediate'], 
               lower_body['advanced'], 
               lower_body['full instructions'], 
               lower_body['form tips'],
               lower_body['injury flag'],
               lower_body['audio'],
               lower_body['gif'])
    ]

    abs_ld = [
        {
            'name': name, 
            'muscle_groups': mg, 
            'link': link, 
            'image_binary': img,
            'recommended_reps_beginner': reps_beg, 
            'recommended_reps_intermediate': reps_int, 
            'recommended_reps_advanced': reps_adv,
            'full_instructions': inst, 
            'form_tips': ft,
            'injury_flag': [i.strip() for i in i_f.split(";")],
            'audio': audio,
            'gif': gif
        }
        for name, mg, link, img, reps_beg, reps_int, reps_adv, inst, ft, i_f, audio, gif
        in zip(abdominals['exercise name'], 
               abdominals['muscle groups'], 
               abdominals['link'], 
               abdominals['image binary'],
               abdominals['beginner'], 
               abdominals['intermediate'], 
               abdominals['advanced'], 
               abdominals['full instructions'], 
               abdominals['form tips'],
               abdominals['injury flag'],
               abdominals['audio'],
               abdominals['gif'])
    ]

    # Insert the processed records into the MongoDB collections
    for col, ld in zip(['upper', 'lower', 'abs'], [upper_ld, lower_ld, abs_ld]):
        mycol = mydb[col]
        x = mycol.insert_many(ld)
        print(f"Inserted into {col} collection: {x.inserted_ids}")


if __name__ == "__main__":
    client, ex_db = connect_exercise_db()
    p = 'Exercise DB - Sheet5.csv'

    upload_exercise_csv(p, ex_db)

    print(client.list_database_names())
    print(ex_db.list_collection_names())
