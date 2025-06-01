// src/components/client/TicketManagement/TicketDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUserAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaExclamationTriangle
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { getTicketDetails } from '../../../api/ticketAPI';
import '../../admin/AdminDashboard.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadTicketDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getTicketDetails(id);

        if (!response || !response.ticket) {
          throw new Error('Les détails du ticket sont introuvables');
        }

        setTicket(response.ticket);
      } catch (err) {
        console.error('Erreur lors du chargement des détails du ticket:', err);
        setError(err.message || 'Erreur lors du chargement des détails du ticket');
      } finally {
        setLoading(false);
      }
    };

    loadTicketDetails();
  }, [id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    try {
      const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return new Date(dateString).toLocaleDateString('fr-FR', options);
    } catch (err) {
      return 'Date invalide';
    }
  };

  const handleBack = () => {
    navigate('/tickets');
  };

  const LoadingSpinner = () => (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div>Chargement des détails du ticket...</div>
      <div className="dot-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Détails du Ticket" />

        <div className="dashboard-content">
          {error && (
            <div className="error-alert" style={{
              padding: '15px',
              borderRadius: 'var(--border-radius)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
              background: 'rgba(220, 38, 38, 0.1)',
              color: 'var(--error)',
              border: '1px solid var(--error)',
            }}>
              <FaExclamationTriangle style={{ fontSize: '1.2rem' }} />
              <div>
                <div style={{ fontWeight: '600', marginBottom: '5px' }}>Attention</div>
                <div>{error}</div>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSpinner />
          ) : ticket ? (
            <div className="ticket-detail-container">
              <div className="ticket-detail-card" style={{
                backgroundColor: 'white',
                borderRadius: 'var(--border-radius-lg)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-md)',
                border: ticket.estVendu ? '2px solid var(--error)' : '2px solid var(--success)'
              }}>
                <div className="ticket-header" style={{
                  background: ticket.estVendu ? 'linear-gradient(135deg, #ff3d57 0%, #ff5f7e 100%)' : 'var(--accent-gradient)',
                  color: 'white',
                  padding: '25px 30px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
                  position: 'relative'
                }}>
                  <div style={{
                    position: 'absolute',
                    top: '15px',
                    right: '15px',
                    backgroundColor: ticket.estVendu ? 'var(--error)' : 'var(--success)',
                    color: 'white',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    padding: '5px 12px',
                    borderRadius: '12px'
                  }}>
                    {ticket.estVendu ? 'Vendu' : 'Disponible'}
                  </div>

                  <div style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    marginBottom: '10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px'
                  }}>
                    <FaTicketAlt />
                    <span>
                      {ticket.match.equipe1} vs {ticket.match.equipe2}
                    </span>
                  </div>

                  <div style={{
                    fontSize: '1.2rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    opacity: '0.9'
                  }}>
                    <FaCalendarAlt style={{ fontSize: '1rem' }} />
                    {formatDate(ticket.match.date)}
                  </div>
                </div>

                <div className="ticket-body" style={{ padding: '30px' }}>
                  <div className="ticket-info-list" style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '25px',
                    marginBottom: '30px'
                  }}>
                    <div className="ticket-info-item" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 107, 1, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontSize: '1.2rem'
                      }}>
                        <FaMapMarkerAlt />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '3px' }}>Lieu du match</div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{ticket.match.lieu}</div>
                      </div>
                    </div>

                    <div className="ticket-info-item" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 192, 0, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--secondary)',
                        fontSize: '1.2rem'
                      }}>
                        <FaMoneyBillWave />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '3px' }}>Prix du ticket</div>
                        <div style={{
                          fontWeight: '700',
                          fontSize: '1.5rem',
                          color: 'var(--primary)'
                        }}>
                          {formatCurrency(ticket.prix)}
                        </div>
                      </div>
                    </div>

                    <div className="ticket-info-item" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(107, 72, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--purple)',
                        fontSize: '1.2rem'
                      }}>
                        <FaUserAlt />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', color: '#888', marginBottom: '3px' }}>Vendeur</div>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>{ticket.vendeur?.nom || 'Non spécifié'}</div>
                        <div style={{ fontSize: '0.9rem', color: '#666' }}>{ticket.vendeur?.email || ''}</div>
                      </div>
                    </div>
                  </div>

                  <div className="ticket-actions" style={{
                    display: 'flex',
                    justifyContent: 'center',
                    marginTop: '20px'
                  }}>
                    <button
                      className="btn btn-primary"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 25px',
                        fontSize: '1rem',
                        fontWeight: '500'
                      }}
                      onClick={handleBack}
                    >
                      <FaArrowLeft /> Retour à la liste
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-data-icon"><FaTicketAlt /></div>
              <p>Ticket non trouvé</p>
              <button
                className="btn btn-primary"
                onClick={handleBack}
                style={{
                  marginTop: '15px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 25px',
                  fontSize: '1rem',
                  fontWeight: '500'
                }}
              >
                <FaArrowLeft /> Retour à la liste
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;