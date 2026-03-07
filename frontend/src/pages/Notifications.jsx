import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getMyNotifications, markNotificationRead } from "../services/notificationService";
import { getTruckRequest } from "../services/truckRequestService";
import { useAuth } from "../hooks/useAuth";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Bell, Check } from "lucide-react";

export default function Notifications() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    getMyNotifications()
      .then((res) => setNotifications(res.data || []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleMarkRead = async (id) => {
    try {
      await markNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = async (n) => {
    if (n.type === "truck_request" && n.relatedId && user?.role === "transporter") {
      try {
        const res = await getTruckRequest(n.relatedId);
        const request = res?.data;
        if (request?.job?._id) {
          await handleMarkRead(n._id);
          navigate(`/jobs/${request.job._id}?request=${n.relatedId}`);
        }
      } catch (err) {
        console.error(err);
      }
    } else if (n.type === "job_accepted" && n.relatedId) {
      navigate(`/trips/${n.relatedId}`);
    } else if (n.type === "payment_done" && n.relatedId) {
      navigate("/payments");
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Notifications</h1>
      </div>

      {notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Bell size={32} className="empty-state-icon" />
            <p className="empty-state-text">No notifications.</p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {notifications.map((n) => {
            const isClickable = (n.type === "truck_request" && user?.role === "transporter") ||
              n.type === "job_accepted" || n.type === "payment_done";
            return (
              <div
                key={n._id}
                className={`card card-hover${isClickable ? " card-interactive" : ""}`}
                style={{ opacity: n.isRead ? 0.7 : 1 }}
                onClick={isClickable ? () => handleNotificationClick(n) : undefined}
              >
                <div className="list-item">
                  <div>
                    <div
                      className="list-item-title"
                      style={{ fontWeight: n.isRead ? 400 : 600 }}
                    >
                      {n.message}
                    </div>
                    <div className="list-item-meta">
                      {formatDate(n.createdAt)}
                      {isClickable && (
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--color-primary)" }}>
                          View →
                        </span>
                      )}
                    </div>
                  </div>
                  {!n.isRead && !isClickable && (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id); }}
                    >
                      <Check size={14} /> Mark read
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
