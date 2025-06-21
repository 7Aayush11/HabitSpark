from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__)
    app.config.from_object("config.Config")
    
    CORS(app)
    
    print("Connecting to:", app.config["SQLALCHEMY_DATABASE_URI"])

    db.init_app(app)
    jwt.init_app(app)

    from app.routes.suggestions import bp as suggestion_bp
    app.register_blueprint(suggestion_bp)
    
    from app.routes.user import bp as user_bp
    app.register_blueprint(user_bp)
    
    from app.routes.habits import bp as habit_bp
    from app.routes.checkin import bp as checkin_bp

    app.register_blueprint(habit_bp)
    app.register_blueprint(checkin_bp)
    
    from app.routes.auth import bp as auth_bp
    app.register_blueprint(auth_bp)

    return app
