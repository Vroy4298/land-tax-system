import { useEffect, useState } from "react";

function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/users/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setUser(data);
        else setUser(null);
      } catch {
        setUser(null);
      }
    };
    fetchProfile();
  }, []);

  if (!user)
    return (
      <p className="text-center mt-10 text-gray-600">Loading user data...</p>
    );

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-gray-800 bg-gray-50">
      <h1 className="text-3xl font-bold mt-6">👋 Welcome, {user.name}</h1>
      <p className="text-gray-600 mt-2">Your email: {user.email}</p>
    </div>
  );
}

export default Dashboard;
