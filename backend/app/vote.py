from flask import Blueprint, request, jsonify, session
from .models import db, Vote, Team, User, NflTeam, NflVote
from sqlalchemy import func, and_

vote_bp = Blueprint('vote', __name__)

NFL_TEAM_COUNT = 32

@vote_bp.route('/teams', methods=['GET'])
def get_teams():
    """Get all available teams"""
    teams = Team.query.order_by(Team.name).all()
    return jsonify([{'id': team.id, 'name': team.name} for team in teams])

@vote_bp.route('/nfl/teams', methods=['GET'])
def get_nfl_teams():
    """Get all NFL teams"""
    teams = NflTeam.query.order_by(NflTeam.name).all()
    return jsonify([{'id': team.id, 'name': team.name} for team in teams])

@vote_bp.route('/nfl/submit_vote', methods=['POST'])
def submit_nfl_vote():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401

    data = request.json or {}
    week = data.get('week')
    team_names = data.get('rankings') or []

    if week is None:
        return jsonify({'error': 'Week is required'}), 400

    if len(team_names) != NFL_TEAM_COUNT:
        return jsonify({'error': f'Please rank all {NFL_TEAM_COUNT} teams'}), 400

    if len(set(team_names)) != NFL_TEAM_COUNT:
        return jsonify({'error': 'Duplicate teams in rankings'}), 400

    all_teams = {team.name: team for team in NflTeam.query.all()}
    if len(all_teams) != NFL_TEAM_COUNT:
        return jsonify({'error': 'NFL teams are not seeded correctly'}), 500

    missing = set(all_teams.keys()) - set(team_names)
    if missing:
        return jsonify({'error': f'Missing teams: {", ".join(sorted(missing))}'}), 400

    NflVote.query.filter_by(user_id=session['user_id'], week=week).delete()

    for rank, team_name in enumerate(team_names, start=1):
        team = all_teams[team_name]
        db.session.add(NflVote(
            user_id=session['user_id'],
            week=week,
            team_id=team.id,
            rank=rank,
        ))

    db.session.commit()
    return jsonify({'message': 'NFL vote submitted'})

@vote_bp.route('/nfl/my_votes', methods=['GET'])
def nfl_my_votes():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    votes = db.session.query(
        NflVote.week, NflTeam.name, NflVote.rank
    ).join(NflTeam).filter(NflVote.user_id == session['user_id']).all()
    vote_history = {}
    for week, team, rank in votes:
        vote_history.setdefault(week, [])
        vote_history[week].append((rank, team))
    return jsonify({
        week: {
            'ranked': [t for _, t in sorted(ranks)],
        }
        for week, ranks in vote_history.items()
    })

@vote_bp.route('/nfl/consensus/<int:week>', methods=['GET'])
def nfl_consensus(week):
    results = db.session.query(
        NflTeam.name,
        func.sum(33 - NflVote.rank).label('points')
    ).join(NflTeam).filter(
        NflVote.week == week, NflVote.rank > 0
    ).group_by(NflTeam.name).order_by(func.sum(33 - NflVote.rank).desc()).all()

    return jsonify({
        'ranked': [{'team': r[0], 'points': r[1]} for r in results],
        'unranked': [],
    })

@vote_bp.route('/nfl/leaderboard/overall', methods=['GET'])
def nfl_overall_leaderboard():
    results = db.session.query(
        NflTeam.name,
        func.sum(33 - NflVote.rank).label('points')
    ).join(NflTeam).filter(
        NflVote.rank > 0
    ).group_by(NflTeam.name).order_by(func.sum(33 - NflVote.rank).desc()).all()

    return jsonify({
        'ranked': [{'team': r[0], 'points': r[1]} for r in results],
        'unranked': [],
    })

@vote_bp.route('/nfl/stats', methods=['GET'])
def nfl_stats():
    week_stats = db.session.query(
        NflVote.week,
        func.count(NflVote.user_id.distinct()).label('voters'),
        func.count(NflVote.id).label('total_votes')
    ).group_by(NflVote.week).order_by(NflVote.week).all()

    return jsonify({
        'weeks': [{'week': w, 'voters': v, 'total_votes': t} for w, v, t in week_stats]
    })

@vote_bp.route('/submit_vote', methods=['POST'])
def submit_vote():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    week = data['week']
    team_names = data['rankings']
    considered_names = data.get('considered', [])

    overlap = set(team_names) & set(considered_names)
    if overlap:
        return jsonify({'error': f'Teams cannot appear in both rankings and considered: {", ".join(sorted(overlap))}'}), 400

    Vote.query.filter_by(user_id=session['user_id'], week=week).delete()

    for rank, team_name in enumerate(team_names, start=1):
        team = Team.query.filter_by(name=team_name).first()
        if team:
            db.session.add(Vote(user_id=session['user_id'], week=week, team_id=team.id, rank=rank))

    for team_name in considered_names:
        team = Team.query.filter_by(name=team_name).first()
        if team:
            db.session.add(Vote(user_id=session['user_id'], week=week, team_id=team.id, rank=0))

    db.session.commit()
    return jsonify({'message': 'Vote submitted'})

@vote_bp.route('/submit_conference_champions', methods=['POST'])
def submit_conference_champions():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    data = request.json
    selections = data.get('champions', {})
    # Remove previous votes for this user
    from .models import ConferenceChampionVote
    ConferenceChampionVote.query.filter_by(user_id=session['user_id']).delete()
    for conference, team in selections.items():
        db.session.add(ConferenceChampionVote(user_id=session['user_id'], conference=conference, team=team))
    db.session.commit()
    return jsonify({'message': 'Conference champion votes submitted'})

@vote_bp.route('/consensus_conference_champions', methods=['GET'])
def consensus_conference_champions():
    from .models import ConferenceChampionVote
    from sqlalchemy import func
    results = db.session.query(
        ConferenceChampionVote.conference,
        ConferenceChampionVote.team,
        func.count(ConferenceChampionVote.team).label('votes')
    ).group_by(ConferenceChampionVote.conference, ConferenceChampionVote.team).all()
    # Find consensus (most voted team per conference)
    consensus = {}
    for conf in set(r[0] for r in results):
        conf_teams = [r for r in results if r[0] == conf]
        winner = max(conf_teams, key=lambda x: x[2]) if conf_teams else None
        if winner:
            consensus[conf] = {'team': winner[1], 'votes': winner[2]}
    return jsonify({'consensus': consensus, 'raw': [{'conference': r[0], 'team': r[1], 'votes': r[2]} for r in results]})
@vote_bp.route('/consensus/<int:week>', methods=['GET'])
def consensus(week):
    results = db.session.query(
        Team.name,
        func.sum(26 - Vote.rank).label('points')
    ).join(Team).filter(Vote.week == week, Vote.rank > 0).group_by(Team.name).order_by(func.sum(26 - Vote.rank).desc()).all()

    # Top 25 teams
    top_25 = results[:25]
    # Teams that got votes but not enough to be ranked
    unranked = results[25:]

    response = {
        'ranked': [{ 'team': r[0], 'points': r[1] } for r in top_25],
        'unranked': [{ 'team': r[0], 'points': r[1] } for r in unranked]
    }
    return jsonify(response)

@vote_bp.route('/leaderboard/overall', methods=['GET'])
def overall_leaderboard():
    """Get overall rankings across all weeks and users"""
    results = db.session.query(
        Team.name,
        func.sum(26 - Vote.rank).label('points')
    ).join(Team).filter(Vote.rank > 0).group_by(Team.name).order_by(func.sum(26 - Vote.rank).desc()).all()

    top_25 = results[:25]
    unranked = results[25:]

    response = {
        'ranked': [{ 'team': r[0], 'points': r[1] } for r in top_25],
        'unranked': [{ 'team': r[0], 'points': r[1] } for r in unranked]
    }
    return jsonify(response)

@vote_bp.route('/my_votes', methods=['GET'])
def my_votes():
    if 'user_id' not in session:
        return jsonify({'error': 'Unauthorized'}), 401
    votes = db.session.query(Vote.week, Team.name, Vote.rank).join(Team).filter(Vote.user_id == session['user_id']).all()
    vote_history = {}
    for week, team, rank in votes:
        vote_history.setdefault(week, {'ranked': [], 'considered': []})
        if rank == 0:
            vote_history[week]['considered'].append(team)
        else:
            vote_history[week]['ranked'].append((rank, team))
    return jsonify({
        week: {
            'ranked': [t for _, t in sorted(data['ranked'])],
            'considered': data['considered'],
        }
        for week, data in vote_history.items()
    })

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
