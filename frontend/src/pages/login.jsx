import { useState } from "react";

function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    if (localStorage.getItem("token")) {
  window.location.href = "/dashboard";
}


    try {
        const response = await fetch("http://localhost:5000/api/users/login", {

        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Store token locally
        localStorage.setItem("token", data.token);

        showToast("success", "✅ Login successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard"; // redirect to dashboard
        }, 1500);
      } else {
        showToast("error", `❌ ${data.error || "Invalid credentials"}`);
      }
    } catch (error) {
      console.error(error);
      showToast("error", "❌ Network error. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96 relative">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Login</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2 rounded-md text-white transition ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {loading ? "Please wait..." : "Login"}
          </button>
        </form>

        {/* ✅ Toast Notification */}
        {toast.show && (
          <div
            className={`absolute top-2 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-md text-white text-sm font-medium shadow-lg transition-all duration-300 ${
              toast.type === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
