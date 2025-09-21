import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons for different issue types
const createCustomIcon = (category, status) => {
  const color = status === 'Resolved' ? 'green' : status === 'In Progress' ? 'blue' : 'red';
  const icon = L.divIcon({
    className: 'custom-div-icon',
    html: `<div style="background-color: ${color}; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
  return icon;
};

// Component to center map on user location
function MapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 13);
    }
  }, [map, center]);
  return null;
}

export default function MapView() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userLocation, setUserLocation] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/issues');
        
        if (!res.ok) {
          throw new Error('Failed to fetch issues');
        }

        const data = await res.json();
        const issuesData = data.issues || data;
        
        // Parse coordinates from location string
        const issuesWithCoords = issuesData.map(issue => {
          let coords = null;
          if (issue.location && issue.location.includes(',')) {
            const [lat, lng] = issue.location.split(',').map(coord => parseFloat(coord.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
              coords = { lat, lng };
            }
          }
          return { ...issue, coords };
        }).filter(issue => issue.coords); // Only include issues with valid coordinates

        setIssues(issuesWithCoords);
      } catch (err) {
        console.error('Error fetching issues:', err);
        setError('Failed to load issues. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    // Get user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.latitude, position.coords.longitude]);
        },
        (err) => {
          console.error('Error getting location:', err);
          // Default to a central location if geolocation fails
          setUserLocation([40.7128, -74.0060]); // New York City
        }
      );
    } else {
      setUserLocation([40.7128, -74.0060]); // Default location
    }

    fetchIssues();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'Resolved':
        return 'text-green-600';
      case 'In Progress':
        return 'text-blue-600';
      case 'Pending':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Infrastructure':
        return '🏗️';
      case 'Traffic':
        return '🚦';
      case 'Environment':
        return '🌱';
      case 'Safety':
        return '⚠️';
      default:
        return '📋';
    }
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

  if (error) {
    return (
      <div className="p-6">
        <div className="text-center">
          <div className="text-red-600 mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Issue Map</h1>
          <p className="text-gray-600">View all reported issues on an interactive map</p>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">In Progress</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Resolved</span>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                {issues.length} issues on map
              </div>
            </div>
          </div>

          <div className="h-96">
            {userLocation && (
              <MapContainer
                center={userLocation}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                <MapCenter center={userLocation} />
                
                {issues.map((issue) => (
                  <Marker
                    key={issue._id}
                    position={[issue.coords.lat, issue.coords.lng]}
                    icon={createCustomIcon(issue.category, issue.status)}
                    eventHandlers={{
                      click: () => setSelectedIssue(issue)
                    }}
                  >
                    <Popup>
                      <div className="p-2">
                        <h3 className="font-medium text-gray-900 mb-1">
                          {issue.title}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {issue.description}
                        </p>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="text-lg">{getCategoryIcon(issue.category)}</span>
                          <span className="text-sm text-gray-500">{issue.category}</span>
                        </div>
                        <div className={`text-sm font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(issue.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            )}
          </div>
        </div>

        {/* Issue Details Modal */}
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
                      <p className="text-sm text-gray-900 flex items-center">
                        <span className="mr-1">{getCategoryIcon(selectedIssue.category)}</span>
                        {selectedIssue.category}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Status</label>
                      <p className={`text-sm font-medium ${getStatusColor(selectedIssue.status)}`}>
                        {selectedIssue.status}
                      </p>
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