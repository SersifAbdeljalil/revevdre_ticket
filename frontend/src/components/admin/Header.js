// src/components/admin/Header.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBars, 
  FaSignOutAlt, 
  FaBell, 
  FaSearch,
  FaTicketAlt,
  FaUsers,
  FaCog,
  FaUserCircle
} from 'react-icons/fa';
import { getCurrentUserAPI, logoutAPI } from '../../api/authAPI';
import './AdminDashboard.css';

const Header = ({ title }) => {
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { 
      id: 1, 
      text: "Nouveaux tickets vendus aujourd'hui: 25", 
      isRead: false, 
      time: "Il y a 1 heure",
      type: "ticket"
    },
    { 
      id: 2, 
      text: "5 nouveaux utilisateurs inscrits", 
      isRead: false, 
      time: "Il y a 3 heures",
      type: "user"
    },
    { 
      id: 3, 
      text: "Mise à jour système disponible", 
      isRead: true, 
      time: "Il y a 1 jour",
      type: "system"
    }
  ]);
  
  const navigate = useNavigate();
  
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
  
  // Marquer toutes les notifications comme lues
  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
  };
  
  // Nombre de notifications non lues
  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Fermer le menu de notifications quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event) => {
      const notifContainer = document.querySelector('.notification-wrapper');
      if (notifContainer && !notifContainer.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showNotifications]);
  
  // Obtenir l'icône pour le type de notification
  const getNotificationIcon = (type) => {
    switch(type) {
      case 'ticket':
        return <FaTicketAlt />;
      case 'user':
        return <FaUsers />;
      case 'system':
        return <FaCog />;
      default:
        return <FaBell />;
    }
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
        <div className="notification-wrapper" style={{ position: 'relative' }}>
          <button 
            className="notification-btn" 
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="Notifications"
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3 className="notification-title">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    className="mark-all-read"
                    onClick={markAllAsRead}
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              
              <div className="notification-body">
                {notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    Aucune notification
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className="notification-item"
                      style={{
                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(255, 107, 1, 0.05)'
                      }}
                    >
                      <div className={`notification-icon ${notif.type === 'ticket' ? 'primary' : notif.type === 'user' ? 'secondary' : 'accent'}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-text">{notif.text}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <div className="notification-footer">
                <a href="#" className="view-all-link">Voir toutes les notifications</a>
              </div>
            </div>
          )}
        </div>
        
        {user && (
          <div className="user-info">
            <div className="user-avatar">
              {getUserInitials()}
            </div>
            <div className="user-details">
              <div className="user-name">{user.nom || user.email.split('@')[0]}</div>
              <div className="user-role">Administrateur</div>
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