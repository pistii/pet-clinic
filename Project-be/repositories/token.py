from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["pet_clinic"]
token_collection = db["refresh_tokens"]
#Mongodb TTL behaviour: https://www.mongodb.com/docs/manual/core/index-ttl/#behavior

token_collection.create_index("expires_at", expireAfterSeconds=30)
def get_refresh_token(token: str):
    return token_collection.find_one({"refresh_token": token})

def add_refresh_token(token: str):
    return token_collection.insert_one({
                                        "refresh_token": token,
                                        "expires_at": datetime.now() + timedelta(seconds=40)
                                        })


def remove_refresh_token(token: str):
    return token_collection.delete_one({"refresh_token": token})


def update_refresh_token(new_token: str, old_token: str):
    return token_collection.find_one_and_update({"refresh_token": old_token}, 
                                                {
                                                    "refresh_token": new_token,
                                                    "expires_at": datetime.now() + timedelta(seconds=120)
                                                    })