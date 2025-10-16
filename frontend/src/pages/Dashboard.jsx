import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const [issues, setIssues] = useState([]);
  const [userIssues, setUserIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState({
    department: '',
    status: ''
  });

  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const allRes = await fetch('http://localhost:5000/api/issues', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const userRes = await fetch('http://localhost:5000/api/issues/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!allRes.ok || !userRes.ok) throw new Error('Failed to fetch issues');

        const allData = await allRes.json();
        const userData = await userRes.json();

        setIssues(allData.issues || allData);
        setUserIssues(userData);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      case 'In Progress': return 'bg-blue-100 text-blue-800';
      case 'Resolved': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Infrastructure': return '🏗️';
      case 'Traffic': return '🚦';
      case 'Environment': return '🌱';
      case 'Safety': return '⚠️';
      default: return '📋';
    }
  };

  const currentIssues = useMemo(() => {
    if (isAdmin) {
      return issues.filter(issue => {
        const matchDept = filters.department
          ? issue.description?.includes(`Assigned to ${filters.department}`)
          : true;
        const matchStatus = filters.status
          ? issue.status === filters.status
          : true;
        return matchDept && matchStatus;
      });
    } else {
      switch (activeTab) {
        case 'my': return userIssues;
        case 'pending': return issues.filter(i => i.status === 'Pending');
        case 'inprogress': return issues.filter(i => i.status === 'In Progress');
        case 'resolved': return issues.filter(i => i.status === 'Resolved');
        case 'closed': return issues.filter(i => i.status === 'Closed');
        default: return issues;
      }
    }
  }, [filters, issues, userIssues, activeTab, isAdmin]);

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
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Monitor and manage reported city issues</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-6 mb-8">
          <StatCard icon="📋" label="Total Issues" value={issues.length} color="blue" />
          <StatCard icon="👤" label="My Reports" value={userIssues.length} color="purple" />
          <StatCard icon="⏳" label="Pending" value={issues.filter(i => i.status === 'Pending').length} color="yellow" />
          <StatCard icon="🚧" label="In Progress" value={issues.filter(i => i.status === 'In Progress').length} color="blue" />
          <StatCard icon="✅" label="Resolved" value={issues.filter(i => i.status === 'Resolved').length} color="green" />
          <StatCard icon="🔒" label="Closed" value={issues.filter(i => i.status === 'Closed').length} color="red" />
        </div>
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Issues</h2>
              {isAdmin ? (
                <Link to="/admin" className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Go to Admin Panel
                </Link>
              ) : (
                <Link to="/report" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">
                  Report New Issue
                </Link>
              )}
            </div>

            {isAdmin ? (
              <div className="flex flex-wrap gap-4 mb-4">
                <select
                  value={filters.department}
                  onChange={(e) => setFilters({ ...filters, department: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Departments</option>
                  <option value="Roads">Roads</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Electricity">Electricity</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Traffic">Traffic</option>
                  <option value="Disaster Management">Disaster Management</option>
                  <option value="Environment">Environment</option>
                  <option value="General">General</option>
                </select>

                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            ) : (
              <div className="flex space-x-1">
                {[
                  { id: 'all', label: 'All Issues', count: issues.length },
                  { id: 'my', label: 'My Reports', count: userIssues.length },
                  { id: 'pending', label: 'Pending', count: issues.filter(i => i.status === 'Pending').length },
                  { id: 'inprogress', label: 'In Progress', count: issues.filter(i => i.status === 'In Progress').length },
                  { id: 'resolved', label: 'Resolved', count: issues.filter(i => i.status === 'Resolved').length },
                  { id: 'closed', label: 'Closed', count: issues.filter(i => i.status === 'Closed').length }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label} ({tab.count})
                  </button>
                ))}
              </div>
            )}
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
          ) : currentIssues.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📝</div>
              <p className="text-lg mb-2">No issues found</p>
              <p className="text-sm">
                {isAdmin
                  ? "No issues match your current filters."
                  : activeTab === 'my'
                  ? "You haven't reported any issues yet. Start by reporting one!"
                  : "No issues match your current filter."}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {currentIssues.map((issue) => (
                <div key={issue._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{issue.title}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-3">{issue.description}</p>
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center">
                          <span className="mr-1">📍</span>
                          {issue.location?.coordinates?.[1]}, {issue.location?.coordinates?.[0]}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">{getCategoryIcon(issue.category)}</span>
                          {issue.category}
                        </div>
                        <div className="flex items-center">
                          <span className="mr-1">🕒</span>
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    {issue.imagePath && (
                      <div className="ml-4">
                        <img
                          src={`http://localhost:5000/${issue.imagePath}`}
                          alt="Issue"
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  const bgColor = {
    blue: 'bg-blue-100',
    purple: 'bg-purple-100',
    yellow: 'bg-yellow-100',
    green: 'bg-green-100',
    red: 'bg-red-100',
  }[color] || 'bg-gray-100';

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex items-center">
        <div className={`p-2 ${bgColor} rounded-lg`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
}
