// src/App.js (extrait)
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import ForgotPassword from "./components/auth/ForgotPassword";
import VerifyCode from "./components/auth/VerifyCode";
import ResetPassword from "./components/auth/ResetPassword";
import HomePage from "./components/home/HomePage";
import AdminDashboard from "./components/admin/AdminDashboard";
import UsersList from "./components/admin/UserManagement/UsersList";
import MatchesList from "./components/admin/MatchManagement/MatchesList";
import TicketsList from "./components/admin/TicketManagement/TicketsList";
import TicketDetail from "./components/admin/TicketManagement/TicketDetails";
import AdminNotifications from "./components/admin/Notifications/AdminNotifications";
import AdminHelpSupport from "./components/admin/HelpSupport/AdminHelpSupport";
import ClientMatchesList from "./components/client/MatchManagement/MatchesList";
import MatchState from "./components/client/MatchManagement/MatchState";
import CreateTicket from "./components/client/TicketManagement/CreateTicket";
import MyTickets from "./components/client/TicketManagement/MyTickets";
import ClientTicketsList from "./components/client/TicketManagement/TicketsList";
import ClientTicketDetail from "./components/client/TicketManagement/TicketDetail";
import EditTicket from "./components/client/TicketManagement/EditTicket";
import ConfirmPurchase from "./components/client/TicketManagement/ConfirmPurchase"; // Nouvelle importation
import { getCurrentUserAPI } from "./api/authAPI";
import "./App.css";

const PrivateRoute = ({ element, requiredRole = null }) => {
  const user = getCurrentUserAPI();
  if (!user) {
    return <Navigate to="/login" />;
  }
  if (requiredRole && user.user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  return element;
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-code" element={<VerifyCode />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<PrivateRoute element={<div className="container">Tableau de bord</div>} />} />
          <Route path="/tickets" element={<PrivateRoute element={<MyTickets />} />} />
          <Route path="/tickets/create" element={<PrivateRoute element={<CreateTicket />} />} />
          <Route path="/tickets/list" element={<PrivateRoute element={<ClientTicketsList />} />} />
          <Route path="/tickets/:id" element={<PrivateRoute element={<ClientTicketDetail />} />} />
          <Route path="/tickets/:id/edit" element={<PrivateRoute element={<EditTicket />} />} />
          <Route path="/tickets/:ticketId/purchase" element={<PrivateRoute element={<ConfirmPurchase />} />} /> {/* Nouvelle route */}
          <Route path="/profile" element={<PrivateRoute element={<div className="container">Mon profil</div>} />} />
          <Route path="/matches" element={<PrivateRoute element={<ClientMatchesList />} />} />
          <Route path="/matches/:id" element={<PrivateRoute element={<MatchState />} />} />
          <Route path="/admin" element={<PrivateRoute element={<AdminDashboard />} requiredRole="administrateur" />} />
          <Route path="/admin/users" element={<PrivateRoute element={<UsersList />} requiredRole="administrateur" />} />
          <Route path="/admin/matches" element={<PrivateRoute element={<MatchesList />} requiredRole="administrateur" />} />
          <Route path="/admin/tickets" element={<PrivateRoute element={<TicketsList />} requiredRole="administrateur" />} />
          <Route path="/admin/tickets/:id" element={<PrivateRoute element={<TicketDetail />} requiredRole="administrateur" />} />
          <Route path="/admin/notifications" element={<PrivateRoute element={<AdminNotifications />} requiredRole="administrateur" />} />
          <Route path="/admin/help" element={<PrivateRoute element={<AdminHelpSupport />} requiredRole="administrateur" />} />
          <Route path="/admin/stats" element={<PrivateRoute element={<div>Statistiques avancées (à implémenter)</div>} requiredRole="administrateur" />} />
          <Route path="/admin/settings" element={<PrivateRoute element={<div>Paramètres (à implémenter)</div>} requiredRole="administrateur" />} />
          <Route
            path="*"
            element={
              <div className="container">
                <h2>Page non trouvée</h2>
                <p>La page que vous recherchez n'existe pas.</p>
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
};

export default App;