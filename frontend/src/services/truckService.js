import api from "./api";

export const addTruck = async (data) => {
  const res = await api.post("/trucks", data);
  return res.data;
};

export const getMyTrucks = async () => {
  const res = await api.get("/trucks");
  return res.data;
};

export const getAllTrucks = async () => {
  const res = await api.get("/trucks/browse");
  return res.data;
};

export const updateTruck = async (id, data) => {
  const res = await api.put(`/trucks/${id}`, data);
  return res.data;
};

export const changeAvailability = async (id, availability) => {
  const res = await api.patch(`/trucks/${id}/availability`, { availability });
  return res.data;
};
