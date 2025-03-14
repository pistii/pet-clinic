import os
from dotenv import load_dotenv
from typing import Annotated
from pymongo import MongoClient
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import APIRouter, HTTPException

from models.User import User, UserResponse, UserCreate
from models.token import Token

from repositories.token import add_refresh_token, remove_refresh_token, get_refresh_token, update_refresh_token
from repositories.user_repository import UserRepository
from auth.auth import authenticate_user, create_token_pair, validate_refresh_token
from auth.RoleChecker import RoleChecker

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

client = MongoClient(MONGO_URI)
db = client["pet_clinic"]
users_collection = db["users"]

router = APIRouter(prefix="/api/users", tags=["Users"])

#Registers a new user if email is not used
@router.post("/register", response_model=UserResponse)
def create_user(user: UserCreate):
    existing_user = UserRepository.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = UserRepository.create_user(user)
    user_dict = user.model_dump(exclude="password")

    return UserResponse(id=user_id, **user_dict)

#For development
@router.post("/register_admin")
def create_admin(user: UserCreate):
    existing_user = UserRepository.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = UserRepository.create_admin(user)
    user_dict = user.model_dump(exclude="password")

    return UserResponse(id=user_id, **user_dict)


#Receives the user with the given id
@router.get("/{user_id}", response_model=UserResponse)
def get_user(user_id: str):
    user = UserRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


  
@router.get("/data")  
def get_data(_: Annotated[bool, Depends(RoleChecker(required_role=["admin"]))]):  
  return {"data": "This is important data"}

@router.post("/login")  
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = authenticate_user(form_data.username, form_data.password)  
    if not user:  
        raise HTTPException(status_code=400, detail="Incorrect username or password")  
      
     
    access_token, refresh_token = create_token_pair(user)
    add_refresh_token(refresh_token)
    return Token(access_token=access_token, refresh_token=refresh_token)
  
@router.post("/refresh")  
async def refresh_access_token(token_data: Annotated[tuple[User, str], Depends(validate_refresh_token)]):  
    user, token = token_data  
    
    access_token, refresh_token = create_token_pair(user)
    update_refresh_token(refresh_token, token)

    return Token(access_token=access_token, refresh_token=refresh_token)


