from flask import Flask
from flask_cors import CORS
from app import create_app
import os

app = create_app()

# Configure CORS for production - update these with your actual domains
CORS(app, origins=[
    "http://localhost:3000",
    "https://your-app-name.vercel.app",  # Replace with your Vercel domain
    "https://your-custom-domain.com"     # Replace with your custom domain
], supports_credentials=True, allow_headers=['Content-Type', 'Authorization'], methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])

# Get database URL from environment (Supabase or Render)
DATABASE_URL = os.environ.get('DATABASE_URL')
if DATABASE_URL:
    print(f"🔗 Using database URL: {DATABASE_URL}")
    app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
else:
    print("⚠️  No DATABASE_URL found, using default")

# Add root route for health checks
@app.route('/')
def root():
    return {
        'message': 'College Football Voting API',
        'status': 'healthy',
        'version': '1.0.0',
        'database': 'Supabase' if 'supabase' in (DATABASE_URL or '') else 'Local/Render',
        'endpoints': {
            'auth': '/api/auth',
            'vote': '/api/vote',
            'teams': '/api/vote/teams'
        }
    }

# Health check endpoint for Render
@app.route('/health')
def health():
    return {'status': 'healthy'}, 200

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    # Use 0.0.0.0 for Render deployment
    app.run(host='0.0.0.0', port=port, debug=False)
