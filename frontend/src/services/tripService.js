import api from "./api";

export const createTrip = async (jobId, truckId) => {
  const res = await api.post("/trips", { jobId, truckId });
  return res.data;
};

export const getMyTrips = async () => {
  const res = await api.get("/trips");
  return res.data;
};

export const getShipperTrips = async () => {
  const res = await api.get("/trips/shipper");
  return res.data;
};

export const getTripById = async (id) => {
  const res = await api.get(`/trips/${id}`);
  return res.data;
};

export const updateTripStatus = async (id, status) => {
  const res = await api.put(`/trips/${id}/status`, { status });
  return res.data;
};

export const updateLiveLocation = async (id, lat, lng) => {
  const res = await api.patch(`/trips/${id}/location`, { lat, lng });
  return res.data;
};
