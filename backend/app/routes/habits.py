from flask import Blueprint, jsonify
from app.models import Habit

bp = Blueprint('habit_bp', __name__)

@bp.route('/api/habits', methods=['GET'])
def list_habits():
    habits = Habit.query.all()
    return jsonify([
        {
            "id": h.id,
            "name": h.name,
            "category": h.category,
            "default_aura_points": h.default_aura_points
        }
        for h in habits
    ])
