from flask import Flask, send_from_directory, request, jsonify
from flask_cors import CORS
from backend.app import create_app
import os

# Create the Flask app
app = create_app()

# Configure CORS for production
CORS(app, origins=[
    "http://localhost:3000",
    "https://college-football-voting-app.onrender.com",
    "https://your-custom-domain.com"
], supports_credentials=True, allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Get database URL from environment
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    print(f"🔗 Using database URL: {DATABASE_URL}")
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    print("⚠️  No DATABASE_URL found, using default")

# Serve static files from the frontend build directory
@app.route('/')
def serve_frontend():
    return send_from_directory('frontend/out', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    # Handle API routes
    if path.startswith('api/'):
        # Let the Flask app handle API routes
        return app.handle_request()
    
    # Serve static files
    try:
        return send_from_directory('frontend/out', path)
    except:
        # Fallback to index.html for client-side routing
        return send_from_directory('frontend/out', 'index.html')

# Health check endpoint for Render
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False) 