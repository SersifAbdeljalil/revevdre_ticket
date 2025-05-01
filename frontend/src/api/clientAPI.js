// src/api/clientAPI.js
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

// Récupérer tous les clients
export const getAllClients = async () => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des clients" };
  }
};

// Récupérer un client par son ID
export const getClientById = async (clientId) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/${clientId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération du client" };
  }
};

// Rechercher des clients
export const searchClients = async (searchTerm) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/search?q=${searchTerm}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la recherche de clients" };
  }
};

// Obtenir les statistiques des clients
export const getClientStats = async () => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/stats`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des statistiques" };
  }
};

// Ajouter un nouveau client rapidement (fonctionnalité spéciale pour création de ticket)
export const addQuickClient = async (clientData) => {
  try {
    setupAuthHeader();
    const response = await axios.post(`${API_URL}/admin/clients/quick`, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la création rapide du client" };
  }
};

// Exporter la liste des clients au format CSV
export const exportClientList = async () => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/export`, {
      responseType: 'blob'
    });
    
    // Créer un lien pour télécharger le fichier
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'liste-clients-can2025.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    return { success: true };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de l'exportation de la liste des clients" };
  }
};

// Obtenir les meilleurs clients (par nombre de tickets achetés)
export const getTopClients = async (limit = 10) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/top?limit=${limit}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des meilleurs clients" };
  }
};

// Mettre à jour les informations d'un client
export const updateClient = async (clientId, clientData) => {
  try {
    setupAuthHeader();
    const response = await axios.put(`${API_URL}/admin/clients/${clientId}`, clientData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la mise à jour du client" };
  }
};

// Bloquer/débloquer un client
export const toggleClientStatus = async (clientId, isBlocked) => {
  try {
    setupAuthHeader();
    const response = await axios.put(`${API_URL}/admin/clients/${clientId}/status`, { 
      estBloque: isBlocked 
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors du changement de statut du client" };
  }
};

// Envoyer un email à un client
export const sendEmailToClient = async (clientId, emailData) => {
  try {
    setupAuthHeader();
    const response = await axios.post(`${API_URL}/admin/clients/${clientId}/email`, emailData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de l'envoi de l'email au client" };
  }
};

// Obtenir l'historique des achats d'un client
export const getClientPurchaseHistory = async (clientId) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/${clientId}/purchases`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération de l'historique des achats" };
  }
};

// Vérifier si un email de client existe déjà (pour éviter les doublons)
export const checkClientEmailExists = async (email) => {
  try {
    setupAuthHeader();
    const response = await axios.get(`${API_URL}/admin/clients/check-email?email=${encodeURIComponent(email)}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la vérification de l'email" };
  }
};

export default {
  getAllClients,
  getClientById,
  searchClients,
  getClientStats,
  addQuickClient,
  exportClientList,
  getTopClients,
  updateClient,
  toggleClientStatus,
  sendEmailToClient,
  getClientPurchaseHistory,
  checkClientEmailExists
};
