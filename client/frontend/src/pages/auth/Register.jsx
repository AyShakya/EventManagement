import React, { useContext, useState } from "react";
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
    } catch (err) {
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
    <div className="min-h-[60vh] flex items-center">
      <div className="app-container mx-auto w-full max-w-md bg-white rounded-lg p-6 card-coffee">
        <h2 className="text-2xl font-semibold mb-4">Register</h2>
        {error && <div className="text-red-600 mb-3">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Name</label>
            <input required value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 rounded border" />
          </div>

          <div>
            <label className="block text-sm mb-1">User type</label>
            <select value={userType} onChange={(e) => setUserType(e.target.value)} className="w-full px-3 py-2 rounded border">
              <option value="user">User</option>
              <option value="organizer">Organizer</option>
            </select>
          </div>

          <div className="flex justify-between items-center">
            <button disabled={loading} type="submit" className="bg-coffee-mid text-white px-4 py-2 rounded">{loading ? "Creating..." : "Register"}</button>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Register;
