from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token
from werkzeug.security import check_password_hash  # Added missing import
from models.user import User, db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already registered"}), 400
        
    user = User(
        username=data['username'],
        email=data['email']
    )
    user.set_password(data['password'])  # Ensure this method hashes the password
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    if not user.check_password(data['password']):  # Changed to use User's method
        return jsonify({"error": "Invalid password"}), 401
    
    print(f"User ID: {user.id}, Type: {type(user.id)}")  # Debug
    
    try:
        access_token = create_access_token(identity=str(user.id))
        return jsonify(access_token=access_token), 200
    except Exception as e:
        print(f"Token generation error: {e}")  # Debug
        return jsonify({"error": "Token generation failed"}), 500