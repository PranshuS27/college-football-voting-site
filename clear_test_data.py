#!/usr/bin/env python3
"""
Script to clear test data from Supabase database
Run this to remove test users so you can run tests again
"""

import psycopg2
import os
from psycopg2.extras import RealDictCursor

# Get database URL from environment variable
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/football_votes')

def clear_test_data():
    """Clear all test data from the database"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        print("Clearing test data...")
        
        # Clear votes
        cur.execute("DELETE FROM votes")
        print("✅ Cleared votes table")
        
        # Clear users (except admin accounts)
        cur.execute("DELETE FROM users WHERE username LIKE 'testuser%'")
        print("✅ Cleared test users")
        
        # Keep teams (they're reference data)
        print("✅ Kept teams (reference data)")
        
        conn.commit()
        print("🎉 Test data cleared successfully!")
        
    except Exception as e:
        print(f"❌ Error clearing test data: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def show_database_stats():
    """Show current database statistics"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # Count users
        cur.execute("SELECT COUNT(*) FROM users")
        user_count = cur.fetchone()[0]
        
        # Count votes
        cur.execute("SELECT COUNT(*) FROM votes")
        vote_count = cur.fetchone()[0]
        
        # Count teams
        cur.execute("SELECT COUNT(*) FROM teams")
        team_count = cur.fetchone()[0]
        
        print(f"📊 Database Statistics:")
        print(f"   Users: {user_count}")
        print(f"   Votes: {vote_count}")
        print(f"   Teams: {team_count}")
        
    except Exception as e:
        print(f"❌ Error getting stats: {e}")
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("🏈 College Football Voting - Test Data Cleanup")
    print("=" * 50)
    
    show_database_stats()
    
    response = input("\nDo you want to clear all test data? (yes/no): ")
    if response.lower() == 'yes':
        clear_test_data()
        print("\nUpdated statistics:")
        show_database_stats()
    else:
        print("❌ Operation cancelled") 