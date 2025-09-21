import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function AdminPanel() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const res = await fetch(`http://localhost:5000/api/admin/issues?status=${filter}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch issues');
        }

        const data = await res.json();
        setIssues(data.issues || data);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, [filter]);

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (!res.ok) {
        throw new Error('Failed to update issue status');
      }

      // Update local state
      setIssues(issues.map(issue => 
        issue._id === issueId ? { ...issue, status: newStatus } : issue
      ));
      
      setSelectedIssue(null);
    } catch (err) {
      console.error('Error updating issue:', err);
      setError('Failed to update issue status');
    }
  };

  const deleteIssue = async (issueId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/issues/${issueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to delete issue');
      }

      // Update local state
      setIssues(issues.filter(issue => issue._id !== issueId));
      setSelectedIssue(null);
    } catch (err) {
      console.error('Error deleting issue:', err);
      setError('Failed to delete issue');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Resolved':
        return 'bg-green-100 text-green-800';
      case 'Closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical':
        return 'bg-red-100 text-red-800';
      case 'High':
        return 'bg-orange-100 text-orange-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Redirect if not admin
  if (user?.role !== 'admin') {
    return (
      <div className="p-6">
        <div className="max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Panel</h1>
          <p className="text-gray-600">Manage and moderate city issues</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex space-x-1">
              {[
                { id: 'all', label: 'All Issues', count: issues.length },
                { id: 'Pending', label: 'Pending', count: issues.filter(issue => issue.status === 'Pending').length },
                { id: 'In Progress', label: 'In Progress', count: issues.filter(issue => issue.status === 'In Progress').length },
                { id: 'Resolved', label: 'Resolved', count: issues.filter(issue => issue.status === 'Resolved').length }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilter(tab.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    filter === tab.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issues Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
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
          ) : issues.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p className="text-lg mb-2">No issues found</p>
              <p className="text-sm">No issues match your current filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Issue
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reporter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {issues.map((issue) => (
                    <tr key={issue._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {issue.imagePath ? (
                              <img
                                className="h-12 w-12 rounded-lg object-cover"
                                src={`http://localhost:5000/${issue.imagePath}`}
                                alt="Issue"
                              />
                            ) : (
                              <div className="h-12 w-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                <span className="text-gray-400">📷</span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {issue.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {issue.description}
                            </div>
                            <div className="text-xs text-gray-400">
                              {issue.location}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {issue.reportedBy?.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {issue.reportedBy?.email || ''}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority || 'Medium'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(issue.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <select
                            value={issue.status}
                            onChange={(e) => updateIssueStatus(issue._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                          <button
                            onClick={() => setSelectedIssue(issue)}
                            className="text-blue-600 hover:text-blue-900 text-xs"
                          >
                            View
                          </button>
                          <button
                            onClick={() => deleteIssue(issue._id)}
                            className="text-red-600 hover:text-red-900 text-xs"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Issue Detail Modal */}
        {selectedIssue && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Issue Details
                  </h3>
                  <button
                    onClick={() => setSelectedIssue(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">{selectedIssue.title}</h4>
                    <p className="text-gray-600 mt-1">{selectedIssue.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Location</label>
                      <p className="text-sm text-gray-900">{selectedIssue.location}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Category</label>
                      <p className="text-sm text-gray-900">{selectedIssue.category}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Reporter</label>
                      <p className="text-sm text-gray-900">{selectedIssue.reportedBy?.name}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Date</label>
                      <p className="text-sm text-gray-900">
                        {new Date(selectedIssue.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {selectedIssue.imagePath && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Image</label>
                      <img
                        src={`http://localhost:5000/${selectedIssue.imagePath}`}
                        alt="Issue"
                        className="mt-2 rounded-lg max-w-full h-64 object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
