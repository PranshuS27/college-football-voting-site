# Time-Based Voting Testing Guide

This guide explains how to test the time-based elements of the College Football Voting application, including week progression, ballot updates, and consensus calculations.

## 🚀 Quick Start

### 1. Start the Application
```bash
# Start the backend and frontend
docker-compose up --build

# Or start them separately:
# Backend: cd backend && python run.py
# Frontend: cd frontend && npm run dev
```

### 2. Access the Testing Interface
- **Main Voting Interface**: http://localhost:3000/vote
- **Testing Suite**: http://localhost:3000/test-time
- **Vote History**: http://localhost:3000/history

## 🧪 Testing Methods

### Method 1: Web Interface Testing

#### A. Manual Testing via Web UI
1. **Register Multiple Users**
   - Go to http://localhost:3000/register
   - Create accounts: `voter1`, `voter2`, `voter3`, etc.

2. **Test Week Progression**
   - Login as different users
   - Use the week selector in the voting interface
   - Submit different ballots for different weeks
   - Verify consensus calculations change

3. **Test Ballot Updates**
   - Submit a ballot for Week 1
   - Submit a different ballot for Week 1 (should replace the first)
   - Check that only the latest ballot is saved

#### B. Automated Testing via Test Suite
1. **Access Test Suite**: http://localhost:3000/test-time
2. **Register Test Users**: Click "Register Test Users"
3. **Submit Test Ballots**: Click "Submit Test Ballots"
4. **Test Week Progression**: Click "Test Week Progression"
5. **View Results**: Check consensus and vote history

### Method 2: Python Script Testing

#### A. Run the Automated Test Script
```bash
# Install requests if needed
pip install requests

# Run the test script
python test_time_based_voting.py
```

This script will:
- Register 5 test users
- Submit ballots for Week 1
- Submit different ballots for Week 2
- Update a ballot for Week 1
- Show consensus calculations
- Display voting statistics

#### B. Expected Output
```
🏈 College Football Voting - Time-Based Testing
Started at: 2024-01-15 10:30:00

==================================================
 USER REGISTRATION TEST
==================================================
✅ Registered voter1
✅ Registered voter2
✅ Registered voter3
✅ Registered voter4
✅ Registered voter5

==================================================
 WEEK 1 VOTING TEST
==================================================
✅ voter1 submitted Week 1 ballot
✅ voter2 submitted Week 1 ballot
✅ voter3 submitted Week 1 ballot
✅ voter4 submitted Week 1 ballot
✅ voter5 submitted Week 1 ballot

==================================================
 CONSENSUS CALCULATION TEST
==================================================

Week 1 Consensus (Top 10):
   1. Alabama          120 pts
   2. Georgia          115 pts
   3. Ohio State       110 pts
   4. Michigan         105 pts
   5. USC              100 pts
   ...

==================================================
 WEEK 2 VOTING TEST
==================================================
✅ voter1 submitted Week 2 ballot
✅ voter2 submitted Week 2 ballot
✅ voter3 submitted Week 2 ballot
✅ voter4 submitted Week 2 ballot
✅ voter5 submitted Week 2 ballot

==================================================
 CONSENSUS CALCULATION TEST
==================================================

Week 2 Consensus (Top 10):
   1. Georgia          120 pts
   2. Alabama          115 pts
   3. Michigan         110 pts
   4. Ohio State       105 pts
   5. USC              100 pts
   ...

==================================================
 BALLOT UPDATE TEST
==================================================
✅ Successfully updated voter1's Week 1 ballot

==================================================
 CONSENSUS CALCULATION TEST
==================================================

Week 1 Consensus (Top 10):
   1. USC              125 pts
   2. Alabama          115 pts
   3. Georgia          110 pts
   4. Ohio State       105 pts
   5. Michigan         100 pts
   ...
```

### Method 3: API Testing

#### A. Test Individual Endpoints
```bash
# Get consensus for Week 1
curl http://localhost:5000/api/vote/consensus/1

# Get consensus for Week 2
curl http://localhost:5000/api/vote/consensus/2

# Get voting statistics
curl http://localhost:5000/api/vote/test/stats

# Get detailed votes for Week 1
curl http://localhost:5000/api/vote/test/votes/1
```

#### B. Test User Registration and Voting
```bash
# Register a user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}'

# Login and get session
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","password":"testpass"}' \
  -c cookies.txt

# Submit a vote for Week 1
curl -X POST http://localhost:5000/api/vote/submit_vote \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"week":1,"rankings":["Alabama","Georgia","Ohio State","Michigan","USC"]}'

# Submit a different vote for Week 1 (should replace the first)
curl -X POST http://localhost:5000/api/vote/submit_vote \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{"week":1,"rankings":["Georgia","Alabama","Michigan","Ohio State","USC"]}'
```

## 🔍 What to Test

### 1. Week Isolation
- **Test**: Submit votes for different weeks
- **Verify**: Votes for Week 1 don't affect Week 2 consensus
- **Expected**: Each week has independent consensus calculations

### 2. Ballot Updates
- **Test**: Submit multiple ballots for the same week
- **Verify**: Only the latest ballot is saved
- **Expected**: Previous ballots are replaced, not added

### 3. Consensus Calculation
- **Test**: Submit ballots from multiple users
- **Verify**: Consensus reflects aggregate rankings
- **Expected**: Teams with higher average rankings get more points

### 4. Vote History
- **Test**: Submit votes for multiple weeks
- **Verify**: History shows all weeks separately
- **Expected**: Each week's ballot is preserved independently

### 5. Session Management
- **Test**: Login as different users
- **Verify**: Each user's votes are isolated
- **Expected**: Users can only see and modify their own votes

## 📊 Expected Behaviors

### Database Structure
```
Votes Table:
- user_id: Which user submitted the vote
- week: Which week the vote is for
- team_id: Which team was voted for
- rank: Position in the ballot (1-25)
```

### Voting Logic
1. **Week-based Storage**: Each vote is stored with a week number
2. **User Isolation**: Users can only see/modify their own votes
3. **Ballot Replacement**: Submitting for the same week replaces previous ballot
4. **Consensus Calculation**: Aggregates all users' votes for a specific week

### Consensus Scoring
- 1st place = 25 points
- 2nd place = 24 points
- ...
- 25th place = 1 point
- Teams are ranked by total points across all voters

## 🐛 Troubleshooting

### Common Issues

1. **"Username taken" error**
   - Solution: Use different usernames or clear the database
   - Test users: voter1, voter2, voter3, etc.

2. **Consensus not updating**
   - Solution: Refresh the page or wait for API calls to complete
   - Check browser console for errors

3. **Votes not saving**
   - Solution: Ensure you're logged in (check session)
   - Verify the ballot has exactly 25 teams

4. **Database connection issues**
   - Solution: Ensure PostgreSQL is running
   - Check docker-compose logs for database errors

### Debug Commands
```bash
# Check if backend is running
curl http://localhost:5000/api/teams

# Check database connection
docker-compose logs db

# Reset database (WARNING: deletes all data)
docker-compose down -v
docker-compose up --build
```

## 📈 Advanced Testing Scenarios

### 1. Stress Testing
- Register 50+ users
- Submit ballots simultaneously
- Test consensus calculation with large datasets

### 2. Edge Cases
- Submit incomplete ballots (< 25 teams)
- Submit duplicate teams in ballot
- Test with non-existent team names

### 3. Time-based Scenarios
- Simulate multiple weeks of voting
- Test ballot updates throughout the week
- Verify historical data preservation

### 4. Performance Testing
- Measure consensus calculation time
- Test with maximum number of teams (130+)
- Monitor database query performance

## 🎯 Success Criteria

A successful test should demonstrate:
- ✅ Users can vote for different weeks independently
- ✅ Ballot updates replace previous ballots for the same week
- ✅ Consensus calculations are accurate and week-specific
- ✅ Vote history shows all weeks separately
- ✅ Multiple users can vote without interference
- ✅ Session management works correctly
- ✅ Database maintains data integrity across weeks 