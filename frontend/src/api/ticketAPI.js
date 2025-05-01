// src/api/ticketAPI.js
import axios from 'axios';
import { getCurrentUserAPI } from './authAPI';

const API_URL = 'http://localhost:5000/api';

// Configurer axios pour les requêtes authentifiées
const setupAuthHeader = () => {
  const user = getCurrentUserAPI();
  if (user && user.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    return true;
  }
  throw new Error('Utilisateur non authentifié');
};

// RÉCUPÉRATION DES TICKETS

// Récupérer tous les tickets (Admin uniquement)
export const getAllTickets = async () => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/tickets`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des tickets" };
  }
};

// Récupérer les tickets d'un client spécifique
export const getClientTickets = async (clientId) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/${clientId}/tickets`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des tickets du client" };
  }
};

// Récupérer les tickets pour un match spécifique
export const getMatchTickets = async (matchId) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/matches/${matchId}/tickets`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des tickets du match" };
  }
};

// Récupérer un ticket par son ID
export const getTicketById = async (ticketId) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération du ticket" };
  }
};

// GESTION DES TICKETS

// Ajouter un nouveau ticket
export const addTicket = async (ticketData) => {
  try {
    setupAuthHeader();
    const response = await axios.post(`${API_URL}/admin/tickets`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la création du ticket" };
  }
};

// Mettre à jour un ticket existant
export const updateTicket = async (ticketId, ticketData) => {
  try {
    setupAuthHeader();
    const response = await axios.put(`${API_URL}/admin/tickets/${ticketId}`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la mise à jour du ticket" };
  }
};

// Supprimer un ticket
export const deleteTicket = async (ticketId) => {
  try {
    setupAuthHeader();
    const response = await axios.delete(`${API_URL}/admin/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la suppression du ticket" };
  }
};

// OPÉRATIONS SPÉCIALES

// Renvoyer un ticket par email
export const resendTicket = async (ticketId) => {
  try {
    setupAuthHeader();
    const response = await axios.post(`${API_URL}/admin/tickets/${ticketId}/resend`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du renvoi du ticket par email" };
  }
};

// Valider un ticket (utilisation pour entrée au stade)
export const validateTicket = async (ticketId) => {
  try {
    setupAuthHeader();
    const response = await axios.post(`${API_URL}/admin/tickets/${ticketId}/validate`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la validation du ticket" };
  }
};

// Marquer un ticket comme revendu
export const markTicketAsResold = async (ticketId) => {
  try {
    setupAuthHeader();
    const response = await axios.put(`${API_URL}/admin/tickets/${ticketId}/resold`, { estRevendu: true });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du marquage du ticket comme revendu" };
  }
};

// RAPPORTS ET STATISTIQUES

// Télécharger le rapport de tous les tickets (format CSV)
export const downloadTicketReport = async () => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/tickets/report`, {
      responseType: 'blob'
    });
    
    // Créer un lien pour télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'rapport-tickets-can2025.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du téléchargement du rapport" };
  }
};

// Obtenir des statistiques sur les tickets
export const getTicketStats = async () => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/tickets/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des statistiques" };
  }
};

// Obtenir les dernières activités liées aux tickets
export const getTicketActivities = async (limit = 5) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/tickets/activities?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des activités" };
  }
};