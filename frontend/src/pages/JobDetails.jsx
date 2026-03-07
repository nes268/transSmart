import { useState, useEffect } from "react";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import { getAllJobs, acceptJob, completeJob } from "../services/jobService";
import { getMyTrucks } from "../services/truckService";
import { createTrip, getMyTrips } from "../services/tripService";
import { getTruckRequest, acceptTruckRequest, rejectTruckRequest } from "../services/truckRequestService";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import RouteMap from "../components/maps/RouteMap";
import { ArrowLeft, MapPin, User, Star, CheckCircle2, Zap } from "lucide-react";

export default function JobDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const requestId = searchParams.get("request");
  const navigate = useNavigate();
  const { user } = useAuth();
  const socket = useSocket();
  const [job, setJob] = useState(null);
  const [trucks, setTrucks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTruck, setSelectedTruck] = useState("");
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [truckRequest, setTruckRequest] = useState(null);
  const [hasActiveTrip, setHasActiveTrip] = useState(false);

  useEffect(() => {
    getAllJobs()
      .then((res) => {
        const found = res.data?.find((j) => j._id === id);
        setJob(found || null);
      })
      .catch(() => setJob(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (user?.role === "transporter") {
      getMyTrips()
        .then((res) => {
          const list = Array.isArray(res?.data) ? res.data : [];
          const active = list.some(
            (t) => t.status === "accepted" || t.status === "in_transit" || t.status === "delivered"
          );
          setHasActiveTrip(active);
        })
        .catch(() => setHasActiveTrip(false));
    }
  }, [user?.role]);

  useEffect(() => {
    if (user?.role === "transporter" && showAcceptModal) {
      getMyTrucks()
        .then((res) => setTrucks(res.data || []))
        .catch(() => setTrucks([]));
    }
  }, [user?.role, showAcceptModal]);

  useEffect(() => {
    if (requestId && user?.role === "transporter") {
      getTruckRequest(requestId)
        .then((res) => setTruckRequest(res?.data))
        .catch(() => setTruckRequest(null));
    } else {
      setTruckRequest(null);
    }
  }, [requestId, user?.role]);

  useEffect(() => {
    if (!socket?.connected || !id) return;
    socket.emit("joinJobRoom", id);
  }, [socket?.connected, id]);

  useEffect(() => {
    if (!socket?.connected || !id) return;
    const handler = ({ jobId, optimizedRoute }) => {
      if (jobId === id) {
        setJob((prev) => (prev ? { ...prev, optimizedRoute } : null));
      }
    };
    socket.on("job:optimizedRoute", handler);
    return () => socket.off("job:optimizedRoute", handler);
  }, [socket?.connected, id]);

  const handleAccept = async () => {
    if (!selectedTruck) {
      setError("Please select a truck");
      return;
    }
    setError("");
    setActionLoading(true);
    try {
      await acceptJob(id);
      await createTrip(id, selectedTruck);
      setShowAcceptModal(false);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept job");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAcceptTruckRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await acceptTruckRequest(requestId);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to accept request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectTruckRequest = async () => {
    if (!requestId) return;
    setActionLoading(true);
    try {
      await rejectTruckRequest(requestId);
      setTruckRequest(null);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoading(false);
    }
  };

  const handleComplete = async () => {
    setActionLoading(true);
    try {
      await completeJob(id);
      navigate("/transporter");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to complete job");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!job)
    return <div className="alert alert-error">Job not found</div>;

  const isShipper = user?.role === "shipper";
  const isTransporter = user?.role === "transporter";
  const canAccept = isTransporter && job.status === "open" && !truckRequest && !hasActiveTrip;
  const hasPendingRequest = isTransporter && truckRequest?.status === "pending";
  const canComplete =
    isTransporter &&
    job.transporter?._id === user?._id &&
    job.status === "accepted";

  return (
    <div className="animate-in">
      <Link
        to={isShipper ? "/shipper" : isTransporter ? "/transporter" : "/admin"}
        className="back-link"
      >
        <ArrowLeft size={16} /> Back
      </Link>

      <div className="card" style={{ maxWidth: "720px" }}>
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.25rem" }}>
          <h1 className="page-title">{job.title}</h1>
          <span className={`badge badge-${job.status}`}>{job.status}</span>
        </div>

        <p style={{ color: "var(--color-text-muted)", marginBottom: "1.5rem", lineHeight: 1.6 }}>
          {job.description}
        </p>

        <div className="detail-grid" style={{ marginBottom: "1.5rem" }}>
          <div>
            <div className="detail-label">Pickup</div>
            <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin size={14} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
              {job.pickupLocation}
            </div>
          </div>
          <div>
            <div className="detail-label">Delivery</div>
            <div className="detail-value" style={{ display: "flex", alignItems: "center", gap: "0.375rem" }}>
              <MapPin size={14} style={{ color: "var(--color-success)", flexShrink: 0 }} />
              {job.deliveryLocation}
            </div>
          </div>
        </div>

        {job.optimizedRoute && (
          <div style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <Zap size={18} style={{ color: "var(--color-accent)" }} />
              <h3 style={{ fontSize: "0.9375rem", fontWeight: 600 }}>Optimized Route</h3>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
              <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Distance</span>
                <div style={{ fontWeight: 600 }}>{job.optimizedRoute.distance} km</div>
              </div>
              <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Est. Time</span>
                <div style={{ fontWeight: 600 }}>~{Math.round(job.optimizedRoute.duration / 60)} min</div>
              </div>
              <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Fuel Cost</span>
                <div style={{ fontWeight: 600 }}>₹{job.optimizedRoute.fuelCost}</div>
              </div>
              <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)", fontSize: "0.8125rem" }}>
                <span style={{ color: "var(--color-text-muted)" }}>Green Score</span>
                <div style={{ fontWeight: 600, color: "var(--color-success)" }}>{job.optimizedRoute.greenScore}/100</div>
              </div>
            </div>
            <RouteMap
              geometry={job.optimizedRoute.geometry}
              pickupLocation={job.pickupLocation}
              deliveryLocation={job.deliveryLocation}
            />
          </div>
        )}

        <div style={{ marginBottom: "1.25rem" }}>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              color: "var(--color-primary)",
              fontWeight: 700,
              fontSize: "1.375rem",
            }}
          >
            ₹{job.price}
          </span>
        </div>

        <div className="divider" />

        {job.shipper && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
            <User size={14} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ color: "var(--color-text-muted)" }}>Shipper:</span>
            <span>{job.shipper.name}</span>
            <span style={{ color: "var(--color-text-muted)" }}>({job.shipper.email})</span>
          </div>
        )}
        {job.transporter && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem", fontSize: "0.875rem" }}>
            <User size={14} style={{ color: "var(--color-text-muted)" }} />
            <span style={{ color: "var(--color-text-muted)" }}>Transporter:</span>
            <span>{job.transporter.name}</span>
            <span style={{ color: "var(--color-text-muted)" }}>({job.transporter.email})</span>
            <Link
              to={`/reviews/user/${job.transporter._id}`}
              className="btn btn-ghost btn-sm"
              style={{ marginLeft: "auto" }}
            >
              <Star size={14} /> Reviews
            </Link>
          </div>
        )}

        <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.5rem" }}>
          Created {formatDate(job.createdAt)}
        </div>

        {hasPendingRequest && (
          <div
            style={{
              marginTop: "1.5rem",
              padding: "1rem",
              background: "rgba(91, 143, 185, 0.1)",
              borderRadius: "var(--radius)",
              border: "1px solid var(--color-accent-light)",
            }}
          >
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              Truck request from {truckRequest.shipper?.name || "shipper"}
            </p>
            <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              {truckRequest.shipper?.name} requested your truck for this job. Accept to start the trip.
            </p>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                onClick={handleAcceptTruckRequest}
                disabled={actionLoading}
              >
                {actionLoading ? "Accepting..." : "Accept"}
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleRejectTruckRequest}
                disabled={actionLoading}
              >
                Reject
              </button>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
          {hasActiveTrip && isTransporter && job.status === "open" && (
            <div
              style={{
                padding: "0.75rem 1rem",
                background: "rgba(245, 158, 11, 0.1)",
                borderRadius: "var(--radius)",
                border: "1px solid rgba(245, 158, 11, 0.3)",
                fontSize: "0.875rem",
                color: "var(--color-warning)",
                fontWeight: 500,
              }}
            >
              Job now is pending. Complete your current trip to accept new jobs.
            </div>
          )}
          {canAccept && (
            <button
              className="btn btn-primary"
              onClick={() => setShowAcceptModal(true)}
              disabled={actionLoading}
            >
              <CheckCircle2 size={16} /> Accept Job
            </button>
          )}
          {canComplete && (
            <button
              className="btn btn-primary"
              onClick={handleComplete}
              disabled={actionLoading}
            >
              {actionLoading ? "Completing..." : "Mark Complete"}
            </button>
          )}
        </div>
      </div>

      {showAcceptModal && (
        <div className="modal-overlay" onClick={() => setShowAcceptModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Select Truck</h3>
            {trucks.filter((t) => t.availability === "available").length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                No available trucks. Add a truck first.
              </p>
            ) : (
              <>
                <div className="form-group">
                  <label>Truck</label>
                  <select
                    value={selectedTruck}
                    onChange={(e) => setSelectedTruck(e.target.value)}
                  >
                    <option value="">Choose...</option>
                    {trucks
                      .filter((t) => t.availability === "available")
                      .map((t) => (
                        <option key={t._id} value={t._id}>
                          {t.truckNumber} - {t.capacity} tons ({t.fuelType})
                        </option>
                      ))}
                  </select>
                </div>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <button
                    className="btn btn-primary"
                    onClick={handleAccept}
                    disabled={actionLoading || !selectedTruck}
                  >
                    {actionLoading ? "Accepting..." : "Accept"}
                  </button>
                  <button
                    className="btn btn-secondary"
                    onClick={() => setShowAcceptModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
