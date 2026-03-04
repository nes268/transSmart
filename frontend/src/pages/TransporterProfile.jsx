import { useState, useEffect } from "react";
import { getMe, updateProfile } from "../services/userService";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { User, Phone } from "lucide-react";

export default function TransporterProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    getMe()
      .then((res) => {
        const data = res.data;
        setProfile(data);
        setFormData({
          name: data.name || "",
          phone: data.phone || "",
        });
      })
      .catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone,
      });
      setProfile(res.data);
      updateUser({ name: res.data.name, phone: res.data.phone });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Profile</h1>
        <p className="page-subtitle">Manage your contact information</p>
      </div>

      <div className="card" style={{ maxWidth: "480px" }}>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>
              <User size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Your full name"
              required
            />
          </div>
          <div className="form-group">
            <label>
              <Phone size={14} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px" }} />
              Phone Number
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="e.g. +91 9876543210"
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : "Save Profile"}
          </button>
        </form>
      </div>
    </div>
  );
}
