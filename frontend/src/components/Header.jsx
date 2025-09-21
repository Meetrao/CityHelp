import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Don't show header on login page
  if (location.pathname === '/') {
    return null;
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">CH</span>
              </div>
              <span className="text-xl font-bold text-gray-900">CityHelp</span>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-8">
            <Link
              to="/dashboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/dashboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/report"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/report'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Report Issue
            </Link>
            <Link
              to="/leaderboard"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/leaderboard'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Leaderboard
            </Link>
            <Link
              to="/map"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/map'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Map
            </Link>
            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  location.pathname === '/admin'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                Admin Panel
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                {user?.points || 0} pts
              </div>
              <span className="text-sm text-gray-700">
                Welcome, {user?.name || user?.username}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}


