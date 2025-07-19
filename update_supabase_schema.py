#!/usr/bin/env python3
"""
Script to update Supabase database schema
Run this to fix the password_hash field length issue
"""

import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# Your Supabase connection details
DATABASE_URL = "postgresql://postgres.zblmmazitumwacgmakot:UwiRcMEYOLz8pOhF@aws-0-us-east-2.pooler.supabase.com:5432/postgres"

def update_schema():
    """Update the Supabase database schema"""
    
    print("🔧 Updating Supabase database schema...")
    
    try:
        # Connect to Supabase
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("✅ Connected to Supabase database")
        
        # Check current schema
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'user' AND column_name = 'password_hash'
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"📊 Current password_hash field: {result[1]}({result[2]})")
        
        # Update the password_hash field to VARCHAR(255)
        print("🔄 Updating password_hash field to VARCHAR(255)...")
        cursor.execute("""
            ALTER TABLE "user" 
            ALTER COLUMN password_hash TYPE VARCHAR(255)
        """)
        
        print("✅ Schema updated successfully!")
        
        # Verify the change
        cursor.execute("""
            SELECT column_name, data_type, character_maximum_length 
            FROM information_schema.columns 
            WHERE table_name = 'user' AND column_name = 'password_hash'
        """)
        
        result = cursor.fetchone()
        if result:
            print(f"📊 Updated password_hash field: {result[1]}({result[2]})")
        
        cursor.close()
        conn.close()
        
        print("🎉 Supabase schema update complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error updating schema: {e}")
        return False

def reset_database():
    """Complete database reset (WARNING: Deletes all data)"""
    
    print("⚠️  WARNING: This will delete ALL data in your Supabase database!")
    response = input("Are you sure you want to continue? (yes/no): ")
    
    if response.lower() != 'yes':
        print("❌ Operation cancelled")
        return False
    
    try:
        # Connect to Supabase
        conn = psycopg2.connect(DATABASE_URL)
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()
        
        print("🗑️  Dropping existing tables...")
        
        # Drop tables in correct order (due to foreign keys)
        cursor.execute('DROP TABLE IF EXISTS "vote" CASCADE')
        cursor.execute('DROP TABLE IF EXISTS "user" CASCADE')
        cursor.execute('DROP TABLE IF EXISTS "team" CASCADE')
        
        print("🏗️  Creating new tables with correct schema...")
        
        # Create tables with correct schema
        cursor.execute('''
            CREATE TABLE "user" (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE "team" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL
            )
        ''')
        
        cursor.execute('''
            CREATE TABLE "vote" (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES "user"(id),
                week INTEGER NOT NULL,
                team_id INTEGER NOT NULL REFERENCES "team"(id),
                rank INTEGER NOT NULL
            )
        ''')
        
        # Create indexes
        cursor.execute('CREATE INDEX idx_vote_user_week ON "vote"(user_id, week)')
        cursor.execute('CREATE INDEX idx_vote_week ON "vote"(week)')
        
        cursor.close()
        conn.close()
        
        print("✅ Database reset complete!")
        return True
        
    except Exception as e:
        print(f"❌ Error resetting database: {e}")
        return False

def main():
    """Main function"""
    print("🏈 College Football Voting - Supabase Schema Update")
    print("=" * 50)
    
    print("\nChoose an option:")
    print("1. Update password_hash field only (preserves data)")
    print("2. Reset entire database (deletes all data)")
    print("3. Exit")
    
    choice = input("\nEnter your choice (1-3): ")
    
    if choice == "1":
        update_schema()
    elif choice == "2":
        reset_database()
    elif choice == "3":
        print("👋 Goodbye!")
    else:
        print("❌ Invalid choice")

if __name__ == "__main__":
    main() 