import { useContext, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const resp = await login(email, password, userType);
      setLoading(false);
      if(resp && resp.user){
        if (res.user.userType === "organizer") navigate("/organizer");
        else navigate("/user");
      } else {
        navigate("/");
      }
    } catch (error) {
      setLoading(false);
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message || "Login failed";
      setError(msg);
    }
  }

  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>Login</h2>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Email</label><br />
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>

        <div style={{ marginBottom: 8 }}>
          <label>Password</label><br />
          <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label>User type</label><br />
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="user">User</option>
            <option value="organizer">Organizer</option>
          </select>
        </div>

        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
      </form>
    </div>
  )
}

export default Login;