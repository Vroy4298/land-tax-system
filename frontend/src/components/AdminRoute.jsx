import { Navigate } from "react-router-dom";
import { getAuthToken, isAdmin } from "../utils/auth";
import Loader from "./Loader";
import { useEffect, useState } from "react";

export default function AdminRoute({ children }) {
    const [checking, setChecking] = useState(true);
    const [authorized, setAuthorized] = useState(false);

    useEffect(() => {
        const token = getAuthToken();
        if (!token) {
            setAuthorized(false);
        } else {
            setAuthorized(isAdmin());
        }
        setChecking(false);
    }, []);

    if (checking) return <Loader />;

    if (!authorized) return <Navigate to="/dashboard" replace />;

    return children;
}
