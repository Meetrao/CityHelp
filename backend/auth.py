import os, datetime
import jwt
from passlib.hash import bcrypt
from flask import Blueprint, request, jsonify
from .models import users_col

bp = Blueprint('auth', __name__, url_prefix='/auth')
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret")

def hash_password(pw): return bcrypt.hash(pw)
def verify_password(pw, h): return bcrypt.verify(pw, h)

def create_token(user):
    payload = {
        "sub": str(user["_id"]),
        "email": user["email"],
        "role": user.get("role","user"),
        "exp": datetime.datetime.utcnow() + datetime.timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

@bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email'); password = data.get('password'); name = data.get('name', '')
    if not email or not password:
        return jsonify({"error":"email and password required"}), 400
    if users_col.find_one({"email": email}):
        return jsonify({"error":"email already exists"}), 409
    user = {"email": email, "password": hash_password(password), "name": name, "role": "user"}
    res = users_col.insert_one(user)
    user["_id"] = res.inserted_id
    token = create_token(user)
    return jsonify({"token": token, "user": {"id": str(user["_id"]), "email": email, "name": name}}), 201

@bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email'); password = data.get('password')
    user = users_col.find_one({"email": email})
    if not user or not verify_password(password, user["password"]):
        return jsonify({"error":"invalid credentials"}), 401
    token = create_token(user)
    return jsonify({"token": token, "user": {"id": str(user["_id"]), "email": user["email"], "name": user.get("name","")}}), 200

def require_auth(fn):
    from functools import wraps
    def parse_token(req):
        auth = req.headers.get('Authorization', '')
        if not auth.startswith('Bearer '): return None
        token = auth.split(' ',1)[1]
        try:
            return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
        except Exception:
            return None
    @wraps(fn)
    def wrapper(*args, **kwargs):
        payload = parse_token(request)
        if not payload:
            return jsonify({"error":"unauthorized"}), 401
        request.user = payload
        return fn(*args, **kwargs)
    return wrapper
