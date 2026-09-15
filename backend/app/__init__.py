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
    
    # Cross-origin prod (separate frontend/backend hosts) needs Secure + SameSite=None.
    # Local Docker sets COOKIE_SECURE=false (or FLASK_ENV=development) for HTTP.
    cookie_secure_env = os.environ.get('COOKIE_SECURE', '').lower()
    if cookie_secure_env in ('true', 'false'):
        cookie_secure = cookie_secure_env == 'true'
    else:
        cookie_secure = os.environ.get('FLASK_ENV', '').lower() != 'development'

    app.config['SESSION_COOKIE_SECURE'] = cookie_secure
    app.config['SESSION_COOKIE_HTTPONLY'] = True
    app.config['SESSION_COOKIE_SAMESITE'] = 'None' if cookie_secure else 'Lax'
    app.config['SESSION_COOKIE_DOMAIN'] = None
    
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
