// src/api/authAPI.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

// Configurer axios pour envoyer le token dans les headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

// Service pour la connexion
export const loginAPI = async (email, motDePasse) => {
  try {
    const response = await axios.post(`${API_URL}/login`, { email, motDePasse });
   
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setAuthToken(response.data.token);
    }
   
    return response.data; // Retourner les données pour accéder au rôle de l'utilisateur
  } catch (error) {
    throw error.response?.data || { message: "Erreur de connexion au serveur" };
  }
};

// Service pour l'inscription
export const signupAPI = async (nom, email, motDePasse, role = 'client') => {
  try {
    const response = await axios.post(`${API_URL}/signup`, { nom, email, motDePasse, role });
   
    if (response.data.token) {
      localStorage.setItem('user', JSON.stringify(response.data));
      setAuthToken(response.data.token);
    }
   
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur de connexion au serveur" };
  }
};

// Service pour la déconnexion
export const logoutAPI = () => {
  localStorage.removeItem('user');
  setAuthToken(null);
};

// Service pour récupérer l'utilisateur actuel
export const getCurrentUserAPI = () => {
  return JSON.parse(localStorage.getItem('user'));
};

// Service pour récupérer les infos de l'utilisateur connecté
export const getUserInfoAPI = async () => {
  try {
    const response = await axios.get(`${API_URL}/me`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur de connexion au serveur" };
  }
};

// Vérifier si l'utilisateur est administrateur
export const isAdmin = () => {
  const user = getCurrentUserAPI();
  return user && user.user && user.user.role === 'administrateur';
};

// Vérifier si l'utilisateur est connecté
export const isAuthenticated = () => {
  const user = getCurrentUserAPI();
  return !!user && !!user.token;
};