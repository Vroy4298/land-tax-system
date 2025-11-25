import { useEffect, useState } from "react";

/**
 * AddProperty.jsx
 *
 * Props:
 *  - onNavigate (function) optional. If provided, we call onNavigate('properties') after successful add.
 *
 * Behavior:
 *  - Live tax preview with detailed breakdown
 *  - Submits to backend; backend also recalculates tax (trusted source)
 */

export default function AddProperty({ onNavigate }) {
  // Form state
  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    address: "",
    propertyType: "residential", // residential, commercial, industrial, agriculture
    usageType: "self", // self, rented, mixed
    zone: "C", // A, B, C
    builtUpArea: "", // number (sq ft)
    constructionYear: "", // year
  });

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });
  const [calculation, setCalculation] = useState({
    baseRate: 0,
    zoneMultiplier: 1,
    usageMultiplier: 1,
    ageFactor: 1,
    finalTax: 0,
  });

  // Base rates and multipliers (must match backend)
  const baseRates = {
    residential: 2.5,
    commercial: 5,
    industrial: 3.5,
    agriculture: 1.5,
  };

  const zoneMultipliers = {
    A: 1.3,
    B: 1.1,
    C: 1.0,
  };

  const usageMultipliers = {
    self: 1.0,
    rented: 1.2,
    mixed: 1.1,
  };

  // Simple toast helper
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 3000);
  };

  // Update form
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  // Age factor calculation (same logic as backend)
  const computeAgeFactor = (year) => {
    const currentYear = new Date().getFullYear();
    const age = currentYear - Number(year || currentYear);
    if (age >= 11 && age <= 20) return 0.9;
    if (age >= 21 && age <= 30) return 0.8;
    if (age > 30) return 0.7;
    return 1.0;
  };

  // Format currency (INR)
  const formatINR = (num) => {
    if (!isFinite(num)) return "₹0";
    return "₹" + Number(num).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  };

  // Live calculation effect
  useEffect(() => {
    const type = form.propertyType;
    const zone = form.zone;
    const usage = form.usageType;
    const area = Number(form.builtUpArea) || 0;
    const year = form.constructionYear || new Date().getFullYear();

    const baseRate = baseRates[type] ?? 0;
    const zoneMultiplier = zoneMultipliers[zone] ?? 1;
    const usageMultiplier = usageMultipliers[usage] ?? 1;
    const ageFactor = computeAgeFactor(year);

    const finalTax = Math.round(area * baseRate * zoneMultiplier * usageMultiplier * ageFactor);

    setCalculation({
      baseRate,
      zoneMultiplier,
      usageMultiplier,
      ageFactor,
      finalTax,
    });
  }, [form.propertyType, form.zone, form.usageType, form.builtUpArea, form.constructionYear]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    // Basic validation
    if (
      !form.ownerName.trim() ||
      !form.ownerPhone.trim() ||
      !form.address.trim() ||
      !form.builtUpArea ||
      !form.constructionYear
    ) {
      showToast("error", "Please fill in all required fields (owner, phone, address, area, year).");
      return;
    }

    if (isNaN(Number(form.builtUpArea)) || Number(form.builtUpArea) <= 0) {
      showToast("error", "Built-up area must be a positive number.");
      return;
    }

    // Year validation (reasonable range)
    const yearNum = Number(form.constructionYear);
    const currentYear = new Date().getFullYear();
    if (yearNum < 1800 || yearNum > currentYear) {
      showToast("error", `Construction year must be between 1800 and ${currentYear}.`);
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      showToast("error", "You must be logged in to add a property.");
      return;
    }

    setLoading(true);

    try {
      // Submit to backend. Backend will recalc and validate tax again.
      const res = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ownerName: form.ownerName.trim(),
          ownerPhone: form.ownerPhone.trim(),
          ownerEmail: form.ownerEmail.trim(),
          address: form.address.trim(),
          propertyType: form.propertyType,
          usageType: form.usageType,
          zone: form.zone,
          builtUpArea: Number(form.builtUpArea),
          constructionYear: Number(form.constructionYear),
        }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Property added — tax saved: " + formatINR(data.tax || calculation.finalTax));
        // small delay to show toast then navigate
        setTimeout(() => {
          if (typeof onNavigate === "function") onNavigate("properties");
          else window.location.href = "/properties";
        }, 900);
      } else if (data && data.error) {
        showToast("error", data.error);
      } else {
        showToast("error", "Failed to add property.");
      }
    } catch (err) {
      console.error("Add property failed:", err);
      showToast("error", "Network or server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-blue-600 mb-4">Add Property</h2>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-lg shadow-sm">
          {/* Owner Info */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Owner Name *</label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Full name"
            />

            <label className="text-sm font-medium">Owner Phone *</label>
            <input
              name="ownerPhone"
              value={form.ownerPhone}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="Phone number"
            />

            <label className="text-sm font-medium">Owner Email</label>
            <input
              name="ownerEmail"
              value={form.ownerEmail}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="owner@example.com (optional)"
            />

            <label className="text-sm font-medium">Address *</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-2 border rounded h-24"
              placeholder="Full property address"
            />
          </div>

          {/* Property Info + Calculation */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Property Type *</label>
            <select name="propertyType" value={form.propertyType} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="industrial">Industrial</option>
              <option value="agriculture">Agriculture</option>
            </select>

            <label className="text-sm font-medium">Usage Type *</label>
            <select name="usageType" value={form.usageType} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="self">Self-Occupied</option>
              <option value="rented">Rented</option>
              <option value="mixed">Mixed</option>
            </select>

            <label className="text-sm font-medium">Zone *</label>
            <select name="zone" value={form.zone} onChange={handleChange} className="w-full p-2 border rounded">
              <option value="A">A - High Value</option>
              <option value="B">B - Medium Value</option>
              <option value="C">C - Low Value</option>
            </select>

            <label className="text-sm font-medium">Built-up Area (sq ft) *</label>
            <input
              name="builtUpArea"
              value={form.builtUpArea}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., 1200"
              inputMode="numeric"
            />

            <label className="text-sm font-medium">Construction Year *</label>
            <input
              name="constructionYear"
              value={form.constructionYear}
              onChange={handleChange}
              className="w-full p-2 border rounded"
              placeholder="e.g., 2015"
              inputMode="numeric"
            />

            {/* Submit */}
            <div className="mt-3">
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded text-white font-semibold ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {loading ? "Saving..." : "Save Property"}
              </button>
            </div>

            {/* Small helper note */}
            <p className="text-xs text-gray-500 mt-2">
              Have a Look at your live tax calculation below as you fill in the details.👇🏼
            </p>
          </div>

          {/* Full width breakdown card */}
          <div className="md:col-span-2 bg-white border rounded p-4 mt-2">
            <h3 className="font-semibold text-lg mb-2">Live Tax Breakdown</h3>

            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Built-up Area</div>
              <div className="text-right">{Number(form.builtUpArea || 0).toLocaleString()} sq ft</div>

              <div className="text-gray-600">Base Rate (₹ / sq ft)</div>
              <div className="text-right">₹{calculation.baseRate}</div>

              <div className="text-gray-600">Zone Multiplier</div>
              <div className="text-right">{calculation.zoneMultiplier}</div>

              <div className="text-gray-600">Usage Multiplier</div>
              <div className="text-right">{calculation.usageMultiplier}</div>

              <div className="text-gray-600">Age Factor</div>
              <div className="text-right">{calculation.ageFactor}</div>

              <div className="col-span-2 border-t my-2" />

              <div className="text-gray-800 font-semibold">Estimated Final Tax</div>
              <div className="text-right font-bold text-blue-600">{formatINR(calculation.finalTax)}</div>
            </div>
          </div>
        </form>

        {/* Toast */}
        {toast.show && (
          <div
            className={`fixed bottom-8 right-8 px-4 py-2 rounded shadow-lg text-white ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}
          >
            {toast.message}
          </div>
        )}
      </div>
    </div>
  );
}
