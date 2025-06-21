from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, UserHabitCheckin, Habit, User
from datetime import date
import math

bp = Blueprint('checkin_bp', __name__)

@bp.route('/api/checkin', methods=['POST'])
@jwt_required()
def checkin():
    data = request.get_json()
    habit_id = data.get('habit_id')
    user_id = get_jwt_identity()

    if not habit_id:
        return jsonify({"error": "habit_id required"}), 400

    habit = Habit.query.get(habit_id)
    if not habit:
        return jsonify({"error": "Habit not found"}), 404

    # Prevent duplicate checkin
    existing = UserHabitCheckin.query.filter_by(
        user_id=user_id, habit_id=habit_id, checkin_date=date.today()
    ).first()
    if existing:
        return jsonify({"message": "Already checked in today"}), 200

    checkin = UserHabitCheckin(user_id=user_id, habit_id=habit_id, checkin_date=date.today())
    db.session.add(checkin)
    db.session.commit()

    # Calculate aura points
    total_aura = calculate_total_aura(user_id)
    level, next_aura = calculate_level(total_aura)

    return jsonify({
        "message": "Check-in recorded",
        "aura_earned": habit.default_aura_points,
        "total_aura": total_aura,
        "level": level,
        "next_level_aura": next_aura
    })

@bp.route('/api/analytics', methods=['GET'])
@jwt_required()
def analytics():
    user_id = get_jwt_identity()
    total_aura = calculate_total_aura(user_id)
    level, next_aura = calculate_level(total_aura)
    streak = calculate_streak(user_id)
    best_streak = calculate_best_streak(user_id)

    recent = UserHabitCheckin.query.filter_by(user_id=user_id).order_by(UserHabitCheckin.checkin_date.desc()).limit(5).all()
    recent_checkins = [
        {
            "habit_name": Habit.query.get(c.habit_id).name,
            "date": c.checkin_date.isoformat()
        } for c in recent
    ]

    return jsonify({
        "total_aura": total_aura,
        "level": level,
        "next_level_aura": next_aura,
        "current_streak": streak,
        "best_streak": best_streak,
        "recent_checkins": recent_checkins
    })

# Utility functions
def calculate_total_aura(user_id):
    checkins = UserHabitCheckin.query.filter_by(user_id=user_id).all()
    return sum(Habit.query.get(c.habit_id).default_aura_points for c in checkins)

def calculate_level(total_aura):
    base = 1.3
    level = math.floor(math.log(total_aura + 1, base))
    next_aura = math.ceil(base ** (level + 1))
    return level, next_aura

def calculate_streak(user_id):
    # Simplified — you can expand to date logic
    today = date.today()
    streak = 0
    for offset in range(30):
        day = today.fromordinal(today.toordinal() - offset)
        exists = UserHabitCheckin.query.filter_by(user_id=user_id, checkin_date=day).first()
        if exists:
            streak += 1
        else:
            break
    return streak

def calculate_best_streak(user_id):
    # Can be optimized — placeholder version
    all_checkins = UserHabitCheckin.query.filter_by(user_id=user_id).order_by(UserHabitCheckin.checkin_date).all()
    best = 0
    current = 0
    last_date = None
    for c in all_checkins:
        if last_date is None or (c.checkin_date - last_date).days == 1:
            current += 1
        else:
            current = 1
        best = max(best, current)
        last_date = c.checkin_date
    return best
