import json
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import JSONResponse
from fastapi.security import OAuth2PasswordRequestForm

from models.helpers.queryparams import QueryParams
from models.User import ForgotPassword, PasswordReset, UpdateUser, User, UserResponse, UserCreate
from models.token import Token

from repositories.token import add_refresh_token, update_refresh_token
from repositories.user_repository import UserRepository
from repositories.appointment_repository import AppointmentRepository

from auth.auth import authenticate_user, create_token, create_token_pair, get_current_user, validate_refresh_token
from auth.RoleChecker import RoleChecker

from utils.converter import convert_object_ids
from services.email import EmailSendingService

router = APIRouter(prefix="/api/users", tags=["Users"])

#Registers a new user if email is not used
@router.post("/register", response_model=UserResponse)
async def create_user(user: UserCreate):
    existing_user = await UserRepository.get_user_by_email(user.email)
    if existing_user and existing_user["is_active"]:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    #User requested appointment as anonim user
    elif existing_user and not existing_user["is_active"]:
        is_updated = await UserRepository.upgrade_anonim_user_to_registered(user)
        if not is_updated:
            raise HTTPException(status_code=400, detail="Failed to create user")
        
        user_dict = user.model_dump(exclude="password")
        return UserResponse(id=str(existing_user["_id"]), **user_dict)
    
    #User doesn't requested appointment before and now wish to create a new account
    else:
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



@router.post("/getAll")
async def get_all_user(queryParams: QueryParams, 
                       _ : Annotated[bool, Depends(RoleChecker(required_role=["admin"]))]):
    users, total = await UserRepository.get_all_user_paginated(queryParams)
    return JSONResponse(content={"users": users, "totalPages": total}, status_code=200)


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

@router.delete('/delete/{id}')
async def delete_user(id: str, 
                      user: User = Depends(get_current_user)):
    
    user_to_remove = await UserRepository.get_user_by_id(id)
    if user_to_remove is None:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_obj = User(**convert_object_ids(user_to_remove))

    if str(user_to_remove["_id"]) == id or user.role == "admin":    
        user_appointment = await AppointmentRepository.get_user_appointments(user_obj)
        
        user_has_pending_appointment = [x for x in user_appointment if "pending" in x["status"].lower()]
        print(user_has_pending_appointment)

        if (len(user_has_pending_appointment) > 0):
            raise HTTPException(status_code=400, detail="User cannot be deleted. User has pending appointment")
        
        is_success = await UserRepository.delete_user(id)
        #TODO: Remove also user appointments
        if is_success:
            deleted_appointments = await AppointmentRepository.delete_all_user_appointment(id)
            print(f" with user also deleted {deleted_appointments} appointment")
            return JSONResponse(status_code=200, content="User deleted")
        else:
            raise HTTPException(status_code=400, detail="Failed to delete user.")
    
    raise HTTPException(status_code=403, detail="Forbidden")

@router.post("/forgot-password")
async def forgot_password(forgot_password: ForgotPassword):
    user_exist = await UserRepository.get_user_by_email(forgot_password.email)
    if user_exist is None: 
        raise HTTPException(status_code=404, detail="User not found")
    if isinstance(user_exist, dict):
        raise HTTPException(detail="You are not registered yet.", status_code=400)
    elif isinstance(user_exist, User) and not user_exist.is_active: 
        raise HTTPException(status_code=400, detail="Your account is not activated")
        
    token = await UserRepository.generate_password_reset_token(user_exist.email)
    if (token):
        WEBSERVER_URL = f"http://localhost:5173/password-reset/{token}"
        EmailSendingService.sendMail(user_exist.email, "Password reset", f"Link: {WEBSERVER_URL}. \
                                    Please be aware this link will be expire in 15 minutes.")
        return JSONResponse(status_code=200, content=None)
    raise HTTPException(status_code=400, detail="Failed to generate token.")

@router.post("/verify-token")
async def verify_token(password_reset: PasswordReset):
    is_valid = await UserRepository.verify_reset_token(password_reset.token)
    if (is_valid):
        user = await UserRepository.get_user_by_email(is_valid)
        update_user = UpdateUser(password=password_reset.password, 
                                 email=user.email, 
                                 id=user.id, 
                                 name=user.name)
        await UserRepository.update_user(update_user)
        await UserRepository.invalidate_reset_token(password_reset.token)
        return JSONResponse(status_code=200, content="Password changed.")
    raise HTTPException(status_code=400, detail="Token is invalid")