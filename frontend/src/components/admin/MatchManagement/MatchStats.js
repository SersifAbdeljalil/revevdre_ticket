// src/components/admin/MatchManagement/MatchStats.js
import React from 'react';
import { FaTimes, FaTicketAlt, FaMoneyBillWave, FaChartPie } from 'react-icons/fa';
import '../AdminDashboard.css';

const MatchStats = ({ matchData, onClose }) => {
  const { match, sales } = matchData;
  
  // Formatage de la date
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
  
  // Formatage du montant
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };
  
  // Calculer le taux de remplissage
  const fillRate = parseFloat(sales.fillRate);
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header" style={{ backgroundColor: '#05F3FF', color: '#333' }}>
          <h2>Statistiques du match</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="match-details" style={{ 
            marginBottom: '30px',
            padding: '15px',
            backgroundColor: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <h3 style={{ 
              margin: '0 0 15px 0',
              fontSize: '1.3rem',
              borderBottom: '2px solid #00FF87',
              paddingBottom: '10px'
            }}>
              {match.equipe1} vs {match.equipe2}
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Date et heure</h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{formatDate(match.date)}</p>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Lieu</h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{match.lieu}</p>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>Capacité</h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{match.capacite || 'Illimitée'}</p>
              </div>
              
              <div>
                <h4 style={{ margin: '0 0 5px 0', color: '#666' }}>ID du match</h4>
                <p style={{ margin: '0', fontWeight: '500' }}>{match.id}</p>
              </div>
            </div>
          </div>
          
          <div className="stats-container">
            <h3 style={{ 
              margin: '0 0 20px 0',
              fontSize: '1.3rem',
              borderBottom: '2px solid #5D3C81',
              paddingBottom: '10px',
              color: '#5D3C81'
            }}>
              Statistiques de vente
            </h3>
            
            <div className="stats-grid" style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div className="stat-card" style={{ 
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#5D3C81',
                color: 'white',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                  <FaTicketAlt />
                </div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Tickets vendus</h4>
                <p style={{ margin: '0', fontWeight: '700', fontSize: '1.5rem' }}>
                  {sales.ticketsSold}
                </p>
              </div>
              
              <div className="stat-card" style={{ 
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#00FF87',
                color: '#333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                  <FaMoneyBillWave />
                </div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Revenus</h4>
                <p style={{ margin: '0', fontWeight: '700', fontSize: '1.5rem' }}>
                  {formatCurrency(sales.revenue)}
                </p>
              </div>
              
              <div className="stat-card" style={{ 
                padding: '15px',
                borderRadius: '8px',
                backgroundColor: '#05F3FF',
                color: '#333',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', marginBottom: '5px' }}>
                  <FaChartPie />
                </div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '0.9rem' }}>Taux de remplissage</h4>
                <p style={{ margin: '0', fontWeight: '700', fontSize: '1.5rem' }}>
                  {fillRate}%
                </p>
              </div>
            </div>
            
            {/* Barre de progression du taux de remplissage */}
            {match.capacite && (
              <div className="fill-rate-container" style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Taux de remplissage</span>
                  <span>{fillRate}%</span>
                </div>
                <div style={{ 
                  height: '20px',
                  backgroundColor: '#f0f0f0',
                  borderRadius: '10px',
                  overflow: 'hidden'
                }}>
                  <div style={{ 
                    width: `${Math.min(fillRate, 100)}%`,
                    height: '100%',
                    backgroundColor: getFillRateColor(fillRate),
                    borderRadius: '10px'
                  }}></div>
                </div>
              </div>
            )}
            
            <div className="stat-summary" style={{ marginTop: '20px' }}>
              <p>
                <strong>Prix moyen par ticket:</strong> {sales.ticketsSold > 0 
                  ? formatCurrency(sales.revenue / sales.ticketsSold) 
                  : 'N/A'}
              </p>
              
              {match.capacite && (
                <p>
                  <strong>Places restantes:</strong> {Math.max(0, match.capacite - sales.ticketsSold)}
                </p>
              )}
            </div>
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

// Fonction pour déterminer la couleur de la barre de progression
const getFillRateColor = (rate) => {
  if (rate < 25) return '#ff5252'; // Rouge
  if (rate < 50) return '#EAFF00'; // Jaune
  if (rate < 75) return '#00FF87'; // Vert
  return '#5D3C81'; // Violet
};

export default MatchStats;