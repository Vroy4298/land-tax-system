import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2500);
  };

  // Base Rates + Multipliers (must match backend exactly)
  const baseRates = {
    residential: 2.5,
    commercial: 5,
    industrial: 3.5,
    agriculture: 1.5,
  };

  const zoneMultipliers = { A: 1.3, B: 1.1, C: 1.0 };
  const usageMultipliers = { self: 1.0, rented: 1.2, mixed: 1.1 };

  const computeAgeFactor = (year) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - Number(year);
    if (age >= 11 && age <= 20) return 0.9;
    if (age >= 21 && age <= 30) return 0.8;
    if (age > 30) return 0.7;
    return 1.0;
  };

  const formatINR = (num) =>
    "₹" + Number(num).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  // Fetch property for editing
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setProperty(data);
        } else {
          showToast("error", "Failed to load property");
        }
      } catch (err) {
        console.error("Fetch property error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  // Live tax calculation from updated property values
  const calculateTax = () => {
    if (!property) return 0;

    const {
      builtUpArea,
      propertyType,
      usageType,
      zone,
      constructionYear,
    } = property;

    const area = Number(builtUpArea) || 0;
    const base = baseRates[propertyType] ?? 0;
    const zoneM = zoneMultipliers[zone] ?? 1;
    const usageM = usageMultipliers[usageType] ?? 1;
    const ageF = computeAgeFactor(constructionYear);

    const tax = Math.round(area * base * zoneM * usageM * ageF);

    return {
      base,
      zoneM,
      usageM,
      ageF,
      tax,
    };
  };

  const breakdown = calculateTax();

  const handleChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (saving) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(property),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Property updated!");

        setTimeout(() => {
          navigate("/properties");
        }, 1000);
      } else {
        showToast("error", data.error || "Update failed");
      }
    } catch (err) {
      console.error("Update error:", err);
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  if (!property) return <p className="text-center mt-10">Property not found</p>;

  return (
    <div className="max-w-3xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-3xl font-bold text-blue-600 mb-6">Edit Property</h2>

      <form className="grid grid-cols-1 md:grid-cols-2 gap-6" onSubmit={handleSubmit}>
        {/* Left side */}
        <div className="space-y-3">
          <input
            type="text"
            name="ownerName"
            value={property.ownerName}
            onChange={handleChange}
            placeholder="Owner Name"
            className="w-full p-3 border rounded"
          />

          <input
            type="text"
            name="ownerPhone"
            value={property.ownerPhone}
            onChange={handleChange}
            placeholder="Owner Phone"
            className="w-full p-3 border rounded"
          />

          <input
            type="text"
            name="ownerEmail"
            value={property.ownerEmail}
            onChange={handleChange}
            placeholder="Owner Email"
            className="w-full p-3 border rounded"
          />

          <textarea
            name="address"
            value={property.address}
            onChange={handleChange}
            placeholder="Address"
            className="w-full p-3 border rounded h-24"
          />
        </div>

        {/* Right side */}
        <div className="space-y-3">
          <select
            name="propertyType"
            value={property.propertyType}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          >
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="agriculture">Agriculture</option>
          </select>

          <select
            name="usageType"
            value={property.usageType}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          >
            <option value="self">Self</option>
            <option value="rented">Rented</option>
            <option value="mixed">Mixed</option>
          </select>

          <select
            name="zone"
            value={property.zone}
            onChange={handleChange}
            className="w-full p-3 border rounded"
          >
            <option value="A">Zone A</option>
            <option value="B">Zone B</option>
            <option value="C">Zone C</option>
          </select>

          <input
            type="number"
            name="builtUpArea"
            value={property.builtUpArea}
            onChange={handleChange}
            placeholder="Built-up Area (sq ft)"
            className="w-full p-3 border rounded"
          />

          <input
            type="number"
            name="constructionYear"
            value={property.constructionYear}
            onChange={handleChange}
            placeholder="Construction Year"
            className="w-full p-3 border rounded"
          />
        </div>

        {/* Full width section for breakdown */}
        <div className="md:col-span-2 bg-gray-50 border rounded p-4">
          <h3 className="font-semibold text-lg mb-3">Live Tax Breakdown</h3>

          <div className="grid grid-cols-2 gap-2 text-sm">
            <p className="text-gray-600">Built-up Area</p>
            <p className="text-right">{property.builtUpArea} sq ft</p>

            <p className="text-gray-600">Base Rate</p>
            <p className="text-right">₹{breakdown.base}</p>

            <p className="text-gray-600">Zone Multiplier</p>
            <p className="text-right">{breakdown.zoneM}</p>

            <p className="text-gray-600">Usage Multiplier</p>
            <p className="text-right">{breakdown.usageM}</p>

            <p className="text-gray-600">Age Factor</p>
            <p className="text-right">{breakdown.ageF}</p>

            <div className="col-span-2 border-t my-2"></div>

            <p className="font-semibold text-gray-800">Estimated Final Tax</p>
            <p className="font-bold text-blue-600 text-right">{formatINR(breakdown.tax)}</p>
          </div>
        </div>

        {/* Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            disabled={saving}
            className={`w-full py-3 text-white rounded ${
              saving ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed bottom-8 right-8 px-4 py-2 rounded shadow-lg text-white ${
            toast.type === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
