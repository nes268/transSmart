import api from "./api";

export const getShipperDashboard = async () => {
  const res = await api.get("/dashboard/shipper");
  return res.data;
};

export const getTransporterDashboard = async () => {
  const res = await api.get("/dashboard/transporter");
  return res.data;
};
