from flask import Blueprint, request, jsonify, session
from .models import db, Vote, Team, User
from sqlalchemy import func, and_

vote_bp = Blueprint('vote', __name__)

@vote_bp.route('/teams', methods=['GET'])
def get_teams():
    """Get all available teams"""
    teams = Team.query.order_by(Team.name).all()
    return jsonify([{'id': team.id, 'name': team.name} for team in teams])

@vote_bp.route('/submit_vote', methods=['POST'])
def submit_vote():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    week = data['week']
    team_names = data['rankings']

    Vote.query.filter_by(user_id=session['user_id'], week=week).delete()

    for rank, team_name in enumerate(team_names, start=1):
        team = Team.query.filter_by(name=team_name).first()
        if team:
            db.session.add(Vote(user_id=session['user_id'], week=week, team_id=team.id, rank=rank))

    db.session.commit()
    return jsonify({'message': 'Vote submitted'})

@vote_bp.route('/consensus/<int:week>', methods=['GET'])
def consensus(week):
    results = db.session.query(
        Team.name,
        func.sum(26 - Vote.rank).label('points')
    ).join(Team).filter(Vote.week == week).group_by(Team.name).order_by(func.sum(26 - Vote.rank).desc()).all()

    return jsonify([{ 'team': r[0], 'points': r[1] } for r in results])

@vote_bp.route('/leaderboard/overall', methods=['GET'])
def overall_leaderboard():
    """Get overall rankings across all weeks and users"""
    results = db.session.query(
        Team.name,
        func.sum(26 - Vote.rank).label('points')
    ).join(Team).group_by(Team.name).order_by(func.sum(26 - Vote.rank).desc()).all()

    return jsonify([{ 'team': r[0], 'points': r[1] } for r in results])

@vote_bp.route('/my_votes', methods=['GET'])
def my_votes():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    votes = db.session.query(Vote.week, Team.name, Vote.rank).join(Team).filter(Vote.user_id == session['user_id']).all()
    vote_history = {}
    for week, team, rank in votes:
        vote_history.setdefault(week, []).append((rank, team))
    return jsonify({week: [t for _, t in sorted(rankings)] for week, rankings in vote_history.items()})

@vote_bp.route('/test/votes/<int:week>', methods=['GET'])
def test_votes(week):
    """Get all votes for a specific week with user information (for testing)"""
    votes = db.session.query(
        User.username,
        Team.name,
        Vote.rank
    ).join(User).join(Team).filter(Vote.week == week).order_by(User.username, Vote.rank).all()
    
    vote_data = {}
    for username, team, rank in votes:
        if username not in vote_data:
            vote_data[username] = []
        vote_data[username].append({'team': team, 'rank': rank})
    
    return jsonify({
        'week': week,
        'total_voters': len(vote_data),
        'votes': vote_data
    })

@vote_bp.route('/test/stats', methods=['GET'])
def test_stats():
    """Get overall voting statistics (for testing)"""
    # Get total users
    total_users = User.query.count()
    
    # Get votes by week
    week_stats = db.session.query(
        Vote.week,
        func.count(Vote.user_id.distinct()).label('voters'),
        func.count(Vote.id).label('total_votes')
    ).group_by(Vote.week).order_by(Vote.week).all()
    
    stats = {
        'total_users': total_users,
        'weeks': [{'week': w, 'voters': v, 'total_votes': t} for w, v, t in week_stats]
    }
    
    return jsonify(stats)
