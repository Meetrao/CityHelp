import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }

    // Simulate decoding token (replace with real JWT decode later)
    const fakeUser = 'admin';
    setUsername(fakeUser);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
      <h1 className="text-4xl font-bold mb-4">Welcome, {username} 👋</h1>
      <p className="text-lg text-gray-700 mb-6">What would you like to do?</p>
      <div className="space-x-4">
        <a href="/report" className="btn">Report an Issue</a>
        <button onClick={handleLogout} className="btn bg-red-500 hover:bg-red-600">Logout</button>
      </div>
    </div>
  );
}
