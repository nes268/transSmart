import api from "./api";

export const createTruckRequest = async (truckId, jobId, message = "") => {
  const res = await api.post("/truck-requests", { truckId, jobId, message });
  return res.data;
};

export const getMyTruckRequests = async () => {
  const res = await api.get("/truck-requests");
  return res.data;
};

export const acceptTruckRequest = async (id) => {
  const res = await api.put(`/truck-requests/${id}/accept`);
  return res.data;
};

export const rejectTruckRequest = async (id) => {
  const res = await api.put(`/truck-requests/${id}/reject`);
  return res.data;
};
