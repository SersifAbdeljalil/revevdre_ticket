import axios from 'axios';

const API_URL = 'http://localhost:5000/api/client';

const setupAuthRequest = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    return user;
  }
  throw new Error('Non autorisé : utilisateur non connecté');
};

// --- Gestion du Profil ---
export const getProfile = async () => {
  try {
    const user = setupAuthRequest();
    const response = await axios.get(`${API_URL}/profile`, { params: { id: user.id } });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updateProfile = async (data) => {
  try {
    setupAuthRequest();
    const response = await axios.put(`${API_URL}/profile`, data);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const updatePassword = async (motDePasse) => {
  try {
    setupAuthRequest();
    const response = await axios.put(`${API_URL}/profile/password`, { motDePasse });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const requestAccountDeletion = async () => {
  try {
    setupAuthRequest();
    const response = await axios.post(`${API_URL}/profile/delete-request`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- Gestion des Matchs ---
export const getAllMatches = async () => {
  try {
    setupAuthRequest();
    const response = await axios.get(`${API_URL}/matches`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getMatchDetails = async (matchId) => {
  try {
    setupAuthRequest();
    const response = await axios.get(`${API_URL}/matches/${matchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const buyTicket = async (matchId, quantity) => {
  try {
    setupAuthRequest();
    const response = await axios.post(`${API_URL}/matches/${matchId}/buy`, { quantity });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- Gestion des Tickets ---
export const createTicketForSale = async (ticketData) => {
  try {
    setupAuthRequest();
    const response = await axios.post(`${API_URL}/tickets/sell`, ticketData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const deleteTicket = async (ticketId) => {
  try {
    setupAuthRequest();
    const response = await axios.delete(`${API_URL}/tickets/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getPurchasedTickets = async () => {
  try {
    setupAuthRequest();
    const response = await axios.get(`${API_URL}/tickets/purchased`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

export const getTicketsForSale = async () => {
  try {
    setupAuthRequest();
    const response = await axios.get(`${API_URL}/tickets/selling`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// --- Gestion des Paiements ---
export const getPaymentHistory = async () => {
  try {
    setupAuthRequest();
    const response = await axios.get(`${API_URL}/payments`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};