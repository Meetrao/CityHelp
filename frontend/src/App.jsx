import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import ReportIssue from './pages/ReportIssue';
import AdminPanel from './pages/AdminPanel';
import MapView from './pages/MapView';
import Header from './components/Header';
import { AuthProvider } from './contexts/AuthContext';
import 'leaflet/dist/leaflet.css';

function App() {
  const location = useLocation();
  const hideHeaderRoutes = ['/login'];

  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {!hideHeaderRoutes.includes(location.pathname) && <Header />}
        <main>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/report" element={<ProtectedRoute><ReportIssue /></ProtectedRoute>} />
            <Route path="/map" element={<ProtectedRoute><MapView /></ProtectedRoute>} />
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminPanel />
              </ProtectedRoute>
            } />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  );
}

function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');
  if (!token) return <Navigate to="/login" replace />;

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded.role;
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to="/dashboard" replace />;
    }
    return children;
  } catch (err) {
    console.error('Invalid token:', err);
    return <Navigate to="/login" replace />;
  }
}

export default App;
