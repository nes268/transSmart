const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

global.io = io;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/jobs", require("./routes/jobRoutes"));
const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);
const truckRoutes = require("./routes/truckRoutes");
app.use("/api/trucks", truckRoutes);
app.use("/api/truck-requests", require("./routes/truckRequestRoutes"));
const tripRoutes = require("./routes/tripRoutes");
app.use("/api/trips", tripRoutes);
const paymentRoutes = require("./routes/paymentRoutes");
app.use("/api/payments", paymentRoutes);
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);
const adminRoutes = require("./routes/adminRoutes");
app.use("/api/admin", adminRoutes);
const aiRoutes = require("./routes/aiRoutes");
app.use("/api/ai", aiRoutes);
const notificationRoutes = require("./routes/notificationRoutes");
app.use("/api/notifications", notificationRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("TransSmart API Running...");
});

const errorHandler = require("./middleware/errorMiddleware");
app.use(errorHandler);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // Join trip room
  socket.on("joinTrip", (tripId) => {
    socket.join(tripId);
    console.log(`Socket joined trip ${tripId}`);
  });

  // Join personal user room for notifications
  socket.on("joinUserRoom", (userId) => {
    socket.join(userId);
  });

  // Driver sending live location
  socket.on("locationUpdate", ({ tripId, lat, lng }) => {
    io.to(tripId).emit("liveLocation", {
      lat,
      lng,
      timestamp: new Date(),
    });
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});