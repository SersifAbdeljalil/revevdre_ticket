import React, { useState, useEffect } from 'react';
import { FaCalendarAlt, FaMapMarkerAlt, FaUsers, FaExclamationTriangle, FaSearch } from 'react-icons/fa';
import { getAllMatches } from '../../../api/clientAPI';
import Sidebar from '../Sidebar';
import Header from '../Header';
import '../../admin/AdminDashboard.css';
import MatchState from './MatchState'; // Import the MatchState component

const MatchesList = () => {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMatch, setSelectedMatch] = useState(null); // State for selected match
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility

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

  const filteredMatches = matches.filter(match =>
    match.equipe1?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.equipe2?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    match.lieu?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="client-layout">
      <Sidebar />
      <div className="client-main">
        <Header title="Liste des Matchs" />
        <div className="container">
          <div className="dashboard-content">
            {error && (
              <div className="error-alert">
                <FaExclamationTriangle />
                {error}
              </div>
            )}

            <div className="feature-header">
              <div className="feature-header-content">
                <h1 className="feature-title">Matchs CAN 2025</h1>
                <p className="feature-description">
                  Consultez la liste des matchs de la CAN 2025 et achetez vos billets !
                </p>
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
                        <th>Tickets disponibles</th>
                        <th>Action</th>
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
                                    {match.capacite ? (match.capacite - match.ticketsVendus) : 'Illimité'}
                                  </span>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="table-actions">
                                <button
                                  className="btn btn-primary"
                                  onClick={() => {
                                    setSelectedMatch(match);
                                    setIsModalOpen(true);
                                  }}
                                >
                                  Voir détails
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
      </div>

      {/* Render MatchState modal when isModalOpen is true */}
      {isModalOpen && (
        <MatchState
          match={selectedMatch}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default MatchesList;