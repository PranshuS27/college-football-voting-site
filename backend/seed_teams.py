from app.models import db, Team
from run import app

teams = [
    "Alabama", "Georgia", "Ohio State", "Michigan", "USC", "Texas", "Oklahoma", "Notre Dame",
    "Clemson", "Florida State", "LSU", "Oregon", "Penn State", "Washington", "Tennessee", "Utah",
    "Ole Miss", "TCU", "Wisconsin", "North Carolina", "Texas A&M", "Iowa", "Miami", "Kansas State",
    "Arkansas", "Oregon State", "UCLA", "Missouri", "Louisville", "South Carolina", "Kentucky",
    "NC State", "Pittsburgh", "Baylor", "Minnesota", "Nebraska", "Michigan State", "Florida",
    "Arizona", "Auburn", "Boise State", "West Virginia", "Duke", "Illinois", "Texas Tech",
    "Purdue", "Syracuse", "Wake Forest", "Indiana", "Stanford", "Washington State",
    "Georgia Tech", "Virginia Tech", "Boston College", "California", "Northwestern", "Colorado",
    "Arizona State", "Rutgers", "Vanderbilt", "Maryland", "Houston", "Cincinnati", "BYU",
    "UCF", "SMU", "Tulane", "Memphis", "Navy", "Army", "Air Force", "Liberty", "Troy", "UTSA",
    "South Alabama", "Appalachian State", "Fresno State", "San Diego State", "Marshall",
    "Coastal Carolina", "Toledo", "Ohio", "Western Kentucky", "Louisiana", "Georgia State",
    "Buffalo", "Ball State", "Eastern Michigan", "Miami (OH)", "Northern Illinois", "Central Michigan",
    "Bowling Green", "Akron", "Kent State", "Old Dominion", "Arkansas State", "Georgia Southern",
    "Texas State", "Louisiana-Monroe", "New Mexico State", "UAB", "Charlotte", "Florida Atlantic",
    "Florida International", "Middle Tennessee", "North Texas", "Rice", "Southern Miss",
    "South Florida", "Temple", "Tulsa", "UMass", "UConn", "New Mexico", "Nevada", "UNLV",
    "San Jose State", "Hawai'i", "Wyoming", "Colorado State"
]

with app.app_context():
    for name in teams:
        if not Team.query.filter_by(name=name).first():
            db.session.add(Team(name=name))
    db.session.commit()
