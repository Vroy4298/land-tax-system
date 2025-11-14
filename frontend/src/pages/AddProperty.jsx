import { useState } from "react";

function AddProperty() {
  const [form, setForm] = useState({
    ownerName: "",
    propertyAddress: "",
    area: "",
    taxAmount: "",
  });
  const [message, setMessage] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("Saving...");

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Property added successfully!");
        setForm({ ownerName: "", propertyAddress: "", area: "", taxAmount: "" });
      } else {
        setMessage(`❌ ${data.error || "Failed to save property"}`);
      }
      if (res.status === 403) {
  localStorage.removeItem("token");
  setMessage("❌ Session expired. Please login again.");
  return;
}

    } catch (err) {
      console.error(err);
      setMessage("❌ Network error. Please try again.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Add Property</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" name="ownerName" value={form.ownerName} onChange={handleChange} placeholder="Owner Name" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" />
          <input type="text" name="propertyAddress" value={form.propertyAddress} onChange={handleChange} placeholder="Property Address" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" />
          <input type="number" name="area" value={form.area} onChange={handleChange} placeholder="Area (sq ft)" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" />
          <input type="number" name="taxAmount" value={form.taxAmount} onChange={handleChange} placeholder="Tax Amount" className="w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-400" />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition">
            Add Property
          </button>
        </form>

        {message && <p className="text-center mt-4 text-gray-700">{message}</p>}
      </div>
    </div>
  );
}

export default AddProperty;
