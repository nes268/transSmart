import { useState, useEffect } from "react";
import { getMyTruckRequests } from "../services/truckRequestService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Send, Truck, User, Phone, Mail } from "lucide-react";

export default function TransporterRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyTruckRequests()
      .then((res) => setRequests(res.data || []))
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const otherRequests = requests.filter((r) => r.status !== "pending");

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Truck Requests</h1>
        <p className="page-subtitle">
          Requests from shippers interested in your trucks
        </p>
      </div>

      {requests.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <Send size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              No truck requests yet. Shippers can send requests when they browse
              trucks.
            </p>
          </div>
        </div>
      ) : (
        <>
          {pendingRequests.length > 0 && (
            <>
              <div className="section-header">
                <h2 className="section-title">Pending</h2>
              </div>
              <div className="list-stack" style={{ marginBottom: "2rem" }}>
                {pendingRequests.map((r) => (
                  <RequestCard key={r._id} request={r} />
                ))}
              </div>
            </>
          )}
          {otherRequests.length > 0 && (
            <>
              <div className="section-header">
                <h2 className="section-title">Past Requests</h2>
              </div>
              <div className="list-stack">
                {otherRequests.map((r) => (
                  <RequestCard key={r._id} request={r} />
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

function RequestCard({ request }) {
  const { shipper, truck, message, status, createdAt } = request;
  return (
    <div className="card card-hover">
      <div className="list-item">
        <div style={{ flex: 1 }}>
          <div className="list-item-title">
            {truck?.truckNumber || "Truck"} • {shipper?.name || "Shipper"}
          </div>
          <div className="list-item-sub" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "0.25rem" }}>
            <User size={14} />
            {shipper?.name}
            {shipper?.email && (
              <>
                <span style={{ margin: "0 0.25rem" }}>•</span>
                <Mail size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                <span style={{ opacity: 0.9 }}>{shipper.email}</span>
              </>
            )}
            {shipper?.phone && (
              <>
                <span style={{ margin: "0 0.25rem" }}>•</span>
                <Phone size={12} style={{ display: "inline", verticalAlign: "middle" }} />
                {shipper.phone}
              </>
            )}
          </div>
          {message && (
            <p
              style={{
                marginTop: "0.5rem",
                fontSize: "0.875rem",
                color: "var(--color-text-muted)",
                fontStyle: "italic",
              }}
            >
              &quot;{message}&quot;
            </p>
          )}
          <div className="list-item-meta" style={{ marginTop: "0.375rem" }}>
            {formatDate(createdAt)}
          </div>
        </div>
        <span className={`badge badge-${status === "pending" ? "open" : status === "accepted" ? "completed" : "open"}`}>
          {status}
        </span>
      </div>
    </div>
  );
}
