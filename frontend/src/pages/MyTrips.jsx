import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getMyTrips, updateTripStatus, updateLiveLocation } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { MapPin, Navigation, ArrowRightCircle, Map } from "lucide-react";

export default function MyTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [locationLoading, setLocationLoading] = useState(null);

  useEffect(() => {
    getMyTrips()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setTrips(list);
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

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

  const statusFlow = {
    pending: "accepted",
    accepted: "in_transit",
    in_transit: "delivered",
    delivered: "completed",
  };

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">My Trips</h1>
      </div>

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
