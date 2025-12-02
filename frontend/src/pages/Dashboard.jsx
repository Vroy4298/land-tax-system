import { useEffect, useState } from "react";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalTax: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch user profile
        const userRes = await fetch("http://localhost:5000/api/users/profile", {

          headers: { Authorization: `Bearer ${token}` },
        });
        const userData = await userRes.json();
        setUser(userData);

        // Fetch properties for stats
        const propRes = await fetch("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const properties = await propRes.json();

        // Calculate stats
        const totalTax = properties.reduce(
          (sum, p) => sum + (p.finalTaxAmount || 0),
          0
        );

        setStats({
          totalProperties: properties.length,
          totalTax: totalTax,
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      }
    };

    fetchData();
  }, []);

  if (!user) return <p className="page-offset text-gray-500">Loading...</p>;

  const formatINR = (num) =>
    "₹" + Number(num).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div className="max-w-6xl mx-auto p-6 page-offset">
      {/* Greeting Card */}
      <div className="glass-card p-6 mb-8 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Welcome back, {user.name.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-600">
          Manage your land records, tax details, and more — all in one place.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Properties */}
        <div className="glass-card p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 mb-1 text-sm">Total Properties</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.totalProperties}
          </div>
        </div>

        {/* Total Tax */}
        <div className="glass-card p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 mb-1 text-sm">Total Tax Due</div>
          <div className="text-3xl font-bold text-blue-600">
            {formatINR(stats.totalTax)}
          </div>
        </div>

        {/* User Email */}
        <div className="glass-card p-6 rounded-xl shadow hover:shadow-lg transition">
          <div className="text-gray-500 mb-1 text-sm">Your Email</div>
          <div className="text-lg font-semibold text-gray-700">
            {user.email}
          </div>
        </div>
      </div>
    </div>
  );
}
