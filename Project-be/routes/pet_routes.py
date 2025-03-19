from typing import Annotated
from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm

from models.User import User, UserResponse, UserCreate
from models.Appointment import RequestAppointment
from models.token import Token
from models.Pet import Pet, PetCreate

from repositories.token import add_refresh_token, update_refresh_token
from repositories.user_repository import UserRepository
from repositories.appointment_repository import AppointmentRepository
from repositories.pet_repository import PetRepository

from auth.auth import authenticate_user, create_token_pair, get_current_user, validate_refresh_token
from auth.RoleChecker import RoleChecker


router = APIRouter(prefix="/api/pets", tags=["Pet"])


@router.post("/add/")
async def add_pet(pet: PetCreate,
                user: User = Depends(get_current_user)):
    result = PetRepository.insert_pet(user=user, pet=pet)

    if result: 
        return JSONResponse(status_code=200, content="Pet inserted.")
    return HTTPException(status_code=400, detail="Failed to insert pet.")


@router.get("/get_all")
async def get_pets(user: User = Depends(get_current_user)):
    return user.pets
