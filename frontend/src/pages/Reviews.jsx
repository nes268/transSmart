import { useState, useEffect } from "react";
import { getMyTrips } from "../services/tripService";
import { createReview } from "../services/reviewService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Star, Send } from "lucide-react";

export default function Reviews() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getMyTrips()
      .then((res) => setTrips(res.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const completedTrips = trips.filter((t) => t.status === "completed");

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!showReview) return;
    setError("");
    setSubmitLoading(true);
    try {
      await createReview(showReview._id, rating, comment);
      setShowReview(null);
      setComment("");
      setRating(5);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">Rate and review completed trips</p>
        </div>
      </div>

      {completedTrips.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Star size={32} className="empty-state-icon" />
            <p className="empty-state-text">No completed trips to review yet.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {completedTrips.map((t) => (
            <div key={t._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{t.job?.title || "Trip"}</div>
                  <div className="list-item-sub">
                    {t.job?.pickupLocation} → {t.job?.deliveryLocation}
                  </div>
                  <div className="list-item-meta">{formatDate(t.completedAt)}</div>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => setShowReview(t)}
                >
                  <Star size={14} /> Write Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">
              Review: {showReview.job?.title}
            </h3>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating</label>
                <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.25rem" }}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setRating(n)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "0.25rem",
                        color: n <= rating ? "var(--color-warning)" : "var(--color-text-muted)",
                        transition: "color 150ms ease",
                      }}
                    >
                      <Star size={24} fill={n <= rating ? "currentColor" : "none"} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Comment (optional)</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  placeholder="Share your experience..."
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitLoading}
                >
                  <Send size={14} />
                  {submitLoading ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowReview(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
