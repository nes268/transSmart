import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyTrips } from "../services/tripService";
import { updateTripStatus, updateLiveLocation } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  useEffect(() => {
    getMyTrips()
      .then((res) => setTrips(res.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  const [locationLoading, setLocationLoading] = useState(null);

  const handleStatusUpdate = async (tripId, status) => {
    setActionLoading(tripId);
    try {
      await updateTripStatus(tripId, status);
      setTrips((prev) => prev.map((t) => (t._id === tripId ? { ...t, status } : t)));
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
          .then(() => setTrips((prev) => prev.map((t) => (t._id === tripId ? { ...t, currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } } : t))))
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
          .then(() => setTrips((prev) => prev.map((t) => (t._id === tripId ? { ...t, currentLocation: { lat, lng } } : t))))
          .catch(console.error)
          .finally(() => setLocationLoading(null));
      },
      () => {
        const lat = prompt("Geolocation failed. Enter latitude (e.g. 13.0827)");
        const lng = prompt("Enter longitude (e.g. 80.2707)");
        if (lat && lng) {
          updateLiveLocation(tripId, parseFloat(lat), parseFloat(lng))
            .then(() => setTrips((prev) => prev.map((t) => (t._id === tripId ? { ...t, currentLocation: { lat: parseFloat(lat), lng: parseFloat(lng) } } : t))))
            .catch(console.error);
        }
        setLocationLoading(null);
      }
    );
  };

  if (loading) return <Loader />;

  const statusFlow = { pending: "accepted", accepted: "in_transit", in_transit: "delivered", delivered: "completed" };

  return (
    <div>
      <h1 style={{ marginBottom: "1.5rem" }}>My Trips</h1>

      {trips.length === 0 ? (
        <div className="card" style={{ textAlign: "center", color: "var(--color-text-muted)" }}>
          No trips yet. Accept a job to start a trip.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {trips.map((t) => (
            <div key={t._id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{t.job?.title || "Job"}</div>
                  <div style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>
                    {t.job?.pickupLocation} → {t.job?.deliveryLocation}
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)", marginTop: "0.25rem" }}>
                    Truck: {t.truck?.truckNumber} • {formatDate(t.createdAt)}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span className={`badge badge-${t.status === "completed" ? "completed" : t.status === "in_transit" || t.status === "delivered" ? "accepted" : "open"}`}>
                    {t.status.replace("_", " ")}
                  </span>
                  <span style={{ fontWeight: 600, color: "var(--color-primary)" }}>₹{t.job?.price}</span>
                </div>
              </div>
              <div style={{ marginTop: "1rem", display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {t.status !== "completed" && statusFlow[t.status] && (
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: "0.875rem" }}
                    disabled={actionLoading === t._id}
                    onClick={() => handleStatusUpdate(t._id, statusFlow[t.status])}
                  >
                    {actionLoading === t._id ? "Updating..." : `Mark as ${statusFlow[t.status].replace("_", " ")}`}
                  </button>
                )}
                {(t.status === "in_transit" || t.status === "delivered") && (
                  <>
                    <button
                      className="btn btn-secondary"
                      style={{ fontSize: "0.875rem" }}
                      disabled={locationLoading === t._id}
                      onClick={() => handleUpdateLocation(t._id)}
                    >
                      {locationLoading === t._id ? "Updating..." : "Update Location"}
                    </button>
                    <Link to={`/trips/${t._id}`} className="btn btn-secondary" style={{ fontSize: "0.875rem" }}>
                      Live Map
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
