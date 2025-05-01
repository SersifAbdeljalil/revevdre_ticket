// src/components/admin/TicketManagement/AddTicket.js
import React, { useState, useEffect } from 'react';
import { 
  FaTimes, 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaUser, 
  FaMoneyBillWave, 
  FaExclamationTriangle,
  FaCheck
} from 'react-icons/fa';
import { addTicket, updateTicket } from '../../../api/ticketAPI';
import { getAllMatches } from '../../../api/adminAPI';
import { getAllClients } from '../../../api/clientAPI';
import '../AdminDashboard.css';

const AddTicket = ({ ticket, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    matchId: '',
    clientId: '',
    prix: '',
    estRevendu: false
  });
  const [matches, setMatches] = useState([]);
  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // Charger les données initiales (matchs et clients)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoadingData(true);
        
        // Charger les matchs
        const matchesData = await getAllMatches();
        setMatches(matchesData.matches || []);
        
        // Charger les clients
        const clientsData = await getAllClients();
        setClients(clientsData.clients || []);
        
        // Si on est en mode édition, pré-remplir le formulaire
        if (ticket) {
          setFormData({
            matchId: ticket.matchId || ticket.match?.id || '',
            clientId: ticket.clientId || ticket.client?.id || '',
            prix: ticket.prix || '',
            estRevendu: ticket.estRevendu || false
          });
        }
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setMessage({ 
          type: 'error', 
          text: 'Erreur lors du chargement des données initiales' 
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    loadInitialData();
  }, [ticket]);
  
  // Gérer les changements de champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Pour les cases à cocher, utiliser la valeur "checked"
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Supprimer les erreurs lors de la modification
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  // Validation du formulaire
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.matchId) {
      newErrors.matchId = "Veuillez sélectionner un match";
    }
    
    if (!formData.clientId) {
      newErrors.clientId = "Veuillez sélectionner un client";
    }
    
    if (!formData.prix) {
      newErrors.prix = "Le prix est requis";
    } else if (isNaN(formData.prix) || parseFloat(formData.prix) <= 0) {
      newErrors.prix = "Le prix doit être un nombre positif";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Soumettre le formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      // Préparer les données du ticket
      const ticketData = {
        matchId: parseInt(formData.matchId),
        clientId: parseInt(formData.clientId),
        prix: parseFloat(formData.prix),
        estRevendu: formData.estRevendu
      };
      
      // Créer ou mettre à jour le ticket
      if (ticket) {
        await updateTicket(ticket.id, ticketData);
        setMessage({ 
          type: 'success', 
          text: 'Ticket mis à jour avec succès' 
        });
      } else {
        await addTicket(ticketData);
        setMessage({ 
          type: 'success', 
          text: 'Ticket ajouté avec succès' 
        });
      }
      
      // Attendre un court instant pour que l'utilisateur puisse voir le message
      setTimeout(() => {
        onSave();
      }, 1500);
      
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du ticket:', err);
      setMessage({ 
        type: 'error', 
        text: err.message || 'Une erreur est survenue lors de l\'enregistrement du ticket' 
      });
      setLoading(false);
    }
  };
  
  // Formater la date et l'heure
  const formatDateTime = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header" style={{ backgroundColor: ticket ? '#00b28f' : '#ff6b01', color: 'white' }}>
          <h2 style={{ color: 'white', WebkitTextFillColor: 'white' }}>
            {ticket ? 'Modifier le ticket' : 'Ajouter un nouveau ticket'}
          </h2>
          <button className="modal-close" onClick={onClose} style={{ color: 'white' }}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {message.text && (
              <div className={`${message.type === 'success' ? 'success-alert' : 'error-alert'}`}>
                {message.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
                {message.text}
              </div>
            )}
            
            {loadingData ? (
              <div className="loading" style={{ padding: '30px' }}>
                <div className="loading-spinner"></div>
                <div>Chargement des données...</div>
              </div>
            ) : (
              <>
                {/* Sélection du match */}
                <div className="form-group">
                  <label htmlFor="matchId">
                    <FaCalendarAlt style={{ marginRight: '8px', color: 'var(--primary)' }} />
                    Match
                  </label>
                  <select
                    id="matchId"
                    name="matchId"
                    className={`form-control ${errors.matchId ? 'is-invalid' : ''}`}
                    value={formData.matchId}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">-- Sélectionner un match --</option>
                    {matches.map(match => (
                      <option key={match.id} value={match.id}>
                        {match.equipe1} vs {match.equipe2} - {formatDateTime(match.date)} - {match.lieu}
                      </option>
                    ))}
                  </select>
                  {errors.matchId && <div className="error-message">{errors.matchId}</div>}
                </div>
                
                {/* Sélection du client */}
                <div className="form-group">
                  <label htmlFor="clientId">
                    <FaUser style={{ marginRight: '8px', color: 'var(--secondary)' }} />
                    Client
                  </label>
                  <select
                    id="clientId"
                    name="clientId"
                    className={`form-control ${errors.clientId ? 'is-invalid' : ''}`}
                    value={formData.clientId}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">-- Sélectionner un client --</option>
                    {clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.nom} ({client.email})
                      </option>
                    ))}
                  </select>
                  {errors.clientId && <div className="error-message">{errors.clientId}</div>}
                </div>
                
                {/* Prix du ticket */}
                <div className="form-group">
                  <label htmlFor="prix">
                    <FaMoneyBillWave style={{ marginRight: '8px', color: 'var(--accent)' }} />
                    Prix (FCFA)
                  </label>
                  <input
                    type="number"
                    id="prix"
                    name="prix"
                    className={`form-control ${errors.prix ? 'is-invalid' : ''}`}
                    value={formData.prix}
                    onChange={handleChange}
                    placeholder="Ex: 25000"
                    min="0"
                    step="100"
                    disabled={loading}
                  />
                  {errors.prix && <div className="error-message">{errors.prix}</div>}
                </div>
                
                {/* Statut du ticket (revendu ou non) */}
                <div className="form-group">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input
                      type="checkbox"
                      id="estRevendu"
                      name="estRevendu"
                      checked={formData.estRevendu}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <label htmlFor="estRevendu" style={{ margin: '0', cursor: 'pointer' }}>
                      <FaTicketAlt style={{ marginRight: '8px', color: formData.estRevendu ? 'var(--error)' : 'var(--success)' }} />
                      Ce ticket a été revendu
                    </label>
                  </div>
                  <small className="form-text text-muted" style={{ marginTop: '8px', display: 'block', paddingLeft: '28px' }}>
                    Un ticket revendu ne sera pas valide pour l'entrée au stade.
                  </small>
                </div>
              </>
            )}
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-danger"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading || loadingData}
            >
              {loading 
                ? 'Enregistrement...' 
                : ticket ? 'Mettre à jour' : 'Ajouter le ticket'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTicket;