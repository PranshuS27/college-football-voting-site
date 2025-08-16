import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app import app
from backend.app.models import db, Team

# FBS Teams (130 teams)
fbs_teams = [
    # Power 5 Conferences
    # SEC
    "Alabama", "Arkansas", "Auburn", "Florida", "Georgia", "Kentucky", "LSU", "Mississippi State",
    "Missouri", "Ole Miss", "South Carolina", "Tennessee", "Texas",  "Oklahoma", "Texas A&M", "Vanderbilt",
    
    # Big Ten
    "Illinois", "Indiana", "Iowa", "Maryland", "Michigan", "Michigan State", "Minnesota",
    "Nebraska", "Northwestern", "Ohio State", "Oregon", "Penn State", "Purdue",
    "Rutgers", "UCLA", "USC", "Washington", "Wisconsin",
    
    # ACC
    "Boston College", "California", "Clemson", "Duke", "Florida State", "Georgia Tech",
    "Louisville", "Miami", "North Carolina", "North Carolina State", "Pittsburgh",
    "SMU", "Stanford", "Syracuse", "Virginia", "Virginia Tech", "Wake Forest",
    
    # Big 12
    "Arizona", "Arizona State", "Baylor", "BYU", "Cincinnati", "Colorado", "Houston",
    "Iowa State", "Kansas", "Kansas State", "Oklahoma State",
    "TCU", "Texas Tech", "UCF", "Utah", "West Virginia",
    
    # Pac-12 (only two football members remain)
    "Oregon State", "Washington State",
    
    # Group of 5 Conferences
    # American Athletic Conference
    "Charlotte", "East Carolina", "Florida Atlantic", "Memphis", "Navy", "North Texas",
    "Rice", "South Florida", "Temple", "Tulane", "Tulsa", "UAB",
    
    # Conference USA
    "Delaware", "FIU", "Jacksonville State", "Kennesaw State", "Liberty", "Louisiana Tech",
    "Middle Tennessee", "Missouri State", "New Mexico State", "Sam Houston",
    "UTEP", "Western Kentucky",
    
    # MAC
    "Akron", "Ball State", "Bowling Green", "Buffalo", "Central Michigan", "Eastern Michigan",
    "Kent State", "Miami (OH)", "Northern Illinois", "Ohio", "Toledo",
    "UMass", "Western Michigan",
    
    # Mountain West
    "Air Force", "Boise State", "Colorado State", "Fresno State", "Hawai'i", "Nevada",
    "New Mexico", "San Diego State", "San Jose State", "UNLV", "Utah State", "Wyoming",
    
    # Sun Belt
    "Appalachian State", "Arkansas State", "Coastal Carolina", "Georgia Southern",
    "Georgia State", "James Madison", "Louisiana", "Louisiana-Monroe", "Marshall",
    "Old Dominion", "South Alabama", "Southern Miss", "Texas State", "Troy"
]

fcs_teams = [
    # Big Sky Conference
    "Cal Poly", "Eastern Washington", "Idaho", "Idaho State", "Montana", "Montana State",
    "Northern Arizona", "Northern Colorado", "Portland State", "Sacramento State",
    "UC Davis", "Weber State",
    
    # Big South-OVC Football Association
    "Bryant", "Charleston Southern", "Gardner-Webb", "Robert Morris", "Tennessee State",
    "Tennessee Tech", "Eastern Illinois", "Lindenwood", "Southeast Missouri State",
    "Tennessee-Martin", "Western Illinois",
    
    # Colonial Athletic Association
    "Albany", "Elon", "Hampton", "Maine", "Monmouth", "New Hampshire",
    "Rhode Island", "Stony Brook", "Towson", "Villanova", "William & Mary",
    
    # Missouri Valley Football Conference
    "Illinois State", "Indiana State", "North Dakota", "North Dakota State",
    "Northern Iowa", "South Dakota", "South Dakota State",
    "Southern Illinois", "Youngstown State",
    
    # Northeast Conference
    "Central Connecticut", "Duquesne", "LIU", "Merrimack", "Sacred Heart", "Stonehill", "Wagner",
    
    # Patriot League
    "Bucknell", "Colgate", "Fordham", "Georgetown", "Holy Cross",
    "Lafayette", "Lehigh", "Richmond",
    
    # Pioneer Football League
    "Butler", "Davidson", "Dayton", "Drake", "Marist", "Morehead State",
    "Presbyterian", "San Diego", "St. Thomas", "Valparaiso",
    
    # Southern Conference
    "Chattanooga", "Citadel", "East Tennessee State", "Furman", "Mercer",
    "Samford", "VMI", "Western Carolina", "Wofford",
    
    # Southland Conference
    "Houston Christian", "Incarnate Word", "Lamar", "McNeese", "Nicholls",
    "Northwestern State", "Southeastern Louisiana", "Texas A&M-Commerce",
    
    # United Athletic Conference
    "Abilene Christian", "Austin Peay", "Central Arkansas", "Eastern Kentucky",
    "North Alabama", "Stephen F. Austin", "Tarleton State", "Utah Tech", "UT Rio Grande Valley",
    
    # Independent FCS
    "New Haven"
]

# Combine all teams
teams = fbs_teams + fcs_teams

with app.app_context():
    for name in teams:
        if not Team.query.filter_by(name=name).first():
            db.session.add(Team(name=name))
    db.session.commit()
