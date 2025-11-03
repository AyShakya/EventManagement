import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
    const {user, loading} = useContext(AuthContext);
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
        <nav style={{ padding: 12, borderBottom: "1px solid #ddd"}}>
            <Link to="/">Home</Link> | <Link to="/events">Events</Link>
            <span style={{float: "right"}}>
                {user ? (
                    <>
                    {user.userType === "user" ? <Link to="/organizer">Dashboard</Link> : <Link to="/user">Dashboard</Link>}
                    {" • "}
                    <button onClick={handleLogout}>Logout</button>
                    </>
                ) : (
                    <>
                    <Link to="/login">Login</Link> • <Link to="/register">Register</Link>
                    </>
                )};
            </span>
        </nav>
    )
}

export default Navbar;