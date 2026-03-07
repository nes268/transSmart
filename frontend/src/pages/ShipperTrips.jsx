import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getShipperTrips } from "../services/tripService";
import { formatDate } from "../utils/formatDate";
import Loader from "../components/common/Loader";
import { MapPin, Navigation, Phone } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useSocket } from "../context/SocketContext";

export default function ShipperTrips() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getShipperTrips()
      .then((res) => {
        const list = Array.isArray(res?.data) ? res.data : [];
        setTrips(list);
      })
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (socket?.connected && user?._id) {
      socket.emit("joinUserRoom", user._id);
    }
  }, [socket?.connected, user?._id]);

  useEffect(() => {
    if (!socket?.connected || !user?._id) return;
    const handler = ({ trip }) => {
      if (trip) {
        setTrips((prev) => {
          const exists = prev.some((t) => t._id === trip._id);
          if (exists) return prev.map((t) => (t._id === trip._id ? trip : t));
          return [trip, ...prev];
        });
      }
    };
    socket.on("trip:created", handler);
    return () => socket.off("trip:created", handler);
  }, [socket?.connected, user?._id]);

  const activeTrips = trips.filter(
    (t) => t.status !== "completed" && t.status !== "delivered"
  );

  const TripCard = ({ trip }) => (
    <div className="card card-hover">
      <div className="list-item">
        <div>
          <div className="list-item-title">{trip.job?.title || "Trip"}</div>
          <div className="list-item-sub">
            {trip.job?.pickupLocation} → {trip.job?.deliveryLocation}
          </div>
          <div className="list-item-meta">
            Transporter: {trip.transporter?.name || "-"}
            {trip.transporter?.phone && (
              <> • <Phone size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {trip.transporter.phone}</>
            )}
            {" "}• Truck: {trip.truck?.truckNumber || "-"} • {formatDate(trip.startedAt)}
          </div>
        </div>
        <div className="list-item-actions">
          <span
            className={`badge badge-${
              trip.status === "completed"
                ? "completed"
                : trip.status === "in_transit" || trip.status === "delivered"
                ? "accepted"
                : "open"
            }`}
          >
            {trip.status.replace("_", " ")}
          </span>
          <span className="list-item-price">₹{trip.job?.price}</span>
          {(trip.status === "accepted" || trip.status === "in_transit" || trip.status === "delivered") && (
            <Link to={`/trips/${trip._id}`} className="btn btn-primary btn-sm">
              <Navigation size={14} /> Track
            </Link>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) return <Loader />;

  return (
    <div className="animate-in">
      <div className="page-header">
        <h1 className="page-title">Track</h1>
      </div>

      <div className="section-header">
        <h2 className="section-title">Active Trips</h2>
      </div>
      {activeTrips.length === 0 ? (
        <div className="card" style={{ marginBottom: "2rem" }}>
          <div className="empty-state">
            <MapPin size={32} className="empty-state-icon" />
            <p className="empty-state-text">
              No active trips. Trips appear here when a transporter accepts your job.
            </p>
          </div>
        </div>
      ) : (
        <div className="list-stack">
          {activeTrips.map((t) => (
            <TripCard key={t._id} trip={t} />
          ))}
        </div>
      )}
    </div>
  );
}
