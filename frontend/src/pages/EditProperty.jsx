import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function EditProperty() {
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
        console.error("Error fetching property:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    setProperty({ ...property, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(`http://localhost:5000/api/properties/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(property),
      });

      if (res.ok) {
        alert("Property updated successfully!");
        window.location.href = "/properties";
      } else {
        alert("Update failed.");
      }
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Edit Property</h2>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <input
          type="text"
          name="ownerName"
          value={property.ownerName}
          onChange={handleChange}
          placeholder="Owner Name"
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="phone"
          value={property.phone}
          onChange={handleChange}
          placeholder="Phone"
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="location"
          value={property.location}
          onChange={handleChange}
          placeholder="Location"
          className="w-full p-3 border rounded"
        />

        <input
          type="number"
          name="landSize"
          value={property.landSize}
          onChange={handleChange}
          placeholder="Land Size"
          className="w-full p-3 border rounded"
        />

        <input
          type="text"
          name="landType"
          value={property.landType}
          onChange={handleChange}
          placeholder="Land Type"
          className="w-full p-3 border rounded"
        />

        <input
          type="number"
          name="annualTax"
          value={property.annualTax}
          onChange={handleChange}
          placeholder="Annual Tax"
          className="w-full p-3 border rounded"
        />

        <button
          type="submit"
          className="w-full p-3 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Update Property
        </button>
      </form>
    </div>
  );
}

export default EditProperty;
