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
  FaUserCircle,
  FaExclamation,
  FaCheck
} from 'react-icons/fa';
import { getCurrentUserAPI, logoutAPI } from '../../api/authAPI';
import { getUserDetails } from '../../api/adminAPI';
import { 
  getAllNotifications, 
  getUnreadNotificationsCount, 
  markAllNotificationsAsRead,
  markNotificationAsRead 
} from '../../api/notificationAPI';
import UserDetails from './UserManagement/UserDetails';
import './AdminDashboard.css';

const Header = ({ title }) => {
  const [user, setUser] = useState(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  const navigate = useNavigate();
  
  // Récupérer l'utilisateur actuel
  useEffect(() => {
    const currentUser = getCurrentUserAPI();
    if (currentUser && currentUser.user) {
      setUser(currentUser.user);
    }
  }, []);
  
  // Récupérer les notifications et leur nombre
  useEffect(() => {
    if (user && user.role === 'administrateur') {
      fetchUnreadCount();
      
      // Rafraîchir les notifications toutes les 30 secondes
      const interval = setInterval(() => {
        fetchUnreadCount();
      }, 30000);
      
      return () => clearInterval(interval);
    }
  }, [user]);
  
  // Récupérer le nombre de notifications non lues
  const fetchUnreadCount = async () => {
    try {
      const response = await getUnreadNotificationsCount();
      setUnreadCount(response.count);
    } catch (error) {
      console.error('Erreur lors du comptage des notifications non lues:', error);
    }
  };
  
  // Récupérer les notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllNotifications();
      
      const formattedNotifications = response.notifications.map(notif => ({
        id: notif.id,
        text: notif.contenu,
        title: notif.titre,
        isRead: Boolean(notif.estLue),
        time: formatNotificationTime(notif.date_creation),
        type: notif.type,
        date: new Date(notif.date_creation),
        entiteId: notif.entite_id,
        entiteType: notif.entite_type
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };
  
  // Formater la date de la notification
  const formatNotificationTime = (dateString) => {
    const now = new Date();
    const notifDate = new Date(dateString);
    const diffMs = now - notifDate;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'À l\'instant';
    } else if (diffMins < 60) {
      return `Il y a ${diffMins} minute${diffMins > 1 ? 's' : ''}`;
    } else if (diffHours < 24) {
      return `Il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
    } else {
      return `Il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
    }
  };
  
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
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  };
  
  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      
      // Mettre à jour l'état local
      setNotifications(notifications.map(notif => 
        notif.id === notificationId 
          ? { ...notif, isRead: true } 
          : notif
      ));
      
      // Mettre à jour le compteur de notifications non lues
      setUnreadCount(prevCount => Math.max(0, prevCount - 1));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  };
  
  // Naviguer vers la page de détails de l'entité ou ouvrir un modal
  const handleNavigateToEntity = async (entiteType, entiteId, notification) => {
    if (!entiteType || !entiteId) return;
    
    // Fermer le dropdown des notifications
    setShowNotifications(false);
    
    // Marquer la notification comme lue
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }
    
    switch(entiteType) {
      case 'utilisateur':
        try {
          // Pour les utilisateurs, ouvrir le modal avec les détails au lieu de naviguer
          const userDetails = await getUserDetails(entiteId);
          setSelectedUser(userDetails);
          setShowUserDetails(true);
        } catch (error) {
          console.error("Erreur lors de la récupération des détails de l'utilisateur:", error);
        }
        break;
      case 'ticket':
        // Pour les tickets, naviguer vers la page de détails
        navigate(`/admin/tickets/${entiteId}`);
        break;
      default:
        break;
    }
  };
  
  // Fermer le modal des détails de l'utilisateur
  const handleCloseUserDetails = () => {
    setShowUserDetails(false);
    setSelectedUser(null);
  };
  
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
  
  // Ouvrir le panel de notifications
  const openNotifications = () => {
    setShowNotifications(true);
    // Déclencher une mise à jour des notifications
    fetchNotifications();
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
            onClick={openNotifications}
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
                    onClick={handleMarkAllAsRead}
                  >
                    Tout marquer comme lu
                  </button>
                )}
              </div>
              
              <div className="notification-body">
                {loading ? (
                  <div style={{ padding: '20px', textAlign: 'center' }}>
                    Chargement...
                  </div>
                ) : error ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>
                    <FaExclamation style={{ marginRight: '5px' }} />
                    {error}
                  </div>
                ) : notifications.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    Aucune notification
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div 
                      key={notif.id} 
                      className="notification-item"
                      style={{
                        backgroundColor: notif.isRead ? 'transparent' : 'rgba(255, 107, 1, 0.05)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        if (notif.entiteId && notif.entiteType) {
                          handleNavigateToEntity(notif.entiteType, notif.entiteId, notif);
                        } else if (!notif.isRead) {
                          handleMarkAsRead(notif.id);
                        }
                      }}
                    >
                      <div className={`notification-icon ${notif.type === 'ticket' ? 'primary' : notif.type === 'user' ? 'secondary' : 'accent'}`}>
                        {getNotificationIcon(notif.type)}
                      </div>
                      <div className="notification-content">
                        <div className="notification-title" style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>
                          {notif.title || 'Notification'}
                        </div>
                        <div className="notification-text">{notif.text}</div>
                        <div className="notification-time">{notif.time}</div>
                      </div>
                      {!notif.isRead && (
                        <div className="notification-action" title="Marquer comme lu" style={{ marginLeft: '8px' }}>
                          <FaCheck color="var(--primary, #FF6B01)" />
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
              
              <div className="notification-footer">
                <button 
                  className="view-all-link"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary, #FF6B01)',
                    cursor: 'pointer',
                    padding: '8px',
                    width: '100%',
                    textAlign: 'center',
                    fontSize: '0.9rem'
                  }}
                  onClick={() => {
                    setShowNotifications(false);
                    navigate('/admin/notifications');
                  }}
                >
                  Voir toutes les notifications
                </button>
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
      
      {/* Modal des détails d'utilisateur */}
      {showUserDetails && selectedUser && (
        <UserDetails 
          user={selectedUser} 
          onClose={handleCloseUserDetails}
          refreshUsers={() => {
            fetchUnreadCount();
            fetchNotifications();
          }} 
        />
      )}
    </header>
  );
};

export default Header;