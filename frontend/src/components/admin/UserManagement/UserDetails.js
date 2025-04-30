import React from 'react';
import { FaTimes, FaTicketAlt, FaUser, FaUserLock, FaUserCheck } from 'react-icons/fa';
import { toggleUserBlock } from '../../../api/adminAPI';

const UserDetails = ({ user, onClose, refreshUsers }) => {
  const { user: userInfo, achats = [] } = user;
  
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
  
  // Bloquer/débloquer l'utilisateur
  const handleToggleBlock = async () => {
    try {
      await toggleUserBlock(userInfo.id, !userInfo.estBloque);
      
      // Mettre à jour l'utilisateur
      userInfo.estBloque = !userInfo.estBloque;
      
      // Rafraîchir la liste si nécessaire
      if (refreshUsers) {
        refreshUsers();
      }
    } catch (err) {
      console.error("Erreur lors du changement de statut de l'utilisateur:", err);
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2>Détails de l'utilisateur</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="profile-card mb-4">
            <div className="profile-avatar">
              <div className="profile-avatar-placeholder">
                {userInfo.nom[0].toUpperCase()}
              </div>
            </div>
            
            <h3 className="profile-name">{userInfo.nom}</h3>
            <p className="profile-role">{userInfo.email}</p>
            
            <div className="profile-stats">
              <div className="stat-item">
                <div className="stat-number">{userInfo.id}</div>
                <div className="stat-label">ID Utilisateur</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">
                  <span className={`badge ${userInfo.estBloque ? 'badge-error' : 'badge-success'}`}>
                    {userInfo.estBloque ? 'Bloqué' : 'Actif'}
                  </span>
                </div>
                <div className="stat-label">Statut</div>
              </div>
            </div>
            
            <div className="profile-actions">
              <div className="stat-label">Inscrit le : {formatDate(userInfo.dateCreation)}</div>
            </div>
          </div>
          
          {userInfo.role === 'client' && (
            <div className="dashboard-section">
              <h2 className="mb-3">
                <FaTicketAlt className="mr-2 text-accent" />
                Historique d'achats
              </h2>
              
              {achats.length > 0 ? (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Match</th>
                        <th>Lieu</th>
                        <th>Prix</th>
                      </tr>
                    </thead>
                    <tbody>
                      {achats.map((achat, index) => (
                        <tr key={achat.id} style={{'--row-index': index}}>
                          <td>{formatDate(achat.dateAchat)}</td>
                          <td>
                            <strong>{achat.equipe1}</strong> vs <strong>{achat.equipe2}</strong>
                          </td>
                          <td>{achat.lieu}</td>
                          <td>{formatCurrency(achat.prix)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="no-data">
                  <FaTicketAlt className="no-data-icon" />
                  Aucun ticket acheté
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            className="btn btn-sm btn-secondary mr-2" 
            onClick={onClose}
          >
            Fermer
          </button>
          
          <button 
            className={`btn btn-sm ${userInfo.estBloque ? 'btn-secondary' : 'btn-danger'}`}
            onClick={handleToggleBlock}
          >
            {userInfo.estBloque ? (
              <><FaUserCheck /> Débloquer</>
            ) : (
              <><FaUserLock /> Bloquer</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserDetails;