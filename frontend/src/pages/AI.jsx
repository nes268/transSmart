import { useState, useEffect } from "react";
import { smartMatch, optimizeRoute } from "../services/aiService";
import { getAllJobs } from "../services/jobService";
import { useSocket } from "../context/SocketContext";
import Loader from "../components/common/Loader";
import RouteMap from "../components/maps/RouteMap";
import { Sparkles, MapPin, Zap } from "lucide-react";

export default function AI() {
  const socket = useSocket();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
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
          <p className="page-subtitle">Smart match and route optimization</p>
        </div>
      </div>

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

      {error && <div className="alert alert-error">{error}</div>}

      {activeTab === "match" && (
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
            <div
              style={{
                marginTop: "1.5rem",
                padding: "1rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: "var(--radius)",
                border: "1px solid var(--color-border)",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600 }}>Result</h3>
              <p style={{ color: "var(--color-text-muted)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                {matchResult.message}
              </p>
              {matchResult.job && (
                <div style={{ marginBottom: "1rem", padding: "0.75rem", background: "var(--color-surface)", borderRadius: "var(--radius-sm)" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginBottom: "0.25rem" }}>Job</div>
                  <div style={{ fontWeight: 600 }}>{matchResult.job.title}</div>
                  <div style={{ fontSize: "0.875rem" }}>{matchResult.job.pickupLocation} → {matchResult.job.deliveryLocation}</div>
                  {matchResult.job.requiredCapacity > 0 && (
                    <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>Required capacity: {matchResult.job.requiredCapacity} tons</div>
                  )}
                </div>
              )}
              {matchResult.suggestions && matchResult.suggestions.length > 0 ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                    Top matches ({matchResult.suggestions.length}) · Scanned {matchResult.totalScanned ?? 0} trucks
                  </div>
                  {matchResult.suggestions.map((s, i) => (
                    <div
                      key={s.truck?._id || i}
                      style={{
                        padding: "0.75rem",
                        background: "var(--color-surface)",
                        borderRadius: "var(--radius-sm)",
                        border: "1px solid var(--color-border)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "0.5rem" }}>
                        <div>
                          <span style={{ fontWeight: 600 }}>{s.truck?.truckNumber ?? "Truck"}</span>
                          <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                            {s.truck?.capacity} tons · {s.truck?.fuelType ?? "-"} · {s.truck?.availability ?? "-"}
                          </span>
                          {s.truck?.transporter && (
                            <div style={{ fontSize: "0.8125rem", marginTop: "0.25rem", color: "var(--color-text-secondary)" }}>
                              {s.truck.transporter.name}
                              {s.truck.transporter.phone && ` · ${s.truck.transporter.phone}`}
                            </div>
                          )}
                        </div>
                        <span style={{ fontWeight: 600, color: "var(--color-accent)" }}>Score: {s.score}</span>
                      </div>
                      {s.reasons && s.reasons.length > 0 && (
                        <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                          {s.reasons.join(" · ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                  No suitable trucks found. Try lowering required capacity or add more trucks.
                </div>
              )}
            </div>
          )}
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
