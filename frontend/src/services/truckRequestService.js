import api from "./api";

export const createTruckRequest = async (truckId, message = "") => {
  const res = await api.post("/truck-requests", { truckId, message });
  return res.data;
};

export const getMyTruckRequests = async () => {
  const res = await api.get("/truck-requests");
  return res.data;
};
