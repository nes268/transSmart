import { useState, useEffect } from "react";
import { getMyTruckRequests, acceptTruckRequest, rejectTruckRequest } from "../services/truckRequestService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { Send, User, Phone, Mail } from "lucide-react";

export default function TransporterRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = () => {
    getMyTruckRequests()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setRequests(list);
      })
      .catch(() => setRequests([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    setLoading(true);
    fetchRequests();
  }, []);

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const otherRequests = requests.filter((r) => r.status !== "pending");

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Truck Requests</h1>
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
                  <RequestCard key={r._id} request={r} onAccept={fetchRequests} onReject={fetchRequests} />
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

function RequestCard({ request, onAccept, onReject }) {
  const { shipper, job, truck, message, status, createdAt } = request;
  const [actionLoading, setActionLoading] = useState(null);
  const [actionError, setActionError] = useState("");

  const handleAccept = async () => {
    if (!request._id) return;
    setActionError("");
    setActionLoading("accept");
    try {
      await acceptTruckRequest(request._id);
      onAccept?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!request._id) return;
    setActionError("");
    setActionLoading("reject");
    try {
      await rejectTruckRequest(request._id);
      onReject?.();
    } catch (err) {
      setActionError(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

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
          {job && (
            <div
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem 0.75rem",
                background: "var(--color-surface)",
                borderRadius: "var(--radius-sm)",
                fontSize: "0.875rem",
              }}
            >
              <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Request for job:</span>
              <div style={{ fontWeight: 600, marginTop: "0.125rem" }}>{job.title}</div>
              <div style={{ color: "var(--color-text-secondary)" }}>
                {job.pickupLocation} → {job.deliveryLocation}
              </div>
              {job.requiredCapacity > 0 && (
                <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                  Required capacity: {job.requiredCapacity} tons
                </div>
              )}
            </div>
          )}
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
          {actionError && (
            <div className="alert alert-error" style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }}>{actionError}</div>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
          <span className={`badge badge-${status === "pending" ? "open" : status === "accepted" ? "completed" : "open"}`}>
            {status}
          </span>
          {status === "pending" && (
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleAccept}
                disabled={!!actionLoading}
              >
                {actionLoading === "accept" ? "..." : "Accept"}
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleReject}
                disabled={!!actionLoading}
              >
                {actionLoading === "reject" ? "..." : "Reject"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
