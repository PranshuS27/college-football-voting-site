"""NFL team list and seeding helpers."""

NFL_TEAMS = [
    # AFC East
    "Buffalo Bills",
    "Miami Dolphins",
    "New England Patriots",
    "New York Jets",
    # AFC North
    "Baltimore Ravens",
    "Cincinnati Bengals",
    "Cleveland Browns",
    "Pittsburgh Steelers",
    # AFC South
    "Houston Texans",
    "Indianapolis Colts",
    "Jacksonville Jaguars",
    "Tennessee Titans",
    # AFC West
    "Denver Broncos",
    "Kansas City Chiefs",
    "Las Vegas Raiders",
    "Los Angeles Chargers",
    # NFC East
    "Dallas Cowboys",
    "New York Giants",
    "Philadelphia Eagles",
    "Washington Commanders",
    # NFC North
    "Chicago Bears",
    "Detroit Lions",
    "Green Bay Packers",
    "Minnesota Vikings",
    # NFC South
    "Atlanta Falcons",
    "Carolina Panthers",
    "New Orleans Saints",
    "Tampa Bay Buccaneers",
    # NFC West
    "Arizona Cardinals",
    "Los Angeles Rams",
    "San Francisco 49ers",
    "Seattle Seahawks",
]


def seed_nfl_teams(db, NflTeam):
    """Insert any missing NFL teams. Returns count added."""
    added = 0
    for name in NFL_TEAMS:
        if not NflTeam.query.filter_by(name=name).first():
            db.session.add(NflTeam(name=name))
            added += 1
    if added:
        db.session.commit()
    return added


if __name__ == "__main__":
    import os
    import sys

    sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    from app import app
    from backend.app.models import db, NflTeam

    with app.app_context():
        added = seed_nfl_teams(db, NflTeam)
        total = NflTeam.query.count()
        print(f"Added {added} NFL teams. Total: {total}")
