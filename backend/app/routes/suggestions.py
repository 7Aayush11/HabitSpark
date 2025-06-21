from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Suggestion

bp = Blueprint('suggestion_bp', __name__)

@bp.route('/api/suggestions', methods=['POST'])
@jwt_required()
def suggest_habit():
    data = request.get_json()
    habit_name = data.get('habit_name')
    description = data.get('description')

    if not habit_name:
        return jsonify({"error": "habit_name is required"}), 400

    suggestion = Suggestion(
        user_id=get_jwt_identity(),
        habit_name=habit_name,
        description=description or ""
    )
    db.session.add(suggestion)
    db.session.commit()

    return jsonify({"message": "Suggestion submitted!"}), 201