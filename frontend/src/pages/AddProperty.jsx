import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

export default function AddProperty() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ownerName: "",
    ownerPhone: "",
    ownerEmail: "",
    address: "",
    propertyType: "Residential",
    usageType: "self",
    zone: "A",
    builtUpArea: "",
    constructionYear: "",
  });

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2500);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // Live tax preview (same formula as backend)
  const taxPreview = useMemo(() => {
    const { propertyType, builtUpArea, zone, usageType, constructionYear } = form;

    if (!builtUpArea || Number(builtUpArea) <= 0) {
      return { finalTaxAmount: 0, breakdown: {} };
    }

    const baseRates = {
      residential: 2.5,
      commercial: 5,
      industrial: 3.5,
      agriculture: 1.5,
    };

    const zoneMultiplier = { A: 1.3, B: 1.1, C: 1.0, D: 0.8 };
    const usageMultiplier = {
      self: 1.0,
      rented: 1.2,
      mixed: 1.1,
      commercial: 1.25,
    };

    const ptKey = String(propertyType).toLowerCase();
    const baseRate = baseRates[ptKey];

    const zKey = zone.toUpperCase();
    const zMult = zoneMultiplier[zKey];

    let uKey = usageType.toLowerCase();
    const uMult = usageMultiplier[uKey];

    const currentYear = new Date().getFullYear();
    const year = Number(constructionYear) || currentYear;
    const age = Math.max(0, currentYear - year);

    let ageFactor = 1.0;
    if (age >= 11 && age <= 20) ageFactor = 0.9;
    else if (age >= 21 && age <= 30) ageFactor = 0.8;
    else if (age > 30) ageFactor = 0.7;

    const area = Number(builtUpArea);
    const rawTax = area * baseRate * zMult * uMult * ageFactor;
    const finalTaxAmount = Math.round(rawTax);

    return {
      finalTaxAmount,
      breakdown: { area, baseRate, zMult, uMult, age, ageFactor, rawTax },
    };
  }, [form]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.ownerName || !form.address || !form.builtUpArea) {
      showToast("error", "Owner Name, Address, and Area are required");
      return;
    }

    setSaving(true);

    try {
      const token = localStorage.getItem("token");
      const body = {
        ...form,
        finalTaxAmount: taxPreview.finalTaxAmount,
      };

      const res = await fetch("http://localhost:5000/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (res.ok) {
        showToast("success", "Property added successfully!");
        setTimeout(() => navigate("/properties"), 800);
      } else {
        showToast("error", data.error || "Failed to add property");
      }
    } catch (err) {
      console.error("Add error:", err);
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 page-offset">
      <h1 className="text-2xl font-bold mb-6">Add Property</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT — FORM */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 bg-white p-6 rounded shadow"
        >
          <div>
            <label className="text-sm font-medium">Owner Name *</label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              className="w-full p-3 border rounded mt-1"
              placeholder="Owner full name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Phone</label>
              <input
                name="ownerPhone"
                value={form.ownerPhone}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
                placeholder="Phone number"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                name="ownerEmail"
                value={form.ownerEmail}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
                placeholder="Email address"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Address *</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-3 border rounded mt-1"
              placeholder="Property full address"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Built-up Area (sq ft) *</label>
              <input
                name="builtUpArea"
                type="number"
                value={form.builtUpArea}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
                placeholder="e.g. 1200"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Construction Year</label>
              <input
                name="constructionYear"
                type="number"
                value={form.constructionYear}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
                placeholder="e.g. 2015"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Property Type</label>
              <select
                name="propertyType"
                value={form.propertyType}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
              >
                <option>Residential</option>
                <option>Commercial</option>
                <option>Industrial</option>
                <option>Agriculture</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Usage</label>
              <select
                name="usageType"
                value={form.usageType}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
              >
                <option value="self">Self-Occupied</option>
                <option value="rented">Rented</option>
                <option value="mixed">Mixed</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium">Zone</label>
              <select
                name="zone"
                value={form.zone}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
              >
                <option value="A">A - High</option>
                <option value="B">B - Medium</option>
                <option value="C">C - Low</option>
                <option value="D">D - Very Low</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className={`btn-primary ${saving ? "opacity-60" : ""}`}
          >
            {saving ? "Saving..." : "Save Property"}
          </button>
        </form>

        {/* RIGHT — LIVE TAX PREVIEW */}
        <div className="bg-white p-6 rounded shadow glass-card">
          <h3 className="text-xl font-semibold mb-4">Live Tax Preview</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Built-up Area</span>
              <span className="font-medium">
                {taxPreview.breakdown.area || 0} sq ft
              </span>
            </div>

            <div className="flex justify-between">
              <span>Base Rate</span>
              <span className="font-medium">
                ₹{taxPreview.breakdown.baseRate || 0} / sq ft
              </span>
            </div>

            <div className="flex justify-between">
              <span>Zone Multiplier</span>
              <span className="font-medium">
                × {taxPreview.breakdown.zMult || 1}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Usage Multiplier</span>
              <span className="font-medium">
                × {taxPreview.breakdown.uMult || 1}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Age Factor</span>
              <span className="font-medium">
                × {taxPreview.breakdown.ageFactor || 1}
              </span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between text-lg font-semibold">
              <span>Estimated Tax</span>
              <span className="text-blue-600 text-2xl">
                ₹{taxPreview.finalTaxAmount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded shadow-lg text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
