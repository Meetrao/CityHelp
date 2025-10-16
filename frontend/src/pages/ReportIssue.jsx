// 📄 File: ReportIssue.jsx (First Half)
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://cityhelp.onrender.com";

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [locationLoading, setLocationLoading] = useState(true);
  const [predictedCategory, setPredictedCategory] = useState('');
  const [predictedDepartment, setPredictedDepartment] = useState('');
  const [classifying, setClassifying] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
        setFormData((prev) => ({ ...prev, location: coords }));
        setLocationLoading(false);
      },
      (err) => {
        console.error('Location error:', err);
        setLocationLoading(false);
        setError('Location access denied. Please enter location manually.');
      }
    );
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImage = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setFormData((prev) => ({ ...prev, image: file }));
      setError('');
      setPredictedCategory('');
      setPredictedDepartment('');
      setClassifying(true);

      try {
        const token = localStorage.getItem('token');
        const form = new FormData();
        form.append('image', file);

        const res = await fetch(`${BACKEND_URL}/api/issues/classify-image`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: form
        });

        if (res.ok) {
          const result = await res.json();
          const category = result.category;
          setPredictedCategory(category);

          const normalizedCategory = category.toLowerCase().replace(/\s+/g, '');
          const departmentMap = {
            pothole: 'Roads',
            potholeissues: 'Roads',
            garbage: 'Sanitation',
            garbagedump: 'Sanitation',
            wire: 'Electricity',
            hangingwire: 'Electricity',
            waterlogging: 'Drainage',
            flood: 'Disaster Management',
            signal: 'Traffic',
            brokensignal: 'Traffic',
            streetlight: 'Electricity',
            openmanhole: 'Drainage',
            treefall: 'Environment'
          };
          const department = departmentMap[normalizedCategory] || 'General';
          setPredictedDepartment(department);

          const autoDesc = `Detected issue: ${category}. Assigned to ${department}.`;
          setFormData((prev) => ({ ...prev, description: autoDesc }));
        }
      } catch (err) {
        console.error('Error classifying image:', err);
      } finally {
        setClassifying(false);
      }
    }
  };
// 📄 File: ReportIssue.jsx (Second Half)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);

    try {
      const [lat, lng] = formData.location.split(',').map(coord => parseFloat(coord.trim()));
      data.append('latitude', lat);
      data.append('longitude', lng);
    } catch {
      setError('Invalid location format. Please use "latitude,longitude".');
      setLoading(false);
      return;
    }

    if (formData.image) {
      data.append('image', formData.image);
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND_URL}/api/report`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Server error: ${res.status}\n${text}`);
      }

      const result = await res.json();
      console.log('Submitted:', result);
      setSuccess(true);
      setFormData({
        title: '',
        description: '',
        location: '',
        image: null,
      });

      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting issue:', err);
      setError('Failed to submit issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Issue Submitted Successfully!</h2>
          <p className="text-gray-600 mb-4">Thank you for reporting this issue. We'll review it and take appropriate action.</p>
          <p className="text-sm text-gray-500">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Report an Issue</h2>

          <input
            type="text"
            name="title"
            placeholder="Issue Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          <input
            type="text"
            name="location"
            placeholder={locationLoading ? "Getting your location..." : "Enter location"}
            value={formData.location}
            onChange={handleChange}
            required
            disabled={locationLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          <input
            type="file"
            accept="image/*"
            onChange={handleImage}
            className="w-full"
          />

          {formData.image && (
            <div className="mt-2">
              <img
                src={URL.createObjectURL(formData.image)}
                alt="Preview"
                className="h-32 w-32 object-cover rounded-lg"
              />
              <p className="text-sm text-gray-600 mt-1">{formData.image.name}</p>
              {classifying && (
                <p className="text-sm text-blue-600 mt-1 animate-pulse">
                  Classifying image...
                </p>
              )}
              {predictedCategory && (
                <p className="text-sm text-green-600 mt-1">
                  Predicted Category: <strong>{predictedCategory}</strong>
                </p>
              )}
              {predictedDepartment && (
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md text-sm text-blue-800">
                  This issue will be assigned to the <strong>{predictedDepartment}</strong> department based on the detected category <strong>{predictedCategory}</strong>.
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 px-4 rounded-md font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
