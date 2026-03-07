import { useState, useEffect } from "react";
import { smartMatch, optimizeRoute } from "../services/aiService";
import { getAllJobs } from "../services/jobService";
import { createTruckRequest } from "../services/truckRequestService";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/common/Loader";
import RouteMap from "../components/maps/RouteMap";
import { Sparkles, MapPin, Zap, Send } from "lucide-react";

export default function AI() {
  const { user } = useAuth();
  const socket = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const isTransporter = user?.role === "transporter";
  const [activeTab, setActiveTab] = useState("match");
  const [matchJobId, setMatchJobId] = useState("");
  const [matchResult, setMatchResult] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [routeForm, setRouteForm] = useState({
    jobId: "",
    fuelType: "diesel",
    fuelEfficiency: "5",
  });
  const [routeResult, setRouteResult] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [error, setError] = useState("");
  const [requestModal, setRequestModal] = useState(null);
  const [requestMessage, setRequestMessage] = useState("");
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState("");

  useEffect(() => {
    if (user?.role === "transporter" && activeTab === "match") {
      setActiveTab("route");
    }
  }, [user?.role]);

  useEffect(() => {
    getAllJobs({ status: "open" })
      .then((res) => setJobs(res.data || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket?.connected || !routeForm.jobId) return;
    socket.emit("joinJobRoom", routeForm.jobId);
  }, [socket?.connected, routeForm.jobId]);

  useEffect(() => {
    if (!socket?.connected) return;
    const handler = ({ jobId, optimizedRoute }) => {
      if (jobId === routeForm.jobId) {
        setRouteResult({
          distance_km: optimizedRoute.distance,
          duration_minutes: Math.round(optimizedRoute.duration / 60),
          fuel_used_liters: optimizedRoute.fuelUsed,
          fuel_cost: optimizedRoute.fuelCost,
          greenScore: optimizedRoute.greenScore,
          steps: optimizedRoute.steps,
          geometry: optimizedRoute.geometry,
        });
      }
    };
    socket.on("job:optimizedRoute", handler);
    return () => socket.off("job:optimizedRoute", handler);
  }, [socket?.connected, routeForm.jobId]);

  const handleSmartMatch = async (e) => {
    e.preventDefault();
    if (!matchJobId) return;
    setError("");
    setMatchLoading(true);
    setMatchResult(null);
    try {
      const res = await smartMatch(matchJobId);
      setMatchResult(res.suggestion);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Smart match failed. AI engine may not be configured."
      );
    } finally {
      setMatchLoading(false);
    }
  };

  const openRequestModal = (truck) => {
    setRequestModal(truck);
    setRequestMessage("");
    setRequestError("");
  };

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!requestModal || !matchJobId) return;
    setRequestError("");
    setRequestLoading(true);
    try {
      await createTruckRequest(requestModal._id, matchJobId, requestMessage);
      setRequestModal(null);
    } catch (err) {
      setRequestError(err.response?.data?.message || "Failed to send request");
    } finally {
      setRequestLoading(false);
    }
  };

  const handleOptimizeRoute = async (e) => {
    e.preventDefault();
    if (!routeForm.jobId) return;
    setError("");
    setRouteLoading(true);
    setRouteResult(null);
    try {
      const res = await optimizeRoute(
        routeForm.jobId,
        routeForm.fuelType,
        parseFloat(routeForm.fuelEfficiency) || 5
      );
      setRouteResult(res.optimization);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Route optimization failed. Check pickup/delivery locations are valid."
      );
    } finally {
      setRouteLoading(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Tools</h1>
          <p className="page-subtitle">
            {isTransporter ? "Route optimization" : "Smart match and route optimization"}
          </p>
        </div>
      </div>

      {!isTransporter && (
        <div className="tab-group" style={{ marginBottom: "1.5rem" }}>
          <button
            className={`tab-btn${activeTab === "match" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("match");
              setError("");
              setMatchResult(null);
            }}
          >
            <Sparkles size={14} /> Smart Match
          </button>
          <button
            className={`tab-btn${activeTab === "route" ? " active" : ""}`}
            onClick={() => {
              setActiveTab("route");
              setError("");
              setRouteResult(null);
            }}
          >
            <MapPin size={14} /> Optimize Route
          </button>
        </div>
      )}

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === "match" && !isTransporter && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: "0.75rem" }}>
            <h2 className="section-title">Smart Match</h2>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-primary-light)",
                color: "var(--color-primary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={18} />
            </div>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Get AI-powered transporter suggestions for a job
          </p>
          <form onSubmit={handleSmartMatch}>
            <div className="form-group">
              <label>Select Job</label>
              <select
                value={matchJobId}
                onChange={(e) => setMatchJobId(e.target.value)}
                required
              >
                <option value="">Choose a job...</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} - ₹{j.price}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={matchLoading || jobs.length === 0}
            >
              {matchLoading ? "Finding match..." : "Get Suggestions"}
            </button>
          </form>
          {matchResult && (
            <div style={{ marginTop: "1.5rem" }}>
              {matchResult.suggestions && matchResult.suggestions.length > 0 ? (
                <>
                  <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                    {matchResult.suggestions.length} match(es) · Scanned {matchResult.totalScanned ?? 0} trucks
                  </p>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {matchResult.suggestions.map((s, i) => (
                      <div
                        key={s.truck?._id || i}
                        className="card card-hover"
                        style={{ padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.25rem" }}>
                          <span style={{ fontWeight: 600, fontSize: "1rem" }}>{s.truck?.truckNumber ?? "Truck"}</span>
                          <span style={{ fontWeight: 600, color: "var(--color-accent)", fontSize: "0.875rem" }}>
                            Score {s.score}
                          </span>
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>
                          {s.truck?.capacity} tons · {(s.truck?.fuelType ?? "-").charAt(0).toUpperCase() + (s.truck?.fuelType?.slice(1) || "")} · {s.truck?.availability ?? "-"}
                        </div>
                        {s.truck?.transporter && (
                          <div style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)" }}>
                            {s.truck.transporter.name}
                            {s.truck.transporter.phone && ` · ${s.truck.transporter.phone}`}
                          </div>
                        )}
                        {s.reasons && s.reasons.length > 0 && (
                          <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", borderTop: "1px solid var(--color-border)", paddingTop: "0.5rem", marginTop: "0.25rem" }}>
                            {s.reasons.join(" · ")}
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: "auto" }}
                          onClick={() => s.truck && openRequestModal(s.truck)}
                        >
                          <Send size={14} /> Send Request
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ padding: "1rem", background: "rgba(255,255,255,0.03)", borderRadius: "var(--radius)", border: "1px solid var(--color-border)", fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  No suitable trucks found. Try lowering required capacity or add more trucks.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {requestModal && activeTab === "match" && (
        <div className="modal-overlay" onClick={() => setRequestModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Send Request</h3>
            <p style={{ color: "var(--color-text-muted)", marginBottom: "1rem", fontSize: "0.875rem" }}>
              Request truck <strong>{requestModal.truckNumber}</strong>
              {requestModal.transporter?.name && <> from {requestModal.transporter.name}</>}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
              Job: {jobs.find((j) => j._id === matchJobId)?.title || "Selected job"}
            </p>
            {requestError && <div className="alert alert-error">{requestError}</div>}
            <form onSubmit={handleSendRequest}>
              <div className="form-group">
                <label>Message (optional)</label>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  placeholder="Add a note for the transporter..."
                  rows={3}
                  style={{ resize: "vertical" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={requestLoading}
                >
                  {requestLoading ? "Sending..." : "Send Request"}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setRequestModal(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {activeTab === "route" && (
        <div className="card">
          <div className="section-header" style={{ marginBottom: "0.75rem" }}>
            <h2 className="section-title">Optimize Route</h2>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "var(--radius-sm)",
                background: "var(--color-accent-light)",
                color: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Zap size={18} />
            </div>
          </div>
          <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
            Get optimized route for a job. The route is saved and shown to the transporter who accepts it.
          </p>
          <form onSubmit={handleOptimizeRoute}>
            <div className="form-group">
              <label>Select Job</label>
              <select
                value={routeForm.jobId}
                onChange={(e) => setRouteForm({ ...routeForm, jobId: e.target.value })}
                required
              >
                <option value="">Choose a job...</option>
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} — {j.pickupLocation} → {j.deliveryLocation}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  value={routeForm.fuelType}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, fuelType: e.target.value })
                  }
                >
                  <option value="diesel">Diesel</option>
                  <option value="petrol">Petrol</option>
                  <option value="electric">Electric</option>
                </select>
              </div>
              <div className="form-group">
                <label>Fuel Efficiency (km/L)</label>
                <input
                  type="number"
                  value={routeForm.fuelEfficiency}
                  onChange={(e) =>
                    setRouteForm({ ...routeForm, fuelEfficiency: e.target.value })
                  }
                  min="0.1"
                  step="0.1"
                />
              </div>
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={routeLoading || jobs.length === 0}
            >
              {routeLoading ? "Optimizing route..." : "Optimize Route"}
            </button>
          </form>
          {routeResult && (
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3 style={{ marginBottom: "0.75rem", fontSize: "0.9375rem", fontWeight: 600 }}>
                Optimized Route
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "0.5rem", marginBottom: "1rem" }}>
                <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Distance</span>
                  <div style={{ fontWeight: 600 }}>{routeResult.distance_km} km</div>
                </div>
                <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Est. Time</span>
                  <div style={{ fontWeight: 600 }}>~{routeResult.duration_minutes} min</div>
                </div>
                <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Est. Fuel Cost</span>
                  <div style={{ fontWeight: 600 }}>₹{routeResult.fuel_cost}</div>
                </div>
                <div style={{ padding: "0.5rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)" }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>Green Score</span>
                  <div style={{ fontWeight: 600, color: "var(--color-success)" }}>{routeResult.greenScore}/100</div>
                </div>
              </div>
              {routeResult.geometry ? (
                <RouteMap
                  geometry={routeResult.geometry}
                  pickupLocation={jobs.find((j) => j._id === routeForm.jobId)?.pickupLocation}
                  deliveryLocation={jobs.find((j) => j._id === routeForm.jobId)?.deliveryLocation}
                />
              ) : (
                <div style={{ height: "200px", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--color-surface)", borderRadius: "var(--radius)", color: "var(--color-text-muted)" }}>
                  Map loading...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
