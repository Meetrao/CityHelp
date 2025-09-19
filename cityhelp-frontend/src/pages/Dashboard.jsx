export default function Dashboard() {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-4xl font-bold mb-4">Welcome to CityHelp.AI</h1>
        <p className="text-lg text-gray-700 mb-6">Choose an action below:</p>
        <div className="space-x-4">
          <a href="/report" className="btn">Report an Issue</a>
          <a href="/dashboard" className="btn">Dashboard</a>
        </div>
      </div>
    );
  }
  