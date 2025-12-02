// frontend/src/pages/PropertyDetails.jsx
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function PropertyDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatINR = (num) =>
    "₹" + Number(num || 0).toLocaleString("en-IN");

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();
        if (res.ok) setProperty(data);
      } catch (error) {
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading)
    return (
      <p className="page-offset text-center text-gray-500 text-lg">
        Loading property details…
      </p>
    );

  if (!property)
    return (
      <p className="page-offset text-center text-red-500 text-lg">
        Property not found.
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto p-6 page-offset animate-fadeIn">

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Property Details</h1>

        <div className="flex gap-3">
          <button
            onClick={() => navigate("/properties")}
            className="btn-secondary"
          >
            Back
          </button>

          <Link
            to={`/properties/${property._id}/edit`}
            className="btn-primary"
          >
            Edit Property
          </Link>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* LEFT: OWNER & ADDRESS CARD */}
        <div className="glass-card p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Owner & Property Information
          </h2>

          <div className="space-y-5">

            <div>
              <p className="text-sm text-gray-500">Owner Name</p>
              <p className="text-gray-800 font-medium">{property.ownerName}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-gray-800 font-medium">
                {property.ownerPhone || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800 font-medium">
                {property.ownerEmail || "—"}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Address</p>
              <p className="text-gray-800 font-medium leading-relaxed">
                {property.address}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3">
              <div>
                <p className="text-sm text-gray-500">Property Type</p>
                <p className="font-medium text-gray-800">
                  {property.propertyType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Usage</p>
                <p className="font-medium text-gray-800">
                  {property.usageType}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Zone</p>
                <p className="font-medium text-gray-800">{property.zone}</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Construction Year</p>
                <p className="font-medium text-gray-800">
                  {property.constructionYear}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT: TAX DETAILS */}
        <div className="glass-card p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Tax Breakdown
          </h2>

          <div className="space-y-4">

            <div className="flex justify-between">
              <span className="text-gray-500">Built-up Area</span>
              <span className="font-medium text-gray-800">
                {property.builtUpArea} sq ft
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Base Rate</span>
              <span className="font-medium text-gray-800">
                ₹{property.baseRate} / sq ft
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Zone Multiplier</span>
              <span className="font-medium text-gray-800">
                × {property.zoneMultiplier}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Usage Multiplier</span>
              <span className="font-medium text-gray-800">
                × {property.usageMultiplier}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-500">Age Factor</span>
              <span className="font-medium text-gray-800">
                × {property.ageFactor}
              </span>
            </div>

            <hr className="my-4" />

            <div className="flex justify-between items-center">
              <span className="text-xl font-semibold text-gray-800">
                Final Tax Amount
              </span>
              <span className="text-3xl font-extrabold text-blue-600">
                {formatINR(property.finalTaxAmount)}
              </span>
            </div>

            <p className="text-xs text-gray-500">
              This value is calculated based on the official zone, usage and property tax multipliers.
            </p>

            <div className="text-gray-500 text-sm pt-2">
              Created on:
              <span className="font-medium text-gray-700 ml-1">
                {new Date(property.createdAt).toLocaleDateString("en-IN")}
              </span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
