import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserLock, FaUserCheck, FaEye, FaSearch } from 'react-icons/fa';
import { getAllUsers, toggleUserBlock, getUserDetails } from '../../../api/adminAPI';
import Sidebar from '../Sidebar';
import Header from '../Header';
import UserDetails from './UserDetails';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  
  const navigate = useNavigate();
  
  // Charger les utilisateurs
  useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        const data = await getAllUsers();
        setUsers(data.users);
        setError('');
      } catch (err) {
        setError('Erreur lors du chargement des utilisateurs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    loadUsers();
  }, []);
  
  // Filtrer les utilisateurs selon la recherche
  const filteredUsers = users.filter(user => 
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Bloquer/débloquer un utilisateur
  const handleToggleBlock = async (userId, currentBlockState) => {
    try {
      await toggleUserBlock(userId, !currentBlockState);
      
      // Mettre à jour l'état local
      setUsers(users.map(user => 
        user.id === userId ? { ...user, estBloque: !currentBlockState } : user
      ));
      
    } catch (err) {
      setError(`Erreur lors du ${currentBlockState ? 'déblocage' : 'blocage'} de l'utilisateur`);
      console.error(err);
    }
  };
  
  // Voir les détails d'un utilisateur
  const handleViewDetails = async (userId) => {
    try {
      const userDetails = await getUserDetails(userId);
      setSelectedUser(userDetails);
      setShowUserDetails(true);
    } catch (err) {
      setError("Erreur lors de la récupération des détails de l'utilisateur");
      console.error(err);
    }
  };
  
  // Formatage de la date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };
  
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Gestion des utilisateurs" />
        
        <div className="dashboard-content">
          {error && <div className="error-alert">{error}</div>}
          
          <div className="dashboard-section">
            <div className="section-header d-flex justify-between align-center mb-4">
              <h2>Liste des utilisateurs</h2>
              
              <div className="search-container">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder="Rechercher un utilisateur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="loading">
                <div className="dot-loader">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                Chargement des utilisateurs...
              </div>
            ) : (
              <div className="data-table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nom</th>
                      <th>Email</th>
                      <th>Rôle</th>
                      <th>Date d'inscription</th>
                      <th>Statut</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user, index) => (
                        <tr key={user.id} style={{'--row-index': index}}>
                          <td>{user.id}</td>
                          <td>{user.nom}</td>
                          <td>{user.email}</td>
                          <td style={{ textTransform: 'capitalize' }}>{user.role}</td>
                          <td>{formatDate(user.dateCreation)}</td>
                          <td>
                            <span className={`badge ${user.estBloque ? 'badge-error' : 'badge-success'}`}>
                              {user.estBloque ? 'Bloqué' : 'Actif'}
                            </span>
                          </td>
                          <td>
                            <div className="table-actions d-flex gap-2">
                              <button 
                                className="btn btn-sm btn-accent"
                                onClick={() => handleViewDetails(user.id)}
                              >
                                <FaEye /> Détails
                              </button>
                              
                              <button 
                                className={`btn btn-sm ${user.estBloque ? 'btn-secondary' : 'btn-danger'}`}
                                onClick={() => handleToggleBlock(user.id, user.estBloque)}
                              >
                                {user.estBloque ? (
                                  <><FaUserCheck /> Débloquer</>
                                ) : (
                                  <><FaUserLock /> Bloquer</>
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="no-data">
                          {searchTerm 
                            ? "Aucun utilisateur ne correspond à votre recherche" 
                            : "Aucun utilisateur disponible"}
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
      
      {/* Modal des détails d'utilisateur */}
      {showUserDetails && selectedUser && (
        <UserDetails 
          user={selectedUser} 
          onClose={() => setShowUserDetails(false)} 
        />
      )}
    </div>
  );
};

export default UsersList;