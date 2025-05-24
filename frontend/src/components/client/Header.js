// src/components/client/Header.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaSignOutAlt, 
  FaSearch,
  FaUserCircle
} from 'react-icons/fa';
import { getCurrentUserAPI, logoutAPI } from '../../api/authAPI';
import '../admin/AdminDashboard.css'; // Réutilisation du même CSS pour la cohérence

const Header = ({ title }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const currentUser = getCurrentUserAPI();
    if (currentUser && currentUser.user) {
      setUser(currentUser.user);
    }
  }, []);

  const handleLogout = () => {
    logoutAPI();
    navigate('/login');
  };

  const toggleSidebar = () => {
    // Pour la version mobile
    const sidebar = document.querySelector('.admin-sidebar');
    if (sidebar) {
      sidebar.classList.toggle('active');
    }
  };

  // Fonction pour obtenir les initiales du nom d'utilisateur
  const getUserInitials = () => {
    if (!user || !user.nom) return "U";
    return user.nom.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <button className="menu-toggle" onClick={toggleSidebar}>
          <FaBars />
        </button>
        <h1>{title}</h1>
      </div>

      <div className="search-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <input 
          type="text" 
          className="search-input" 
          placeholder="Rechercher..." 
        />
        <FaSearch className="search-icon" />
      </div>

      <div className="user-menu">
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.nom || user.email.split('@')[0]}</div>
              <div className="user-role">Client</div>
            </div>
          </div>
        )}

        <button className="logout-btn" onClick={handleLogout}>
          <FaSignOutAlt /> Déconnexion
        </button>
      </div>
    </header>
  );
};

export default Header;