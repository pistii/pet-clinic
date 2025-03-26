import json
import os
from typing import Union
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

from models.User import UnregisteredUserForm, User, UserCreate, UserResponse
from models.Appointment import RequestAnonimAppointment

from utils.hasher import Hasher


load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client_motor = AsyncIOMotorClient(MONGO_URI)
db = client_motor.get_database("pet_clinic")
users_collection = db.get_collection("users")


class UserRepository:
    @staticmethod
    async def get_user_by_email(email: str):
        user_data = await users_collection.find_one({"email": email})
        if user_data and user_data["is_active"]:
            user_data["_id"] = str(user_data["_id"])
            return User(**user_data)
        elif user_data: #dict type
            return user_data
        return None

    @staticmethod
    async def create_user(user: UserCreate, role: str = "user"):
        
        new_user = {
            "name": user.name,
            "email": user.email,
            "password": Hasher.hashPassword(user.password),
            "role": role,
            "registration_date": datetime.now(),
            "last_login": None,
            "is_active": True,
            "pets": []
        }
        result = await users_collection.insert_one(new_user)
        return str(result.inserted_id)
    
    @staticmethod
    async def create_anonim_user(appointment: RequestAnonimAppointment) -> User:
        user = appointment.user
        #Initialize user object then insert the pet into the array.
        new_user = {
            "name": user.name,
            "email": user.email,
            "role": "anonim",
            "is_active": False,
            "pets": []
        }
        new_user["pets"].append(appointment.pet.model_dump())
        
        result = await users_collection.insert_one(new_user)

        return UserResponse(**new_user, id=str(result.inserted_id))
    
    @staticmethod
    async def get_user_by_id(user_id: str):
        return await users_collection.find_one({"_id": ObjectId(user_id)})
    
    @staticmethod
    async def create_admin(user: UserCreate):
        new_user = {
            "name": user.name,
            "email": user.email,
            "password": Hasher.hashPassword(user.password),
            "role": "admin",
            "registration_date": datetime.now(datetime.timezone.utc),
            "last_login": None,
            "is_active": True,
            "pets": []
        }
        result = await users_collection.insert_one(new_user)
        return str(result.inserted_id)