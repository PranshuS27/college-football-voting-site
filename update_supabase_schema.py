#!/usr/bin/env python3
"""
Script to update Supabase database schema
Run this to fix the password_hash field length issue
"""

import psycopg2
import os
from psycopg2.extras import RealDictCursor

# Get database URL from environment variable
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/football_votes')

def create_tables():
    """Create the necessary tables for the voting system"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        # Create users table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                username VARCHAR(80) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """)
        
        # Create votes table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS votes (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id),
                week INTEGER NOT NULL,
                rankings TEXT[] NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(user_id, week)
            );
        """)
        
        # Create teams table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS teams (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) UNIQUE NOT NULL,
                conference VARCHAR(50),
                division VARCHAR(50)
            );
        """)
        
        conn.commit()
        print("Tables created successfully!")
        
    except Exception as e:
        print(f"Error creating tables: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

def seed_teams():
    """Seed the teams table with college football teams"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    teams = [
        # SEC
        ("Alabama", "SEC", "West"),
        ("Auburn", "SEC", "West"),
        ("LSU", "SEC", "West"),
        ("Mississippi State", "SEC", "West"),
        ("Ole Miss", "SEC", "West"),
        ("Texas A&M", "SEC", "West"),
        ("Arkansas", "SEC", "West"),
        ("Georgia", "SEC", "East"),
        ("Florida", "SEC", "East"),
        ("Tennessee", "SEC", "East"),
        ("Kentucky", "SEC", "East"),
        ("South Carolina", "SEC", "East"),
        ("Missouri", "SEC", "East"),
        ("Vanderbilt", "SEC", "East"),
        
        # Big Ten
        ("Michigan", "Big Ten", "East"),
        ("Ohio State", "Big Ten", "East"),
        ("Penn State", "Big Ten", "East"),
        ("Michigan State", "Big Ten", "East"),
        ("Indiana", "Big Ten", "East"),
        ("Maryland", "Big Ten", "East"),
        ("Rutgers", "Big Ten", "East"),
        ("Wisconsin", "Big Ten", "West"),
        ("Iowa", "Big Ten", "West"),
        ("Minnesota", "Big Ten", "West"),
        ("Nebraska", "Big Ten", "West"),
        ("Northwestern", "Big Ten", "West"),
        ("Illinois", "Big Ten", "West"),
        ("Purdue", "Big Ten", "West"),
        
        # ACC
        ("Clemson", "ACC", "Atlantic"),
        ("Florida State", "ACC", "Atlantic"),
        ("NC State", "ACC", "Atlantic"),
        ("Wake Forest", "ACC", "Atlantic"),
        ("Boston College", "ACC", "Atlantic"),
        ("Syracuse", "ACC", "Atlantic"),
        ("Louisville", "ACC", "Atlantic"),
        ("Miami", "ACC", "Coastal"),
        ("North Carolina", "ACC", "Coastal"),
        ("Virginia Tech", "ACC", "Coastal"),
        ("Pittsburgh", "ACC", "Coastal"),
        ("Virginia", "ACC", "Coastal"),
        ("Georgia Tech", "ACC", "Coastal"),
        ("Duke", "ACC", "Coastal"),
        
        # Big 12
        ("Texas", "Big 12", None),
        ("Oklahoma", "Big 12", None),
        ("Baylor", "Big 12", None),
        ("Kansas State", "Big 12", None),
        ("Oklahoma State", "Big 12", None),
        ("TCU", "Big 12", None),
        ("Texas Tech", "Big 12", None),
        ("Iowa State", "Big 12", None),
        ("Kansas", "Big 12", None),
        ("West Virginia", "Big 12", None),
        ("BYU", "Big 12", None),
        ("Cincinnati", "Big 12", None),
        ("Houston", "Big 12", None),
        ("UCF", "Big 12", None),
        
        # Pac-12
        ("USC", "Pac-12", None),
        ("UCLA", "Pac-12", None),
        ("Oregon", "Pac-12", None),
        ("Washington", "Pac-12", None),
        ("Utah", "Pac-12", None),
        ("Stanford", "Pac-12", None),
        ("California", "Pac-12", None),
        ("Arizona State", "Pac-12", None),
        ("Arizona", "Pac-12", None),
        ("Oregon State", "Pac-12", None),
        ("Washington State", "Pac-12", None),
        ("Colorado", "Pac-12", None),
        
        # Other notable teams
        ("Notre Dame", "Independent", None),
        ("Army", "Independent", None),
        ("Navy", "Independent", None),
        ("Liberty", "Conference USA", None),
        ("Boise State", "Mountain West", None),
        ("San Diego State", "Mountain West", None),
        ("Fresno State", "Mountain West", None),
        ("Air Force", "Mountain West", None),
        ("Tulane", "American", None),
        ("SMU", "American", None),
        ("Memphis", "American", None),
        ("Appalachian State", "Sun Belt", None),
        ("Coastal Carolina", "Sun Belt", None),
        ("Troy", "Sun Belt", None),
        ("James Madison", "Sun Belt", None)
    ]
    
    try:
        for team in teams:
            cur.execute("""
                INSERT INTO teams (name, conference, division) 
                VALUES (%s, %s, %s) 
                ON CONFLICT (name) DO NOTHING
            """, team)
        
        conn.commit()
        print(f"Seeded {len(teams)} teams successfully!")
        
    except Exception as e:
        print(f"Error seeding teams: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("Creating tables...")
    create_tables()
    
    print("Seeding teams...")
    seed_teams()
    
    print("Database setup complete!") 