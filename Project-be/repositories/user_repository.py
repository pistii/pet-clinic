import os
from dotenv import load_dotenv
from pymongo import MongoClient
from datetime import datetime
from models.User import User, UserCreate
from utils.hasher import Hasher

# MongoDB kapcsolat létrehozása

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["pet_clinic"]
users_collection = db["users"]

class UserRepository:
    @staticmethod
    def get_user_by_email(email: str):
        user_data = users_collection.find_one({"email": email})
        if user_data:
            return User(**user_data)
        return None

    @staticmethod
    def create_user(user: UserCreate):
        new_user = {
            "name": user.name,
            "email": user.email,
            "password": Hasher.hashPassword(user.password),
            "role": "user",
            "registration_date": datetime.utcnow(),
            "last_login": None,
            "is_active": True,
            "pets": []
        }
        result = users_collection.insert_one(new_user)
        return str(result.inserted_id)
