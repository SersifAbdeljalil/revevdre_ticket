// src/components/admin/TicketManagement/TicketsList.js
import React, { useState, useEffect } from 'react';
import { 
  FaTicketAlt, 
  FaSearch, 
  FaFilter, 
  FaEllipsisV, 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaDownload,
  FaPlus,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaUser,
  FaSyncAlt
} from 'react-icons/fa';
import { getAllTickets, deleteTicket, downloadTicketReport } from '../../../api/ticketAPI';
import Sidebar from '../Sidebar';
import Header from '../Header';
import TicketDetails from './TicketDetails';
import AddTicket from './AddTicket';
import '../AdminDashboard.css';

// Composant pour le spinner de chargement
const LoadingSpinner = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
    <div>Chargement des tickets...</div>
    <div className="dot-loader">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </div>
);

const TicketsList = () => {
  const [tickets, setTickets] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTicket, setEditTicket] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Charger les tickets
  const loadTickets = async () => {
    try {
      setLoading(true);
      const data = await getAllTickets();
      setTickets(data.tickets || []);
      setFilteredTickets(data.tickets || []);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des tickets');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadTickets();
  }, []);
  
  // Filtrer les tickets selon la recherche et le statut
  useEffect(() => {
    let results = tickets;
    
    // Filtre par recherche
    if (searchTerm) {
      results = results.filter(ticket => 
        ticket.id.toString().includes(searchTerm) ||
        ticket.match?.equipe1.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.match?.equipe2.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.client?.nom.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtre par statut
    if (filterStatus !== 'all') {
      results = results.filter(ticket => {
        if (filterStatus === 'vendu') return !ticket.estRevendu;
        if (filterStatus === 'revendu') return ticket.estRevendu;
        return true;
      });
    }
    
    setFilteredTickets(results);
    setCurrentPage(1); // Réinitialiser la pagination
  }, [searchTerm, filterStatus, tickets]);
  
  // Supprimer un ticket
  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
      try {
        await deleteTicket(ticketId);
        setTickets(tickets.filter(ticket => ticket.id !== ticketId));
        setFilteredTickets(filteredTickets.filter(ticket => ticket.id !== ticketId));
      } catch (err) {
        setError('Erreur lors de la suppression du ticket');
        console.error(err);
      }
    }
  };
  
  // Modifier un ticket
  const handleEditTicket = (ticket) => {
    setEditTicket(ticket);
    setShowAddModal(true);
  };
  
  // Voir les détails d'un ticket
  const handleViewDetails = (ticket) => {
    setSelectedTicket(ticket);
    setShowDetailsModal(true);
  };
  
  // Générer un rapport
  const handleGenerateReport = async () => {
    try {
      setIsGeneratingReport(true);
      await downloadTicketReport();
      // Le téléchargement se fera automatiquement grâce à l'API
    } catch (err) {
      setError('Erreur lors de la génération du rapport');
      console.error(err);
    } finally {
      setIsGeneratingReport(false);
    }
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
  
  // Formater le montant en FCFA
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Pagination
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);
  
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Gestion des tickets" />
        
        <div className="dashboard-content">
          {error && (
            <div className="error-alert">
              <FaTicketAlt />
              {error}
            </div>
          )}
          
          <div className="welcome-banner" style={{
            background: 'linear-gradient(135deg, #ff6b01 0%, #ff9a44 100%)',
            borderRadius: 'var(--border-radius-lg)',
            padding: '30px',
            marginBottom: '30px',
            color: 'white',
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
              <h2 style={{ 
                margin: '0 0 15px 0',
                fontSize: '1.8rem',
                fontWeight: '700'
              }}>
                Gestion des tickets CAN 2025
              </h2>
              
              <p style={{ fontSize: '1.1rem', maxWidth: '800px', marginBottom: '20px' }}>
                Gérez les tickets vendus, suivez les reventes et assurez un contrôle optimal de la billetterie pour tous les matchs.
              </p>
              
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button 
                  className="btn-3d" 
                  style={{
                    background: 'white',
                    color: '#ff6b01',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 'var(--border-radius-md)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    fontSize: '0.95rem'
                  }}
                  onClick={() => setShowAddModal(true)}
                >
                  <FaPlus /> Ajouter un ticket
                </button>
                
                <button 
                  style={{
                    background: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: 'var(--border-radius-md)',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    backdropFilter: 'blur(5px)',
                    fontSize: '0.95rem'
                  }}
                  onClick={handleGenerateReport}
                  disabled={isGeneratingReport}
                >
                  {isGeneratingReport ? <FaSyncAlt className="fa-spin" /> : <FaDownload />}
                  {isGeneratingReport ? 'Génération...' : 'Télécharger rapport'}
                </button>
              </div>
            </div>
            
            <div style={{
              position: 'absolute',
              right: '30px',
              bottom: '-20px',
              fontSize: '8rem',
              opacity: '0.2',
              transform: 'rotate(15deg)',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <FaTicketAlt />
            </div>
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <h2>
                <FaTicketAlt style={{ color: 'var(--primary)' }} />
                Liste des tickets
              </h2>
              
              <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
                <div className="search-container">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher un ticket..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <FaSearch className="search-icon" />
                </div>
                
                <div className="filter-container" style={{ position: 'relative' }}>
                  <select 
                    className="form-control"
                    style={{ paddingLeft: '35px', minWidth: '150px' }}
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">Tous les tickets</option>
                    <option value="vendu">Vendus</option>
                    <option value="revendu">Revendus</option>
                  </select>
                  <FaFilter style={{ 
                    position: 'absolute',
                    left: '12px', 
                    top: '50%', 
                    transform: 'translateY(-50%)',
                    color: '#888',
                    pointerEvents: 'none'
                  }} />
                </div>
              </div>
            </div>
            
            {loading ? (
              <LoadingSpinner />
            ) : (
              <>
                {currentTickets.length > 0 ? (
                  <div className="data-table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Match</th>
                          <th>Date</th>
                          <th>Client</th>
                          <th>Prix</th>
                          <th>Statut</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTickets.map((ticket, index) => (
                          <tr key={ticket.id} style={{ '--row-index': index }}>
                            <td>#{ticket.id}</td>
                            <td>
                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}>
                                <span style={{ 
                                  padding: '8px',
                                  borderRadius: 'var(--border-radius-sm)',
                                  background: 'var(--primary-gradient)',
                                  color: 'white',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <FaCalendarAlt />
                                </span>
                                <div>
                                  <strong>{ticket.match?.equipe1 || '?'}</strong> 
                                  <span style={{ margin: '0 8px', opacity: '0.7' }}>VS</span> 
                                  <strong>{ticket.match?.equipe2 || '?'}</strong>
                                </div>
                              </div>
                            </td>
                            <td>{formatDate(ticket.dateAchat || ticket.date || new Date())}</td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaUser style={{ color: 'var(--accent)' }} />
                                {ticket.client?.nom || "Client inconnu"}
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', color: 'var(--primary)' }}>
                                <FaMoneyBillWave />
                                {formatCurrency(ticket.prix || 0)}
                              </div>
                            </td>
                            <td>
                              <span className={`status-badge ${ticket.estRevendu ? 'blocked' : 'active'}`}>
                                {ticket.estRevendu ? 'Revendu' : 'Vendu'}
                              </span>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button 
                                  className="btn btn-sm btn-accent tooltip"
                                  onClick={() => handleViewDetails(ticket)}
                                >
                                  <FaEye />
                                  <span className="tooltip-text">Voir les détails</span>
                                </button>
                                
                                <button 
                                  className="btn btn-sm btn-primary tooltip"
                                  onClick={() => handleEditTicket(ticket)}
                                >
                                  <FaEdit />
                                  <span className="tooltip-text">Modifier</span>
                                </button>
                                
                                <button 
                                  className="btn btn-sm btn-danger tooltip"
                                  onClick={() => handleDeleteTicket(ticket.id)}
                                >
                                  <FaTrash />
                                  <span className="tooltip-text">Supprimer</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    <div className="data-table-pagination">
                      <div className="pagination-info">
                        Affichage de {Math.min(indexOfFirstTicket + 1, filteredTickets.length)} à {Math.min(indexOfLastTicket, filteredTickets.length)} sur {filteredTickets.length} tickets
                      </div>
                      
                      <div className="pagination-controls">
                        <button 
                          className={`page-btn ${currentPage === 1 ? 'disabled' : ''}`}
                          onClick={() => currentPage > 1 && paginate(currentPage - 1)}
                          disabled={currentPage === 1}
                        >
                          &laquo;
                        </button>
                        
                        {[...Array(totalPages).keys()].map(number => (
                          <button
                            key={number + 1}
                            onClick={() => paginate(number + 1)}
                            className={`page-btn ${currentPage === number + 1 ? 'active' : ''}`}
                          >
                            {number + 1}
                          </button>
                        ))}
                        
                        <button 
                          className={`page-btn ${currentPage === totalPages ? 'disabled' : ''}`}
                          onClick={() => currentPage < totalPages && paginate(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        >
                          &raquo;
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="no-data">
                    <div className="no-data-icon"><FaTicketAlt /></div>
                    {searchTerm || filterStatus !== 'all' 
                      ? "Aucun ticket ne correspond à vos critères de recherche" 
                      : "Aucun ticket disponible"}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal d'ajout/modification de ticket */}
      {showAddModal && (
        <AddTicket 
          ticket={editTicket}
          onClose={() => {
            setShowAddModal(false);
            setEditTicket(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditTicket(null);
            loadTickets();
          }}
        />
      )}
      
      {/* Modal de détails de ticket */}
      {showDetailsModal && selectedTicket && (
        <TicketDetails 
          ticket={selectedTicket}
          onClose={() => setShowDetailsModal(false)}
        />
      )}
    </div>
  );
};

export default TicketsList;