from fastapi import APIRouter, HTTPException
from models import User
from bson import ObjectId


# MongoDB kapcsolat létrehozása


db = client["pet_clinic"]
users_collection = db["user"]
client = MongoClient("mongodb://localhost:27017")
db = client["pet_clinic"]
users_collection = db["users"]

router = APIRouter()

# Új felhasználó létrehozása
@router.post("/")
async def create_user(user: User):
    new_user = await users_collection.insert_one(user.dict())
    return {"id": str(new_user.inserted_id)}

# Felhasználó lekérése ID alapján
@router.get("/{user_id}")
async def get_user(user_id: str):
    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


from fastapi import APIRouter, HTTPException
from models.user import UserCreate, UserResponse
from repositories.user_repository import UserRepository

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
