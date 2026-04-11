import React, { useContext } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ requiredUserType }) {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredUserType && user.userType !== requiredUserType) {
    return <Navigate to="/request-denied" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
