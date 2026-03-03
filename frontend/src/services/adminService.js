import api from "./api";

export const getAllUsers = async () => {
  const res = await api.get("/admin/users");
  return res.data;
};

export const toggleBlockUser = async (id) => {
  const res = await api.patch(`/admin/users/${id}/block`);
  return res.data;
};

export const deleteUser = async (id) => {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAllJobsAdmin = async () => {
  const res = await api.get("/admin/jobs");
  return res.data;
};

export const deleteJob = async (id) => {
  const res = await api.delete(`/admin/jobs/${id}`);
  return res.data;
};

export const getPlatformStats = async () => {
  const res = await api.get("/admin/stats");
  return res.data;
};

export const getAdvancedAnalytics = async () => {
  const res = await api.get("/admin/analytics");
  return res.data;
};
