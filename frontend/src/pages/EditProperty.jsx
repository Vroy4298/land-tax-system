// frontend/src/pages/EditProperty.jsx
import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ show: false, type: "", message: "" });

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

  useEffect(() => {
    const fetchProperty = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) {
          setProperty(data);
          setForm({
            ownerName: data.ownerName ?? data.owner ?? "",
            ownerPhone: data.ownerPhone ?? data.phone ?? "",
            ownerEmail: data.ownerEmail ?? data.email ?? "",
            address: data.address ?? data.propertyAddress ?? "",
            propertyType: data.propertyType ?? "Residential",
            usageType: mapIncomingUsageToKey(data.usageType ?? data.usage),
            zone: data.zone ?? "A",
            builtUpArea: data.builtUpArea ?? data.area ?? data.landSize ?? "",
            constructionYear:
              data.constructionYear ??
              data.buildYear ??
              (data.createdAt ? new Date(data.createdAt).getFullYear() : ""),
          });
        } else {
          showToast("error", data.error || "Failed to load property");
        }
      } catch (err) {
        showToast("error", "Network error while fetching property");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProperty();
  }, [id]);

  function mapIncomingUsageToKey(val) {
    if (!val) return "self";
    const s = String(val).toLowerCase();
    if (s.includes("self")) return "self";
    if (s.includes("rent")) return "rented";
    if (s.includes("mixed")) return "mixed";
    if (s.includes("commercial")) return "commercial";
    return "self";
  }

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => setToast({ show: false, type: "", message: "" }), 2500);
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  // TAX PREVIEW
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
    const baseRate = baseRates[ptKey] ?? 2.5;

    const zKey = (zone || "A").toUpperCase();
    const zMult = zoneMultiplier[zKey] ?? 1.0;

    let uKey = String(usageType).toLowerCase();
    if (!usageMultiplier[uKey]) uKey = "self";
    const uMult = usageMultiplier[uKey];

    const currentYear = new Date().getFullYear();
    const year = Number(constructionYear) || currentYear;
    const age = Math.max(0, currentYear - year);

    let ageFactor = 1.0;
    if (age >= 11 && age <= 20) ageFactor = 0.9;
    else if (age >= 21 && age <= 30) ageFactor = 0.8;
    else if (age > 30) ageFactor = 0.7;

    const area = Number(builtUpArea) || 0;
    const rawTax = area * baseRate * zMult * uMult * ageFactor;
    const finalTaxAmount = Math.round(rawTax);

    const breakdown = {
      area,
      baseRate,
      zMult,
      uMult,
      age,
      ageFactor,
      rawTax,
    };

    return { finalTaxAmount, breakdown };
  }, [form]);

  const handleSave = async (e) => {
    e.preventDefault();

    if (!form.ownerName || !form.address || !form.builtUpArea) {
      showToast("error", "Owner, Address, and Area are required.");
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          finalTaxAmount: taxPreview.finalTaxAmount,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("success", "Property updated");
        setTimeout(() => navigate("/properties"), 800);
      } else {
        showToast("error", data.error || "Update failed");
      }
    } catch (err) {
      showToast("error", "Network error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this property?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (res.ok) {
        showToast("success", "Deleted successfully");
        setTimeout(() => navigate("/properties"), 800);
      } else {
        showToast("error", data.error || "Delete failed");
      }
    } catch (err) {
      showToast("error", "Network error");
    }
  };

  if (loading)
    return <p className="text-center mt-10 text-gray-600">Loading property...</p>;

  if (!property)
    return (
      <p className="text-center mt-10 text-red-600">
        Property not found or not authorized.
      </p>
    );

  // ✅ FIX — extract breakdown safely
  const breakdown = taxPreview.breakdown || {};

  return (
    <div className="max-w-6xl mx-auto p-6 page-offset">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Edit Property</h1>
        <div>
          <button onClick={() => navigate("/properties")} className="btn-secondary">
            Back
          </button>
          <button onClick={handleDelete} className="ml-2 bg-red-500 text-white px-3 py-1 rounded">
            Delete
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT: FORM */}
        <form onSubmit={handleSave} className="bg-white p-6 rounded shadow space-y-4">
          
          <div>
            <label className="text-sm font-medium">Owner Name</label>
            <input
              name="ownerName"
              value={form.ownerName}
              onChange={handleChange}
              className="w-full p-3 border rounded mt-1"
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
              />
            </div>

            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                name="ownerEmail"
                value={form.ownerEmail}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full p-3 border rounded mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Built-up Area (sq ft)</label>
              <input
                name="builtUpArea"
                type="number"
                value={form.builtUpArea}
                onChange={handleChange}
                className="w-full p-3 border rounded mt-1"
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

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className={`btn-primary ${saving ? "opacity-60" : ""}`}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => navigate("/properties")}
              className="btn-secondary"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* RIGHT: TAX PREVIEW */}
        <div className="bg-white p-6 rounded shadow glass-card">
          <h3 className="text-xl font-semibold mb-4">Live Tax Preview</h3>

          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-500">Built-up Area</span>
              <span className="font-medium">{breakdown.area ?? 0} sq ft</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Base Rate</span>
              <span className="font-medium">₹{breakdown.baseRate ?? 0} / sq ft</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Zone Multiplier</span>
              <span className="font-medium">× {breakdown.zMult ?? 1}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Usage Multiplier</span>
              <span className="font-medium">× {breakdown.uMult ?? 1}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Age Factor ({breakdown.age ?? 0} yrs)</span>
              <span className="font-medium">× {breakdown.ageFactor ?? 1}</span>
            </div>

            <hr className="my-3" />

            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Estimated Tax</span>
              <span className="text-2xl font-bold text-blue-600">
                ₹{taxPreview.finalTaxAmount}
              </span>
            </div>
          </div>

          {/* DETAILED BREAKDOWN */}
          <div className="mt-6 bg-white shadow-sm border rounded-xl p-5">
            <h3 className="font-semibold text-lg mb-3">Detailed Breakdown</h3>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Built-up Area</span>
                <span className="font-medium">{breakdown.area} sq ft</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Base Rate</span>
                <span className="font-medium">₹{breakdown.baseRate}/sq ft</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Zone Multiplier</span>
                <span className="font-medium">× {breakdown.zMult}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Usage Multiplier</span>
                <span className="font-medium">× {breakdown.uMult}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Property Age</span>
                <span className="font-medium">{breakdown.age} yrs</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Age Factor</span>
                <span className="font-medium">× {breakdown.ageFactor}</span>
              </div>

              <hr className="my-3" />

              <div className="flex justify-between text-blue-600 font-semibold text-lg">
                <span>Raw Tax</span>
                <span>₹{breakdown.rawTax}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded shadow text-white ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
