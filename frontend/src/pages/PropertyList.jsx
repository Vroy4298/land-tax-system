// frontend/src/pages/PropertyList.jsx
import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  User,
  Ruler,
  Layers,
  Building2,
  Eye,
  Edit2,
  Trash2,
  Search,
} from "lucide-react";

export default function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [query, setQuery] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [usageFilter, setUsageFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [areaMin, setAreaMin] = useState("");
  const [areaMax, setAreaMax] = useState("");
  const [taxMin, setTaxMin] = useState("");
  const [taxMax, setTaxMax] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Fetch properties on load
  useEffect(() => {
    fetchWithFilters();
  }, []);

  // Fetch properties from backend with filters
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
    } catch (error) {
      console.error("Network error:", error);
    } finally {
      setLoading(false);
    }
  };

  // RESET filters
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

  // Format INR
  const formatINR = (num) =>
    "₹" +
    Number(num || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    });

  // ========= CRITICAL FIX ==========
  // filtered must exist because UI uses filtered.length
  const filtered = useMemo(() => properties, [properties]);

  // Delete property
  const handleDelete = async (id) => {
    if (!confirm("Delete this property? This action cannot be undone.")) return;

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

      {/* -------- FILTER BAR -------- */}
      <div className="glass-card p-4 rounded-xl mb-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">

          {/* Search */}
          <div className="col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                fetchWithFilters(
                  e.target.value,
                  zoneFilter,
                  usageFilter,
                  typeFilter,
                  areaMin,
                  areaMax,
                  taxMin,
                  taxMax
                );
              }}
              placeholder="Search owner, address..."
              className="pl-10 pr-4 py-2 border rounded-lg w-full"
            />
          </div>

          {/* Zone */}
          <select
            value={zoneFilter}
            onChange={(e) => {
              setZoneFilter(e.target.value);
              fetchWithFilters(
                query,
                e.target.value,
                usageFilter,
                typeFilter,
                areaMin,
                areaMax,
                taxMin,
                taxMax
              );
            }}
            className="p-2 border rounded-lg"
          >
            <option value="all">Zone (All)</option>
            <option value="A">A - Prime</option>
            <option value="B">B - Standard</option>
            <option value="C">C - Low</option>
            <option value="D">D - Very Low</option>
          </select>

          {/* Usage */}
          <select
            value={usageFilter}
            onChange={(e) => {
              setUsageFilter(e.target.value);
              fetchWithFilters(
                query,
                zoneFilter,
                e.target.value,
                typeFilter,
                areaMin,
                areaMax,
                taxMin,
                taxMax
              );
            }}
            className="p-2 border rounded-lg"
          >
            <option value="all">Usage (All)</option>
            <option value="self">Self-Occupied</option>
            <option value="rented">Rented</option>
            <option value="commercial">Commercial</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              fetchWithFilters(
                query,
                zoneFilter,
                usageFilter,
                e.target.value,
                areaMin,
                areaMax,
                taxMin,
                taxMax
              );
            }}
            className="p-2 border rounded-lg"
          >
            <option value="all">Type (All)</option>
            <option value="Residential">Residential</option>
            <option value="Commercial">Commercial</option>
            <option value="Industrial">Industrial</option>
          </select>

          {/* Reset */}
          <button
            onClick={resetFilters}
            className="bg-gray-100 hover:bg-gray-200 rounded-lg px-3 py-2 text-sm"
          >
            Reset
          </button>
        </div>

        {/* Area & Tax */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
          <input
            type="number"
            value={areaMin}
            onChange={(e) => {
              setAreaMin(e.target.value);
              fetchWithFilters(
                query,
                zoneFilter,
                usageFilter,
                typeFilter,
                e.target.value,
                areaMax,
                taxMin,
                taxMax
              );
            }}
            placeholder="Min Area"
            className="p-2 border rounded-lg"
          />

          <input
            type="number"
            value={areaMax}
            onChange={(e) => {
              setAreaMax(e.target.value);
              fetchWithFilters(
                query,
                zoneFilter,
                usageFilter,
                typeFilter,
                areaMin,
                e.target.value,
                taxMin,
                taxMax
              );
            }}
            placeholder="Max Area"
            className="p-2 border rounded-lg"
          />

          <input
            type="number"
            value={taxMin}
            onChange={(e) => {
              setTaxMin(e.target.value);
              fetchWithFilters(
                query,
                zoneFilter,
                usageFilter,
                typeFilter,
                areaMin,
                areaMax,
                e.target.value,
                taxMax
              );
            }}
            placeholder="Min Tax"
            className="p-2 border rounded-lg"
          />

          <input
            type="number"
            value={taxMax}
            onChange={(e) => {
              setTaxMax(e.target.value);
              fetchWithFilters(
                query,
                zoneFilter,
                usageFilter,
                typeFilter,
                areaMin,
                areaMax,
                taxMin,
                e.target.value
              );
            }}
            placeholder="Max Tax"
            className="p-2 border rounded-lg"
          />
        </div>
      </div>

      {/* ---------- EMPTY ---------- */}
      {!loading && filtered.length === 0 && (
        <p className="text-center text-gray-500 mt-10">No properties found.</p>
      )}

      {/* ---------- LOADING ---------- */}
      {loading && (
        <p className="text-center text-gray-500">Loading properties...</p>
      )}

      {/* ---------- TABLE ---------- */}
      {!loading && filtered.length > 0 && (
        <div className="glass-card overflow-x-auto">
          <table className="min-w-full divide-y">
            <thead className="bg-white">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Address
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Area
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Zone
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">
                  Usage
                </th>
                <th className="px-6 py-3 text-right text-sm font-medium text-gray-500">
                  Tax
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-gray-500">
                  Actions
                </th>
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
                      {deleting === p._id ? "..." : <Trash2 className="w-4 h-4 inline-block" />}
                    </button>
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
