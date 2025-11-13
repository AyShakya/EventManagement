import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function PublicOnlyRoute({ redirectTo = "/" }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (user) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}
