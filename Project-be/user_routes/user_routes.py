import os
from fastapi import APIRouter, HTTPException
from pymongo import MongoClient
from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from models.User import UserResponse, UserCreate
from repositories.user_repository import UserRepository

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["pet_clinic"]
users_collection = db["user"]

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserResponse)
def create_user(user: UserCreate):
    existing_user = UserRepository.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = UserRepository.create_user(user)
    return UserResponse(id=user_id, **user.dict(exclude={"password"}))


@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    user = UserRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

