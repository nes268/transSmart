import { useState, useEffect } from "react";
import { getMyNotifications, markNotificationRead } from "../services/notificationService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function Notifications() {
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
      setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <Loader />;

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>Notifications</h1>

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No notifications.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {notifications.map((n) => (
            <div
              key={n._id}
              className="card"
              style={{
                opacity: n.isRead ? 0.8 : 1,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <div>
                <div style={{ fontWeight: n.isRead ? 400 : 600 }}>{n.message}</div>
                <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                  {formatDate(n.createdAt)}
                </div>
              </div>
              {!n.isRead && (
                <button className="btn btn-secondary" style={{ fontSize: "0.8125rem" }} onClick={() => handleMarkRead(n._id)}>
                  Mark read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
