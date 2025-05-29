from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.habit import Habit, HabitCompletion, db
from datetime import datetime

habits_bp = Blueprint('habits', __name__)

@habits_bp.route('/habits', methods=['POST'])
@jwt_required()
def create_habit():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    habit = Habit(
        name=data['name'],
        description=data.get('description', ''),
        frequency=data['frequency'],
        aura_points=data.get('aura_points', 1),
        user_id=user_id
    )
    
    db.session.add(habit)
    db.session.commit()
    
    return jsonify({"message": "Habit created successfully"}), 201

@habits_bp.route('/habits', methods=['GET'])
@jwt_required()
def get_habits():
    user_id = get_jwt_identity()
    habits = Habit.query.filter_by(user_id=user_id).all()
    
    return jsonify([{
        'id': habit.id,
        'name': habit.name,
        'description': habit.description,
        'frequency': habit.frequency,
        'aura_points': habit.aura_points,
        'created_at': habit.created_at.isoformat()
    } for habit in habits]), 200

@habits_bp.route('/habits/<int:habit_id>/complete', methods=['POST'])
@jwt_required()
def complete_habit(habit_id):
    user_id = get_jwt_identity()
    habit = Habit.query.filter_by(id=habit_id, user_id=user_id).first()
    
    if not habit:
        return jsonify({"error": "Habit not found"}), 404
    
    completion = HabitCompletion(habit_id=habit_id)
    db.session.add(completion)
    db.session.commit()
    
    return jsonify({"message": "Habit marked as complete"}), 200