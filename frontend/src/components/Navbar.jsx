import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};


  return (
    <nav className="bg-blue-600 text-white py-3 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-6">
        <h1 className="text-2xl font-bold tracking-wide">
          <Link to="/">🏡LandTax</Link>
        </h1>

        <div className="space-x-6 text-sm font-medium">
          <Link to="/" className="hover:text-gray-200">Home</Link>
          <Link to="/properties" className="hover:text-gray-200">Properties</Link>
          <Link to="/add-property" className="hover:text-gray-200">Add Property</Link>
          <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
          <Link to="/about" className="hover:text-gray-200">About</Link>
          <Link to="/contact" className="hover:text-gray-200">Contact</Link>

          {token ? (
            <button
  onClick={handleLogout}
  className="bg-red-500 text-white px-4 py-1 rounded hover:bg-red-600 ml-4"
>
  Logout
</button>

          ) : (
            <>
              <Link to="/login" className="hover:text-gray-200">Login</Link>
              <Link to="/register" className="hover:text-gray-200">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
