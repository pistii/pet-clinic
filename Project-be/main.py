
import os
from dotenv import load_dotenv

from fastapi import FastAPI, APIRouter
from pymongo.server_api import ServerApi
from pymongo import MongoClient, errors
from fastapi.middleware.cors import CORSMiddleware
from routes.user_routes.user_routes import router

load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")

app = FastAPI()
user_router = router

client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except errors.ConnectionFailure as e:
    print("connection failed to database")
    print(e)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(user_router)