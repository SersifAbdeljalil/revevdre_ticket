import axios from 'axios';

const API_URL = 'http://localhost:5000/api/client';

const setupAuthRequest = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    return true;
  }
  throw new Error('Non autorisé : utilisateur non connecté');
};

// --- GESTION DES MATCHS (unchanged) ---

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

// --- GESTION DES TICKETS ---

export const createTicketForSale = async (ticketData) => {
  try {
    setupAuthRequest();
    const response = await axios.post(`${API_URL}/tickets/sell`, ticketData);
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