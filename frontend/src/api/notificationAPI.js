// src/api/notificationAPI.js
import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_URL = 'http://localhost:5000/api';
const NOTIFICATIONS_ENDPOINT = '/notifications';

// Configurer axios pour envoyer le token dans les headers
const setAuthToken = () => {
  try {
    const userStr = localStorage.getItem('user');
    if (!userStr) {
      console.warn('Aucun utilisateur trouvé dans localStorage');
      return false;
    }
    
    const user = JSON.parse(userStr);
    if (!user || !user.token) {
      console.warn('Aucun token trouvé dans les données utilisateur');
      return false;
    }
    
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration du token:', error);
    return false;
  }
};

// Récupérer toutes les notifications
export const getAllNotifications = async () => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour accéder aux notifications" };
    }
    
    const response = await axios.get(`${API_URL}${NOTIFICATIONS_ENDPOINT}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des notifications" };
  }
};

// Récupérer le nombre de notifications non lues
export const getUnreadNotificationsCount = async () => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour accéder aux notifications" };
    }
    
    const response = await axios.get(`${API_URL}${NOTIFICATIONS_ENDPOINT}/unread-count`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du comptage des notifications" };
  }
};

// Marquer une notification comme lue
export const markNotificationAsRead = async (notificationId) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour modifier les notifications" };
    }
    
    const response = await axios.put(`${API_URL}${NOTIFICATIONS_ENDPOINT}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la mise à jour de la notification" };
  }
};

// Marquer toutes les notifications comme lues
export const markAllNotificationsAsRead = async () => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour modifier les notifications" };
    }
    
    const response = await axios.put(`${API_URL}${NOTIFICATIONS_ENDPOINT}/read-all`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la mise à jour des notifications" };
  }
};

// Supprimer une notification
export const deleteNotification = async (notificationId) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour supprimer les notifications" };
    }
    
    const response = await axios.delete(`${API_URL}${NOTIFICATIONS_ENDPOINT}/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la suppression de la notification" };
  }
};