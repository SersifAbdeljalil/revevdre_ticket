// src/components/client/MatchManagement/MatchState.js
import React, { useState } from 'react';
import { FaTimes, FaTicketAlt, FaMoneyBillWave, FaClock, FaMapMarkerAlt, FaPlus } from 'react-icons/fa';
import { buyTicket } from '../../../api/clientAPI';
import '../../admin/AdminDashboard.css'; // Réutilisation des styles admin pour la cohérence

const MatchState = ({ match, onClose }) => {
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Formatage de la date
  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  // Formatage du montant
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Gestion de l'achat de ticket
  const handleBuyTicket = async () => {
    if (quantity < 1) {
      setError('Veuillez sélectionner au moins 1 ticket.');
      return;
    }

    try {
      await buyTicket(match.id, quantity);
      setSuccess('Ticket(s) acheté(s) avec succès !');
      setError('');
      setTimeout(() => onClose(), 2000); // Ferme la modale après 2 secondes
    } catch (err) {
      setError('Erreur lors de l\'achat du ticket.');
      console.error(err);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header" style={{ backgroundColor: '#05F3FF', color: '#333' }}>
          <h2>Détails et achat du match</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          <div
            className="match-details"
            style={{
              marginBottom: '30px',
              padding: '15px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
            }}
          >
            <h3
              style={{
                margin: '0 0 15px 0',
                fontSize: '1.3rem',
                borderBottom: '2px solid #00FF87',
                paddingBottom: '10px',
              }}
            >
              {match.equipe1} vs {match.equipe2}
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>
                  <FaClock style={{ marginRight: '5px' }} />
                  Date et heure
                </h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{formatDate(match.date)}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>
                  <FaMapMarkerAlt style={{ marginRight: '5px' }} />
                  Lieu
                </h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{match.lieu}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>
                  <FaTicketAlt style={{ marginRight: '5px' }} />
                  Capacité
                </h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{match.capacite || 'Illimitée'}</p>
              </div>

              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>
                  <FaMoneyBillWave style={{ marginRight: '5px' }} />
                  Prix du ticket
                </h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{formatCurrency(match.prix)}</p>
              </div>
            </div>
          </div>

          <div className="buy-ticket-section">
            <h3
              style={{
                margin: '0 0 20px 0',
                fontSize: '1.3rem',
                borderBottom: '2px solid #5D3C81',
                paddingBottom: '10px',
                color: '#5D3C81',
              }}
            >
              Acheter un ticket
            </h3>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="quantity" style={{ marginRight: '10px', fontWeight: 'bold' }}>
                Quantité :
              </label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                style={{ padding: '8px', width: '60px', marginRight: '10px' }}
              />
              <button className="btn btn-primary" onClick={handleBuyTicket}>
                <FaPlus style={{ marginRight: '5px' }} /> Acheter
              </button>
            </div>

            {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
            {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn btn-primary" onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchState;