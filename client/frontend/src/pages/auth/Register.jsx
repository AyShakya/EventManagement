import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const { register } = useContext(AuthContext);
  const [userName, setUserName] = useState("");
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
      const res = await register(userName, email, password, userType);
      setLoading(false);
      alert(res?.message || "Registered successfully. Please login.");
      navigate("/login");
    } catch (error) {
      setLoading(false);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err.message ||
        "Registration failed";
      setError(msg);
    }
  }
  return (
    <div style={{ padding: 20, maxWidth: 520, margin: "0 auto" }}>
      <h2>Register</h2>
      {error && <div style={{ color: "red", marginBottom: 12 }}>{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 8 }}>
          <label>Name</label><br />
          <input required value={userName} onChange={(e) => setUserName(e.target.value)} />
        </div>

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

        <button disabled={loading} type="submit">{loading ? "Creating..." : "Register"}</button>
      </form>
    </div>
  );
};
export default Register;
