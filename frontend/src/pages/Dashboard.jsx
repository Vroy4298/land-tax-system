
import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch user profile
        const userRes = await fetch("http://localhost:5000/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();

        // Fetch properties
        const propRes = await fetch("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const propData = await propRes.json();

        if (userRes.ok) setUser(userData);
        if (propRes.ok) setProperties(propData);

      } catch (error) {
        console.error("Dashboard error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading || !user) {
    return <p className="text-center mt-10">Loading dashboard...</p>;
  }

  // --------- CALCULATIONS ----------
  const totalProperties = properties.length;
  const totalTax = properties.reduce((sum, p) => sum + Number(p.taxAmount || 0), 0);

  const recentProperties = properties.slice(-3).reverse();

  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">
        👋 Welcome, {user.name}
      </h1>

      {/* ---- CARDS ---- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
        
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-600">Total Properties</h2>
          <p className="text-3xl font-bold text-blue-600 mt-2">{totalProperties}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-600">Total Tax Amount</h2>
          <p className="text-3xl font-bold text-green-600 mt-2">₹{totalTax}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-600">Recent Added</h2>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {recentProperties.length}
          </p>
        </div>

      </div>

      {/* ---- RECENT PROPERTIES ---- */}
      <div className="mt-10">
        <h2 className="text-2xl font-bold mb-3">🕒 Recent Properties</h2>

        {recentProperties.length === 0 ? (
          <p>No recent properties.</p>
        ) : (
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {recentProperties.map((p) => (
              <div key={p._id} className="bg-white shadow rounded-xl p-4">
                <h3 className="font-bold text-lg">{p.ownerName}</h3>
                <p>{p.propertyAddress}</p>
                <p>Tax: ₹{p.taxAmount}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
