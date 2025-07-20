from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from backend.app import create_app
import os

# Create the Flask app
app = create_app()

# Configure CORS for production - allow frontend domain
CORS(app, origins=[
    "http://localhost:3000",
    "https://college-football-frontend.onrender.com",
    "https://your-custom-domain.com"
], supports_credentials=True, allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    print(f"🔗 Using database URL: {DATABASE_URL}")
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    print("⚠️  No DATABASE_URL found, using default")

# Health check endpoint for Render
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

# Root endpoint for API info
@app.route('/')
def api_info():
    return {
        'message': 'College Football Voting API',
        'status': 'healthy',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth',
            'vote': '/api/vote',
            'teams': '/api/vote/teams'
        }
    }

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 