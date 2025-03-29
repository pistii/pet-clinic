import json
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm

from models.User import UpdateUser, User, UserResponse, UserCreate
from models.token import Token

from repositories.token import add_refresh_token, update_refresh_token
from repositories.user_repository import UserRepository

from auth.auth import authenticate_user, create_token, create_token_pair, get_current_user, validate_refresh_token
from auth.RoleChecker import RoleChecker


router = APIRouter(prefix="/api/users", tags=["Users"])

#Registers a new user if email is not used
@router.post("/register", response_model=UserResponse)
async def create_user(user: UserCreate):
    existing_user = await UserRepository.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = await UserRepository.create_user(user)
    user_dict = user.model_dump(exclude="password")

    return UserResponse(id=user_id, **user_dict)

#Registers assistant if email is not used
@router.post("/register/assistant", response_model=UserResponse)
async def create_user(_ : Annotated[bool, Depends(RoleChecker(required_role=["admin"]))],
                      user: UserCreate):
    existing_user = await UserRepository.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = await UserRepository.create_user(user, role="assistant")
    user_dict = user.model_dump(exclude="password")

    return UserResponse(id=user_id, **user_dict)


#For development
@router.post("/register_admin")
async def create_admin(user: UserCreate):
    existing_user = await UserRepository.get_user_by_email(user.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    user_id = await UserRepository.create_admin(user)
    user_dict = user.model_dump(exclude="password")

    return UserResponse(id=user_id, **user_dict)


#Receives the user with the given id
@router.get("/get_by_id/{user_id}", response_model=UserResponse)
async def get_user(user_id: str):
    user = await UserRepository.get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


#Receives the user email from token then returns the user obj
@router.get("/getUser", response_model=UserResponse)
async def get_user(user: User = Depends(get_current_user)):
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@router.post("/login")  
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> Token:
    user = await authenticate_user(form_data.username, form_data.password)  
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


@router.put("/update")
async def update_user_data(user_model: UpdateUser, 
                           user: User = Depends(get_current_user)):
    user_found = await UserRepository.get_user_by_id(user_model.id)
    if not user_found:
        raise HTTPException(status_code=404, detail="User not found.")
    
    #Check if admin or user is the one who willing to update details
    if user.role == "admin" or user.id == user_model.id:
        result = await UserRepository.update_user(user=user_model)
        if result:
            if user_model.email != None:
                u = user_model.model_dump()
                u["role"] = user_found["role"]
                ur = UserResponse(**u) #It only needed for email and role
                access_token, refresh_token = create_token_pair(ur)

                return Token(access_token=access_token, refresh_token=refresh_token)
            return JSONResponse(status_code=201, content="Update success.")
        elif result == False:
            raise HTTPException(status_code=400, detail="Update failed.")
        else: 
            raise HTTPException(status_code=400, detail="No changes.")

    raise HTTPException(status_code=403)