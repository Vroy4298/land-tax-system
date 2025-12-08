import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payLoading, setPayLoading] = useState(false);

  const formatINR = (num) =>
    "₹" + Number(num).toLocaleString("en-IN");

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

  // ⛳ Mark As Paid
  const handleMarkAsPaid = async () => {
    if (!confirm("Are you sure you want to mark this property as PAID?")) return;

    setPayLoading(true);
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/properties/${id}/pay`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        alert("Payment marked as PAID!");
        setProperty((prev) => ({
          ...prev,
          paymentStatus: "paid",
          paymentDate: new Date().toISOString(),
        }));
      } else {
        alert(data.error || "Payment update failed");
      }
    } catch (err) {
      console.error("Payment error:", err);
      alert("Network error");
    } finally {
      setPayLoading(false);
    }
  };

  // ⛳ Download Receipt (PDF)
  const downloadReceipt = async () => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/properties/${property._id}/receipt`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("Failed to download receipt.");
      return;
    }

    // Convert response to Blob (PDF file)
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);

    // Auto-trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt_${property._id}.pdf`;
    a.click();

    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Receipt download error:", err);
    alert("Error downloading receipt.");
  }
};


  if (loading)
    return <p className="page-offset text-center text-gray-500">Loading...</p>;

  if (!property)
    return (
      <p className="page-offset text-center text-red-500">Property not found.</p>
    );


  return (
    <div className="max-w-4xl mx-auto p-6 page-offset">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Property Details</h1>

        <div className="flex items-center gap-3">
          <Link to="/properties" className="btn-secondary">
            Back
          </Link>

          <Link
            to={`/properties/${property._id}/edit`}
            className="btn-primary"
          >
            Edit
          </Link>
        </div>
      </div>

      <div className="glass-card p-6 rounded-xl space-y-5">

        {/* Payment Status */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Payment Status</h2>

          {property.paymentStatus === "paid" ? (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
              ✓ Paid
            </span>
          ) : (
            <span className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-full">
              Pending
            </span>
          )}
        </div>

        {property.paymentDate && (
          <p className="text-gray-600 text-sm">
            Paid on: {new Date(property.paymentDate).toLocaleString("en-IN")}
          </p>
        )}

        {/* Owner */}
        <div>
          <h2 className="text-lg font-semibold">Owner Name</h2>
          <p className="text-gray-600">{property.ownerName}</p>
        </div>

        {/* Address */}
        <div>
          <h2 className="text-lg font-semibold">Address</h2>
          <p className="text-gray-600">{property.address}</p>
        </div>

        {/* Area */}
        <div className="flex justify-between">
          <span className="text-gray-500">Built-up Area</span>
          <span className="font-semibold">{property.builtUpArea} sq ft</span>
        </div>

        {/* Base Rate */}
        <div className="flex justify-between">
          <span className="text-gray-500">Base Rate</span>
          <span className="font-semibold">₹{property.baseRate} / sq ft</span>
        </div>

        {/* Multipliers */}
        <div className="flex justify-between">
          <span className="text-gray-500">Zone Multiplier</span>
          <span className="font-semibold">{property.zoneMultiplier}×</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Usage Multiplier</span>
          <span className="font-semibold">{property.usageMultiplier}×</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Age Factor</span>
          <span className="font-semibold">{property.ageFactor}×</span>
        </div>

        {/* Final Tax */}
        <div className="pt-4 border-t flex justify-between items-center">
          <span className="text-gray-700 font-semibold text-xl">
            Final Tax Amount
          </span>
          <span className="text-blue-600 font-extrabold text-2xl">
            {formatINR(property.finalTaxAmount)}
          </span>
        </div>

        {/* Receipt + Payment buttons */}
        <div className="flex items-center justify-between mt-6">

          {/* Download Receipt */}
          <button
            onClick={downloadReceipt}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Download Receipt (PDF)
          </button>

          {/* Mark As Paid */}
          {property.paymentStatus !== "paid" && (
            <button
              onClick={handleMarkAsPaid}
              disabled={payLoading}
              className={`px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ${
                payLoading ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {payLoading ? "Processing..." : "Mark As Paid"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
