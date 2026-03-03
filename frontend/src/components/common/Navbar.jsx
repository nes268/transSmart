import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        background: "var(--color-surface)",
        borderBottom: "1px solid var(--color-border)",
        padding: "0.75rem 1.5rem",
      }}
    >
      <div
        className="container"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link
          to="/"
          style={{
            fontSize: "1.25rem",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          TransSmart
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
          {user && (
            <>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                {user.name} ({user.role})
              </span>
              <Link
                to="/notifications"
                style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}
              >
                Notifications
              </Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: "0.5rem 1rem", fontSize: "0.875rem" }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
