import React, { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, loading, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <nav className="bg-coffee-hero text-white py-6 shadow-sm">
      <div className="app-container flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="font-semibold text-lg">CoffeeEvents</Link>
          <Link to="/events" className="opacity-90 hover:opacity-100">Browse</Link>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              {user.userType === "organizer" ? (
                <Link to="/organizer" className="text-sm">Dashboard</Link>
              ) : (
                <Link to="/user" className="text-sm">Dashboard</Link>
              )}
              <button
                onClick={handleLogout}
                className="bg-coffee-dark hover:bg-coffee-mid text-sm px-3 py-1 rounded"
                style={{ backgroundColor: "#561C24" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-sm">Login</Link>
              <Link to="/register" className="text-sm">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
