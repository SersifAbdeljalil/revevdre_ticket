// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import Navbar from './components/layout/Navbar';
import HomePage from './components/home/HomePage';
import { getCurrentUserAPI } from './api/authAPI';
import './App.css';

// Composant pour les routes protégées
const PrivateRoute = ({ element }) => {
  const user = getCurrentUserAPI();
  return user ? element : <Navigate to="/login" />;
};

const App = () => {
  return (
    <Router>
      <div className="app">
        <Routes>
          {/* Route pour la page d'accueil sans Navbar normale */}
          <Route path="/" element={<HomePage />} />
          
          {/* Routes avec Navbar (pour les autres pages) */}
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
        </Routes>
      </div>
    </Router>
  );
};

export default App;