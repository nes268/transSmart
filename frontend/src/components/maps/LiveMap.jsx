import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

function MapUpdater({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center?.lat && center?.lng) {
      map.setView([center.lat, center.lng], map.getZoom());
    }
  }, [center, map]);
  return null;
}

export default function LiveMap({ tripId, socket, initialLocation, onLocationReceived, isDriver = false, onSendLocation }) {
  const [location, setLocation] = useState(initialLocation || { lat: 13.0827, lng: 80.2707 });

  useEffect(() => {
    if (initialLocation?.lat && initialLocation?.lng) {
      setLocation(initialLocation);
    }
  }, [initialLocation]);

  useEffect(() => {
    if (!socket?.connected || !tripId) return;
    socket.emit("joinTrip", tripId);
  }, [tripId, socket?.connected]);

  useEffect(() => {
    if (!socket?.connected || !tripId) return;
    const handler = (data) => {
      setLocation({ lat: data.lat, lng: data.lng });
      onLocationReceived?.(data);
    };
    socket.on("liveLocation", handler);
    return () => socket.off("liveLocation", handler);
  }, [tripId, socket?.connected, onLocationReceived]);

  const handleMapClick = (e) => {
    if (isDriver && onSendLocation) {
      const { lat, lng } = e.latlng;
      setLocation({ lat, lng });
      onSendLocation(lat, lng);
    }
  };

  return (
    <div style={{ height: "400px", borderRadius: "var(--radius)", overflow: "hidden" }}>
      <MapContainer
        center={[location.lat, location.lng]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        onClick={handleMapClick}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapUpdater center={location} />
        <Marker position={[location.lat, location.lng]}>
          <Popup>Current location</Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
