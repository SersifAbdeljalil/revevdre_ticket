// src/components/admin/Sidebar.js
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  FaTachometerAlt, 
  FaUsers, 
  FaCalendarAlt, 
  FaTicketAlt, 
  FaChartBar, 
  FaCog, 
  FaSignOutAlt,
  FaFootballBall,
  FaHome,
  FaMoneyBillWave,
  FaBell,
  FaQuestionCircle
} from 'react-icons/fa';
import { logoutAPI } from '../../api/authAPI';
import { getUnreadNotificationsCount } from '../../api/notificationAPI';
import './AdminDashboard.css';

const Sidebar = () => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);
  
  // Récupérer le nombre de notifications non lues
  useEffect(() => {
    fetchUnreadCount();
    
    // Rafraîchir le compteur toutes les 30 secondes
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);
  
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationsCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
    }
  };
  
  const handleLogout = () => {
    logoutAPI();
    navigate('/login');
  };
  
  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <FaFootballBall />
          </div>
          <h2>CAN 2025</h2>
        </div>
      </div>
      
      <div className="sidebar-menu">
        <div className="menu-section">
          <div className="menu-section-title">PRINCIPAL</div>
          <NavLink to="/admin" end className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaTachometerAlt /></span>
            Tableau de bord
          </NavLink>
          
          <NavLink to="/" className="menu-item">
            <span className="menu-icon"><FaHome /></span>
            Site principal
          </NavLink>
        </div>
        
        <div className="menu-section">
          <div className="menu-section-title">GESTION</div>
          <NavLink to="/admin/users" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaUsers /></span>
            Utilisateurs
          </NavLink>
          
          <NavLink to="/admin/matches" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaCalendarAlt /></span>
            Matchs
          </NavLink>
          
          <NavLink to="/admin/tickets" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaTicketAlt /></span>
            Tickets
          </NavLink>
        </div>
        
        <div className="menu-section">
          <div className="menu-section-title">RAPPORTS</div>
          
          
          <NavLink to="/admin/notifications" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaBell /></span>
            Notifications
            {unreadCount > 0 && (
              <span className="notification-badge sidebar-badge">
                {unreadCount}
              </span>
            )}
          </NavLink>
        </div>
        
        <div className="menu-section">
          <div className="menu-section-title">SYSTÈME</div>
          
          <NavLink to="/admin/help" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaQuestionCircle /></span>
            Aide & Support
          </NavLink>
          
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