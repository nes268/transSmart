import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { SocketProvider } from "./context/SocketContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import RoleBasedRoute from "./components/common/RoleBasedRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

import ShipperLayout from "./layouts/ShipperLayout";
import TransporterLayout from "./layouts/TransporterLayout";
import AdminLayout from "./layouts/AdminLayout";
import MainLayout from "./layouts/MainLayout";

import ShipperDashboard from "./pages/ShipperDashboard";
import CreateJob from "./pages/CreateJob";
import ShipperJobs from "./pages/ShipperJobs";
import ShipperTrips from "./pages/ShipperTrips";

import TransporterDashboard from "./pages/TransporterDashboard";
import BrowseJobs from "./pages/BrowseJobs";
import MyTrucks from "./pages/MyTrucks";
import MyTrips from "./pages/MyTrips";

import AdminDashboard from "./pages/AdminDashboard";
import AdminUsers from "./pages/AdminUsers";
import AdminJobs from "./pages/AdminJobs";
import AdminStats from "./pages/AdminStats";

import JobDetails from "./pages/JobDetails";
import TripDetails from "./pages/TripDetails";
import PaymentHistory from "./pages/PaymentHistory";
import Notifications from "./pages/Notifications";
import Reviews from "./pages/Reviews";
import UserReviews from "./pages/UserReviews";
import AI from "./pages/AI";

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <BrowserRouter>
          <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route
            path="/shipper"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["shipper"]}>
                  <ShipperLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/shipper/dashboard" replace />} />
            <Route path="dashboard" element={<ShipperDashboard />} />
            <Route path="jobs" element={<ShipperJobs />} />
            <Route path="jobs/new" element={<CreateJob />} />
            <Route path="trips" element={<ShipperTrips />} />
          </Route>

          <Route
            path="/transporter"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["transporter"]}>
                  <TransporterLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/transporter/dashboard" replace />} />
            <Route path="dashboard" element={<TransporterDashboard />} />
            <Route path="jobs" element={<BrowseJobs />} />
            <Route path="trucks" element={<MyTrucks />} />
            <Route path="trips" element={<MyTrips />} />
          </Route>

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleBasedRoute allowedRoles={["admin"]}>
                  <AdminLayout />
                </RoleBasedRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="analytics" element={<AdminStats />} />
          </Route>

          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="jobs/:id" element={<JobDetails />} />
            <Route path="trips/:id" element={<TripDetails />} />
            <Route path="payments" element={<PaymentHistory />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="reviews" element={<Reviews />} />
            <Route path="reviews/user/:userId" element={<UserReviews />} />
            <Route path="ai" element={<AI />} />
          </Route>

          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
