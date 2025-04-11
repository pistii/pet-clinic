import json
import math
import os
from typing import Union
import uuid
from bson import ObjectId
from dotenv import load_dotenv
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorClient

from models.User import UnregisteredUserForm, UpdateUser, User, UserCreate, UserResponse
from models.Appointment import RequestAnonimAppointment
from models.helpers.queryparams import QueryParams

from utils.hasher import Hasher
from utils.converter import convert_document

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
RESET_TOKEN_EXPIRES_MINUTES = 15

client_motor = AsyncIOMotorClient(MONGO_URI)
db = client_motor.get_database("pet_clinic")
users_collection = db.get_collection("users")

reset_token_collection = db.get_collection("reset_tokens")
reset_token_collection.create_index("expires_at", expireAfterSeconds=900)


class UserRepository:
    @staticmethod
    async def get_all_user_paginated(queryParams: QueryParams):
        query = {
            "$or": [
                {"email": {"$regex": queryParams.search, "$options": "i"}},
                {"name": {"$regex": queryParams.search, "$options": "i"}},
            ]
        }
        total_document = await users_collection.count_documents(query)
        total_pages = math.ceil(total_document/queryParams.limit)

        users = await users_collection.find(query).limit(queryParams.limit).skip(queryParams.offset).to_list()
        converted = convert_document(users)
        return converted, total_pages


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
        user = await users_collection.find_one({"_id": ObjectId(user_id)})
        return user
    
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
    

    # Returns true if any data were modified. 
    # None if no changes happened. 
    # False if exception happened or any field is either invalid, or not allowed to use
    @staticmethod
    async def update_user(user: UpdateUser):
        original_data = await UserRepository.get_user_by_id(user.id)
        dict_original = json.loads(json.dumps((convert_document(original_data))))
        
        user_model = {
            key: value for key, value in user.model_dump(by_alias=True).items() if value is not None
        }
        updated_fields = {
            key: value for key, value in user_model.items() if key in dict_original and dict_original[key] != value
        }

        if not updated_fields:
            return None

        if updated_fields.get("email") is not None:
            email_is_used = await UserRepository.get_user_by_email(user.email)
            if isinstance(email_is_used, User):
                raise HTTPException(status_code=400, detail="Email is in use")
        
        # Update data in db
        try:
            if updated_fields.get("password") and len(updated_fields.get("password")) > 7:
                updated_fields["password"] = Hasher.hashPassword(updated_fields.get("password"))

            result = await users_collection.update_one({"_id": ObjectId(user.id)}, {"$set": updated_fields})
            if result.modified_count:
                print("Felhasználói adatok frissítve:", updated_fields)
                return True
            else:
                print("Nem történt módosítás az adatbázisban.")
                return None
        except Exception as e:
            print("Hiba az adatfrissítés során:", e)
            return False

    @staticmethod
    async def delete_user(user_id: str):
        result = await users_collection.delete_one({'_id': ObjectId(user_id)})
        if result.deleted_count == 1:
            return True
        return False
      
    @staticmethod
    async def upgrade_anonim_user_to_registered(user_data: UserCreate):
        result = await users_collection.update_one(
            {"email": user_data.email, "role": "anonim"},
            {
                "$set": {
                    "name": user_data.name,
                    "password": Hasher.hashPassword(user_data.password),
                    "role": "user",
                    "is_active": True,
                    "registration_date": datetime.now()
                }
            }
        )
        return True

        

    async def generate_password_reset_token(email: str):
        token = str(uuid.uuid4())
        expires_at = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRES_MINUTES)

        token_data = {
            "token": token,
            "email": email,
            "expires_at": expires_at,
            "used": False
        }

        await reset_token_collection.insert_one(token_data)

        return token


    async def verify_reset_token(token: str):
        token_data = await db.get_collection("reset_tokens").find_one({"token": token})

        if not token_data or token_data["used"]:
            raise HTTPException(status_code=400, detail="Invalid or used token")

        expires_at = token_data["expires_at"]
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)

        if expires_at < datetime.now(timezone.utc):
            raise HTTPException(status_code=400, detail="Token expired")

        return token_data["email"]


    async def invalidate_reset_token(token: str):
        await db.get_collection("reset_tokens").find_one_and_update(
            {"token": token}, {"$set": {"used": True}})
