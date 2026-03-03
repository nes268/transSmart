import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { login as loginApi } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { Truck } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi(email, password);
      login(
        { _id: data._id, name: data.name, email: data.email, role: data.role },
        data.token
      );
      const redirect =
        data.role === "shipper"
          ? "/shipper/dashboard"
          : data.role === "transporter"
          ? "/transporter/dashboard"
          : data.role === "admin"
          ? "/admin/dashboard"
          : "/";
      navigate(redirect, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card animate-in">
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <div className="landing-logo" style={{ margin: "0 auto 1rem", width: 44, height: 44 }}>
            <Truck size={22} />
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your TransSmart account</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            style={{ width: "100%", marginTop: "0.5rem" }}
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  );
}
