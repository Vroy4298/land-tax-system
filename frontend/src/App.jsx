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

// Admin pages (Phase 2)
import AdminDashboard from "./pages/AdminDashboard";
import AdminProperties from "./pages/AdminProperties";
import AdminUsers from "./pages/AdminUsers";

// Phase 3/4 pages
import MapView from "./pages/MapView";
import Disputes from "./pages/Disputes";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

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

          <Route path="/dashboard" element={<ProtectedRoute citizenOnly><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute citizenOnly><PropertyList /></ProtectedRoute>} />
          <Route path="/add-property" element={<ProtectedRoute citizenOnly><AddProperty /></ProtectedRoute>} />
          <Route path="/properties/:id" element={<ProtectedRoute><PropertyDetails /></ProtectedRoute>} />
          <Route path="/properties/:id/edit" element={<ProtectedRoute citizenOnly><EditProperty /></ProtectedRoute>} />
          <Route path="/payment-history" element={<ProtectedRoute citizenOnly><PaymentHistory /></ProtectedRoute>} />

          {/* Phase 3 */}
          <Route path="/map" element={<ProtectedRoute citizenOnly><MapView /></ProtectedRoute>} />
          <Route path="/disputes" element={<ProtectedRoute><Disputes /></ProtectedRoute>} />

          {/* Admin routes — Phase 2 */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/properties" element={<AdminRoute><AdminProperties /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        </Routes>
      </div>
    </>
  );
}

export default App;
