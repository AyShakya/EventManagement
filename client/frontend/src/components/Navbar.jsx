import React, { useContext } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const NavbarCoffeeGrain = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname.startsWith(path);

  async function handleLogout() {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }

  return (
    <nav className="sticky top-0 z-40 shadow-lg backdrop-blur-md bg-[radial-gradient(circle_at_top,_#723030,_#2B0D0F_55%,_#140607_100%)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[4rem] px-4 sm:px-6 lg:px-8">
        {/* LEFT SIDE - LOGO */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center gap-3 group hover:opacity-80 transition-opacity duration-300"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-coffee-cream to-amber-200 text-coffee-dark font-extrabold flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              CE
            </div>
            <span className="text-xl font-bold tracking-wide text-coffee-cream hidden sm:inline">
              CoffeeEvents
            </span>
          </Link>

          {/* MIDDLE - NAVIGATION LINKS */}
          <div className="hidden md:flex items-center gap-8 text-sm">
            <Link
              to="/events"
              className={`relative py-2 transition-all duration-300 font-medium ${
                isActive("/events")
                  ? "text-coffee-cream"
                  : "text-coffee-cream/70 hover:text-coffee-cream"
              } after:absolute after:bottom-0 after:left-0 after:w-0 hover:after:w-full after:h-0.5 after:bg-coffee-cream after:transition-all after:duration-300`}
            >
              Browse Events
            </Link>
          </div>
        </div>

        {/* RIGHT SIDE - AUTH ACTIONS */}
        <div className="flex items-center gap-3 md:gap-5 text-sm">
          {!user ? (
            <>
              <Link
                to="/login"
                className={`py-2 px-4 rounded-lg font-medium transition-all duration-300 ${
                  isActive("/login")
                    ? "text-coffee-cream bg-white/10"
                    : "text-coffee-cream/80 hover:text-coffee-cream hover:bg-white/5"
                }`}
              >
                Login
              </Link>

              <Link
                to="/register"
                className="px-4 py-2 rounded-lg bg-[#3b1f1f]/70 text-coffee-cream 
             font-medium border border-coffee-cream/20
             shadow-md hover:bg-[#4a2626] hover:border-coffee-cream/40 
             hover:shadow-lg hover:scale-105 
             transition-all duration-300"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link
                to={user.userType === "organizer" ? "/organizer" : "/user"}
                className="px-4 py-2 rounded-lg border-2 border-coffee-cream/50 text-coffee-cream font-medium hover:bg-white/10 hover:border-coffee-cream transition-all duration-300"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg bg-[#3b1f1f]/70 text-coffee-cream 
             font-medium border border-coffee-cream/20
             shadow-md hover:bg-[#4a2626] hover:border-coffee-cream/40 
             hover:shadow-lg hover:scale-105 
             transition-all duration-300"
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
