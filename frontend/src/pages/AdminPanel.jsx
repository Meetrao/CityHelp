import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Pie, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function AdminPanel() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchIssues = async () => {
      if (!token) return console.error('No token found');
      try {
        setLoadingIssues(true);
        const res = await fetch(`http://localhost:5000/api/admin/issues?status=${filter}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setIssues(data.issues || []);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues');
      } finally {
        setLoadingIssues(false);
      }
    };

    const fetchUsers = async () => {
      if (!token) return console.error('No token found');
      try {
        setLoadingUsers(true);
        const res = await fetch('http://localhost:5000/api/users', {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users');
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchIssues();
    setTimeout(fetchUsers, 500);
  }, [filter]);

  const filteredIssues = useMemo(() => {
    return filter === 'all'
      ? issues
      : issues.filter(i => i.status?.toLowerCase() === filter.toLowerCase());
  }, [issues, filter]);

  const changeUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`http://localhost:5000/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update role');
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      console.error('Error updating role:', err);
      alert('Failed to update role');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-6 text-center text-red-600">Access denied. Admins only.</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Admin Panel</h1>
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        {['all', 'Pending', 'In Progress', 'Resolved', 'Closed'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded ${
              filter === status ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {status}
          </button>
        ))}
      </div>

      {/* Issues Table */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">Reported Issues</h2>
        {loadingIssues ? (
          <div>Loading issues...</div>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Title</th>
                <th className="p-2 text-left">Status</th>
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-left">Date</th>
              </tr>
            </thead>
            <tbody>
              {filteredIssues.map(issue => (
                <tr key={issue._id} className="border-t">
                  <td className="p-2">{issue.title}</td>
                  <td className="p-2">{issue.status}</td>
                  <td className="p-2">{issue.category}</td>
                  <td className="p-2">{new Date(issue.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Users Table */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold mb-4">User Accounts</h2>
        {loadingUsers ? (
          <div>Loading users...</div>
        ) : (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Name</th>
                <th className="p-2 text-left">Email</th>
                <th className="p-2 text-left">Role</th>
                <th className="p-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u._id} className="border-t">
                  <td className="p-2">{u.name}</td>
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2">
                    <select
                      value={u.role}
                      onChange={e => changeUserRole(u._id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="citizen">Citizen</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Issue Status Breakdown</h3>
          <Pie
            data={{
              labels: ['Pending', 'In Progress', 'Resolved', 'Closed'],
              datasets: [{
                data: [
                  issues.filter(i => i.status?.toLowerCase() === 'pending').length,
                  issues.filter(i => i.status?.toLowerCase() === 'in progress').length,
                  issues.filter(i => i.status?.toLowerCase() === 'resolved').length,
                  issues.filter(i => i.status?.toLowerCase() === 'closed').length
                ],
                backgroundColor: ['#facc15', '#3b82f6', '#22c55e', '#9ca3af']
              }]
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
          />
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium mb-4">Issues by Category</h3>
          <Bar
            data={{
              labels: [...new Set(issues.map(i => i.category))],
              datasets: [{
                label: 'Count',
                data: [...new Set(issues.map(i => i.category))].map(cat =>
                  issues.filter(i => i.category === cat).length
                ),
                backgroundColor: '#3b82f6'
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: { y: { beginAtZero: true } }
            }}
          />
        </div>
      </div>
    </div>
  );
}
