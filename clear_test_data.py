#!/usr/bin/env python3
"""
Script to clear test data from Supabase database
Run this to remove test users so you can run tests again
"""

import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Your Supabase connection details
DATABASE_URL = "postgresql://postgres.zblmmazitumwacgmakot:UwiRcMEYOLz8pOhF@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

def clear_test_data():
    """Clear test users and their votes from the database"""
    
    print("🧹 Clearing test data from Supabase...")
    
    try:
        # Connect to Supabase
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("✅ Connected to Supabase database")
        
        # List of test usernames to remove
        test_users = ['voter1', 'voter2', 'voter3', 'voter4', 'voter5']
        
        # Delete votes first (due to foreign key constraints)
        print("🗑️  Deleting test votes...")
        for username in test_users:
            cursor.execute("""
                DELETE FROM "vote" 
                WHERE user_id IN (
                    SELECT id FROM "user" WHERE username = %s
                )
            """, (username,))
        
        # Delete test users
        print("🗑️  Deleting test users...")
        for username in test_users:
            cursor.execute('DELETE FROM "user" WHERE username = %s', (username,))
            if cursor.rowcount > 0:
                print(f"✅ Deleted user: {username}")
            else:
                print(f"ℹ️  User not found: {username}")
        
        cursor.close()
        conn.close()
        
        print("🎉 Test data cleared successfully!")
        return True
        
    except Exception as e:
        print(f"❌ Error clearing test data: {e}")
        return False

def show_current_users():
    """Show all current users in the database"""
    
    try:
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        cursor.execute('SELECT username FROM "user" ORDER BY username')
        users = cursor.fetchall()
        
        print(f"📊 Current users in database ({len(users)} total):")
        for user in users:
            print(f"  - {user[0]}")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"❌ Error showing users: {e}")

def main():
    """Main function"""
    print("🏈 College Football Voting - Test Data Cleanup")
    print("=" * 50)
    
    print("\nChoose an option:")
    print("1. Clear test users (voter1-voter5)")
    print("2. Show current users")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ")
    
    if choice == "1":
        clear_test_data()
    elif choice == "2":
        show_current_users()
    elif choice == "3":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main() 