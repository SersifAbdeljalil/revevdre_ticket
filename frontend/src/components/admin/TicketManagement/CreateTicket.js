// src/components/client/TicketManagement/CreateTicket.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaTicketAlt,
  FaCalendarAlt,
  FaMoneyBillWave,
  FaArrowLeft,
  FaCheckCircle,
  FaExclamationTriangle,
  FaTags
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { createTicketForSale } from '../../../api/clientAPI';
import { getAllMatches } from '../../../api/clientAPI';
import '../../admin/AdminDashboard.css';

const CreateTicket = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    matchId: '',
    prix: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    const loadMatches = async () => {
      try {
        setLoading(true);
        const data = await getAllMatches();
        const upcomingMatches = data.matches.filter(match =>
          new Date(match.date) > new Date()
        );
        setMatches(upcomingMatches);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des matchs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadMatches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.matchId || !formData.prix) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    const prix = parseFloat(formData.prix);
    if (isNaN(prix) || prix <= 0) {
      setError('Veuillez entrer un prix valide');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await createTicketForSale({
        matchId: parseInt(formData.matchId),
        prix: prix
      });

      setSuccess(true);
      setFormData({
        matchId: '',
        prix: ''
      });

      setTimeout(() => {
        navigate('/tickets');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Erreur lors de la mise en vente du ticket');
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/tickets');
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const LoadingSpinner = () => (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div>Chargement des matchs disponibles...</div>
      <div className="dot-loader">
        <div className="dot"></div>
        <div className="dot"></div>
        <div className="dot"></div>
      </div>
    </div>
  );

  return (
    <div className="client-layout">
      <Sidebar />
      <div className="client-main">
        <Header title="Mettre un ticket en vente" />

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
              Mettre un ticket en vente
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
                <div style={{
                  backgroundColor: 'var(--success)',
                  color: 'white',
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.2rem'
                }}>
                  <FaCheckCircle />
                </div>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>
                    Ticket mis en vente avec succès !
                  </div>
                  <p style={{ margin: '0', fontSize: '0.95rem' }}>
                    Vous allez être redirigé vers la liste de vos tickets...
                  </p>
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="error-alert">
                    <FaExclamationTriangle />
                    {error}
                  </div>
                )}

                {loading ? (
                  <LoadingSpinner />
                ) : matches.length > 0 ? (
                  <form onSubmit={handleSubmit} className="admin-form">
                    <div className="form-group">
                      <label htmlFor="matchId">
                        <FaCalendarAlt style={{ marginRight: '8px' }} />
                        Sélectionner un match
                      </label>
                      <select
                        id="matchId"
                        name="matchId"
                        className={`form-control ${!formData.matchId && 'is-invalid'}`}
                        value={formData.matchId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">-- Choisir un match --</option>
                        {matches.map(match => (
                          <option key={match.id} value={match.id}>
                            {match.equipe1} vs {match.equipe2} - {formatDate(match.date)} - {match.lieu}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label htmlFor="prix">
                        <FaMoneyBillWave style={{ marginRight: '8px' }} />
                        Prix du ticket (DH)
                      </label>
                      <input
                        type="number"
                        id="prix"
                        name="prix"
                        className={`form-control ${!formData.prix && 'is-invalid'}`}
                        value={formData.prix}
                        onChange={handleChange}
                        placeholder="Ex: 25000"
                        min="1"
                        required
                      />
                      <div className="form-text">
                        Indiquez le prix auquel vous souhaitez vendre votre ticket.
                      </div>
                    </div>

                    {formData.matchId && formData.prix && (
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
                          <FaTags />
                          Aperçu du ticket
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
                            <div>
                              {matches.find(m => m.id === parseInt(formData.matchId))?.equipe1} vs {matches.find(m => m.id === parseInt(formData.matchId))?.equipe2}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
                            paddingBottom: '10px'
                          }}>
                            <div style={{ fontWeight: '500' }}>Date</div>
                            <div>
                              {formatDate(matches.find(m => m.id === parseInt(formData.matchId))?.date)}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            borderBottom: '1px dashed rgba(0, 0, 0, 0.1)',
                            paddingBottom: '10px'
                          }}>
                            <div style={{ fontWeight: '500' }}>Lieu</div>
                            <div>
                              {matches.find(m => m.id === parseInt(formData.matchId))?.lieu}
                            </div>
                          </div>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            fontWeight: '600',
                            color: 'var(--secondary)',
                            fontSize: '1.1rem'
                          }}>
                            <div>Prix de vente</div>
                            <div>
                              {new Intl.NumberFormat('fr-FR', {
                                style: 'currency',
                                currency: 'MAD',
                                minimumFractionDigits: 0
                              }).format(formData.prix)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

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
                            Mise en vente en cours...
                          </>
                        ) : (
                          <>
                            <FaTicketAlt /> Mettre en vente
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon"><FaCalendarAlt /></div>
                    <p>Aucun match à venir n'est disponible pour la mise en vente de tickets</p>
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

export default CreateTicket;