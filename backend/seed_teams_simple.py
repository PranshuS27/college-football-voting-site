#!/usr/bin/env python3
"""
Simple script to seed teams directly to the database
"""

import psycopg2
import os
from psycopg2.extras import RealDictCursor

# Get database URL from environment variable
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://user:password@localhost:5432/football_votes')

# FBS Teams (130 teams)
fbs_teams = [
    # Power 5 Conferences
    # SEC
    "Alabama", "Arkansas", "Auburn", "Florida", "Georgia", "Kentucky", "LSU", "Mississippi State",
    "Missouri", "Ole Miss", "South Carolina", "Tennessee", "Texas A&M", "Vanderbilt",
    
    # Big Ten
    "Illinois", "Indiana", "Iowa", "Maryland", "Michigan", "Michigan State", "Minnesota",
    "Nebraska", "Northwestern", "Ohio State", "Penn State", "Purdue", "Rutgers", "Wisconsin",
    
    # ACC
    "Boston College", "Clemson", "Duke", "Florida State", "Georgia Tech", "Louisville",
    "Miami", "NC State", "North Carolina", "Pittsburgh", "Syracuse", "Virginia",
    "Virginia Tech", "Wake Forest",
    
    # Big 12
    "Baylor", "BYU", "Cincinnati", "Houston", "Iowa State", "Kansas", "Kansas State",
    "Oklahoma", "Oklahoma State", "TCU", "Texas", "Texas Tech", "UCF", "West Virginia",
    
    # Pac-12
    "Arizona", "Arizona State", "California", "Colorado", "Oregon", "Oregon State",
    "Stanford", "UCLA", "USC", "Utah", "Washington", "Washington State",
    
    # Group of 5 Conferences
    # American Athletic Conference
    "Charlotte", "East Carolina", "Florida Atlantic", "Memphis", "Navy", "North Texas",
    "Rice", "SMU", "South Florida", "Temple", "Tulane", "Tulsa", "UAB",
    
    # Conference USA
    "FIU", "Jacksonville State", "Liberty", "Louisiana Tech", "Middle Tennessee",
    "New Mexico State", "Sam Houston", "UTEP", "Western Kentucky",
    
    # MAC
    "Akron", "Ball State", "Bowling Green", "Buffalo", "Central Michigan", "Eastern Michigan",
    "Kent State", "Miami (OH)", "Northern Illinois", "Ohio", "Toledo", "Western Michigan",
    
    # Mountain West
    "Air Force", "Boise State", "Colorado State", "Fresno State", "Hawai'i", "Nevada",
    "New Mexico", "San Diego State", "San Jose State", "UNLV", "Utah State", "Wyoming",
    
    # Sun Belt
    "Appalachian State", "Arkansas State", "Coastal Carolina", "Georgia Southern",
    "Georgia State", "James Madison", "Louisiana", "Louisiana-Monroe", "Marshall",
    "Old Dominion", "South Alabama", "Southern Miss", "Texas State", "Troy"
]

# FCS Teams (128 teams)
fcs_teams = [
    # Big Sky Conference
    "Cal Poly", "Eastern Washington", "Idaho", "Idaho State", "Montana", "Montana State",
    "Northern Arizona", "Northern Colorado", "Portland State", "Sacramento State",
    "UC Davis", "Weber State",
    
    # Big South Conference
    "Bryant", "Charleston Southern", "Gardner-Webb", "Robert Morris", "Tennessee State",
    "Tennessee Tech",
    
    # Colonial Athletic Association
    "Albany", "Delaware", "Elon", "Hampton", "Maine", "Monmouth", "New Hampshire",
    "Rhode Island", "Richmond", "Stony Brook", "Towson", "Villanova", "William & Mary",
    
    # Missouri Valley Football Conference
    "Illinois State", "Indiana State", "Missouri State", "Murray State", "North Dakota",
    "North Dakota State", "Northern Iowa", "South Dakota", "South Dakota State",
    "Southern Illinois", "Western Illinois", "Youngstown State",
    
    # Northeast Conference
    "Central Connecticut", "Duquesne", "LIU", "Merrimack", "Sacred Heart", "Saint Francis",
    "Stonehill", "Wagner",
    
    # Ohio Valley Conference
    "Eastern Illinois", "Lindenwood", "Southeast Missouri State", "Tennessee-Martin",
    "Western Illinois",
    
    # Patriot League
    "Bucknell", "Colgate", "Fordham", "Georgetown", "Holy Cross", "Lafayette", "Lehigh",
    
    # Pioneer Football League
    "Butler", "Davidson", "Dayton", "Drake", "Marist", "Morehead State", "Presbyterian",
    "San Diego", "St. Thomas", "Valparaiso",
    
    # Southern Conference
    "Chattanooga", "Citadel", "East Tennessee State", "Furman", "Mercer", "Samford",
    "VMI", "Western Carolina", "Wofford",
    
    # Southland Conference
    "Houston Christian", "Incarnate Word", "Lamar", "McNeese", "Nicholls", "Northwestern State",
    "Southeastern Louisiana", "Texas A&M-Commerce",
    
    # United Athletic Conference
    "Abilene Christian", "Austin Peay", "Central Arkansas", "Eastern Kentucky", "North Alabama",
    "Stephen F. Austin", "Tarleton State", "Utah Tech",
    
    # Independent FCS
    "Kennesaw State", "Stetson"
]

# Combine all teams
teams = fbs_teams + fcs_teams

def seed_teams():
    """Seed teams to the database"""
    conn = psycopg2.connect(DATABASE_URL)
    cur = conn.cursor()
    
    try:
        print("🏈 Seeding teams to database...")
        
        # Check if team table exists
        cur.execute("""
            SELECT EXISTS (
                SELECT FROM information_schema.tables 
                WHERE table_name = 'team'
            );
        """)
        
        if not cur.fetchone()[0]:
            print("❌ Team table does not exist. Please run database migrations first.")
            return
        
        # Count existing teams
        cur.execute("SELECT COUNT(*) FROM team")
        existing_count = cur.fetchone()[0]
        print(f"📊 Found {existing_count} existing teams")
        
        # Add teams that don't exist
        added_count = 0
        for team_name in teams:
            cur.execute("SELECT id FROM team WHERE name = %s", (team_name,))
            if not cur.fetchone():
                cur.execute("INSERT INTO team (name) VALUES (%s)", (team_name,))
                added_count += 1
                print(f"✅ Added: {team_name}")
        
        conn.commit()
        
        # Final count
        cur.execute("SELECT COUNT(*) FROM team")
        final_count = cur.fetchone()[0]
        
        print(f"🎉 Seeding complete!")
        print(f"   Teams added: {added_count}")
        print(f"   Total teams: {final_count}")
        
    except Exception as e:
        print(f"❌ Error seeding teams: {e}")
        conn.rollback()
    finally:
        cur.close()
        conn.close()

if __name__ == "__main__":
    print("🏈 College Football Voting - Team Seeding")
    print("=" * 50)
    seed_teams() 