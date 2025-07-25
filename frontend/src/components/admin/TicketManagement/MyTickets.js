// src/components/admin/TicketManagement/MyTickets.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FaTicketAlt, 
  FaShoppingCart, 
  FaStore, 
  FaPlusCircle, 
  FaDownload,
  FaEye,
  FaEdit,
  FaTrashAlt,
  FaTags,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaUserAlt,
  FaSearch,
  FaSortAmountDown,
  FaFilter
} from 'react-icons/fa';
import { getMyPurchasedTickets, getMyTicketsForSale, deleteTicket } from '../../../api/ticketAPI';
import Sidebar from '../Sidebar';
import Header from '../Header';
import '../AdminDashboard.css';

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState('purchased');
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [saleTickets, setSaleTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, available, sold
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, price_asc, price_desc
  
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Charger les tickets achetés
        const purchasedData = await getMyPurchasedTickets();
        setPurchasedTickets(purchasedData.tickets);
        
        // Charger les tickets mis en vente
        const salesData = await getMyTicketsForSale();
        setSaleTickets(salesData.tickets);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadTickets();
  }, [deleteSuccess]);
  
  // Formater le montant en FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'MAD',
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
  
  // Filtrer les tickets selon la recherche et le filtre
  const filterTickets = (tickets) => {
    return tickets.filter(ticket => {
      // Filtre par texte de recherche
      const matchesSearch = 
        ticket.match?.equipe1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.match?.equipe2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.match?.lieu?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtre par statut
      let matchesStatus = true;
      if (filterStatus === 'available') {
        matchesStatus = !ticket.estVendu;
      } else if (filterStatus === 'sold') {
        matchesStatus = ticket.estVendu;
      }
      
      return matchesSearch && matchesStatus;
    });
  };
  
  // Trier les tickets
  const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      switch (sortBy) {
        case 'date_asc':
          return new Date(a.match.date) - new Date(b.match.date);
        case 'date_desc':
          return new Date(b.match.date) - new Date(a.match.date);
        case 'price_asc':
          return a.prix - b.prix;
        case 'price_desc':
          return b.prix - a.prix;
        default:
          return 0;
      }
    });
  };
  
  // Filtrer et trier les tickets achetés
  const filteredPurchasedTickets = sortTickets(filterTickets(purchasedTickets));
  
  // Filtrer et trier les tickets en vente
  const filteredSaleTickets = sortTickets(filterTickets(saleTickets));
  
  // Voir les détails d'un ticket
  const handleViewTicket = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}`);
  };
  
  // Modifier un ticket
  const handleEditTicket = (ticketId) => {
    navigate(`/admin/tickets/${ticketId}/edit`);
  };
  
  // Supprimer un ticket
  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket de la vente ?')) {
      try {
        await deleteTicket(ticketId);
        setDeleteSuccess(true);
        setTimeout(() => setDeleteSuccess(false), 3000);
      } catch (err) {
        setError(err.message || 'Erreur lors de la suppression du ticket');
        console.error(err);
      }
    }
  };
  
  // Télécharger un e-ticket
  const handleDownloadTicket = (ticketId) => {
    alert('Fonctionnalité de téléchargement en cours de développement');
    // Ici, vous implémenteriez la fonctionnalité pour télécharger le e-ticket
  };
  
  // Mettre un nouveau ticket en vente
  const handleCreateTicket = () => {
    navigate('/admin/tickets/create');
  };
  
  // Composant pour le spinner de chargement
  const LoadingSpinner = () => (
    <div className="loading">
      <div className="loading-spinner"></div>
      <div>Chargement de vos tickets...</div>
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
        <Header title="Mes Tickets" />
        
        <div className="dashboard-content">
          {error && (
            <div className="error-alert">
              <FaExclamationTriangle />
              {error}
            </div>
          )}
          
          {deleteSuccess && (
            <div className="success-alert">
              <FaTicketAlt />
              Ticket supprimé avec succès
            </div>
          )}
          
          <div className="tabs">
            <div 
              className={`tab ${activeTab === 'purchased' ? 'active' : ''}`}
              onClick={() => setActiveTab('purchased')}
            >
              <FaShoppingCart style={{ marginRight: '8px' }} />
              Tickets Achetés
            </div>
            <div 
              className={`tab ${activeTab === 'selling' ? 'active' : ''}`}
              onClick={() => setActiveTab('selling')}
            >
              <FaStore style={{ marginRight: '8px' }} />
              Tickets en Vente
            </div>
          </div>
          
          <div className="filter-sort-container" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '20px',
            flexWrap: 'wrap',
            gap: '15px'
          }}>
            <div className="search-container" style={{ maxWidth: '300px' }}>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Rechercher un ticket..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <FaSearch className="search-icon" />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div className="filter-group" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaFilter style={{ color: 'var(--primary)' }} />
                <select 
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', minWidth: '150px' }}
                >
                  <option value="all">Tous les tickets</option>
                  <option value="available">Disponibles</option>
                  <option value="sold">Vendus</option>
                </select>
              </div>
              
              <div className="sort-options" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FaSortAmountDown style={{ color: 'var(--primary)' }} />
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="form-control"
                  style={{ width: 'auto', minWidth: '180px' }}
                >
                  <option value="date_desc">Date (plus récent)</option>
                  <option value="date_asc">Date (plus ancien)</option>
                  <option value="price_asc">Prix (croissant)</option>
                  <option value="price_desc">Prix (décroissant)</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className={`tab-content ${activeTab === 'purchased' ? 'active' : ''}`}>
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <FaTicketAlt style={{ color: 'var(--primary)' }} />
                  Vos tickets achetés
                </h2>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : filteredPurchasedTickets.length > 0 ? (
                <div className="tickets-grid" style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '25px'
                }}>
                  {filteredPurchasedTickets.map((ticket, index) => (
                    <div key={ticket.id} className="ticket-card" style={{ 
                      backgroundColor: 'white',
                      borderRadius: 'var(--border-radius-lg)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'all var(--transition-normal)',
                      border: '2px solid var(--accent)',
                      animation: `fadeInUp ${0.3 + index * 0.05}s ease-out`
                    }}>
                      <div className="ticket-header" style={{ 
                        background: 'var(--accent-gradient)',
                        color: 'white',
                        padding: '15px 20px',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          backgroundColor: 'var(--success)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '4px 8px',
                          borderRadius: '12px'
                        }}>
                          Acheté
                        </div>
                        
                        <div style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: '700',
                          marginBottom: '5px'
                        }}>
                          {ticket.match.equipe1} vs {ticket.match.equipe2}
                        </div>
                        
                        <div style={{ 
                          fontSize: '0.95rem', 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '5px',
                          opacity: '0.9'
                        }}>
                          <FaCalendarAlt style={{ fontSize: '0.9rem' }} />
                          {formatDate(ticket.match.date)}
                        </div>
                      </div>
                      
                      <div className="ticket-body" style={{ padding: '20px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(0, 178, 143, 0.1)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '15px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            marginBottom: '5px', 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--accent)'
                          }}>
                            <FaTags />
                            Prix payé
                          </div>
                          <div style={{ 
                            fontSize: '1.3rem', 
                            fontWeight: '700',
                            color: 'var(--accent)'
                          }}>
                            {formatCurrency(ticket.prix)}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                          <div style={{ fontWeight: '600', marginBottom: '5px', color: '#444' }}>Lieu du match</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
                            {ticket.match.lieu}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                          <div style={{ fontWeight: '600', marginBottom: '5px', color: '#444' }}>Vendeur</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaUserAlt style={{ color: 'var(--purple)' }} />
                            {ticket.vendeur.nom}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '20px', fontSize: '0.9rem', color: '#666' }}>
                          <div style={{ fontWeight: '600', marginBottom: '5px', color: '#444' }}>Date d'achat</div>
                          <div>{formatDate(ticket.dateAchat)}</div>
                        </div>
                        
                        <div className="ticket-actions" style={{ 
                          display: 'flex', 
                          gap: '10px'
                        }}>
                          <button 
                            className="btn btn-accent"
                            onClick={() => handleViewTicket(ticket.id)}
                            style={{ flex: '1' }}
                          >
                            <FaEye /> Voir
                          </button>
                          
                          <button 
                            className="btn btn-primary"
                            onClick={() => handleDownloadTicket(ticket.id)}
                            style={{ flex: '1' }}
                          >
                            <FaDownload /> E-Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon"><FaTicketAlt /></div>
                  <p>Vous n'avez pas encore acheté de tickets</p>
                  <button className="btn btn-primary" onClick={() => navigate('/admin/tickets')}>
                    Voir les tickets disponibles
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className={`tab-content ${activeTab === 'selling' ? 'active' : ''}`}>
            <div className="dashboard-section">
              <div className="section-header">
                <h2>
                  <FaStore style={{ color: 'var(--secondary)' }} />
                  Vos tickets en vente
                </h2>
                
                <button
                  className="btn btn-secondary"
                  onClick={handleCreateTicket}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <FaPlusCircle /> Mettre un ticket en vente
                </button>
              </div>
              
              {loading ? (
                <LoadingSpinner />
              ) : filteredSaleTickets.length > 0 ? (
                <div className="tickets-grid" style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '25px'
                }}>
                  {filteredSaleTickets.map((ticket, index) => (
                    <div key={ticket.id} className="ticket-card" style={{ 
                      backgroundColor: 'white',
                      borderRadius: 'var(--border-radius-lg)',
                      overflow: 'hidden',
                      boxShadow: 'var(--shadow-md)',
                      transition: 'all var(--transition-normal)',
                      border: ticket.estVendu ? '2px solid var(--error)' : '2px solid var(--secondary)',
                      animation: `fadeInUp ${0.3 + index * 0.05}s ease-out`
                    }}>
                      <div className="ticket-header" style={{ 
                        background: ticket.estVendu ? 
                          'linear-gradient(135deg, #ff3d57 0%, #ff5f7e 100%)' : 
                          'var(--secondary-gradient)',
                        color: ticket.estVendu ? 'white' : 'var(--dark)',
                        padding: '15px 20px',
                        position: 'relative'
                      }}>
                        <div style={{ 
                          position: 'absolute', 
                          top: '10px', 
                          right: '10px', 
                          backgroundColor: ticket.estVendu ? 'var(--error)' : 'var(--dark)',
                          color: 'white',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          padding: '4px 8px',
                          borderRadius: '12px'
                        }}>
                          {ticket.estVendu ? 'Vendu' : 'En vente'}
                        </div>
                        
                        <div style={{ 
                          fontSize: '1.3rem', 
                          fontWeight: '700',
                          marginBottom: '5px'
                        }}>
                          {ticket.match.equipe1} vs {ticket.match.equipe2}
                        </div>
                        
                        <div style={{ 
                          fontSize: '0.95rem', 
                          display: 'flex', 
                          alignItems: 'center',
                          gap: '5px',
                          opacity: '0.9'
                        }}>
                          <FaCalendarAlt style={{ fontSize: '0.9rem' }} />
                          {formatDate(ticket.match.date)}
                        </div>
                      </div>
                      
                      <div className="ticket-body" style={{ padding: '20px' }}>
                        <div style={{ 
                          backgroundColor: 'rgba(255, 192, 0, 0.1)',
                          borderRadius: 'var(--border-radius-md)',
                          padding: '15px',
                          marginBottom: '20px'
                        }}>
                          <div style={{ 
                            fontWeight: '600', 
                            marginBottom: '5px', 
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            color: 'var(--secondary)'
                          }}>
                            <FaTags />
                            Prix de vente
                          </div>
                          <div style={{ 
                            fontSize: '1.3rem', 
                            fontWeight: '700',
                            color: 'var(--secondary)'
                          }}>
                            {formatCurrency(ticket.prix)}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                          <div style={{ fontWeight: '600', marginBottom: '5px', color: '#444' }}>Lieu du match</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaMapMarkerAlt style={{ color: 'var(--primary)' }} />
                            {ticket.match.lieu}
                          </div>
                        </div>
                        
                        <div style={{ marginBottom: '15px', fontSize: '0.9rem', color: '#666' }}>
                          <div style={{ fontWeight: '600', marginBottom: '5px', color: '#444' }}>Date du match</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <FaCalendarAlt style={{ color: 'var(--primary)' }} />
                            Dans {getDaysRemaining(ticket.match.date)} jours
                          </div>
                        </div>
                        
                        <div className="ticket-actions" style={{ 
                          display: 'flex', 
                          gap: '10px'
                        }}>
                          <button 
                            className="btn btn-accent"
                            onClick={() => handleViewTicket(ticket.id)}
                            style={{ flex: '1' }}
                          >
                            <FaEye /> Voir
                          </button>
                          
                          {!ticket.estVendu && (
                            <>
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleEditTicket(ticket.id)}
                                style={{ flex: '1' }}
                              >
                                <FaEdit /> Modifier
                              </button>
                              
                              <button 
                                className="btn btn-danger"
                                onClick={() => handleDeleteTicket(ticket.id)}
                                style={{ flex: '1' }}
                              >
                                <FaTrashAlt /> Supprimer
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-data">
                  <div className="no-data-icon"><FaStore /></div>
                  <p>Vous n'avez pas de tickets en vente</p>
                  <button className="btn btn-secondary" onClick={handleCreateTicket}>
                    <FaPlusCircle /> Mettre un ticket en vente
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyTickets;