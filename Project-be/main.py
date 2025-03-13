import pymongo
from user_routes import user_routes
from fastapi import FastAPI

from pymongo import MongoClient, errors
import os
from dotenv import load_dotenv
from pymongo.server_api import ServerApi

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")

app = FastAPI()
uri = MongoClient("MONGO_URI")
client = MongoClient(MONGO_URI, server_api=ServerApi('1'))

try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except errors.ConnectionFailure as e:
    print("connection failed to database")
    print(e)


    