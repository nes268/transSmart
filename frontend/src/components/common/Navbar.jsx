import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { Bell, LogOut, User, Phone } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getMe, updateProfile } from "../../services/userService";

export default function Navbar() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: "", phone: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");

  const isTransporter = user?.role === "transporter";

  useEffect(() => {
    if (showProfileModal && user) {
      getMe()
        .then((res) => {
          const d = res?.data;
          if (d) setProfileForm({ name: d.name ?? "", phone: d.phone ?? "" });
        })
        .catch(() => {});
    }
  }, [showProfileModal, user?._id]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError("");
    setProfileSaving(true);
    try {
      const res = await updateProfile({ name: profileForm.name, phone: profileForm.phone });
      const updated = res?.data;
      if (updated) {
        updateUser({ name: updated.name, phone: updated.phone });
        setShowProfileModal(false);
      }
    } catch (err) {
      setProfileError(err.response?.data?.message || "Failed to update");
    } finally {
      setProfileSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="navbar-brand-text">TransSmart</span>
        </Link>

        <div className="navbar-actions">
          {user && (
            <>
              <div
                className={`navbar-user${isTransporter ? " navbar-user-clickable" : ""}`}
                onClick={isTransporter ? () => setShowProfileModal(true) : undefined}
                role={isTransporter ? "button" : undefined}
                title={isTransporter ? "Edit profile" : undefined}
              >
                <div className="navbar-user-info">
                  <div className="navbar-user-name">{user.name}</div>
                  <div className="navbar-user-role">{user.role}</div>
                </div>
                <div className="navbar-avatar">{initials}</div>
              </div>

              <Link to="/notifications" className="navbar-icon-btn" title="Notifications">
                <Bell size={18} />
              </Link>

              <button onClick={handleLogout} className="navbar-icon-btn" title="Log out">
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {showProfileModal && isTransporter && createPortal(
        <div className="modal-overlay" style={{ zIndex: 9999 }} onClick={() => setShowProfileModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
            <h3 className="modal-title">Edit Profile</h3>
            {profileError && <div className="alert alert-error">{profileError}</div>}
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label><User size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />Name</label>
                <input
                  type="text"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Your full name"
                  required
                />
              </div>
              <div className="form-group">
                <label><Phone size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />Phone</label>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="e.g. +91 9876543210"
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
                <button type="submit" className="btn btn-primary" disabled={profileSaving}>
                  {profileSaving ? "Saving..." : "Save"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </nav>
  );
}
