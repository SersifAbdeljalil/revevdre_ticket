// src/api/matchAPI.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const setupRequest = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user && user.token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
  } else {
    delete axios.defaults.headers.common['Authorization'];
  }
};

export const getAllMatches = async () => {
  try {
    setupRequest();
    const response = await axios.get(`${API_URL}/matches`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};