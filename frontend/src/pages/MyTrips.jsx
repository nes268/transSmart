import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyTrips, updateTripStatus, updateLiveLocation } from "../services/tripService";
import { getReturnLoads } from "../services/jobService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { MapPin, Navigation, ArrowRightCircle, Map, Package } from "lucide-react";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [locationLoading, setLocationLoading] = useState(null);
  const [pickupNearby, setPickupNearby] = useState({ loading: false, data: [], dropLocation: "", error: false, expanded: false });

  useEffect(() => {
    getMyTrips()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setTrips(list);
        return list;
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  // Fetch Pickup Nearby when trips load - use most recent completed/delivered trip's drop location
  useEffect(() => {
    const latestCompleted = trips
      .filter((t) => (t.status === "completed" || t.status === "delivered") && t.job)
      .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))[0];
    if (!latestCompleted) return;
    const jobId = latestCompleted.job?._id || latestCompleted.job;
    if (!jobId) return;
    setPickupNearby((p) => ({ ...p, loading: true, error: false }));
    getReturnLoads(jobId)
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setPickupNearby({ loading: false, data: list, dropLocation: res?.deliveryLocation || latestCompleted.job?.deliveryLocation, error: false });
      })
      .catch(() => setPickupNearby((p) => ({ ...p, loading: false, data: [], error: true })));
  }, [trips]);

  const handleStatusUpdate = async (tripId, status) => {
    setActionLoading(tripId);
    try {
      await updateTripStatus(tripId, status);
      setTrips((prev) =>
        prev.map((t) => (t._id === tripId ? { ...t, status } : t))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateLocation = (tripId) => {
    setLocationLoading(tripId);
    if (!navigator.geolocation) {
      const lat = prompt("Enter latitude (e.g. 13.0827)");
      const lng = prompt("Enter longitude (e.g. 80.2707)");
      if (lat && lng) {
        updateLiveLocation(tripId, parseFloat(lat), parseFloat(lng))
          .then(() =>
            setTrips((prev) =>
              prev.map((t) =>
                t._id === tripId
                  ? { ...t, currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } }
                  : t
              )
            )
          )
          .catch(console.error)
          .finally(() => setLocationLoading(null));
      } else {
        setLocationLoading(null);
      }
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        updateLiveLocation(tripId, lat, lng)
          .then(() =>
            setTrips((prev) =>
              prev.map((t) =>
                t._id === tripId ? { ...t, currentLocation: { lat, lng } } : t
              )
            )
          )
          .catch(console.error)
          .finally(() => setLocationLoading(null));
      },
      () => {
        const lat = prompt("Geolocation failed. Enter latitude (e.g. 13.0827)");
        const lng = prompt("Enter longitude (e.g. 80.2707)");
        if (lat && lng) {
          updateLiveLocation(tripId, parseFloat(lat), parseFloat(lng))
            .then(() =>
              setTrips((prev) =>
                prev.map((t) =>
                  t._id === tripId
                    ? { ...t, currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } }
                    : t
                )
              )
            )
            .catch(console.error);
        }
        setLocationLoading(null);
      }
    );
  };

  if (loading) return <Loader />;

  const hasCompletedTrip = trips.some((t) => (t.status === "completed" || t.status === "delivered") && t.job);

  const statusFlow = {
    pending: "accepted",
    accepted: "in_transit",
    in_transit: "delivered",
    delivered: "completed",
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">My Trips</h1>
          <p className="page-subtitle">Manage your trips and find pickups nearby after delivery</p>
        </div>
      </div>

      {/* Pickup Nearby - button to expand, based on latest drop location */}
      {hasCompletedTrip && (
        <div style={{ marginBottom: "1.5rem" }}>
          {!pickupNearby.expanded ? (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setPickupNearby((p) => ({ ...p, expanded: true }))}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <Package size={18} style={{ color: "var(--color-success)" }} />
              Pickup Nearby
            </button>
          ) : (
            <div className="card" style={{ marginBottom: 0 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <Package size={20} style={{ color: "var(--color-success)" }} />
                  <h2 style={{ fontSize: "1rem", fontWeight: 600, margin: 0 }}>Pickup Nearby</h2>
                </div>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => setPickupNearby((p) => ({ ...p, expanded: false }))}
                >
                  Hide
                </button>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)", marginBottom: "1rem" }}>
                Jobs near your last drop location
              </p>
              {pickupNearby.loading ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>Loading...</p>
              ) : pickupNearby.error ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-error)" }}>Could not load pickups nearby.</p>
              ) : !pickupNearby.data?.length ? (
                <p style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>No pickups nearby right now.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {pickupNearby.data.map((job) => (
                    <div
                      key={job._id}
                      className="card card-hover"
                      style={{
                        padding: "0.75rem 1rem",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.25rem",
                        background: "var(--color-surface)",
                      }}
                    >
                      <div style={{ fontWeight: 600, fontSize: "0.9375rem" }}>{job.title}</div>
                      <div style={{ fontSize: "0.8125rem", color: "var(--color-text-muted)" }}>
                        {job.pickupLocation} → {job.deliveryLocation}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "var(--color-text-secondary)" }}>
                        {job.requiredCapacity ? `${job.requiredCapacity} tons • ` : ""}₹{job.price}
                      </div>
                      <Link
                        to={`/jobs/${job._id}`}
                        className="btn btn-primary btn-sm"
                        style={{ marginTop: "0.5rem", alignSelf: "flex-start" }}
                      >
                        Accept Return Load
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {trips.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <MapPin size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              No trips yet. Accept a job to start a trip.
            </p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {trips.map((t) => (
            <div key={t._id} className="card card-hover">
              <div className="list-item">
                <div>
                  <div className="list-item-title">{t.job?.title || "Job"}</div>
                  <div className="list-item-sub">
                    {t.job?.pickupLocation} → {t.job?.deliveryLocation}
                  </div>
                  <div className="list-item-meta">
                    Truck: {t.truck?.truckNumber} • {formatDate(t.createdAt)}
                    {t.status === "completed" && (
                      <span style={{ marginLeft: "0.5rem" }}>
                        • <span className={`badge badge-${t.paymentStatus === "paid" ? "paid" : "pending"}`}>
                          {t.paymentStatus === "paid" ? "Paid" : "Yet to Pay"}
                        </span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="list-item-actions">
                  <span
                    className={`badge badge-${
                      t.status === "completed"
                        ? "completed"
                        : t.status === "in_transit" || t.status === "delivered"
                        ? "accepted"
                        : "open"
                    }`}
                  >
                    {t.status.replace("_", " ")}
                  </span>
                  <span className="list-item-price">₹{t.job?.price}</span>
                </div>
              </div>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {t.status !== "completed" && statusFlow[t.status] && (
                  <button
                    className="btn btn-primary btn-sm"
                    disabled={actionLoading === t._id}
                    onClick={() => handleStatusUpdate(t._id, statusFlow[t.status])}
                  >
                    <ArrowRightCircle size={14} />
                    {actionLoading === t._id
                      ? "Updating..."
                      : `Mark as ${statusFlow[t.status].replace("_", " ")}`}
                  </button>
                )}
                {(t.status === "in_transit" || t.status === "delivered") && (
                  <>
                    <button
                      className="btn btn-secondary btn-sm"
                      disabled={locationLoading === t._id}
                      onClick={() => handleUpdateLocation(t._id)}
                    >
                      <Navigation size={14} />
                      {locationLoading === t._id ? "Updating..." : "Update Location"}
                    </button>
                    <Link to={`/trips/${t._id}`} className="btn btn-secondary btn-sm">
                      <Map size={14} /> Live Map
                    </Link>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
