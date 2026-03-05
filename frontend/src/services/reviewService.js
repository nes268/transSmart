import api from "./api";

export const createReview = async (tripId, rating, comment) => {
  const res = await api.post("/reviews", { tripId, rating, comment });
  return res.data;
};

export const getMyReviews = async () => {
  const res = await api.get("/reviews/my");
  return res.data;
};

export const getUserReviews = async (userId) => {
  const res = await api.get(`/reviews/user/${userId}`);
  return res.data;
};
