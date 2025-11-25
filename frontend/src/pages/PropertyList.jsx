import { useEffect, useState } from "react";
import { Link } from "react-router-dom";


function PropertyList() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch("http://localhost:5000/api/properties", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          setProperties(data);

          if (data.length === 0) {
            setMessage("No properties found.");
          }
        } else {
          setMessage("❌ Failed to load properties");
        }
      } catch {
        setMessage("❌ Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const handleDelete = async (id) => {
    const token = localStorage.getItem("token");

    await fetch(`http://localhost:5000/api/properties/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });

    const newList = properties.filter((p) => p._id !== id);
    setProperties(newList);

    if (newList.length === 0) {
      setMessage("No properties found.");
    }
  };

  if (loading) {
    return <p className="text-gray-500 mt-5">Loading properties...</p>;
  }

  if (properties.length === 0) {
    return <p className="text-gray-600 mt-5">{message}</p>;
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-blue-600 mb-4">🏠 Property List</h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {properties.map((prop) => (
          <div key={prop._id} className="p-4 bg-white shadow-md rounded-xl">
            <h3 className="font-bold text-lg">{prop.ownerName}</h3>
            <p>{prop.propertyAddress}</p>
            <p>Area: {prop.area} sq ft</p>
            <p>Tax: ₹{prop.taxAmount}</p>

    <Link
  to={`/property/${prop._id}`}
  className="mt-2 bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600 mr-2 inline-block"
>
  View
</Link>


            {/* EDIT BUTTON */}
            <a
              href={`/edit-property/${prop._id}`}
              className="mt-2 bg-yellow-500 text-white px-4 py-1 rounded hover:bg-yellow-600 mr-2 inline-block"
            >
              Edit
            </a>

            {/* DELETE BUTTON */}
            <button
              onClick={() => handleDelete(prop._id)}
              className="mt-2 bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PropertyList;