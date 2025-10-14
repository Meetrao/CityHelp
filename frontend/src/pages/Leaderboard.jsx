import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
  axios.get('/api/leaderboard')
    .then(res => setUsers(res.data))
    .catch(err => console.error("Leaderboard fetch error:", err));
}, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const [leaderboardRes, statsRes] = await Promise.all([
          fetch('http://localhost:5000/api/leaderboard', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch('http://localhost:5000/api/stats', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          })
        ]);

        if (!leaderboardRes.ok || !statsRes.ok) {
          throw new Error('Failed to fetch leaderboard data');
        }

        const leaderboardData = await leaderboardRes.json();
        const statsData = await statsRes.json();

        setLeaderboard(leaderboardData);
        setUserStats(statsData);
      } catch (err) {
        console.error('Error fetching leaderboard:', err);
        setError('Failed to load leaderboard. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return '🥇';
      case 2:
        return '🥈';
      case 3:
        return '🥉';
      default:
        return `#${rank}`;
    }
  };

  const getBadgeColor = (points) => {
    if (points >= 1000) return 'bg-purple-100 text-purple-800';
    if (points >= 500) return 'bg-blue-100 text-blue-800';
    if (points >= 200) return 'bg-green-100 text-green-800';
    if (points >= 100) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard</h1>
          <p className="text-gray-600">See how you rank among civic contributors</p>
        </div>

        {/* User Stats */}
        {userStats && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 mb-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Your Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-blue-100 text-sm">Rank</p>
                    <p className="text-2xl font-bold">{getRankIcon(userStats.user.rank)}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Points</p>
                    <p className="text-2xl font-bold">{userStats.user.points}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Reports</p>
                    <p className="text-2xl font-bold">{userStats.stats.totalIssues}</p>
                  </div>
                  <div>
                    <p className="text-blue-100 text-sm">Resolved</p>
                    <p className="text-2xl font-bold">{userStats.stats.issuesResolved}</p>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl mb-2">🏆</div>
                <p className="text-sm text-blue-100">Keep contributing!</p>
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Top Contributors</h2>
            <p className="text-sm text-gray-600">Ranked by total points earned</p>
          </div>

          {error ? (
            <div className="p-6 text-center">
              <div className="text-red-600 mb-4">{error}</div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Retry
              </button>
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <p className="text-lg mb-2">No contributors yet</p>
              <p className="text-sm">Be the first to start earning points!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {leaderboard.map((user, index) => (
                <div key={user.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-2xl font-bold">
                          {getRankIcon(index + 1)}
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {user.name}
                          {user.id === user?.id && (
                            <span className="ml-2 text-sm text-blue-600">(You)</span>
                          )}
                        </h3>
                        <p className="text-sm text-gray-500">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <span className="text-sm text-gray-600">
                            {user.issuesReported} reports
                          </span>
                          <span className="text-sm text-gray-600">
                            {user.issuesResolved} resolved
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getBadgeColor(user.points)}`}>
                        {user.points} pts
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                          {user.points}
                        </div>
                        <div className="text-sm text-gray-500">points</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Achievement Badges */}
        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Achievement Badges</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'First Report', points: 10, icon: '🎯', description: 'Submit your first issue' },
              { name: 'Civic Hero', points: 100, icon: '🦸', description: 'Reach 100 points' },
              { name: 'City Champion', points: 500, icon: '🏆', description: 'Reach 500 points' },
              { name: 'Urban Legend', points: 1000, icon: '⭐', description: 'Reach 1000 points' }
            ].map((badge) => (
              <div key={badge.name} className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">{badge.icon}</div>
                <h4 className="font-medium text-gray-900">{badge.name}</h4>
                <p className="text-sm text-gray-600">{badge.description}</p>
                <p className="text-xs text-gray-500 mt-1">{badge.points} points</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
