import React, { Suspense } from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicOnlyRoute from "./components/PublicOnlyRoute";
import Navbar from "./components/Navbar";
import { SendFeedback } from "./pages/user/SendFeedback";
import "./App.css";

// lazy pages
const Home = React.lazy(() => import("./pages/Home"));
const EventsList = React.lazy(() => import("./pages/EventsList"));
const EventDetail = React.lazy(() => import("./pages/EventDetail"));
const Login = React.lazy(() => import("./pages/auth/Login"));
const Register = React.lazy(() => import("./pages/auth/Register"));
const VerifyEmail = React.lazy(() => import("./pages/auth/VerifyEmail"));
const RequestResetOTP = React.lazy(() => import("./pages/auth/RequestResetOTP"));
const ResetPassword = React.lazy(() => import("./pages/auth/ResetPassword"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

// user pages
const UserDashboard = React.lazy(() => import("./pages/user/UserDashboard"));
const LikedEvents = React.lazy(() => import("./pages/user/LikedEvents"));
const MyQueries = React.lazy(() => import("./pages/user/MyQueries"));

// organizer pages
const OrganizerDashboard = React.lazy(() => import("./pages/organizer/OrganizerDashboard"));
const OrganizerEvents = React.lazy(() => import("./pages/organizer/OrganizerEvents"));
const OrganizerCreateEvent = React.lazy(() => import("./pages/organizer/OrganizerCreateEvent"));
const OrganizerEditEvent = React.lazy(() => import("./pages/organizer/OrganizerEditEvent"));
const OrganizerEventQueries = React.lazy(() => import("./pages/organizer/OrganizerEventQueries"));
const OrganizerEventStats = React.lazy(
  () => import("./pages/organizer/OrganizerEventStats")
);


function AppRoutes() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<EventsList />} />
        <Route path="/events/:id" element={<EventDetail />} />

        {/* Auth Pages (public only) */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-pass-otp" element={<RequestResetOTP />} />
          <Route path="/reset-password" element={<ResetPassword />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* User Only */}
        <Route element={<ProtectedRoute requiredUserType="user" />}>
          <Route path="/user" element={<UserDashboard />}>
            <Route index element={<div>User Home</div>} />
            <Route path="liked" element={<LikedEvents />} />
            <Route path="queries" element={<MyQueries />} />
          </Route>
          <Route path="/events/:id/feedback" element={<SendFeedback />} />
        </Route>

        {/* Organizer Only */}
        <Route element={<ProtectedRoute requiredUserType="organizer" />}>
          <Route path="/organizer" element={<OrganizerDashboard />}>
            <Route index element={<div>Organizer Home</div>} />
            <Route path="events" element={<OrganizerEvents />} />
            <Route path="events/create" element={<OrganizerCreateEvent />} />
            <Route path="events/:id/edit" element={<OrganizerEditEvent />} />
            <Route path="events/:id/queries" element={<OrganizerEventQueries />} />
            <Route path="events/:id/stats" element={<OrganizerEventStats />} />
          </Route>
        </Route>

        <Route path="/auth" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <AppRoutes />
        </main>
      </BrowserRouter>
    </AuthProvider>
    
  );
};

export default App;
