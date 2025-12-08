import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import PropertyList from "./pages/PropertyList";
import AddProperty from "./pages/AddProperty";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Navbar from "./components/Navbar";
import PrivateRoute from "./components/PrivateRoute";
import EditProperty from "./pages/EditProperty";
import PropertyDetails from "./pages/PropertyDetails";
import PaymentHistory from "./pages/PaymentHistory.jsx";



function App() {
  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-gray-50">
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/payment-history" element={<PaymentHistory />} />


          {/* PROTECTED ROUTES */}
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/properties"
            element={
              <PrivateRoute>
                <PropertyList />
              </PrivateRoute>
            }
          />

          <Route
            path="/add-property"
            element={
              <PrivateRoute>
                <AddProperty />
              </PrivateRoute>
            }
          />
          <Route
  path="/properties/:id/edit"
  element={
    <PrivateRoute>
      <EditProperty />
    </PrivateRoute>
  }
/>
<Route
  path="/properties/:id"
  element={
    <PrivateRoute>
      <PropertyDetails />
    </PrivateRoute>
  }
/>



        </Routes>
      </div>
    </>
  );
}

export default App;