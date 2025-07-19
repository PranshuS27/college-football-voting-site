from flask import Flask
from flask_cors import CORS
from flask_migrate import Migrate
from .models import db
from .auth import auth_bp
from .vote import vote_bp
import os

def create_app():
    app = Flask(__name__)
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-key-change-in-production')
    
    # Session configuration for cookies
    app.config['SESSION_COOKIE_SECURE'] = False  # Set to True in production with HTTPS
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'
    app.config['SESSION_COOKIE_DOMAIN'] = None  # Let Flask set this automatically
    
    # Database configuration
    database_url = os.environ.get('DATABASE_URL', 'postgresql://user:password@db:5432/football_votes')
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    
    # Initialize extensions
    db.init_app(app)
    migrate = Migrate(app, db)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(vote_bp, url_prefix='/api/vote')
    
    # Create database tables
    with app.app_context():
        db.create_all()
    
    return app
