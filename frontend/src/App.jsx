import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import PropertyList from "./pages/PropertyList";
import PropertyDetails from "./pages/PropertyDetails";
import EditProperty from "./pages/EditProperty";
import AddProperty from "./pages/AddProperty";
import PaymentHistory from "./pages/PaymentHistory";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";




import ProtectedRoute from "./components/ProtectedRoute";


function App() {
  return (
    <>
      <Navbar />

      {/* App background only — pages control layout */}
      <div className="min-h-screen bg-gray-50 dark:bg-[#0b1220] transition-colors duration-300">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />


          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/properties"
            element={
              <ProtectedRoute>
                <PropertyList />
              </ProtectedRoute>
            }
          />

          <Route
            path="/add-property"
            element={
              <ProtectedRoute>
                <AddProperty />
              </ProtectedRoute>
            }
          />

          <Route
            path="/properties/:id"
            element={
              <ProtectedRoute>
                <PropertyDetails />
              </ProtectedRoute>
            }
          />

          <Route
            path="/properties/:id/edit"
            element={
              <ProtectedRoute>
                <EditProperty />
              </ProtectedRoute>
            }
          />

          <Route
            path="/payment-history"
            element={
              <ProtectedRoute>
                <PaymentHistory />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </>
  );
}

export default App;
