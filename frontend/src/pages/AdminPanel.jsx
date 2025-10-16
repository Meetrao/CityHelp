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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://cityhelp.onrender.com";

export default function AdminPanel() {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loadingIssues, setLoadingIssues] = useState(true);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState('');
  const [noteEdits, setNoteEdits] = useState({});
  const { user } = useAuth();
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchIssues = async () => {
      if (!token) return console.error('No token found');
      try {
        setLoadingIssues(true);
        const normalized = filter.toLowerCase();
        const query = normalized === 'all' ? '' : `?status=${normalized}`;
        const res = await fetch(`${BACKEND_URL}/api/admin/issues${query}`, {
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
        const res = await fetch(`${BACKEND_URL}/api/users`, {
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
    const normalized = filter.toLowerCase();
    return normalized === 'all'
      ? issues
      : issues.filter(i => i.status?.toLowerCase() === normalized);
  }, [issues, filter]);

  const changeUserRole = async (userId, newRole) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users/${userId}/role`, {
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

  const updateIssueStatus = async (issueId, newStatus) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/issues/${issueId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update status');
      setIssues(issues.map(i => i._id === issueId ? { ...i, status: newStatus } : i));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update issue status');
    }
  };

  const updateIssueNotes = async (issueId, newNotes) => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/admin/issues/${issueId}/notes`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notes: newNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update notes');
      setIssues(issues.map(i => i._id === issueId ? { ...i, notes: newNotes } : i));
      setNoteEdits(prev => ({ ...prev, [issueId]: '' }));
    } catch (err) {
      console.error('Error updating notes:', err);
      alert('Failed to update issue notes');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="p-6 text-center text-red-600">Access denied. Admins only.</div>;
  }
