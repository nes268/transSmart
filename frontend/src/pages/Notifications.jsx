import { useState, useEffect } from "react";
import { getMyNotifications, markNotificationRead } from "../services/notificationService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Bell, Check } from "lucide-react";

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
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error(err);
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
          {notifications.map((n) => (
            <div
              key={n._id}
              className="card card-hover"
              style={{ opacity: n.isRead ? 0.7 : 1 }}
            >
              <div className="list-item">
                <div>
                  <div
                    className="list-item-title"
                    style={{ fontWeight: n.isRead ? 400 : 600 }}
                  >
                    {n.message}
                  </div>
                  <div className="list-item-meta">{formatDate(n.createdAt)}</div>
                </div>
                {!n.isRead && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleMarkRead(n._id)}
                  >
                    <Check size={14} /> Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
