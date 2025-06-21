from app import create_app
from app.models import db, Habit

# Define some default habits
default_habits = [
    {"name": "Read a book", "category": "Mind", "default_aura_points": 30},
    {"name": "Morning workout", "category": "Body", "default_aura_points": 50},
    {"name": "Meditate", "category": "Mind", "default_aura_points": 40},
    {"name": "Drink 2L water", "category": "Health", "default_aura_points": 10},
    {"name": "Write journal", "category": "Reflection", "default_aura_points": 25},
    {"name": "Learn coding", "category": "Skill", "default_aura_points": 35},
    {"name": "Sleep 8 hours", "category": "Health", "default_aura_points": 20},
    {"name": "Cold shower", "category": "Challenge", "default_aura_points": 15},
    {"name": "No social media", "category": "Discipline", "default_aura_points": 25},
]

app = create_app()

with app.app_context():
    for habit_data in default_habits:
        exists = Habit.query.filter_by(name=habit_data["name"]).first()
        if not exists:
            habit = Habit(**habit_data)
            db.session.add(habit)
    db.session.commit()
    print(f"✅ Seeded {len(default_habits)} habits.")