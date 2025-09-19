import os
from pymongo import MongoClient, ASCENDING
from bson import ObjectId
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Read values from .env
MONGO_URI = os.getenv("mongodb+srv://cityhelp_ai:11223344@cityhelp-cluster.x8elial.mongodb.net/?retryWrites=true&w=majority&appName=cityhelp-cluster")
MONGO_DB = os.getenv("MONGO_DB", "cityhelp")

# Connect to MongoDB
client = MongoClient(MONGO_URI)
db = client[MONGO_DB]

# Collections
users_col = db["users"]
issues_col = db["issues"]

# Indexes
users_col.create_index([("email", ASCENDING)], unique=True)
issues_col.create_index([("status", ASCENDING)])
issues_col.create_index([("category", ASCENDING)])
issues_col.create_index([("created_at", ASCENDING)])

# Utility
def to_object_id(id_str):
    try:
        return ObjectId(id_str)
    except:
        return None
