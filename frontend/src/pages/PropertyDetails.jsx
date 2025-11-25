import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

function PropertyDetails() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);

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
        }
      } catch (error) {
        console.error("Error loading property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  if (loading) {
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;
  }

  if (!property) {
    return <p className="text-center mt-10 text-gray-500">Property not found.</p>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded-xl shadow">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">
        Property Details
      </h2>

      <div className="space-y-3 text-gray-700">
        <p><strong>Owner Name:</strong> {property.ownerName}</p>
        <p><strong>Address:</strong> {property.propertyAddress}</p>
        <p><strong>Area:</strong> {property.area} sq ft</p>
        <p><strong>Tax Amount:</strong> ₹{property.taxAmount}</p>
        <p><strong>Created:</strong> {new Date(property.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to={`/edit-property/${property._id}`}
          className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
        >
          Edit
        </Link>

        <Link
          to="/properties"
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back
        </Link>
      </div>
    </div>
  );
}

export default PropertyDetails;