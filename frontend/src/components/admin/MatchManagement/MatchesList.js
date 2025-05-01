// src/components/admin/MatchManagement/MatchesList.js
import React, { useState, useEffect } from 'react';
import { 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaChartLine, 
  FaSearch, 
  FaCalendarAlt, 
  FaMapMarkerAlt, 
  FaUsers,
  FaExclamationTriangle
} from 'react-icons/fa';
import { getAllMatches, deleteMatch, getMatchSalesStats } from '../../../api/adminAPI';
import Sidebar from '../Sidebar';
import Header from '../Header';
import AddMatch from './AddMatch';
import MatchStats from './MatchStats';
import '../AdminDashboard.css';

const MatchesList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editMatch, setEditMatch] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  
  // Charger les matchs
  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await getAllMatches();
      setMatches(data.matches);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des matchs');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    loadMatches();
  }, []);
  
  // Filtrer les matchs selon la recherche
  const filteredMatches = matches.filter(match => 
    match.equipe1?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    match.equipe2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Supprimer un match
  const handleDeleteMatch = async (matchId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce match ?')) {
      try {
        await deleteMatch(matchId);
        setMatches(matches.filter(match => match.id !== matchId));
      } catch (err) {
        setError('Erreur lors de la suppression du match');
        console.error(err);
      }
    }
  };
  
  // Modifier un match
  const handleEditMatch = (match) => {
    setEditMatch(match);
    setShowAddModal(true);
  };
  
  // Voir les statistiques d'un match
  const handleViewStats = async (matchId) => {
    try {
      const statsData = await getMatchSalesStats(matchId);
      setSelectedMatch(statsData);
      setShowStatsModal(true);
    } catch (err) {
      setError('Erreur lors de la récupération des statistiques');
      console.error(err);
    }
  };
  
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
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Gestion des matchs" />
        
        <div className="dashboard-content">
          {error && (
            <div className="error-alert">
              <FaExclamationTriangle />
              {error}
            </div>
          )}

          {/* En-tête orange style ticket */}
          <div className="feature-header">
            <div className="feature-header-content">
              <h1 className="feature-title">Gestion des matchs CAN 2025</h1>
              <p className="feature-description">
                Gérez les matchs de la CAN 2025, ajoutez de nouveaux matchs ou modifiez ceux existants. Consultez les statistiques de vente des billets.
              </p>
              
              <div className="feature-actions">
                <button 
                  className="btn-feature"
                  onClick={() => {
                    setEditMatch(null);
                    setShowAddModal(true);
                  }}
                >
                  <FaPlus /> Ajouter un match
                </button>
              </div>
            </div>
            <div className="feature-icon">
              <FaCalendarAlt />
            </div>
          </div>
          
          <div className="dashboard-section">
            <div className="section-header">
              <div className="section-title">
                <h2>Liste des matchs</h2>
                <p className="section-subtitle">Tous les matchs de la compétition</p>
              </div>
              
              <div className="section-actions">
                <div className="search-container">
                  <FaSearch className="search-icon" />
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Rechercher un match..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </div>
            
            {loading ? (
              <div className="loading-container">
                <div className="loading-spinner"></div>
                <p>Chargement des matchs...</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Date</th>
                      <th>Équipes</th>
                      <th>Lieu</th>
                      <th>Tickets vendus</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMatches.length > 0 ? (
                      filteredMatches.map((match) => (
                        <tr key={match.id}>
                          <td>#{match.id}</td>
                          <td>
                            <div className="cell-with-icon">
                              <FaCalendarAlt className="cell-icon" style={{ color: 'var(--primary)' }} />
                              {formatDate(match.date)}
                            </div>
                          </td>
                          <td>
                            <div className="match-teams">
                              <span className="team team1">{match.equipe1}</span>
                              <span className="vs">VS</span>
                              <span className="team team2">{match.equipe2}</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              <FaMapMarkerAlt className="cell-icon" style={{ color: 'var(--accent)' }} />
                              {match.lieu}
                            </div>
                          </td>
                          <td>
                            <div className="cell-with-icon">
                              <FaUsers className="cell-icon" style={{ color: 'var(--purple)' }} />
                              <div className="tickets-count">
                                <span className={`ticket-count ${
                                  match.capacite && (match.ticketsVendus / match.capacite > 0.9) 
                                    ? 'almost-full' 
                                    : match.capacite && (match.ticketsVendus / match.capacite > 0.7) 
                                      ? 'moderate' 
                                      : ''
                                }`}>
                                  {match.ticketsVendus || 0}
                                </span>
                                {match.capacite ? (
                                  <span className="capacity">/ {match.capacite}</span>
                                ) : (
                                  <span className="capacity">/ ∞</span>
                                )}
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="table-actions">
                              <button 
                                className="btn btn-accent"
                                onClick={() => handleViewStats(match.id)}
                                title="Voir les statistiques"
                              >
                                <FaChartLine />
                              </button>
                              
                              <button 
                                className="btn btn-primary"
                                onClick={() => handleEditMatch(match)}
                                title="Modifier"
                              >
                                <FaEdit />
                              </button>
                              
                              <button 
                                className="btn btn-danger"
                                onClick={() => handleDeleteMatch(match.id)}
                                title="Supprimer"
                                disabled={match.ticketsVendus > 0}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="no-data">
                          {searchTerm 
                            ? "Aucun match ne correspond à votre recherche" 
                            : "Aucun match disponible"}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Modal d'ajout/modification de match */}
      {showAddModal && (
        <AddMatch 
          match={editMatch}
          onClose={() => {
            setShowAddModal(false);
            setEditMatch(null);
          }}
          onSave={() => {
            setShowAddModal(false);
            setEditMatch(null);
            loadMatches();
          }}
        />
      )}
      
      {/* Modal de statistiques de match */}
      {showStatsModal && selectedMatch && (
        <MatchStats 
          matchData={selectedMatch}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  );
};

export default MatchesList;