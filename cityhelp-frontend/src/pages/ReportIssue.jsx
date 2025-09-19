import { useState } from 'react';

export default function ReportIssue() {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Issue submitted:', formData);
    // TODO: Connect to Flask backend
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Report an Issue</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Issue Title"
          value={formData.title}
          onChange={handleChange}
          className="input"
        />
        <textarea
          name="description"
          placeholder="Describe the issue"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          className="input"
        />
        <input
          type="text"
          name="location"
          placeholder="Location"
          value={formData.location}
          onChange={handleChange}
          className="input"
        />
        <button type="submit" className="btn">Submit</button>
      </form>
    </div>
  );
}
