import { useEffect, useState } from 'react';
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

export default function StatsPanel() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="p-6 text-center text-gray-500">Loading statistics...</div>;
  }

  if (error || !stats) {
    return <div className="p-6 text-center text-red-600">{error || 'No statistics available.'}</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">City Issue Statistics</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Issues', value: stats.total, color: 'bg-blue-100 text-blue-800' },
          { label: 'Resolved', value: stats.resolved, color: 'bg-green-100 text-green-800' },
          { label: 'Pending', value: stats.pending, color: 'bg-yellow-100 text-yellow-800' },
          { label: 'Closed', value: stats.closed, color: 'bg-gray-100 text-gray-800' }
        ].map(stat => (
          <div key={stat.label} className={`p-4 rounded-lg shadow ${stat.color}`}>
            <div className="text-sm font-medium">{stat.label}</div>
            <div className="text-2xl font-bold">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {/* Pie Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issue Status Overview</h3>
          <Pie
            data={{
              labels: ['Pending', 'In Progress', 'Resolved', 'Closed'],
              datasets: [{
                data: [
                  stats.pending,
                  stats.inProgress || 0,
                  stats.resolved,
                  stats.closed
                ],
                backgroundColor: ['#facc15', '#3b82f6', '#22c55e', '#9ca3af'],
                borderWidth: 1
              }]
            }}
            options={{ responsive: true, plugins: { legend: { position: 'bottom' } } }}
          />
        </div>

        {/* Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Issues by Category</h3>
          <Bar
            data={{
              labels: Object.keys(stats.categories),
              datasets: [{
                label: 'Issues',
                data: Object.values(stats.categories),
                backgroundColor: '#3b82f6'
              }]
            }}
            options={{
              responsive: true,
              plugins: { legend: { display: false } },
              scales: {
                y: { beginAtZero: true },
                x: { ticks: { autoSkip: false } }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
