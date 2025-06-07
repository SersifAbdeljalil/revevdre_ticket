// src/components/client/TicketManagement/EditTicket.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FaTicketAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { getTicketDetails, updateTicket } from '../../../api/ticketAPI';
import '../../admin/AdminDashboard.css';

const EditTicket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [prix, setPrix] = useState('');

  useEffect(() => {
    const loadTicketDetails = async () => {
      try {
        setLoading(true);
        setError('');

        const response = await getTicketDetails(id);

        if (!response || !response.ticket) {
          throw new Error('Ticket non trouvé');
        }

        if (response.ticket.estVendu) {
          throw new Error('Ce ticket a déjà été vendu et ne peut pas être modifié');
        }

        setTicket(response.ticket);
        setPrix(response.ticket.prix.toString());
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement du ticket');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTicketDetails();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPrix = parseFloat(prix);
    if (isNaN(newPrix) || newPrix <= 0) {
      setError('Veuillez entrer un prix valide (supérieur à 0 DH)');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await updateTicket(id, { prix: newPrix });

      setSuccess(true);
      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification du ticket');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/tickets');
  };

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
        <Header title="Modifier le Ticket" />

        <div className="dashboard-content">
          <button
            className="btn btn-outline btn-primary"
            onClick={handleBack}
            style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <FaArrowLeft /> Retour à mes tickets
          </button>

          <div className="dashboard-section">
            <h2 style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FaTicketAlt />
              Modifier le prix du ticket
            </h2>

            {success ? (
              <div className="success-alert" style={{
                backgroundColor: 'rgba(0, 202, 114, 0.1)',
                color: 'var(--success)',
                padding: '20px',
                borderRadius: 'var(--border-radius-md)',
                marginBottom: '25px',
                display: 'flex',
                alignItems: 'center',
                gap: '15px',
                animation: 'fadeInUp 0.5s ease-out'
              }}>
                <FaCheckCircle style={{ fontSize: '1.5rem' }} />
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>
                    Ticket modifié avec succès !
                  </div>
                  <p style={{ margin: '0', fontSize: '0.95rem' }}>
                    Redirection vers vos tickets dans quelques secondes...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="error-alert" style={{
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    color: 'var(--error)',
                    padding: '15px',
                    borderRadius: 'var(--border-radius)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <FaExclamationTriangle />
                    {error}
                  </div>
                )}

                {loading ? (
                  <LoadingSpinner />
                ) : ticket ? (
                  <form onSubmit={handleSubmit} className="admin-form">
                    <div className="ticket-preview" style={{
                      backgroundColor: 'rgba(255, 192, 0, 0.1)',
                      borderRadius: 'var(--border-radius-md)',
                      padding: '20px',
                      marginBottom: '25px',
                      border: '1px solid rgba(255, 192, 0, 0.3)'
                    }}>
                      <h3 style={{
                        color: 'var(--secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '15px',
                        fontSize: '1.1rem'
                      }}>
                        <FaTicketAlt />
                        Détails du ticket
                      </h3>
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px'
                      }}>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
                          paddingBottom: '10px'
                        }}>
                          <div style={{ fontWeight: '500' }}>Match</div>
                          <div>{ticket.match.equipe1} vs {ticket.match.equipe2}</div>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
                          paddingBottom: '10px'
                        }}>
                          <div style={{ fontWeight: '500' }}>Date</div>
                          <div>{formatDate(ticket.match.date)}</div>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
                          paddingBottom: '10px'
                        }}>
                          <div style={{ fontWeight: '500' }}>Lieu</div>
                          <div>{ticket.match.lieu}</div>
                        </div>
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontWeight: '600',
                          color: 'var(--secondary)',
                          fontSize: '1.1rem'
                        }}>
                          <div>Prix actuel</div>
                          <div>{formatCurrency(ticket.prix)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="prix">
                        <FaMoneyBillWave style={{ marginRight: '8px' }} />
                        Nouveau prix du ticket (DH)
                      </label>
                      <input
                        type="number"
                        id="prix"
                        name="prix"
                        className={`form-control ${!prix && 'is-invalid'}`}
                        value={prix}
                        onChange={(e) => setPrix(e.target.value)}
                        placeholder="Ex: 25000"
                        min="1"
                        step="1"
                        required
                      />
                      <div className="form-text">
                        Indiquez le nouveau prix auquel vous souhaitez vendre votre ticket (DH).
                      </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '25px' }}>
                      <button
                        type="submit"
                        className="btn btn-lg btn-secondary"
                        disabled={submitting}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '15px 30px',
                          fontSize: '1.1rem'
                        }}
                      >
                        {submitting ? (
                          <>
                            <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                            Mise à jour en cours...
                          </>
                        ) : (
                          <>
                            <FaTicketAlt /> Mettre à jour
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon"><FaTicketAlt /></div>
                    <p>Ticket non trouvé ou non modifiable</p>
                    <button className="btn btn-primary" onClick={handleBack}>
                      Retour à mes tickets
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditTicket;