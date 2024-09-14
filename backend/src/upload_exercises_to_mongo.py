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
    mydict = [{ "name": "pushups", "demo_link": "http://youtube.com/pushup_video" }]

    x = test_col.insert_many(mydict)

    return x

def upload_exercise_csv(path, mydb):
    df = pd.read_csv(path)

    upper_body = df[df["body part"]=='upper body']
    # print(upper_body.columns)
    upper_body.drop(columns=["body part"], inplace=True)
    lower_body = df[df["body part"]=='lower body']
    lower_body.drop(columns=["body part"], inplace=True)
    abdominals = df[df["body part"]=='abdominals']
    abdominals.drop(columns=["body part"], inplace=True)
    # exercise name	body part	muscle groups	youtube link	recommended reps	full instructions	form tips	progression tips	regression tips	easy	beginner	advanced
    upper_ld = [{'name': name, 
             'muscle_groups': mg, 
             'youtube_link': yt, 
             'recommended_reps': reps, 
             'full_instructions': inst, 
             'form_tips': ft, 
             'progressions': pt, 
             'regressions': rt, 
             'easy_status': bool(e), 
             'beginner_status': bool(b), 
             'advanced_status': bool(a)}
            for name, mg, yt, reps, inst, ft, pt, rt, e, b, a 
            in zip(upper_body['exercise name'], 
                   upper_body['muscle groups'], 
                   upper_body['youtube link'], 
                   upper_body['recommended reps'], 
                   upper_body['full instructions'], 
                   upper_body['form tips'], 
                   upper_body['progression tips'], 
                   upper_body['regression tips'], 
                   upper_body['easy'], 
                   upper_body['beginner'], 
                   upper_body['advanced'])]

    lower_ld = [{'name': name, 
             'muscle_groups': mg, 
             'youtube_link': yt, 
             'recommended_reps': reps, 
             'full_instructions': inst, 
             'form_tips': ft, 
             'progressions': pt, 
             'regressions': rt, 
             'easy_status': bool(e), 
             'beginner_status': bool(b), 
             'advanced_status': bool(a)}
            for name, mg, yt, reps, inst, ft, pt, rt, e, b, a 
            in zip(lower_body['exercise name'], 
                   lower_body['muscle groups'], 
                   lower_body['youtube link'], 
                   lower_body['recommended reps'], 
                   lower_body['full instructions'], 
                   lower_body['form tips'], 
                   lower_body['progression tips'], 
                   lower_body['regression tips'], 
                   lower_body['easy'], 
                   lower_body['beginner'], 
                   lower_body['advanced'])]

    abs_ld = [{'name': name, 
           'muscle_groups': mg, 
           'youtube_link': yt, 
           'recommended_reps': reps, 
           'full_instructions': inst, 
           'form_tips': ft, 
           'progressions': pt, 
           'regressions': rt, 
           'easy_status': bool(e), 
           'beginner_status': bool(b), 
           'advanced_status': bool(a)}
          for name, mg, yt, reps, inst, ft, pt, rt, e, b, a 
          in zip(abdominals['exercise name'], 
                 abdominals['muscle groups'], 
                 abdominals['youtube link'], 
                 abdominals['recommended reps'], 
                 abdominals['full instructions'], 
                 abdominals['form tips'], 
                 abdominals['progression tips'], 
                 abdominals['regression tips'], 
                 abdominals['easy'], 
                 abdominals['beginner'], 
                 abdominals['advanced'])]

    for col, ld in zip(['upper_body', 'lower_body', 'abs'], [upper_ld, lower_ld, abs_ld]):
        mycol = mydb[col]
        x = mycol.insert_many(ld)
        print(x.inserted_ids)
    


if __name__ == "__main__":
    client, ex_db = connect_exercise_db()
    ex_db.users.remove({})
    p = 'Exercise DB - no equipment.csv'
    # test_col = upload_test_collection(ex_db)
    # x = upload_test_record(test_col)

    upload_exercise_csv(p, ex_db)

    print(client.list_database_names())
    print(ex_db.list_collection_names())
    # print(x.inserted_ids)