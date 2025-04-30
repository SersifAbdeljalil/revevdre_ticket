// src/components/admin/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCurrentUserAPI } from '../../api/authAPI';
import { getDashboardStats } from '../../api/adminAPI';
import { 
  FaUsers, 
  FaTicketAlt, 
  FaMoneyBillWave, 
  FaChartLine,
  FaCalendarAlt,
  FaExclamationTriangle,
  FaFutbol,
  FaStopwatch,
  FaEllipsisV,
  FaStar,
  FaMapMarkerAlt,
  FaCheck
} from 'react-icons/fa';
import Sidebar from './Sidebar';
import Header from './Header';
import './AdminDashboard.css';

// Composant pour le spinner de chargement
const LoadingSpinner = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
    <div>Chargement des statistiques...</div>
    <div className="dot-loader">
      <div className="dot"></div>
      <div className="dot"></div>
      <div className="dot"></div>
    </div>
  </div>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    userCount: 0,
    ticketCount: 0,
    revenue: 0,
    upcomingMatches: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  
  const navigate = useNavigate();
  
  useEffect(() => {
    // Vérifier que l'utilisateur est bien administrateur
    const currentUser = getCurrentUserAPI();
    if (!currentUser || currentUser.user.role !== 'administrateur') {
      navigate('/login');
      return;
    }
    
    // Charger les statistiques
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats();
        setStats(data);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des statistiques');
        console.error(err);
      } finally {
        setTimeout(() => setLoading(false), 800); // Délai légèrement augmenté pour montrer l'animation
      }
    };
    
    loadStats();
  }, [navigate]);
  
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
  
  // Calculer le taux de conversion
  const conversionRate = stats.userCount ? ((stats.ticketCount / stats.userCount) * 100).toFixed(1) : 0;
  
  // Générer un pourcentage aléatoire pour la démo
  const getRandomPercentage = () => {
    return (Math.random() * 100).toFixed(1);
  };
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Tableau de bord" />
        
        <div className="dashboard-content">
          {error && (
            <div className="error-alert">
              <FaExclamationTriangle />
              {error}
            </div>
          )}
          
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
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
                    Bienvenue sur le Dashboard Admin CAN 2025
                  </h2>
                  
                  <p style={{ fontSize: '1.1rem', maxWidth: '800px', marginBottom: '20px' }}>
                    Gérez les tickets, suivez les statistiques et administrez la plateforme de billetterie pour la Coupe d'Afrique des Nations 2025 avec facilité.
                  </p>
                  
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn-3d" style={{
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
                    }}>
                      <FaCheck /> Démarrer maintenant
                    </button>
                    
                    <button style={{
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
                    }}>
                      <FaMapMarkerAlt /> Voir les guides
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
                  <FaFutbol />
                </div>
              </div>
              
              <div className="stats-cards">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaUsers />
                  </div>
                  <div className="stat-info">
                    <h3>Utilisateurs</h3>
                    <p className="stat-value">{stats.userCount.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaTicketAlt />
                  </div>
                  <div className="stat-info">
                    <h3>Tickets vendus</h3>
                    <p className="stat-value">{stats.ticketCount.toLocaleString()}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaMoneyBillWave />
                  </div>
                  <div className="stat-info">
                    <h3>Revenus</h3>
                    <p className="stat-value">{formatCurrency(stats.revenue)}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div className="stat-icon">
                    <FaChartLine />
                  </div>
                  <div className="stat-info">
                    <h3>Taux de conversion</h3>
                    <p className="stat-value">{conversionRate}<small>%</small></p>
                  </div>
                </div>
              </div>
              
              <div className="tabs">
                <div 
                  className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  Aperçu
                </div>
                <div 
                  className={`tab ${activeTab === 'upcoming' ? 'active' : ''}`}
                  onClick={() => setActiveTab('upcoming')}
                >
                  Matchs à venir
                </div>
                <div 
                  className={`tab ${activeTab === 'stats' ? 'active' : ''}`}
                  onClick={() => setActiveTab('stats')}
                >
                  Statistiques avancées
                </div>
              </div>
              
              <div className={`tab-content ${activeTab === 'overview' ? 'active' : ''}`}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                  <div className="info-card">
                    <div className="info-card-header">
                      <div className="info-card-icon primary">
                        <FaStar />
                      </div>
                      <div>
                        <h3 className="info-card-title">Matchs vedettes</h3>
                        <p className="info-card-subtitle">Les plus populaires</p>
                      </div>
                    </div>
                    
                    <div className="info-card-content">
                      {stats.upcomingMatches && stats.upcomingMatches.length > 0 ? (
                        <div>
                          {stats.upcomingMatches.slice(0, 1).map(match => (
                            <div key={match.id} style={{ 
                              backgroundColor: 'rgba(255, 107, 1, 0.05)',
                              padding: '15px',
                              borderRadius: 'var(--border-radius-md)',
                              marginTop: '15px'
                            }}>
                              <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                                {match.equipe1} vs {match.equipe2}
                              </div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', color: '#666' }}>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FaCalendarAlt /> {formatDate(match.date).split('à')[0]}
                                </span>
                                <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                  <FaTicketAlt /> {match.ticketsVendus || 0} tickets
                                </span>
                              </div>
                            </div>
                          ))}
                          
                          <div style={{ textAlign: 'center', marginTop: '15px' }}>
                            <button className="btn btn-sm btn-outline btn-primary" onClick={() => setActiveTab('upcoming')}>
                              Voir tous les matchs
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="no-data">Aucun match à venir</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="info-card secondary">
                    <div className="info-card-header">
                      <div className="info-card-icon secondary">
                        <FaStopwatch />
                      </div>
                      <div>
                        <h3 className="info-card-title">Performance des ventes</h3>
                        <p className="info-card-subtitle">Dernières 24 heures</p>
                      </div>
                    </div>
                    
                    <div className="info-card-content">
                      <div className="progress-container">
                        <div className="progress-header">
                          <span className="progress-label">Objectif journalier</span>
                          <span className="progress-value">{getRandomPercentage()}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill secondary" style={{ width: `${getRandomPercentage()}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="progress-container">
                        <div className="progress-header">
                          <span className="progress-label">Taux d'engagement</span>
                          <span className="progress-value">{getRandomPercentage()}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${getRandomPercentage()}%` }}></div>
                        </div>
                      </div>
                      
                      <div className="progress-container">
                        <div className="progress-header">
                          <span className="progress-label">Satisfaction client</span>
                          <span className="progress-value">{getRandomPercentage()}%</span>
                        </div>
                        <div className="progress-bar">
                          <div className="progress-fill accent" style={{ width: `${getRandomPercentage()}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="dashboard-section">
                  <div className="section-header">
                    <h2>
                      <FaCalendarAlt /> Activité récente
                    </h2>
                    
                    <div className="action-buttons">
                      <button className="btn btn-sm btn-outline btn-primary">
                        Voir tout
                      </button>
                      
                      <div className="tooltip">
                        <button className="btn btn-sm btn-icon">
                          <FaEllipsisV />
                        </button>
                        <span className="tooltip-text">Plus d'options</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                    {[1, 2, 3].map(index => (
                      <div key={index} style={{ 
                        padding: '20px',
                        borderRadius: 'var(--border-radius-md)',
                        border: '1px solid rgba(0, 0, 0, 0.08)',
                        transition: 'all var(--transition-fast)',
                        animation: `fadeInUp ${0.3 + index * 0.1}s ease-out`,
                      }}
                      className="glass-card"
                      >
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '15px', 
                          marginBottom: '15px'
                        }}>
                          <div style={{ 
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '1.1rem',
                            background: index === 1 ? 'var(--primary-gradient)' :
                                       index === 2 ? 'var(--secondary-gradient)' :
                                       'var(--accent-gradient)'
                          }}>
                            {index === 1 ? <FaTicketAlt /> : 
                             index === 2 ? <FaUsers /> : 
                             <FaMoneyBillWave />}
                          </div>
                          <div>
                            <div style={{ fontWeight: '600' }}>
                              {index === 1 ? 'Nouveau ticket vendu' :
                               index === 2 ? 'Nouvel utilisateur inscrit' :
                               'Paiement effectué'}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: '#888' }}>
                              il y a {index * 5} minutes
                            </div>
                          </div>
                        </div>
                        
                        <p style={{ 
                          margin: '0 0 15px 0',
                          color: '#666',
                          fontSize: '0.95rem'
                        }}>
                          {index === 1 ? 'Ahmed a acheté un ticket pour Côte d\'Ivoire vs Nigeria' :
                           index === 2 ? 'Marie s\'est inscrite sur la plateforme' :
                           'Un paiement de 50,000 FCFA a été reçu'}
                        </p>
                        
                        <div style={{ 
                          display: 'flex',
                          justifyContent: 'space-between'
                        }}>
                          <span className={`badge badge-${index === 1 ? 'primary' : index === 2 ? 'secondary' : 'accent'}`}>
                            {index === 1 ? 'Ticket' : index === 2 ? 'Utilisateur' : 'Paiement'}
                          </span>
                          <a href="#" style={{ 
                            color: 'var(--primary)',
                            textDecoration: 'none',
                            fontSize: '0.9rem',
                            fontWeight: '500'
                          }}>
                            Voir les détails
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className={`tab-content ${activeTab === 'upcoming' ? 'active' : ''}`}>
                <div className="dashboard-section">
                  <h2>
                    <FaCalendarAlt style={{ color: 'var(--primary)' }} />
                    Prochains matchs
                  </h2>
                  
                  {stats.upcomingMatches && stats.upcomingMatches.length > 0 ? (
                    <div className="table-responsive">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Match</th>
                            <th>Stade</th>
                            <th>Tickets vendus</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stats.upcomingMatches.map((match, index) => (
                            <tr key={match.id} style={{ '--row-index': index }}>
                              <td>
                                <div style={{ fontWeight: '500' }}>{formatDate(match.date).split('à')[0]}</div>
                                <div style={{ fontSize: '0.85rem', color: '#888' }}>{formatDate(match.date).split('à')[1]}</div>
                              </td>
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
                                    <FaFutbol />
                                  </span>
                                  <div>
                                    <strong>{match.equipe1}</strong> 
                                    <span style={{ margin: '0 8px', opacity: '0.7' }}>VS</span> 
                                    <strong>{match.equipe2}</strong>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <FaMapMarkerAlt style={{ color: 'var(--accent)' }} />
                                  {match.lieu}
                                </div>
                              </td>
                              <td>
                                <div className="tickets-count">
                                  <span className="icon"><FaTicketAlt /></span>
                                  {match.ticketsVendus || 0}
                                </div>
                                
                                <div className="progress-container" style={{ marginTop: '8px' }}>
                                  <div className="progress-bar" style={{ height: '6px' }}>
                                    <div 
                                      className="progress-fill" 
                                      style={{ 
                                        width: `${match.ticketsVendus ? (match.ticketsVendus / 60000) * 100 : 0}%`,
                                        background: getProgressColor(match.ticketsVendus ? (match.ticketsVendus / 60000) * 100 : 0)
                                      }}
                                    ></div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div className="table-actions">
                                  <button className="btn btn-sm btn-primary tooltip">
                                    Détails
                                    <span className="tooltip-text">Voir les détails</span>
                                  </button>
                                  <button className="btn btn-sm btn-outline btn-accent tooltip">
                                    Statistiques
                                    <span className="tooltip-text">Voir les statistiques</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="no-data">
                      <div className="no-data-icon"><FaCalendarAlt /></div>
                      Aucun match à venir
                    </div>
                  )}
                </div>
              </div>
              
              <div className={`tab-content ${activeTab === 'stats' ? 'active' : ''}`}>
                <div className="dashboard-section">
                  <h2>Statistiques avancées</h2>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', marginBottom: '30px' }}>
                    {generateStatCards()}
                  </div>
                  
                  <div style={{ textAlign: 'center', marginTop: '20px' }}>
                    <button className="btn btn-primary btn-lg bounce-animation">
                      Générer un rapport complet
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Fonction auxiliaire pour déterminer la couleur de la barre de progression
const getProgressColor = (percentage) => {
  if (percentage < 30) return 'var(--primary-gradient)';
  if (percentage < 70) return 'var(--secondary-gradient)';
  return 'var(--accent-gradient)';
};

// Fonction pour générer des cartes de statistiques aléatoires pour la démo
const generateStatCards = () => {
  const cards = [
    { title: 'Taux d\'occupation', value: '64%', icon: <FaUsers /> },
    { title: 'Recettes moyennes', value: '42,500 FCFA', icon: <FaMoneyBillWave /> },
    { title: 'Âge moyen', value: '28 ans', icon: <FaChartLine /> },
    { title: 'Ventes en ligne', value: '87%', icon: <FaTicketAlt /> }
  ];
  
  return cards.map((card, index) => (
    <div key={index} style={{
      padding: '25px',
      borderRadius: 'var(--border-radius-lg)',
      background: index % 2 === 0 ? 'var(--light)' : 'var(--light-gradient)',
      boxShadow: 'var(--shadow-md)',
      transition: 'all var(--transition-normal)',
      animation: `fadeInUp ${0.3 + index * 0.1}s ease-out`,
      border: '1px solid rgba(0, 0, 0, 0.05)'
    }}
    className="fluid-animation"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: 'var(--border-radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          background: index === 0 ? 'var(--primary-gradient)' :
                   index === 1 ? 'var(--secondary-gradient)' :
                   index === 2 ? 'var(--accent-gradient)' :
                   'var(--purple-gradient)',
          color: 'white',
          boxShadow: index === 0 ? 'var(--shadow-primary)' :
                   index === 1 ? 'var(--shadow-secondary)' :
                   index === 2 ? 'var(--shadow-accent)' :
                   'var(--shadow-purple)'
        }}>
          {card.icon}
        </div>
        <div>
          <h3 style={{ margin: '0 0 5px 0', fontSize: '1rem', color: '#888' }}>{card.title}</h3>
          <p style={{ margin: '0', fontSize: '1.8rem', fontWeight: '700', color: 'var(--dark)' }}>{card.value}</p>
        </div>
      </div>
    </div>
  ));
};

export default AdminDashboard;