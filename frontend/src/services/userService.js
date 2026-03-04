import api from "./api";

export const getMe = async () => {
  const res = await api.get("/users/me");
  return res.data;
};

export const updateProfile = async (data) => {
  const res = await api.patch("/users/me", data);
  return res.data;
};
