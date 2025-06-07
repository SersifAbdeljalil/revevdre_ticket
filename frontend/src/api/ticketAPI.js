import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_URL = 'http://localhost:5000/api';
const TICKETS_ENDPOINT = '/tickets';

// Configurer axios pour envoyer le token dans les headers
export const setAuthToken = () => {
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
    const response = await axios.get(`${API_URL}/version`, { 
      timeout: 5000
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
    
    const healthCheck = await checkApiHealth();
    if (!healthCheck.available) {
      console.error('API inaccessible lors du health check:', healthCheck.error);
      throw new Error(`API inaccessible: ${healthCheck.error}`);
    }
    
    const hasToken = setAuthToken();
    console.log('Token d\'authentification défini:', hasToken);
    
    const fullUrl = `${API_URL}${TICKETS_ENDPOINT}`;
    console.log('URL complète de l\'appel API:', fullUrl);
    
    const response = await axios.get(fullUrl, { 
      params: filters,
      timeout: 10000,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('Status de la réponse:', response.status);
    console.log('Données brutes reçues:', response.data);
    
    let tickets;
    if (Array.isArray(response.data)) {
      tickets = response.data;
    } else if (response.data.tickets && Array.isArray(response.data.tickets)) {
      tickets = response.data.tickets;
    } else if (typeof response.data === 'object') {
      const possibleTicketArrays = Object.values(response.data)
        .filter(val => Array.isArray(val));
        
      if (possibleTicketArrays.length > 0) {
        tickets = possibleTicketArrays[0];
      } else {
        tickets = [response.data];
      }
    } else {
      throw new Error('Format de réponse non reconnu');
    }
    
    const formattedTickets = tickets.map(ticket => adaptTicketForFrontend(ticket));
    console.log('Tickets normalisés:', formattedTickets);
    
    if (formattedTickets.length > 0) {
      const requiredProps = ['id', 'prix'];
      const missingProps = [];
      
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
    console.error('Erreur lors de la récupération des tickets:', error);
    
    let errorMessage = "Erreur lors de la récupération des tickets";
    let errorDetails = {};
    
    if (error.response) {
      errorMessage = `Erreur ${error.response.status} du serveur`;
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };
    } else if (error.request) {
      errorMessage = "Le serveur n'a pas répondu à la requête";
      errorDetails = {
        request: error.request?.responseURL || `${API_URL}${TICKETS_ENDPOINT}`,
        method: error.config?.method || 'GET',
        timeout: error.config?.timeout || 'inconnu'
      };
    } else {
      errorMessage = error.message || "Erreur inconnue";
    }
    
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

// Mettre un ticket en vente avec PDF
export const createTicketForSale = async (ticketData, pdfFile) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour mettre un ticket en vente" };
    }
    const formData = new FormData();
    formData.append('prix', ticketData.prix);
    formData.append('matchId', ticketData.matchId);
    formData.append('pdf', pdfFile);

    const response = await axios.post(`${API_URL}${TICKETS_ENDPOINT}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
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
      throw new Error("Vous devez être connecté pour acheter un ticket");
    }

    if (!paymentData || !paymentData.methode) {
      throw new Error("La méthode de paiement est requise");
    }

    const validPaymentMethods = ['carte', 'mobile'];
    if (!validPaymentMethods.includes(paymentData.methode)) {
      throw new Error(`Méthode de paiement non valide. Doit être l'une de: ${validPaymentMethods.join(', ')}`);
    }

    if (paymentData.methode === 'carte' && paymentData.cardNumber) {
      if (!/^\d{16}$/.test(paymentData.cardNumber)) {
        throw new Error("Numéro de carte invalide (16 chiffres requis)");
      }
    } else if (paymentData.methode === 'mobile' && paymentData.phoneNumber) {
      if (!/^\d{10}$/.test(paymentData.phoneNumber)) {
        throw new Error("Numéro de téléphone invalide (10 chiffres requis)");
      }
    }

    console.log(`Tentative d'achat du ticket ${ticketId} avec méthode ${paymentData.methode}`);

    const response = await axios.post(
      `${API_URL}${TICKETS_ENDPOINT}/${ticketId}/purchase`,
      paymentData,
      {
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Achat réussi:', response.data);

    return {
      success: true,
      message: response.data.message || "Ticket acheté avec succès",
      ticketId: response.data.ticketId,
      data: response.data,
    };
  } catch (error) {
    console.error('Erreur lors de l\'achat du ticket:', error);

    let errorMessage = "Erreur lors de l'achat du ticket";
    let errorDetails = {};

    if (error.response) {
      errorMessage = error.response.data.message || `Erreur ${error.response.status} du serveur`;
      errorDetails = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
      };

      switch (error.response.status) {
        case 400:
          if (error.response.data.message.includes('déjà vendu')) {
            errorMessage = "Ce ticket a déjà été vendu.";
          } else if (error.response.data.message.includes('propre ticket')) {
            errorMessage = "Vous ne pouvez pas acheter votre propre ticket.";
          } else if (error.response.data.message.includes('match a déjà eu lieu')) {
            errorMessage = "Ce match a déjà eu lieu.";
          }
          break;
        case 404:
          errorMessage = "Ticket non trouvé.";
          break;
        case 401:
          errorMessage = "Vous devez être connecté pour acheter ce ticket.";
          break;
        default:
          break;
      }
    } else if (error.request) {
      errorMessage = "Le serveur n'a pas répondu à la requête.";
      errorDetails = {
        request: error.request?.responseURL || `${API_URL}${TICKETS_ENDPOINT}/${ticketId}/purchase`,
        method: 'POST',
        timeout: error.config?.timeout || 'inconnu',
      };
    } else {
      errorMessage = error.message || "Erreur inconnue";
    }

    throw {
      error: true,
      message: errorMessage,
      details: errorDetails,
      originalError: error,
    };
  }
};

// Mettre un ticket en revente avec PDF
export const resellTicket = async (ticketId, ticketData, pdfFile) => {
  try {
    if (!setAuthToken()) {
      throw { message: "Vous devez être connecté pour mettre un ticket en revente" };
    }
    const formData = new FormData();
    formData.append('prix', ticketData.prix);
    formData.append('pdf', pdfFile);

    const response = await axios.post(`${API_URL}${TICKETS_ENDPOINT}/${ticketId}/resell`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      ...response.data,
      ticket: adaptTicketForFrontend(response.data.ticket)
    };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la mise en revente du ticket" };
  }
};

// Modifier un ticket
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

// Supprimer un ticket
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
    const tickets = response.data.tickets.map(ticket => adaptTicketForFrontend(ticket));
    return { tickets };
  } catch (error) {
    throw error.response?.data || { message: "Erreur lors de la récupération de vos achats" };
  }
};

// Adapter les données du frontend au format de la base de données
export const adaptTicketForDatabase = (ticket) => {
  if (!ticket) return null;
  
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
  
  if ('estRevendu' in ticket) {
    const { estRevendu, ...restTicket } = ticket;
    return {
      ...restTicket,
      estVendu: estRevendu
    };
  }
  
  return ticket;
};