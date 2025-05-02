// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navbar from './components/layout/Navbar';
import HomePage from './components/home/HomePage';
import AdminDashboard from './components/admin/AdminDashboard';
import UsersList from './components/admin/UserManagement/UsersList';
import MatchesList from './components/admin/MatchManagement/MatchesList';
import TicketsList from './components/admin/TicketManagement/TicketsList';
import TicketDetail from './components/admin/TicketManagement/TicketDetails';
import { getCurrentUserAPI } from './api/authAPI';
import './App.css';

// Composant pour les routes protégées
const PrivateRoute = ({ element, requiredRole = null }) => {
  const user = getCurrentUserAPI();
  
  // Si l'utilisateur n'est pas connecté, rediriger vers la connexion
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si un rôle spécifique est requis et que l'utilisateur n'a pas ce rôle, rediriger vers la page d'accueil
  if (requiredRole && user.user.role !== requiredRole) {
    return <Navigate to="/" />;
  }
  
  // Si tout est ok, afficher le composant demandé
  return element;
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Route pour la page d'accueil sans Navbar normale */}
          <Route path="/" element={<HomePage />} />
         
          {/* Routes d'authentification avec Navbar */}
          <Route path="/login" element={
            <>
              <Navbar />
              <Login />
            </>
          } />
          <Route path="/signup" element={
            <>
              <Navbar />
              <Signup />
            </>
          } />
          
          {/* Routes client avec Navbar */}
          <Route path="/dashboard" element={
            <>
              <Navbar />
              <PrivateRoute element={<div className="container">Tableau de bord</div>} />
            </>
          } />
          <Route path="/tickets" element={
            <>
              <Navbar />
              <PrivateRoute element={<div className="container">Mes tickets</div>} />
            </>
          } />
          <Route path="/profile" element={
            <>
              <Navbar />
              <PrivateRoute element={<div className="container">Mon profil</div>} />
            </>
          } />
          
          {/* Routes administrateur (sans Navbar, car la sidebar remplace ce rôle) */}
          <Route path="/admin" element={
            <PrivateRoute 
              element={<AdminDashboard />} 
              requiredRole="administrateur"
            />
          } />
          <Route path="/admin/users" element={
            <PrivateRoute 
              element={<UsersList />} 
              requiredRole="administrateur"
            />
          } />
          <Route path="/admin/matches" element={
            <PrivateRoute 
              element={<MatchesList />} 
              requiredRole="administrateur"
            />
          } />
          <Route path="/admin/tickets" element={
            <PrivateRoute 
              element={<TicketsList />} 
              requiredRole="administrateur"
            />
          } />
          {/* Ajout de la route pour les détails d'un ticket */}
          <Route path="/admin/tickets/:id" element={
            <PrivateRoute 
              element={<TicketDetail />} 
              requiredRole="administrateur"
            />
          } />
          <Route path="/admin/stats" element={
            <PrivateRoute 
              element={<div>Statistiques avancées (à implémenter)</div>} 
              requiredRole="administrateur"
            />
          } />
          <Route path="/admin/settings" element={
            <PrivateRoute 
              element={<div>Paramètres (à implémenter)</div>} 
              requiredRole="administrateur"
            />
          } />
          
          {/* Route 404 */}
          <Route path="*" element={
            <>
              <Navbar />
              <div className="container">
                <h2>Page non trouvée</h2>
                <p>La page que vous recherchez n'existe pas.</p>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
};

export default App;