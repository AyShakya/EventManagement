import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function ProtectedRoute({ requiredUserType }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;

  if (requiredUserType && user.userType !== requiredUserType) {
    return <div className="p-8 text-center text-red-600">Access Denied</div>;
  }
  return <Outlet />;
}
