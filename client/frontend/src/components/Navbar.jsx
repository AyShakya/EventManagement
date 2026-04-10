import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavbarCoffeeGrain = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  const navLinkClass = (path) =>
    `relative px-1 py-2 text-sm font-medium transition-colors ${
      isActive(path) ? "text-coffee-dark" : "text-coffee-dark/70 hover:text-coffee-dark"
    }`;

  return (
    <nav className="sticky top-0 z-40 backdrop-blur-md bg-[#f7f1e9]/90">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.35rem] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b241b] to-[#8a5a3b] text-[#f6ece0] font-bold flex items-center justify-center shadow">
              EE
            </div>
            <span className="text-3xl sm:text-[2rem] leading-none font-semibold text-coffee-dark hidden sm:inline">
              EventEase
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-7">
            <Link to="/" className={navLinkClass("/")}>Home</Link>
            <Link to="/events" className={navLinkClass("/events")}>Events</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-sm">
          {!user ? (
            <>
              <Link
                to="/login"
                className={`px-4 py-2 rounded-full border border-[#c9b39b] font-medium ${
                  isActive("/login")
                    ? "text-coffee-dark bg-[#f2e8dc]"
                    : "text-coffee-dark/90 hover:bg-[#f2e8dc]"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-full bg-coffee-dark text-coffee-cream font-medium shadow hover:bg-[#3b241b]"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link
                to={user.userType === "organizer" ? "/organizer" : "/user"}
                className="px-4 py-2 rounded-full border border-[#b89979] text-coffee-dark font-medium hover:bg-[#f2e8dc]"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-coffee-dark text-coffee-cream font-medium hover:bg-[#3b241b]"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarCoffeeGrain;
