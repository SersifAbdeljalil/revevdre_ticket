// src/components/admin/TicketManagement/TicketDetails.js
import React, { useState } from 'react';
import { 
  FaTimes, 
  FaTicketAlt, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUser, 
  FaMoneyBillWave, 
  FaClock,
  FaQrcode,
  FaPrint,
  FaEnvelope,
  FaCheck,
  FaExclamationTriangle
} from 'react-icons/fa';
import { resendTicket, validateTicket } from '../../../api/ticketAPI';
import { QRCodeSVG } from 'qrcode.react'; // Import corrigé
import '../AdminDashboard.css';

const TicketDetails = ({ ticket, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
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
  
  // Fonction pour renvoyer le ticket par email
  const handleResendTicket = async () => {
    try {
      setLoading(true);
      await resendTicket(ticket.id);
      setMessage({ 
        type: 'success', 
        text: 'Le ticket a été renvoyé avec succès' 
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors du renvoi du ticket' 
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour valider un ticket (utilisation pour entrée au stade)
  const handleValidateTicket = async () => {
    try {
      setLoading(true);
      await validateTicket(ticket.id);
      setMessage({ 
        type: 'success', 
        text: 'Le ticket a été validé avec succès' 
      });
    } catch (err) {
      setMessage({ 
        type: 'error', 
        text: 'Erreur lors de la validation du ticket' 
      });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  // Fonction pour imprimer le ticket
  const handlePrintTicket = () => {
    // Ouvrir une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    
    // Contenu à imprimer
    const printContent = `
      <html>
      <head>
        <title>Ticket CAN 2025 - #${ticket.id}</title>
        <style>
          body {
            font-family: 'Arial', sans-serif;
            margin: 0;
            padding: 20px;
          }
          .ticket {
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #ff6b01;
            border-radius: 10px;
            overflow: hidden;
          }
          .ticket-header {
            background: linear-gradient(135deg, #ff6b01 0%, #ff9a44 100%);
            color: white;
            padding: 20px;
            text-align: center;
          }
          .ticket-body {
            padding: 20px;
          }
          .ticket-info {
            display: flex;
            flex-wrap: wrap;
            margin-bottom: 20px;
          }
          .info-item {
            width: 50%;
            padding: 10px;
            box-sizing: border-box;
          }
          .info-label {
            font-weight: bold;
            margin-bottom: 5px;
            color: #666;
          }
          .info-value {
            font-size: 1.2em;
          }
          .ticket-match {
            text-align: center;
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f8f8;
            border-radius: 8px;
          }
          .teams {
            font-size: 1.6em;
            font-weight: bold;
            margin: 10px 0;
          }
          .vs {
            margin: 0 10px;
            color: #888;
          }
          .qr-section {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px dashed #ccc;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            font-size: 0.9em;
            color: #888;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="ticket-header">
            <h1>Ticket CAN 2025</h1>
            <p>Ticket #${ticket.id}</p>
          </div>
          <div class="ticket-body">
            <div class="ticket-match">
              <div class="info-label">Match</div>
              <div class="teams">${ticket.match?.equipe1 || '?'} <span class="vs">VS</span> ${ticket.match?.equipe2 || '?'}</div>
              <div>${formatDate(ticket.match?.date || new Date())}</div>
              <div>${ticket.match?.lieu || 'Lieu non spécifié'}</div>
            </div>
            
            <div class="ticket-info">
              <div class="info-item">
                <div class="info-label">Client</div>
                <div class="info-value">${ticket.client?.nom || 'Client inconnu'}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Prix</div>
                <div class="info-value">${formatCurrency(ticket.prix || 0)}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Date d'achat</div>
                <div class="info-value">${formatDate(ticket.dateAchat || ticket.date || new Date())}</div>
              </div>
              <div class="info-item">
                <div class="info-label">Statut</div>
                <div class="info-value">${ticket.estRevendu ? 'Revendu' : 'Valide'}</div>
              </div>
            </div>
            
            <div class="qr-section">
              <div class="info-label">Code d'authentification</div>
              <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-CAN2025-${ticket.id}" alt="QR Code" />
              <p>Scannez ce code pour valider votre ticket à l'entrée du stade</p>
            </div>
            
            <div class="footer">
              <p>Ce ticket est officiel et a été émis par le Comité d'Organisation de la CAN 2025.</p>
              <p>Pour toute assistance, veuillez contacter support@can2025.org</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
    
    // Écrire dans la nouvelle fenêtre et imprimer
    printWindow.document.open();
    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Imprimer après chargement
    printWindow.onload = function() {
      printWindow.print();
      // printWindow.close(); // Optionnel: fermer après impression
    };
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header" style={{ backgroundColor: '#ff6b01', color: 'white' }}>
          <h2 style={{ color: 'white', WebkitTextFillColor: 'white' }}>Détails du ticket #{ticket.id}</h2>
          <button className="modal-close" onClick={onClose} style={{ color: 'white' }}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          {message.text && (
            <div className={`${message.type === 'success' ? 'success-alert' : 'error-alert'}`}>
              {message.type === 'success' ? <FaCheck /> : <FaExclamationTriangle />}
              {message.text}
            </div>
          )}
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Section Match */}
            <div className="info-card">
              <div className="info-card-header">
                <div className="info-card-icon primary">
                  <FaCalendarAlt />
                </div>
                <div>
                  <h3 className="info-card-title">Détails du match</h3>
                  <p className="info-card-subtitle">Informations sur l'événement</p>
                </div>
              </div>
              
              <div className="info-card-content">
                <div style={{ 
                  textAlign: 'center', 
                  margin: '20px 0', 
                  padding: '20px', 
                  backgroundColor: 'rgba(255, 107, 1, 0.05)',
                  borderRadius: 'var(--border-radius-md)'
                }}>
                  <div style={{ fontSize: '1.6rem', fontWeight: '700', margin: '10px 0' }}>
                    {ticket.match?.equipe1 || '?'} 
                    <span style={{ margin: '0 15px', color: '#888', fontWeight: '400' }}>VS</span> 
                    {ticket.match?.equipe2 || '?'}
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', marginTop: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaClock style={{ color: 'var(--primary)' }} />
                      {formatDate(ticket.match?.date || new Date())}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FaMapMarkerAlt style={{ color: 'var(--accent)' }} />
                      {ticket.match?.lieu || 'Lieu non spécifié'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Section Client et Paiement */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div className="info-card secondary">
                <div className="info-card-header">
                  <div className="info-card-icon secondary">
                    <FaUser />
                  </div>
                  <div>
                    <h3 className="info-card-title">Informations client</h3>
                    <p className="info-card-subtitle">Détails de l'acheteur</p>
                  </div>
                </div>
                
                <div className="info-card-content">
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Nom:</strong>
                    <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>
                      {ticket.client?.nom || 'Client inconnu'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Email:</strong>
                    <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>
                      {ticket.client?.email || 'Email non disponible'}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>ID Client:</strong>
                    <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>
                      #{ticket.client?.id || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="info-card accent">
                <div className="info-card-header">
                  <div className="info-card-icon accent">
                    <FaMoneyBillWave />
                  </div>
                  <div>
                    <h3 className="info-card-title">Détails du paiement</h3>
                    <p className="info-card-subtitle">Informations de transaction</p>
                  </div>
                </div>
                
                <div className="info-card-content">
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Prix:</strong>
                    <div style={{ fontSize: '1.2rem', marginTop: '5px', color: 'var(--accent)', fontWeight: '600' }}>
                      {formatCurrency(ticket.prix || 0)}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Date d'achat:</strong>
                    <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>
                      {formatDate(ticket.dateAchat || ticket.date || new Date())}
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong>Méthode de paiement:</strong>
                    <div style={{ fontSize: '1.1rem', marginTop: '5px' }}>
                      {ticket.paiement?.methode || 'Non spécifiée'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* QR Code et Statut */}
            <div className="info-card purple">
              <div className="info-card-header">
                <div className="info-card-icon purple">
                  <FaTicketAlt />
                </div>
                <div>
                  <h3 className="info-card-title">Statut du ticket</h3>
                  <p className="info-card-subtitle">Validité et authentification</p>
                </div>
              </div>
              
              <div className="info-card-content">
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '15px' }}>
                  <div style={{ 
                    display: 'inline-block', 
                    padding: '8px 15px', 
                    borderRadius: '30px',
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: ticket.estRevendu ? 'var(--error)' : 'var(--success)',
                    backgroundColor: ticket.estRevendu ? 'rgba(255, 61, 87, 0.1)' : 'rgba(0, 202, 114, 0.1)',
                    marginBottom: '10px'
                  }}>
                    {ticket.estRevendu ? 'Ticket revendu' : 'Ticket valide'}
                  </div>
                  
                  <div style={{ 
                    backgroundColor: 'white',
                    padding: '15px',
                    borderRadius: 'var(--border-radius-md)',
                    display: 'inline-block',
                    boxShadow: 'var(--shadow-md)'
                  }}>
                    <QRCodeSVG 
                      value={`TICKET-CAN2025-${ticket.id}`}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  
                  <div style={{ fontSize: '0.9rem', color: '#666', maxWidth: '300px', margin: '0 auto' }}>
                    Ce code QR est utilisé pour valider l'entrée au stade. Chaque ticket ne peut être utilisé qu'une seule fois.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' }}>
            <div>
              <button className="btn btn-danger" onClick={onClose}>
                Fermer
              </button>
            </div>
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={handlePrintTicket}
                disabled={loading}
              >
                <FaPrint /> Imprimer
              </button>
              
              <button 
                className="btn btn-accent" 
                onClick={handleResendTicket}
                disabled={loading}
              >
                <FaEnvelope /> Renvoyer par email
              </button>
              
              <button 
                className="btn btn-primary" 
                onClick={handleValidateTicket}
                disabled={loading || ticket.estRevendu}
              >
                <FaCheck /> Valider l'entrée
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetails;