import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMe, updateProfile } from "../services/userService";
import { getUserReviews } from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import { User, Phone, Star } from "lucide-react";

export default function TransporterProfile() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reviewsData, setReviewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({ name: "", phone: "" });

  useEffect(() => {
    Promise.all([
      getMe().then((res) => res?.data),
      user?._id ? getUserReviews(user._id).catch(() => null) : Promise.resolve(null),
    ]).then(([profileData, reviews]) => {
      if (profileData) {
        setProfile(profileData);
        setFormData({
          name: profileData.name ?? "",
          phone: profileData.phone ?? "",
        });
      }
      setReviewsData(reviews);
    }).catch(() => setError("Failed to load profile"))
      .finally(() => setLoading(false));
  }, [user?._id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const res = await updateProfile({
        name: formData.name,
        phone: formData.phone,
      });
      const updated = res?.data;
      if (updated) {
        setProfile(updated);
        updateUser({ name: updated.name, phone: updated.phone });
      }
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
      </div>


      {reviewsData && (reviewsData.count > 0 || reviewsData.data?.length > 0) && (
        <div className="card" style={{ maxWidth: "480px", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Star size={20} style={{ color: "var(--color-primary)" }} fill="currentColor" />
              <span style={{ fontWeight: 600, fontSize: "1.125rem" }}>{reviewsData.averageRating || "0"}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                ({reviewsData.count || reviewsData.data?.length || 0} review{(reviewsData.count || reviewsData.data?.length || 0) !== 1 ? "s" : ""})
              </span>
            </div>
            <Link to={`/reviews/user/${user._id}`} className="btn btn-secondary btn-sm">
              View all
            </Link>
          </div>
          <div className="list-stack" style={{ gap: "0.5rem" }}>
            {(reviewsData.data || []).slice(0, 3).map((r) => (
              <div key={r._id} style={{ padding: "0.75rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius-sm)", border: "1px solid var(--color-border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                  <span style={{ fontWeight: 600, fontSize: "0.875rem" }}>{r.reviewer?.name || "Shipper"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-primary)", fontWeight: 600 }}>
                    <Star size={14} fill="currentColor" />{r.rating}
                  </span>
                </div>
                {r.comment && <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", margin: 0, lineHeight: 1.4 }}>{r.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

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
