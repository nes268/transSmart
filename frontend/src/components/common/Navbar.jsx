import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Truck, Bell, LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Truck size={18} />
          </div>
          <span className="navbar-brand-text">TransSmart</span>
        </Link>

        <div className="navbar-actions">
          {user && (
            <>
              <Link to="/notifications" className="navbar-icon-btn" title="Notifications">
                <Bell size={16} />
              </Link>

              <div className="navbar-user">
                <div className="navbar-user-info">
                  <div className="navbar-user-name">{user.name}</div>
                  <div className="navbar-user-role">{user.role}</div>
                </div>
                <div className="navbar-avatar">{initials}</div>
              </div>

              <button onClick={handleLogout} className="navbar-icon-btn" title="Logout">
                <LogOut size={16} />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
