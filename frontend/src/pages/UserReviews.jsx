import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserReviews } from "../services/reviewService";
import Loader from "../components/common/Loader";
import { ArrowLeft, Star, User } from "lucide-react";

export default function UserReviews() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserReviews(userId)
      .then((res) => setData(res))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <Loader />;
  if (!data)
    return <div className="alert alert-error">Failed to load reviews</div>;

  const { averageRating, count, data: reviews } = data;

  return (
    <div className="animate-in">
      <button
        onClick={() => navigate(-1)}
        className="back-link"
        style={{ background: "none", border: "none", cursor: "pointer" }}
      >
        <ArrowLeft size={16} /> Back
      </button>

      <div className="page-header">
        <h1 className="page-title">Reviews</h1>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "1.5rem",
            fontWeight: 700,
            color: "var(--color-primary)",
          }}
        >
          <Star size={24} fill="currentColor" />
          {averageRating}
        </div>
        <div style={{ color: "var(--color-text-muted)" }}>
          {count} review{count !== 1 ? "s" : ""}
        </div>
      </div>

      {reviews.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <User size={32} className="empty-state-icon" />
            <p className="empty-state-text">No reviews yet.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {reviews.map((r) => (
            <div key={r._id} className="card card-hover">
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "0.5rem",
                }}
              >
                <span className="list-item-title">
                  {r.reviewer?.name || "Anonymous"}
                </span>
                <span
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.25rem",
                    color: "var(--color-primary)",
                    fontWeight: 600,
                  }}
                >
                  <Star size={14} fill="currentColor" />
                  {r.rating}
                </span>
              </div>
              {r.comment && (
                <p
                  style={{
                    color: "var(--color-text-muted)",
                    fontSize: "0.875rem",
                    lineHeight: 1.5,
                  }}
                >
                  {r.comment}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
