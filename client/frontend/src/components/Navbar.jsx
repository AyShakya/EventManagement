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
      isActive(path)
        ? "text-[#9f402d] underline underline-offset-8 decoration-[1.5px]"
        : "text-[#352e29]/85 hover:text-[#271310]"
    }`;

  return (
    <nav className="sticky top-0 z-40 bg-[#f8f7f2]/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-[4.35rem] px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-3 group">
            <span className="text-[2.15rem] sm:text-[2.25rem] leading-none font-semibold text-[#22100f] italic tracking-tight">
              EventEase
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className={navLinkClass("/")}>Home</Link>
            <Link to="/events" className={navLinkClass("/events")}>Events</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3 text-sm">
          {!user ? (
            <>
              <Link
                to="/login"
                className={`px-5 py-2.5 rounded-full bg-[#f5f5dc] text-[#271310] font-medium ${
                  isActive("/login")
                    ? "ring-2 ring-[#9f402d]/45"
                    : "hover:bg-[#eceac8]"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-5 py-2.5 rounded-full bg-[#271310] text-white font-medium shadow-[0_10px_22px_rgba(39,19,16,0.18)] hover:bg-[#3b1d18]"
              >
                Sign up
              </Link>
            </>
          ) : (
            <>
              <Link
                to={user.userType === "organizer" ? "/organizer" : "/user"}
                className="px-4 py-2 rounded-full bg-[#f5f5dc] text-[#271310] font-medium hover:bg-[#eceac8]"
              >
                Dashboard
              </Link>

              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-full bg-[#271310] text-white font-medium hover:bg-[#3b241b]"
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
