from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from flask_migrate import Migrate
from datetime import timedelta
from dotenv import load_dotenv
from models.user import db, User
from models.habit import Habit, HabitCompletion
from routes.auth import auth_bp
from routes.habits import habits_bp
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure app
app.config.from_object('config.Config')

# Initialize extensions
db.init_app(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)

# Register blueprints
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(habits_bp, url_prefix='/api')

# Create database tables
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(debug=True)