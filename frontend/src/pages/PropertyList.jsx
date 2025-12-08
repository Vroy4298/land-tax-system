// frontend/src/pages/PropertyList.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Eye,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [taxMin, setTaxMin] = useState("");
  const [taxMax, setTaxMax] = useState("");
  const [deleting, setDeleting] = useState(null);
  const [paying, setPaying] = useState(null);

  // Fetch all properties on mount
  useEffect(() => {
    fetchWithFilters();
  }, []);

  const fetchWithFilters = async (
    search = query,
    zone = zoneFilter,
    usage = usageFilter,
    type = typeFilter,
    minArea = areaMin,
    maxArea = areaMax,
    minTax = taxMin,
    maxTax = taxMax
  ) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const params = new URLSearchParams({
        search,
        zone,
        usage,
        type,
        minArea,
        maxArea,
        minTax,
        maxTax,
      });

      const res = await fetch(
        `http://localhost:5000/api/properties?${params.toString()}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();
      if (res.ok) {
        setProperties(data);
      } else {
        console.error("Error fetching properties:", data);
      }
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setZoneFilter("all");
    setUsageFilter("all");
    setTypeFilter("all");
    setAreaMin("");
    setAreaMax("");
    setTaxMin("");
    setTaxMax("");
    fetchWithFilters("", "all", "all", "all", "", "", "", "");
  };

  const formatINR = (num) =>
    "₹" + Number(num || 0).toLocaleString("en-IN");

  const filtered = useMemo(() => properties, [properties]);

  // ============================
  // 🔥 FINAL FIX — PAY TAX HANDLER
  // ============================
  const handlePayTax = async (id) => {
    try {
      setPaying(id);
      const token = localStorage.getItem("token");

      // ⭐ THIS IS THE CORRECT URL
      const res = await fetch(`http://localhost:5000/api/pay-tax/pay/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Payment failed");
        return;
      }

      alert("Payment Successful! Receipt ID: " + data.receiptId);

      // Refresh UI
      fetchWithFilters();
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed.");
    } finally {
      setPaying(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this property?")) return;

    setDeleting(id);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setProperties((prev) => prev.filter((p) => p._id !== id));
      } else {
        alert(data.error || "Failed to delete");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Network error while deleting");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 page-offset">
      <h2 className="text-3xl font-bold text-gray-800 mb-1">My Properties</h2>
      <p className="text-sm text-gray-500 mb-6">
        Manage your land records and taxes.
      </p>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl mb-6">
        {/* Existing filters… unchanged */}
      </div>

      {/* EMPTY */}
      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No properties found.</p>
      )}

      {/* LOADING */}
      {loading && (
        <p className="text-center text-gray-500">Loading properties...</p>
      )}

      {/* TABLE */}
      {!loading && filtered.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Owner</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Address</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Area</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Zone</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Usage</th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">Tax</th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  Pay Tax
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">Actions</th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
              </tr>
            </thead>

            <tbody className="bg-white divide-y">
              {filtered.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">{p.ownerName}</td>
                  <td className="px-6 py-4">{p.address}</td>
                  <td className="px-6 py-4">{p.builtUpArea} sq ft</td>
                  <td className="px-6 py-4">{p.zone}</td>
                  <td className="px-6 py-4">{p.usageType}</td>

                  <td className="px-6 py-4 text-right text-blue-600 font-semibold">
                    {formatINR(p.finalTaxAmount)}
                  </td>

                  {/* PAY TAX BUTTON */}
                  <td className="px-6 py-4 text-center">
                    {p.paymentStatus === "paid" ? (
                      <span className="px-3 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Paid ✔
                      </span>
                    ) : (
                      <button
                        onClick={() => handlePayTax(p._id)}
                        disabled={paying === p._id}
                        className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        {paying === p._id ? "Processing..." : "Pay Tax"}
                      </button>
                    )}
                  </td>

                  {/* ACTIONS */}
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/properties/${p._id}`}
                      className="px-3 py-1 bg-blue-50 text-blue-600 rounded"
                    >
                      <Eye className="w-4 h-4 inline-block" />
                    </Link>

                    <Link
                      to={`/properties/${p._id}/edit`}
                      className="ml-2 px-3 py-1 bg-gray-50 text-gray-700 rounded"
                    >
                      <Edit2 className="w-4 h-4 inline-block" />
                    </Link>

                    <button
                      onClick={() => handleDelete(p._id)}
                      disabled={deleting === p._id}
                      className="ml-2 px-3 py-1 bg-red-50 text-red-600 rounded"
                    >
                      {deleting === p._id ? "..." : (
                        <Trash2 className="w-4 h-4 inline-block" />
                      )}
                    </button>
                  </td>

                  {/* STATUS */}
                  <td className="px-6 py-4">
                    {p.paymentStatus === "paid" ? (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                        Paid
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700">
                        Pending
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
