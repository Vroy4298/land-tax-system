// frontend/src/pages/PaymentHistory.jsx
import { useEffect, useState } from "react";

export default function PaymentHistory() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await fetch("http://localhost:5000/api/payments", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (!res.ok) {
        console.error("Payment history error:", data);
        return;
      }

      setPayments(data);
    } catch (err) {
      console.error("Network error:", err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (propertyId) => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `http://localhost:5000/api/properties/${propertyId}/receipt`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        alert("Failed to download receipt.");
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `receipt_${propertyId}.pdf`;
      a.click();

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Receipt download error:", err);
      alert("Error downloading receipt.");
    }
  };

  const formatINR = (num) =>
    "₹" + Number(num || 0).toLocaleString("en-IN");

  if (loading) {
    return <p className="page-offset text-gray-500">Loading payments...</p>;
  }

  if (payments.length === 0) {
    return (
      <div className="page-offset text-center text-gray-500">
        <h2 className="text-2xl font-bold mb-4">Payment History</h2>
        <p>No tax payments found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 page-offset">
      <h2 className="text-3xl font-bold text-gray-800 mb-1">Payment History</h2>
      <p className="text-sm text-gray-500 mb-6">
        All your previous land tax payments.
      </p>

      <div className="glass-card overflow-x-auto">
        <table className="min-w-full divide-y">
          <thead className="bg-white">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Owner</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Address</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Paid On</th>
              <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Receipt</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y">
            {payments.map((p) => (
              <tr key={p._id} className="hover:bg-gray-50">
                <td className="px-6 py-4">{p.ownerName}</td>
                <td className="px-6 py-4">{p.address}</td>
                <td className="px-6 py-4 text-blue-600 font-semibold">
                  {formatINR(p.finalTaxAmount)}
                </td>
                <td className="px-6 py-4">
                  {new Date(p.paymentDate).toLocaleString()}
                </td>

                <td className="px-6 py-4">
                  <button
                    onClick={() => downloadReceipt(p._id)}
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Download PDF
                  </button>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
