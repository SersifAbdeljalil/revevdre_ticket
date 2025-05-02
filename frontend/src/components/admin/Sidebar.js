// src/components/admin/Sidebar.js
import React from 'react';
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
import './AdminDashboard.css';

const Sidebar = () => {
  const navigate = useNavigate();
  
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
          <NavLink to="/admin/stats" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaChartBar /></span>
            Statistiques
            <span className="badge badge-primary" style={{ 
              marginLeft: 'auto', 
              fontSize: '0.7rem', 
              padding: '3px 6px' 
            }}>
              Nouveau
            </span>
          </NavLink>
          
          <NavLink to="/admin/notifications" className={({isActive}) => isActive ? "menu-item active" : "menu-item"}>
            <span className="menu-icon"><FaBell /></span>
            Notifications
            <span style={{ 
              marginLeft: 'auto', 
              background: 'var(--primary)',
              color: 'white',
              fontSize: '0.7rem',
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              2
            </span>
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