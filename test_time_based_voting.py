#!/usr/bin/env python3
"""
Test script for time-based voting functionality
Run this script to test week progression, ballot updates, and consensus calculations
"""

import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:5000"

def print_separator(title):
    print(f"\n{'='*50}")
    print(f" {title}")
    print(f"{'='*50}")

def test_user_registration():
    """Test registering multiple users"""
    print_separator("USER REGISTRATION TEST")
    
    test_users = [
        {"username": "voter1", "password": "password1"},
        {"username": "voter2", "password": "password2"},
        {"username": "voter3", "password": "password3"},
        {"username": "voter4", "password": "password4"},
        {"username": "voter5", "password": "password5"}
    ]
    
    for user in test_users:
        try:
            response = requests.post(f"{BASE_URL}/api/auth/register", json=user)
            if response.status_code == 200:
                print(f"✅ Registered {user['username']}")
            else:
                print(f"❌ Failed to register {user['username']}: {response.json()}")
        except Exception as e:
            print(f"❌ Error registering {user['username']}: {e}")

def test_week_1_voting():
    """Test voting for week 1"""
    print_separator("WEEK 1 VOTING TEST")
    
    # Different ballots for different users
    ballots = {
        "voter1": ["Alabama", "Georgia", "Ohio State", "Michigan", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter2": ["Georgia", "Alabama", "Michigan", "Ohio State", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter3": ["Ohio State", "Michigan", "Alabama", "Georgia", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter4": ["Michigan", "Ohio State", "Georgia", "Alabama", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter5": ["USC", "Alabama", "Georgia", "Ohio State", "Michigan", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"]
    }
    
    # Add more teams to make 25 total
    all_teams = ["LSU", "Oregon", "Penn State", "Washington", "Tennessee", "Utah", "Ole Miss", "TCU", "Wisconsin", "North Carolina", 
                 "Texas A&M", "Iowa", "Miami", "Kansas State", "Arkansas"]
    
    for username, ballot in ballots.items():
        # Extend ballot to 25 teams
        full_ballot = ballot + all_teams[:25-len(ballot)]
        
        try:
            # Login
            session = requests.Session()
            login_response = session.post(f"{BASE_URL}/api/auth/login", json={
                "username": username,
                "password": f"password{username[-1]}"
            })
            
            if login_response.status_code == 200:
                # Submit vote
                vote_response = session.post(f"{BASE_URL}/api/vote/submit_vote", json={
                    "week": 1,
                    "rankings": full_ballot
                })
                
                if vote_response.status_code == 200:
                    print(f"✅ {username} submitted Week 1 ballot")
                else:
                    print(f"❌ {username} failed to submit vote: {vote_response.json()}")
            else:
                print(f"❌ {username} failed to login: {login_response.json()}")
                
        except Exception as e:
            print(f"❌ Error with {username}: {e}")

def test_week_2_voting():
    """Test voting for week 2 (different ballots)"""
    print_separator("WEEK 2 VOTING TEST")
    
    # Different ballots for week 2
    ballots = {
        "voter1": ["Georgia", "Alabama", "Ohio State", "Michigan", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter2": ["Alabama", "Georgia", "Michigan", "Ohio State", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter3": ["Michigan", "Ohio State", "Alabama", "Georgia", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter4": ["Ohio State", "Michigan", "Georgia", "Alabama", "USC", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"],
        "voter5": ["USC", "Georgia", "Alabama", "Ohio State", "Michigan", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State"]
    }
    
    all_teams = ["LSU", "Oregon", "Penn State", "Washington", "Tennessee", "Utah", "Ole Miss", "TCU", "Wisconsin", "North Carolina", 
                 "Texas A&M", "Iowa", "Miami", "Kansas State", "Arkansas"]
    
    for username, ballot in ballots.items():
        full_ballot = ballot + all_teams[:25-len(ballot)]
        
        try:
            session = requests.Session()
            login_response = session.post(f"{BASE_URL}/api/auth/login", json={
                "username": username,
                "password": f"password{username[-1]}"
            })
            
            if login_response.status_code == 200:
                vote_response = session.post(f"{BASE_URL}/api/vote/submit_vote", json={
                    "week": 2,
                    "rankings": full_ballot
                })
                
                if vote_response.status_code == 200:
                    print(f"✅ {username} submitted Week 2 ballot")
                else:
                    print(f"❌ {username} failed to submit vote: {vote_response.json()}")
            else:
                print(f"❌ {username} failed to login: {login_response.json()}")
                
        except Exception as e:
            print(f"❌ Error with {username}: {e}")

def test_ballot_update():
    """Test updating a ballot for the same week"""
    print_separator("BALLOT UPDATE TEST")
    
    try:
        session = requests.Session()
        
        # Login as voter1
        login_response = session.post(f"{BASE_URL}/api/auth/login", json={
            "username": "voter1",
            "password": "password1"
        })
        
        if login_response.status_code == 200:
            # Submit updated ballot for week 1
            updated_ballot = ["USC", "Michigan", "Ohio State", "Alabama", "Georgia", "Texas", "Oklahoma", "Notre Dame", "Clemson", "Florida State",
                             "LSU", "Oregon", "Penn State", "Washington", "Tennessee", "Utah", "Ole Miss", "TCU", "Wisconsin", "North Carolina", 
                             "Texas A&M", "Iowa", "Miami", "Kansas State", "Arkansas"]
            
            vote_response = session.post(f"{BASE_URL}/api/vote/submit_vote", json={
                "week": 1,
                "rankings": updated_ballot
            })
            
            if vote_response.status_code == 200:
                print("✅ Successfully updated voter1's Week 1 ballot")
            else:
                print(f"❌ Failed to update ballot: {vote_response.json()}")
        else:
            print(f"❌ Failed to login: {login_response.json()}")
            
    except Exception as e:
        print(f"❌ Error updating ballot: {e}")

def test_consensus_calculation():
    """Test consensus calculation for different weeks"""
    print_separator("CONSENSUS CALCULATION TEST")
    
    for week in [1, 2]:
        try:
            response = requests.get(f"{BASE_URL}/api/vote/consensus/{week}")
            if response.status_code == 200:
                consensus = response.json()
                print(f"\nWeek {week} Consensus (Top 10):")
                for i, team in enumerate(consensus[:10], 1):
                    print(f"  {i:2d}. {team['team']:<15} {team['points']:3d} pts")
            else:
                print(f"❌ Failed to get Week {week} consensus: {response.json()}")
        except Exception as e:
            print(f"❌ Error getting Week {week} consensus: {e}")

def test_vote_statistics():
    """Test getting voting statistics"""
    print_separator("VOTING STATISTICS TEST")
    
    try:
        response = requests.get(f"{BASE_URL}/api/vote/test/stats")
        if response.status_code == 200:
            stats = response.json()
            print(f"Total Users: {stats['total_users']}")
            print("\nVotes by Week:")
            for week_data in stats['weeks']:
                print(f"  Week {week_data['week']}: {week_data['voters']} voters, {week_data['total_votes']} total votes")
        else:
            print(f"❌ Failed to get statistics: {response.json()}")
    except Exception as e:
        print(f"❌ Error getting statistics: {e}")

def test_detailed_votes():
    """Test getting detailed vote information"""
    print_separator("DETAILED VOTE INFORMATION TEST")
    
    for week in [1, 2]:
        try:
            response = requests.get(f"{BASE_URL}/api/vote/test/votes/{week}")
            if response.status_code == 200:
                vote_data = response.json()
                print(f"\nWeek {week} - {vote_data['total_voters']} voters:")
                for username, votes in vote_data['votes'].items():
                    top_5 = [v['team'] for v in votes[:5]]
                    print(f"  {username}: {', '.join(top_5)}")
            else:
                print(f"❌ Failed to get Week {week} votes: {response.json()}")
        except Exception as e:
            print(f"❌ Error getting Week {week} votes: {e}")

def main():
    """Run all tests"""
    print("🏈 College Football Voting - Time-Based Testing")
    print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Run tests in sequence
    test_user_registration()
    time.sleep(1)  # Small delay between tests
    
    test_week_1_voting()
    time.sleep(1)
    
    test_consensus_calculation()
    time.sleep(1)
    
    test_week_2_voting()
    time.sleep(1)
    
    test_consensus_calculation()
    time.sleep(1)
    
    test_ballot_update()
    time.sleep(1)
    
    test_consensus_calculation()
    time.sleep(1)
    
    test_vote_statistics()
    time.sleep(1)
    
    test_detailed_votes()
    
    print_separator("TESTING COMPLETE")
    print(f"Finished at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 