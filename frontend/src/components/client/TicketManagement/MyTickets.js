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
  FaFilter,
  FaPlus,
  FaCheckCircle
} from 'react-icons/fa';
import { getMyPurchasedTickets, getMyTicketsForSale, deleteTicket } from '../../../api/ticketAPI';
import Sidebar from '../Sidebar';
import Header from '../Header';
import '../../admin/AdminDashboard.css';
import { jsPDF } from 'jspdf'; // Importer jsPDF
import QRCode from 'qrcode'; // Importer qrcode
import JsBarcode from 'jsbarcode'; // Importer jsbarcode

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState('purchased');
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [saleTickets, setSaleTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  const navigate = useNavigate();

  useEffect(() => {
    const loadTickets = async () => {
      try {
        setLoading(true);
        setError('');

        const purchasedData = await getMyPurchasedTickets();
        setPurchasedTickets(purchasedData.tickets || []);

        const salesData = await getMyTicketsForSale();
        setSaleTickets(salesData.tickets || []);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement des tickets');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadTickets();
  }, [deleteSuccess]);

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

  const getDaysRemaining = (dateString) => {
    const matchDate = new Date(dateString);
    const today = new Date();
    const diffTime = Math.abs(matchDate - today);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filterTickets = (tickets) => {
    return tickets.filter(ticket => {
      if (!ticket.match) return false;
      const matchesSearch =
        ticket.match.equipe1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.match.equipe2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.match.lieu?.toLowerCase().includes(searchTerm.toLowerCase());

      let matchesStatus = true;
      if (filterStatus === 'available') {
        matchesStatus = !ticket.estVendu;
      } else if (filterStatus === 'sold') {
        matchesStatus = ticket.estVendu;
      }

      return matchesSearch && matchesStatus;
    });
  };

  const sortTickets = (tickets) => {
    return [...tickets].sort((a, b) => {
      try {
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
      } catch (err) {
        return 0;
      }
    });
  };

  const filteredPurchasedTickets = sortTickets(filterTickets(purchasedTickets));
  const filteredSaleTickets = sortTickets(filterTickets(saleTickets));

  const handleViewTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}`);
  };

  const handleEditTicket = (ticketId) => {
    navigate(`/tickets/${ticketId}/edit`);
  };

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

  const handleDownloadTicket = async (ticketId) => {
    // Trouver le ticket correspondant dans purchasedTickets
    const ticket = purchasedTickets.find(t => t.id === ticketId);
    if (!ticket) {
      setError('Ticket non trouvé pour le téléchargement');
      return;
    }

    try {
      // Créer un nouveau document PDF avec jsPDF
      const doc = new jsPDF();

      // Définir les couleurs et styles globaux
      const accentColor = [0, 178, 143]; // var(--accent) en RGB
      const darkColor = [34, 34, 34]; // var(--dark) en RGB
      const greyColor = [100, 100, 100]; // Gris pour les textes secondaires

      // Générer le QR Code
      const qrCodeData = `Ticket ID: ${ticket.id}`; // Données à encoder dans le QR Code
      const qrCodeDataUrl = await QRCode.toDataURL(qrCodeData, {
        width: 80,
        margin: 1,
      });

      // Générer le code-barres
      const canvas = document.createElement('canvas');
      JsBarcode(canvas, ticket.id.toString(), {
        format: 'CODE128',
        width: 2,
        height: 40,
        displayValue: true,
        fontSize: 12,
        margin: 5,
      });
      const barcodeDataUrl = canvas.toDataURL('image/png');

      // En-tête
      doc.setFillColor(...accentColor);
      doc.rect(0, 0, 210, 40, 'F'); // Bandeau vert en haut
      doc.setFontSize(22);
      doc.setTextColor(255, 255, 255); // Blanc pour le texte sur fond vert
      doc.setFont('helvetica', 'bold');
      doc.text('Ticket Officiel - CAN 2025', 105, 20, { align: 'center' });
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Votre billet pour une expérience inoubliable', 105, 30, { align: 'center' });

      // Cadre principal pour les informations
      doc.setDrawColor(...accentColor);
      doc.setLineWidth(1);
      doc.rect(10, 50, 190, 200); // Cadre autour des informations

      // Titre du match
      doc.setFontSize(16);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.text(`${ticket.match.equipe1} vs ${ticket.match.equipe2}`, 20, 65);

      // Ligne de séparation
      doc.setDrawColor(...greyColor);
      doc.setLineWidth(0.5);
      doc.line(20, 70, 190, 70);

      // Détails du ticket
      doc.setFontSize(12);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'normal');

      // Informations sous forme de liste
      doc.text(`Lieu: ${ticket.match.lieu}`, 20, 85);
      doc.text(`Date: ${formatDate(ticket.match.date)}`, 20, 95);
      doc.text(`Prix: ${formatCurrency(ticket.prix)}`, 20, 105);
      doc.text(`Vendeur: ${ticket.vendeur?.nom || 'Non spécifié'}`, 20, 115);
      doc.text(`Date d'achat: ${formatDate(ticket.dateAchat)}`, 20, 125);
      doc.text(`ID du ticket: ${ticket.id}`, 20, 135);

      // Ajouter le QR Code
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text('Scan pour vérifier', 150, 85);
      doc.addImage(qrCodeDataUrl, 'PNG', 150, 90, 30, 30);

      // Ajouter le code-barres
      doc.text('Code-barres', 20, 155);
      doc.addImage(barcodeDataUrl, 'PNG', 20, 160, 80, 20);

      // Section "Instructions"
      doc.setFontSize(14);
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'bold');
      doc.text('Instructions', 20, 195);
      doc.setLineWidth(0.5);
      doc.line(20, 200, 190, 200);

      doc.setFontSize(11);
      doc.setTextColor(...greyColor);
      doc.setFont('helvetica', 'normal');
      doc.text('• Veuillez arriver 30 minutes avant le début du match.', 20, 210);
      doc.text('• Présentez ce ticket à l’entrée du stade.', 20, 220);
      doc.text('• Ce ticket est non remboursable.', 20, 230);

      // Pied de page
      doc.setFillColor(...accentColor);
      doc.rect(0, 257, 210, 40, 'F'); // Bandeau vert en bas
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'italic');
      doc.text('Merci pour votre achat ! Profitez du match !', 105, 270, { align: 'center' });
      doc.text('CAN 2025 - Tous droits réservés', 105, 280, { align: 'center' });

      // Générer un nom de fichier unique
      const fileName = `ticket_${ticket.match.equipe1}_vs_${ticket.match.equipe2}_${ticket.id}.pdf`;

      // Télécharger le PDF
      doc.save(fileName);
    } catch (err) {
      setError('Erreur lors de la génération du PDF');
      console.error('Erreur lors du téléchargement du ticket:', err);
    }
  };

  const handleCreateTicket = () => {
    navigate('/tickets/create');
  };

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

          {deleteSuccess && (
            <div className="success-alert" style={{
              backgroundColor: 'rgba(0, 202, 114, 0.1)',
              color: 'var(--success)',
              padding: '15px',
              borderRadius: 'var(--border-radius)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <FaCheckCircle />
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

          <div className={`tab-content ${activeTab === 'purchased' ? 'active' : ''}`}>
            <div className="dashboard-section">
              <div className="section-header">
                <div className="section-title">
                  <h2>Vos tickets achetés</h2>
                  <p className="section-subtitle">Liste de vos tickets achetés</p>
                </div>
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
                            {ticket.vendeur?.nom || 'Non spécifié'}
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
                            <FaDownload /> Télécharger
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
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      console.log('Clic sur "Voir les tickets disponibles"');
                      try {
                        navigate('/tickets/list');
                        console.log('Navigation vers : /tickets/list');
                      } catch (error) {
                        console.error('Erreur lors de la navigation :', error);
                      }
                    }}
                  >
                    Voir les tickets disponibles
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'selling' ? 'active' : ''}`}>
            <div className="dashboard-section">
              <div className="feature-header">
                <div className="feature-header-content">
                  <h1 className="feature-title">Gestion des tickets CAN 2025</h1>
                  <p className="feature-description">
                    Gérez vos tickets pour la CAN 2025, ajoutez de nouveaux tickets ou modifiez ceux existants.
                  </p>
                  <div className="feature-actions">
                    <button
                      className="btn-feature"
                      onClick={handleCreateTicket}
                    >
                      <FaPlus /> Ajouter un ticket
                    </button>
                  </div>
                </div>
                <div className="feature-icon">
                  <FaTicketAlt />
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