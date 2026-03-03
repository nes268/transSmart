import { useState, useEffect } from "react";
import { getMyTrips } from "../services/tripService";
import { createReview, getUserReviews } from "../services/reviewService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

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
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Reviews</h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem" }}>
        Rate and review completed trips
      </p>

      {completedTrips.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No completed trips to review yet.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {completedTrips.map((t) => (
            <div key={t._id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }}>
              <div>
                <div style={{ fontWeight: 600 }}>{t.job?.title || "Trip"}</div>
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  {t.job?.pickupLocation} → {t.job?.deliveryLocation}
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {formatDate(t.completedAt)}
                </div>
              </div>
              <button
                className="btn btn-primary"
                style={{ fontSize: "0.875rem" }}
                onClick={() => setShowReview(t)}
              >
                Write Review
              </button>
            </div>
          ))}
        </div>
      )}

      {showReview && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setShowReview(null)}
        >
          <div className="card" style={{ maxWidth: "400px", width: "90%" }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ marginBottom: "1rem" }}>Review: {showReview.job?.title}</h3>
            {error && (
              <div style={{ padding: "0.75rem", background: "rgba(239,68,68,0.2)", color: "var(--color-error)", borderRadius: "var(--radius)", marginBottom: "1rem" }}>
                {error}
              </div>
            )}
            <form onSubmit={handleSubmitReview}>
              <div className="form-group">
                <label>Rating (1-5)</label>
                <select value={rating} onChange={(e) => setRating(Number(e.target.value))}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} star{n > 1 ? "s" : ""}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Comment (optional)</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Share your experience..." />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" className="btn btn-primary" disabled={submitLoading}>
                  {submitLoading ? "Submitting..." : "Submit Review"}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowReview(null)}>
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
