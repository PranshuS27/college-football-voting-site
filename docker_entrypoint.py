"""Wait for Postgres, seed teams if needed, then start Flask."""
import os
import sys
import time

import psycopg2


def wait_for_db(database_url: str, attempts: int = 30) -> None:
    print("Waiting for database...")
    for attempt in range(1, attempts + 1):
        try:
            conn = psycopg2.connect(database_url)
            conn.close()
            print("Database is ready.")
            return
        except Exception as exc:
            print(f"  attempt {attempt}/{attempts}: {exc}")
            time.sleep(2)
    print("Database did not become ready in time.")
    sys.exit(1)


def seed_teams_if_needed(app) -> None:
    from backend.app.models import Team, db
    from backend.seed_teams_simple import teams as team_names

    unique_names = list(dict.fromkeys(team_names))

    with app.app_context():
        existing = Team.query.count()
        if existing > 0:
            print(f"Teams already seeded ({existing} teams).")
            return

        print("Seeding teams...")
        for name in unique_names:
            if not Team.query.filter_by(name=name).first():
                db.session.add(Team(name=name))
        db.session.commit()
        print(f"Seeded {Team.query.count()} teams.")


def seed_nfl_teams_if_needed(app) -> None:
    from backend.app.models import NflTeam, db
    from backend.seed_nfl_teams import seed_nfl_teams

    with app.app_context():
        existing = NflTeam.query.count()
        if existing >= 32:
            print(f"NFL teams already seeded ({existing} teams).")
            return

        print("Seeding NFL teams...")
        added = seed_nfl_teams(db, NflTeam)
        print(f"Seeded {added} NFL teams ({NflTeam.query.count()} total).")


def main() -> None:
    database_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://user:password@db:5432/football_votes",
    )
    wait_for_db(database_url)

    # Import after env is ready so create_app picks up DATABASE_URL
    from app import app

    seed_teams_if_needed(app)
    seed_nfl_teams_if_needed(app)

    port = int(os.environ.get("PORT", "5000"))
    print(f"Starting Flask on 0.0.0.0:{port}")
    app.run(host="0.0.0.0", port=port, debug=True, use_reloader=False)


if __name__ == "__main__":
    main()
