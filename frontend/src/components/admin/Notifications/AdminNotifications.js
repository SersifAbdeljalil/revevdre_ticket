// src/components/admin/Notifications/AdminNotifications.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaBell, 
  FaTicketAlt, 
  FaUsers, 
  FaCog, 
  FaTrash,
  FaExclamation,
  FaCheck,
  FaFilter
} from 'react-icons/fa';
import { 
  getAllNotifications, 
  markAllNotificationsAsRead, 
  markNotificationAsRead,
  deleteNotification
} from '../../../api/notificationAPI';
import { getUserDetails } from '../../../api/adminAPI';
import Header from '../Header';
import Sidebar from '../Sidebar';
import UserDetails from '../UserManagement/UserDetails';
import './AdminNotifications.css';

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  const navigate = useNavigate();
  
  // Récupérer toutes les notifications
  useEffect(() => {
    fetchNotifications();
  }, []);
  
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
        time: formatDate(notif.date_creation),
        type: notif.type,
        date: new Date(notif.date_creation),
        entiteId: notif.entite_id,
        entiteType: notif.entite_type
      }));
      
      setNotifications(formattedNotifications);
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      setError('Impossible de charger les notifications. Veuillez réessayer plus tard.');
    } finally {
      setLoading(false);
    }
  };
  
  // Formater la date
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  // Marquer toutes les notifications comme lues
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications(notifications.map(notif => ({ ...notif, isRead: true })));
    } catch (error) {
      console.error('Erreur lors de la mise à jour des notifications:', error);
    }
  };
  
  // Marquer une notification comme lue
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications(notifications.map(notif => 
        notif.id === notificationId ? { ...notif, isRead: true } : notif
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la notification:', error);
    }
  };
  
  // Supprimer une notification
  const handleDeleteNotification = async (notificationId) => {
    try {
      await deleteNotification(notificationId);
      setNotifications(notifications.filter(notif => notif.id !== notificationId));
    } catch (error) {
      console.error('Erreur lors de la suppression de la notification:', error);
    }
  };
  
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
  
  // Filtrer les notifications
  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.isRead;
    if (filter === 'user') return notif.type === 'user';
    if (filter === 'ticket') return notif.type === 'ticket';
    if (filter === 'system') return notif.type === 'system';
    return true;
  });
  
  // Naviguer vers la page de détails de l'entité ou ouvrir un modal
  const handleNavigateToEntity = async (entiteType, entiteId, notification) => {
    if (!entiteType || !entiteId) return;
    
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
  
  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="admin-content">
        <Header title="Notifications" />
        
        <main className="admin-main">
          <div className="admin-card">
            <div className="card-header">
              <h2>
                <FaBell style={{ marginRight: '10px' }} />
                Centre de notifications
              </h2>
              
              <div className="notification-actions">
                <div className="filter-container">
                  <FaFilter style={{ marginRight: '8px', color: '#555' }} />
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="all">Toutes</option>
                    <option value="unread">Non lues</option>
                    <option value="user">Utilisateurs</option>
                    <option value="ticket">Tickets</option>
                    <option value="system">Système</option>
                  </select>
                </div>
                
                {notifications.some(n => !n.isRead) && (
                  <button 
                    className="action-btn mark-all-read-btn"
                    onClick={handleMarkAllAsRead}
                  >
                    <FaCheck /> Tout marquer comme lu
                  </button>
                )}
              </div>
            </div>
            
            <div className="card-body">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Chargement des notifications...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <FaExclamation style={{ color: 'red', marginRight: '10px' }} />
                  <p>{error}</p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="empty-container">
                  <p>Aucune notification à afficher</p>
                </div>
              ) : (
                <div className="notifications-list">
                  {filteredNotifications.map(notification => (
                    <div 
                      key={notification.id}
                      className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                    >
                      <div className={`notification-icon ${notification.type}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      
                      <div 
                        className="notification-content"
                        onClick={() => {
                          if (notification.entiteId && notification.entiteType) {
                            handleNavigateToEntity(notification.entiteType, notification.entiteId, notification);
                          }
                        }}
                        style={{ 
                          cursor: notification.entiteId ? 'pointer' : 'default',
                          flex: 1
                        }}
                      >
                        <div className="notification-header">
                          <h3 className="notification-title">{notification.title}</h3>
                          <span className="notification-time">{notification.time}</span>
                        </div>
                        <p className="notification-text">{notification.text}</p>
                        
                        {notification.entiteId && notification.entiteType && (
                          <div className="notification-link">
                            Cliquez pour voir les détails
                          </div>
                        )}
                      </div>
                      
                      <div className="notification-actions">
                        {!notification.isRead && (
                          <button 
                            className="action-btn mark-read-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id);
                            }}
                            title="Marquer comme lu"
                          >
                            <FaCheck />
                          </button>
                        )}
                        
                        <button 
                          className="action-btn delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                          title="Supprimer"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
      
      {/* Modal des détails d'utilisateur */}
      {showUserDetails && selectedUser && (
        <UserDetails 
          user={selectedUser} 
          onClose={handleCloseUserDetails}
          refreshUsers={fetchNotifications} 
        />
      )}
    </div>
  );
};

export default AdminNotifications;