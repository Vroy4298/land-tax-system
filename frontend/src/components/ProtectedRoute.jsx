import { Navigate, useLocation } from "react-router-dom";
import { getAuthToken } from "../utils/auth";
import Loader from "./Loader";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const token = getAuthToken();

    if (!token) {
      setAuthorized(false);
      setChecking(false);
      return;
    }

    // Token exists → backend will validate expiry
    setAuthorized(true);
    setChecking(false);
  }, []);

  if (checking) {
    return <Loader />;
  }

  if (!authorized) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return children;
}
