from fastapi.responses import JSONResponse
from fastapi import APIRouter, Depends, HTTPException

from auth.auth import get_current_user

from models.User import User
from models.Pet import PetCreate

from repositories.pet_repository import PetRepository


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
