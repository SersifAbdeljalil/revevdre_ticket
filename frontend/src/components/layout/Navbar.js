// src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logoutAPI, getCurrentUserAPI } from '../../api/authAPI';
import { FaTicketAlt, FaUserCircle, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const user = getCurrentUserAPI()?.user;
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
 
  const handleLogout = () => {
    logoutAPI();
    navigate('/login');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
 
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <FaTicketAlt className="logo-icon" />
          <span>Revente Tickets CAN 2025</span>
        </Link>

        {/* Menu burger pour mobile */}
        <div className="mobile-menu-icon" onClick={toggleMenu}>
          {isMenuOpen ? <FaTimes /> : <FaBars />}
        </div>
       
        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          {/* Navigation principale */}
          <div className="nav-links">
            <Link to="/tickets" className="nav-link">Tickets</Link>
            <Link to="/matchs" className="nav-link">Matchs</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
          </div>

          {/* Authentification */}
          {user ? (
            <div className="user-section">
              <div className="user-info">
                <FaUserCircle className="user-icon" />
                <span className="user-greeting">Bonjour, {user.nom}</span>
              </div>
              <div className="user-dropdown">
                <Link to="/profile" className="dropdown-item">Mon profil</Link>
                <Link to="/mes-tickets" className="dropdown-item">Mes tickets</Link>
                <Link to="/historique" className="dropdown-item">Historique d'achats</Link>
                <button className="logout-button" onClick={handleLogout}>
                  <FaSignOutAlt className="logout-icon" />
                  <span>Déconnexion</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login" className="auth-link login">Connexion</Link>
              <Link to="/signup" className="auth-link signup">Inscription</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;