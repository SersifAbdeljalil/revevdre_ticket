// src/components/admin/TicketManagement/TicketDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaMoneyBillWave,
  FaArrowLeft,
  FaShoppingCart,
  FaCheck,
  FaExclamationTriangle,
  FaClock,
  FaEnvelope,
  FaPhoneAlt,
  FaStar,
  FaExclamationCircle
} from 'react-icons/fa';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { getTicketDetails, buyTicket } from '../../../api/ticketAPI';
import { getCurrentUserAPI } from '../../../api/authAPI';
import '../AdminDashboard.css';

const TicketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [buying, setBuying] = useState(false);
  const [buySuccess, setBuySuccess] = useState(false);
  const [buyError, setBuyError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  
  useEffect(() => {
    // Récupérer l'utilisateur courant
    const user = getCurrentUserAPI();
    if (user && user.user) {
      setCurrentUser(user.user);
    }
    
    // Charger les détails du ticket
    const loadTicketDetails = async () => {
      try {
        setLoading(true);
        const data = await getTicketDetails(id);
        setTicket(data.ticket);
        setError('');
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des détails du ticket');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTicketDetails();
  }, [id]);
  
  // Formater le montant en FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Formater la date
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
  
  // Calculer les jours restants avant le match
  const getDaysRemaining = (dateString) => {
    const matchDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(matchDate - today);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };
  
  // Acheter un ticket
  const handleBuyTicket = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/admin/tickets/${id}` } });
      return;
    }
    
    if (ticket.estVendu) {
      setBuyError('Ce ticket a déjà été vendu');
      return;
    }
    
    try {
      setBuying(true);
      setBuyError('');
      // Simuler le choix d'une méthode de paiement (à remplacer par un vrai formulaire)
      const paymentData = { methode: 'carte' };
      await buyTicket(id, paymentData);
      setBuySuccess(true);
      // Mettre à jour le ticket localement
      setTicket({ ...ticket, estVendu: true });
    } catch (err) {
      setBuyError(err.message || 'Erreur lors de l\'achat du ticket');
      console.error(err);
    } finally {
      setBuying(false);
    }
  };
  
  // Retourner à la liste des tickets
  const handleBack = () => {
    navigate('/admin/tickets');
  };
  
  // Composant pour le spinner de chargement
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
  
  const isOwnTicket = currentUser && ticket && ticket.vendeur.id === currentUser.id;
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Détails du Ticket" />
        
        <div className="dashboard-content">
          {error && (
            <div className="error-alert">
              <FaExclamationTriangle />
              {error}
            </div>
          )}
          
          <button 
            className="btn btn-outline btn-primary" 
            onClick={handleBack}
            style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}
          >
            <FaArrowLeft /> Retour à la liste
          </button>
          
          {loading ? (
            <LoadingSpinner />
          ) : ticket ? (
            <div className="ticket-detail-grid" style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {/* Carte d'info du match */}
              <div className="dashboard-section">
                <h2 style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaTicketAlt />
                  Informations du match
                </h2>
                
                <div className="match-header" style={{ 
                  background: 'var(--primary-gradient)',
                  color: 'white',
                  padding: '25px',
                  borderRadius: 'var(--border-radius-lg)',
                  marginBottom: '25px',
                  boxShadow: 'var(--shadow-lg)',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  <div className="fluid-animation" style={{ 
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    opacity: 0.2,
                    zIndex: 0
                  }}></div>
                  
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ 
                      fontSize: '2rem', 
                      fontWeight: '700', 
                      marginBottom: '15px', 
                      textAlign: 'center' 
                    }}>
                      {ticket.match.equipe1} 
                      <span style={{ 
                        margin: '0 15px', 
                        opacity: '0.8', 
                        fontSize: '1.5rem' 
                      }}>VS</span> 
                      {ticket.match.equipe2}
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '25px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaCalendarAlt />
                        <span>{formatDate(ticket.match.date)}</span>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <FaMapMarkerAlt />
                        <span>{ticket.match.lieu}</span>
                      </div>
                    </div>
                    
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '8px',
                      marginTop: '15px',
                      padding: '8px 15px',
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 'var(--border-radius-lg)',
                      width: 'fit-content',
                      margin: '0 auto'
                    }}>
                      <FaClock />
                      <span>
                        {getDaysRemaining(ticket.match.date)} {getDaysRemaining(ticket.match.date) > 1 ? 'jours' : 'jour'} avant le match
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="match-info-list" style={{ 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: '20px'
                }}>
                  <div className="info-group" style={{ 
                    backgroundColor: 'rgba(255, 107, 1, 0.05)',
                    padding: '15px 20px',
                    borderRadius: 'var(--border-radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      color: 'var(--primary)', 
                      marginBottom: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaUser /> Vendeur
                    </h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <div className="user-avatar" style={{ 
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--secondary-gradient)',
                        color: 'var(--dark)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.3rem',
                        fontWeight: '600',
                        boxShadow: 'var(--shadow-secondary)'
                      }}>
                        {ticket.vendeur.nom.charAt(0).toUpperCase()}
                      </div>
                      
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '3px' }}>{ticket.vendeur.nom}</div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          fontSize: '0.9rem',
                          color: '#666'
                        }}>
                          <FaEnvelope style={{ fontSize: '0.85rem' }} />
                          <span>{ticket.vendeur.email}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ fontSize: '0.9rem', color: '#666', marginTop: '5px' }}>
                      <div className="badge badge-accent" style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '0.8rem',
                        padding: '5px 10px'
                      }}>
                        <FaStar />
                        Vendeur vérifié
                      </div>
                    </div>
                  </div>
                  
                  <div className="info-group" style={{ 
                    backgroundColor: 'rgba(107, 72, 255, 0.05)',
                    padding: '15px 20px',
                    borderRadius: 'var(--border-radius-md)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px'
                  }}>
                    <h3 style={{ 
                      fontSize: '1.1rem', 
                      color: 'var(--purple)',
                      marginBottom: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaTicketAlt /> Statut du ticket
                    </h3>
                    
                    {ticket.estVendu ? (
                      <div className="status-indicator" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        padding: '10px 15px',
                        backgroundColor: 'rgba(255, 61, 87, 0.1)',
                        borderRadius: 'var(--border-radius-md)',
                        color: 'var(--error)'
                      }}>
                        <FaExclamationCircle style={{ fontSize: '1.2rem' }} />
                        <div>
                          <div style={{ fontWeight: '600' }}>Ce ticket a déjà été vendu</div>
                          <div style={{ fontSize: '0.9rem' }}>Veuillez consulter d'autres offres disponibles.</div>
                        </div>
                      </div>
                    ) : (
                      <div className="status-indicator" style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '10px',
                        padding: '10px 15px',
                        backgroundColor: 'rgba(0, 202, 114, 0.1)',
                        borderRadius: 'var(--border-radius-md)',
                        color: 'var(--success)'
                      }}>
                        <FaCheck style={{ fontSize: '1.2rem' }} />
                        <div>
                          <div style={{ fontWeight: '600' }}>Ce ticket est disponible à l'achat</div>
                          <div style={{ fontSize: '0.9rem' }}>Vous pouvez acheter ce ticket maintenant.</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Carte d'achat */}
              <div className="dashboard-section">
                <h2 style={{ color: 'var(--secondary)', display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <FaMoneyBillWave />
                  Acheter ce ticket
                </h2>
                
                <div className="price-display" style={{ 
                  backgroundColor: 'var(--secondary-gradient)',
                  color: 'var(--dark)',
                  borderRadius: 'var(--border-radius-lg)',
                  padding: '30px',
                  marginBottom: '30px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  boxShadow: 'var(--shadow-secondary)'
                }}>
                  <div style={{ fontSize: '1rem', fontWeight: '500', marginBottom: '10px' }}>Prix du ticket</div>
                  <div style={{ 
                    fontSize: '2.5rem', 
                    fontWeight: '700',
                    letterSpacing: '-1px',
                    marginBottom: '5px'
                  }}>
                    {formatCurrency(ticket.prix)}
                  </div>
                  <div style={{ fontSize: '0.9rem', opacity: '0.8' }}>Paiement sécurisé</div>
                </div>
                
                {buySuccess ? (
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
                      <FaCheck />
                    </div>
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '1.1rem', marginBottom: '5px' }}>
                        Achat réussi !
                      </div>
                      <p style={{ margin: '0', fontSize: '0.95rem' }}>
                        Votre ticket a été ajouté à votre compte. Vous pouvez le consulter dans la section "Mes tickets".
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {buyError && (
                      <div className="error-alert" style={{ marginBottom: '20px' }}>
                        <FaExclamationTriangle />
                        {buyError}
                      </div>
                    )}
                    
                    <div className="purchase-options">
                      <button 
                        className="btn btn-primary btn-lg"
                        onClick={handleBuyTicket}
                        disabled={buying || ticket.estVendu || isOwnTicket}
                        style={{
                          width: '100%',
                          padding: '15px',
                          fontSize: '1.1rem',
                          marginBottom: '15px'
                        }}
                      >
                        {buying ? (
                          <>
                            <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                            Traitement en cours...
                          </>
                        ) : (
                          <>
                            <FaShoppingCart /> Acheter maintenant
                          </>
                        )}
                      </button>
                      
                      {isOwnTicket && (
                        <div className="info-message" style={{ 
                          backgroundColor: 'rgba(0, 149, 255, 0.1)',
                          color: 'var(--info)',
                          padding: '15px',
                          borderRadius: 'var(--border-radius-md)',
                          fontSize: '0.95rem',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px'
                        }}>
                          <FaExclamationCircle />
                          <span>Vous ne pouvez pas acheter votre propre ticket.</span>
                        </div>
                      )}
                      
                      <div className="payment-methods" style={{ 
                        display: 'flex', 
                        flexDirection: 'column',
                        gap: '15px',
                        marginTop: '25px'
                      }}>
                        <h3 style={{ fontSize: '1.1rem', marginBottom: '5px' }}>Moyens de paiement acceptés</h3>
                        
                        <div style={{ 
                          display: 'flex', 
                          gap: '15px',
                          flexWrap: 'wrap'
                        }}>
                          <div className="payment-method" style={{ 
                            padding: '12px 20px',
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                          }}>
                            <div style={{ 
                              backgroundColor: 'rgba(255, 107, 1, 0.1)',
                              color: 'var(--primary)',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FaMoneyBillWave />
                            </div>
                            <span>Carte bancaire</span>
                          </div>
                          
                          <div className="payment-method" style={{ 
                            padding: '12px 20px',
                            borderRadius: 'var(--border-radius-md)',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            fontSize: '0.95rem',
                            fontWeight: '500'
                          }}>
                            <div style={{ 
                              backgroundColor: 'rgba(0, 178, 143, 0.1)',
                              color: 'var(--accent)',
                              width: '30px',
                              height: '30px',
                              borderRadius: '50%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}>
                              <FaPhoneAlt />
                            </div>
                            <span>Mobile Money</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="no-data">
              <div className="no-data-icon"><FaTicketAlt /></div>
              <p>Ticket non trouvé</p>
              <button className="btn btn-primary" onClick={handleBack}>
                Retour à la liste des tickets
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketDetail;