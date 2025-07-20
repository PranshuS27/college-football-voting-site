# College Football Voting App

A full-stack web application for voting on college football team rankings with real-time consensus calculations and leaderboards.

## 🏈 Features

- **User Authentication**: Secure login/registration system
- **Voting System**: Drag-and-drop interface for ranking top 25 teams
- **Real-time Consensus**: Automatic calculation of community rankings
- **Leaderboard**: Overall team standings across all weeks
- **Vote History**: Track your past ballots and results
- **Copy Ballot**: One-click clipboard copying of your rankings
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd college-football-voting-site
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env
   # Edit .env with your actual values
   ```

3. **Start with Docker**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

### Manual Setup

1. **Backend Setup**
   ```bash
   cd backend
   pip install -r requirements.txt
   python run.py
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/football_votes

# Flask Secret Key (generate a strong random key)
SECRET_KEY=your-super-secret-key-change-this-in-production

# Frontend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Database Setup

The app supports multiple database options:

- **Local PostgreSQL** (Docker)
- **Supabase** (Cloud PostgreSQL)
- **Render PostgreSQL** (Cloud database)

## 🏗️ Architecture

### Backend (Flask)
- **Framework**: Flask with SQLAlchemy ORM
- **Database**: PostgreSQL with psycopg2
- **Authentication**: Session-based with Werkzeug password hashing
- **API**: RESTful endpoints with CORS support

### Frontend (Next.js)
- **Framework**: Next.js with React
- **Styling**: Chakra UI components
- **State Management**: React Context for authentication
- **Drag & Drop**: react-beautiful-dnd for voting interface

### Key Components
- **AuthContext**: Global authentication state management
- **Vote System**: Drag-and-drop team ranking
- **Consensus Engine**: Real-time vote aggregation
- **Leaderboard**: Team standings calculation

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Voting
- `GET /api/vote/teams` - Get all teams
- `POST /api/vote/submit_vote` - Submit ballot
- `GET /api/vote/my_votes` - Get user's vote history
- `GET /api/vote/consensus/{week}` - Get consensus for week
- `GET /api/vote/leaderboard/overall` - Get overall leaderboard

## 🚀 Deployment

### Free Deployment Options

1. **Vercel** (Frontend) + **Render** (Backend + Database)
2. **Vercel** (Frontend) + **Supabase** (Database) + **Render** (Backend)

See `DEPLOYMENT.md` for detailed instructions.

## 🔒 Security Best Practices

### Before Making Public

1. **Environment Variables**
   - Move all secrets to environment variables
   - Never commit `.env` files
   - Use placeholder values in examples

2. **Database Security**
   - Use strong passwords
   - Enable SSL connections
   - Restrict database access

3. **Application Security**
   - Generate strong SECRET_KEY
   - Enable HTTPS in production
   - Set secure cookie options

4. **Code Review**
   - Remove hardcoded credentials
   - Sanitize user inputs
   - Validate all API requests

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For issues and questions:
1. Check the documentation
2. Review existing issues
3. Create a new issue with details

---

**🏈 Go Team!** 