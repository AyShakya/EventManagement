import { useContext } from "react";

export default function PublicOnlyRoute({redirectTo = "/"}){
    const {user, loading} = useContext(AuthContext);
    if (loading) return <div>Loading...</div>;
  if (user) return <Navigate to={redirectTo} replace />;
  return <Outlet />;
}