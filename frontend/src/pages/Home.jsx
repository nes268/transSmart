import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router-dom";

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user) {
    const redirect = user.role === "shipper" ? "/shipper/dashboard" : user.role === "transporter" ? "/transporter/dashboard" : user.role === "admin" ? "/admin/dashboard" : "/login";
    return <Navigate to={redirect} replace />;
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "linear-gradient(135deg, var(--color-bg) 0%, var(--color-surface) 100%)",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", marginBottom: "0.5rem", color: "var(--color-primary)" }}>TransSmart</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "2rem", textAlign: "center" }}>
        Smart logistics platform connecting shippers and transporters
      </p>
      <div style={{ display: "flex", gap: "1rem" }}>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
        <Link to="/register" className="btn btn-secondary">
          Register
        </Link>
      </div>
    </div>
  );
}
