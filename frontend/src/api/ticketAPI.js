// src/api/ticketAPI.js
import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_URL = 'http://localhost:5000/api';

// Correction du chemin pour correspondre au backend
const TICKETS_ENDPOINT = '/tickets'; // Au lieu de '/admin/tickets'

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
    
    console.log('Token trouvé, définition des headers');
    axios.defaults.headers.common['Authorization'] = `Bearer ${user.token}`;
    return true;
  } catch (error) {
    console.error('Erreur lors de la configuration du token:', error);
    return false;
  }
};

// Vérifier si l'API est disponible
export const checkApiHealth = async () => {
  try {
    // Utiliser la route de version qui existe déjà dans votre serveur
    const response = await axios.get(`${API_URL}/version`, { 
      timeout: 5000 // 5 secondes max
    });
    
    return { 
      available: true, 
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'API:', error);
    return { 
      available: false, 
      error: error.message
    };
  }
};

// Récupérer tous les tickets avec filtres
export const getAllTickets = async (filters = {}) => {
  try {
    console.log('Tentative de récupération des tickets avec filtres:', filters);
    
    // Vérifier la santé de l'API d'abord (optionnel)
    const healthCheck = await checkApiHealth();
    if (!healthCheck.available) {
      console.error('API inaccessible lors du health check:', healthCheck.error);
      throw new Error(`API inaccessible: ${healthCheck.error}`);
    }
    
    // Configurer le token d'authentification
    const hasToken = setAuthToken();
    console.log('Token d\'authentification défini:', hasToken);
    
    // URL complète avec le bon chemin pour les tickets
    const fullUrl = `${API_URL}${TICKETS_ENDPOINT}`;
    console.log('URL complète de l\'appel API:', fullUrl);
    
    // Tentative avec timeout prolongé
    const response = await axios.get(fullUrl, { 
      params: filters,
      timeout: 10000, // 10 secondes
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('Status de la réponse:', response.status);
    console.log('Données brutes reçues:', response.data);
    
    // Normaliser la réponse selon différents formats possibles
    let tickets;
    
    if (Array.isArray(response.data)) {
      tickets = response.data;
    } else if (response.data.tickets && Array.isArray(response.data.tickets)) {
      tickets = response.data.tickets;
    } else if (typeof response.data === 'object') {
      // Chercher un tableau dans l'objet
      const possibleTicketArrays = Object.values(response.data)
        .filter(val => Array.isArray(val));
        
      if (possibleTicketArrays.length > 0) {
        tickets = possibleTicketArrays[0];
      } else {
        // Si aucun tableau n'est trouvé, considérer que c'est un objet unique
        tickets = [response.data];
      }
    } else {
      throw new Error('Format de réponse non reconnu');
    }
    
    // Appliquer la transformation pour chaque ticket
    const formattedTickets = tickets.map(ticket => adaptTicketForFrontend(ticket));
    
    console.log('Tickets normalisés:', formattedTickets);
    
    // Validation des données reçues
    if (formattedTickets.length > 0) {
      const requiredProps = ['id', 'prix'];
      const missingProps = [];
      
      // Vérifier les propriétés essentielles sur le premier ticket
      for (const prop of requiredProps) {
        if (formattedTickets[0][prop] === undefined) {
          missingProps.push(prop);
        }
      }
      
      if (missingProps.length > 0) {
        console.warn(`Attention: Propriétés manquantes dans les tickets: ${missingProps.join(', ')}`);
      }
    }
    
    return { tickets: formattedTickets };
  } catch (error) {
    // Gestion d'erreur détaillée
    console.error('Erreur lors de la récupération des tickets:', error);
    
    // Construire un message d'erreur significatif
    let errorMessage = "Erreur lors de la récupération des tickets";
    let errorDetails = {};
    
    if (error.response) {
      // Erreur de réponse HTTP
      errorMessage = `Erreur ${error.response.status} du serveur`;
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };
    } else if (error.request) {
      // Pas de réponse reçue
      errorMessage = "Le serveur n'a pas répondu à la requête";
      errorDetails = {
        request: error.request._currentUrl || error.request.responseURL || `${API_URL}${TICKETS_ENDPOINT}`,
        method: error.config?.method || 'GET',
        timeout: error.config?.timeout || 'inconnu'
      };
    } else {
      // Erreur lors de la configuration de la requête
      errorMessage = error.message || "Erreur inconnue";
    }
    
    // Lancer une erreur avec un format standardisé
    throw {
      message: errorMessage,
      details: errorDetails,
      originalError: error
    };
  }
};

// Récupérer les détails d'un ticket spécifique
export const getTicketDetails = async (ticketId) => {
  try {
    setAuthToken();
    const response = await axios.get(`${API_URL}${TICKETS_ENDPOINT}/${ticketId}`);
    return {
      ticket: adaptTicketForFrontend(response.data.ticket)
    };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération des détails du ticket" };
  }
};

// Mettre un ticket en vente (pour l'utilisateur connecté)
export const createTicketForSale = async (ticketData) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour mettre un ticket en vente" };
    }
    const adaptedData = adaptTicketForDatabase(ticketData);
    const response = await axios.post(`${API_URL}${TICKETS_ENDPOINT}`, adaptedData);
    return {
      ...response.data,
      ticket: adaptTicketForFrontend(response.data.ticket)
    };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la création du ticket" };
  }
};

// Acheter un ticket
export const buyTicket = async (ticketId, paymentData) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour acheter un ticket" };
    }
    const response = await axios.post(`${API_URL}${TICKETS_ENDPOINT}/${ticketId}/purchase`, paymentData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de l'achat du ticket" };
  }
};

// Modifier un ticket (pour le vendeur seulement)
export const updateTicket = async (ticketId, ticketData) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour modifier un ticket" };
    }
    const adaptedData = adaptTicketForDatabase(ticketData);
    const response = await axios.put(`${API_URL}${TICKETS_ENDPOINT}/${ticketId}`, adaptedData);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la modification du ticket" };
  }
};

// Supprimer un ticket (pour le vendeur seulement)
export const deleteTicket = async (ticketId) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour supprimer un ticket" };
    }
    const response = await axios.delete(`${API_URL}${TICKETS_ENDPOINT}/${ticketId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la suppression du ticket" };
  }
};

// Récupérer les tickets mis en vente par l'utilisateur connecté
export const getMyTicketsForSale = async () => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour voir vos tickets" };
    }
    const response = await axios.get(`${API_URL}${TICKETS_ENDPOINT}/my-sales`);
    // Appliquer la transformation pour chaque ticket
    const tickets = response.data.tickets.map(ticket => adaptTicketForFrontend(ticket));
    return { tickets };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération de vos tickets" };
  }
};

// Récupérer les tickets achetés par l'utilisateur connecté
export const getMyPurchasedTickets = async () => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour voir vos achats" };
    }
    const response = await axios.get(`${API_URL}${TICKETS_ENDPOINT}/my-purchases`);
    // Appliquer la transformation pour chaque ticket
    const tickets = response.data.tickets.map(ticket => adaptTicketForFrontend(ticket));
    return { tickets };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération de vos achats" };
  }
};

// Adapter les données du frontend au format de la base de données
export const adaptTicketForDatabase = (ticket) => {
  if (!ticket) return null;
  
  // Transformer estVendu en estRevendu pour la compatibilité avec la BDD
  if ('estVendu' in ticket) {
    const { estVendu, ...restTicket } = ticket;
    return {
      ...restTicket,
      estRevendu: estVendu
    };
  }
  
  return ticket;
};

// Adapter les données de la base de données au format du frontend
export const adaptTicketForFrontend = (ticket) => {
  if (!ticket) return null;
  
  // Transformer estRevendu en estVendu pour la cohérence frontend
  if ('estRevendu' in ticket) {
    const { estRevendu, ...restTicket } = ticket;
    return {
      ...restTicket,
      estVendu: estRevendu
    };
  }
  
  return ticket;
};