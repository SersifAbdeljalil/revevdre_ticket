// src/api/adminAPI.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

// Configurer axios pour vérifier que l'utilisateur est bien admin
const setupAdminRequest = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token && user.user.role === 'administrateur') {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    return true;
  }
  throw new Error('Non autorisé : droits administrateur requis');
};

// --- GESTION DES UTILISATEURS ---

// Récupérer tous les utilisateurs
export const getAllUsers = async () => {
  try {
    setupAdminRequest();
    const response = await axios.get(`${API_URL}/users`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Bloquer/débloquer un utilisateur
export const toggleUserBlock = async (userId, shouldBlock) => {
  try {
    setupAdminRequest();
    const response = await axios.put(`${API_URL}/users/${userId}/block`, { estBloque: shouldBlock });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Obtenir les détails d'un utilisateur
export const getUserDetails = async (userId) => {
  try {
    setupAdminRequest();
    const response = await axios.get(`${API_URL}/users/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- GESTION DES MATCHS ---

// Récupérer tous les matchs
export const getAllMatches = async () => {
  try {
    setupAdminRequest();
    const response = await axios.get(`${API_URL}/matches`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Ajouter un match
export const addMatch = async (matchData) => {
  try {
    setupAdminRequest();
    const response = await axios.post(`${API_URL}/matches`, matchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Supprimer un match
export const deleteMatch = async (matchId) => {
  try {
    setupAdminRequest();
    const response = await axios.delete(`${API_URL}/matches/${matchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mettre à jour un match
export const updateMatch = async (matchId, matchData) => {
  try {
    setupAdminRequest();
    const response = await axios.put(`${API_URL}/matches/${matchId}`, matchData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- STATISTIQUES ET RAPPORTS ---

// Obtenir les statistiques générales
export const getDashboardStats = async () => {
  try {
    setupAdminRequest();
    const response = await axios.get(`${API_URL}/stats/dashboard`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Obtenir les statistiques de vente par match
export const getMatchSalesStats = async (matchId) => {
  try {
    setupAdminRequest();
    const response = await axios.get(`${API_URL}/stats/matches/${matchId}/sales`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};