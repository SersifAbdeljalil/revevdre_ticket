
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaTicketAlt, 
  FaUser, 
  FaSignOutAlt,
  FaFutbol, // Remplacement de FaFootballBall par FaFutbol
  FaHome,
  FaCalendarAlt,
  FaListAlt
} from 'react-icons/fa';
import { logoutAPI } from '../../api/authAPI';
import '../admin/AdminDashboard.css'; // Réutilisation du même CSS pour la cohérence

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutAPI();
    navigate('/login');
  };

  return (
    <div className="admin-sidebar"> {/* On garde la classe pour réutiliser le CSS */}
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaFutbol /> {/* Icône modifiée */}
          </div>
          <h2>CAN 2025</h2>
        </div>
      </div>

      <div className="sidebar-menu">
        <div className="menu-section">
          <div className="menu-section-title">PRINCIPAL</div>
          <NavLink to="/matches" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaCalendarAlt /></span>
            Matchs
          </NavLink>
          <NavLink to="/" className="menu-item">
            <span className="menu-icon"><FaHome /></span>
            Site principal
          </NavLink>
        </div>

        <div className="menu-section">
          <div className="menu-section-title">GESTION</div>
          <NavLink to="/tickets" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaTicketAlt /></span>
            Mes tickets
          </NavLink>
          <NavLink to="/tickets/list" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaListAlt /></span>
            Tickets disponibles
          </NavLink>
          <NavLink to="/profile" className={({ isActive }) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaUser /></span>
            Mon profil
          </NavLink>
        </div>

        <div className="menu-section">
          <div className="menu-section-title">SYSTÈME</div>
          <div className="menu-item" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <span className="menu-icon"><FaSignOutAlt /></span>
            Déconnexion
          </div>
        </div>
      </div>

      <div className="sidebar-footer">
        <div className="sidebar-footer-text">
          Revente Tickets CAN 2025 v1.0
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
