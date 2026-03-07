import { useState, useEffect } from "react";
import { getMyTrips, getShipperTrips } from "../services/tripService";
import { createReview, getMyReviews, getUserReviews } from "../services/reviewService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Star, Send } from "lucide-react";

export default function Reviews() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [reviewedTripIds, setReviewedTripIds] = useState([]);
  const [reviewsReceived, setReviewsReceived] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const isShipper = user?.role === "shipper";
        if (isShipper) {
          const [tripsRes, reviewsRes] = await Promise.all([
            getShipperTrips(),
            getMyReviews().catch(() => ({ data: [] })),
          ]);
          const list = Array.isArray(tripsRes?.data) ? tripsRes.data : [];
          setTrips(list);
          const reviews = Array.isArray(reviewsRes?.data) ? reviewsRes.data : [];
          setReviewedTripIds(reviews.map((r) => r.trip?.toString?.() || r.trip).filter(Boolean));
        } else {
          setTrips([]);
          setReviewedTripIds([]);
        }
        if (!isShipper && user?._id) {
          getUserReviews(user._id)
            .then((res) => setReviewsReceived(res))
            .catch(() => setReviewsReceived(null));
        } else {
          setReviewsReceived(null);
        }
      } catch {
        setTrips([]);
        setReviewedTripIds([]);
        setReviewsReceived(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user?.role, user?._id]);

  const completedTrips = trips
    .filter((t) => t.status === "completed")
    .filter((t) => !reviewedTripIds.includes(t._id?.toString?.() || t._id));

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
      setError("");
      setReviewedTripIds((prev) => [...prev, showReview._id?.toString?.() || showReview._id]);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitLoading(false);
    }
  };

  if (loading) return <Loader />;

  const isTransporter = user?.role === "transporter";
  const receivedList = reviewsReceived?.data || [];
  const hasReviewsReceived = isTransporter && receivedList.length > 0;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Reviews</h1>
          <p className="page-subtitle">
            {isTransporter ? "Reviews from shippers" : "Rate and review completed trips"}
          </p>
        </div>
      </div>

      {hasReviewsReceived && (
        <div className="card" style={{ marginBottom: "1.5rem" }}>
          <div className="section-header" style={{ marginBottom: "1rem" }}>
            <h3 className="section-title">Reviews you received</h3>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Star size={18} style={{ color: "var(--color-primary)" }} fill="currentColor" />
              <span style={{ fontWeight: 600 }}>{reviewsReceived.averageRating || "0"}</span>
              <span style={{ color: "var(--color-text-muted)", fontSize: "0.875rem" }}>
                ({receivedList.length} review{receivedList.length !== 1 ? "s" : ""})
              </span>
            </div>
          </div>
          <div className="list-stack">
            {receivedList.map((r) => (
              <div key={r._id} className="card card-hover" style={{ padding: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.5rem" }}>
                  <span className="list-item-title">{r.reviewer?.name || "Shipper"}</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "var(--color-primary)", fontWeight: 600 }}>
                    <Star size={14} fill="currentColor" />{r.rating}
                  </span>
                </div>
                {r.comment && (
                  <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", margin: 0, lineHeight: 1.5 }}>{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {(isTransporter && !hasReviewsReceived) || (!isTransporter && completedTrips.length === 0) ? (
        <div className="card">
          <div className="empty-state">
            <Star size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              {isTransporter ? "No reviews from shippers yet." : "No completed trips to review yet."}
            </p>
          </div>
        </div>
      ) : null}

      {!isTransporter && completedTrips.length > 0 && (
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
