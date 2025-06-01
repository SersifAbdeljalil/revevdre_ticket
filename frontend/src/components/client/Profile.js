
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaUserEdit, FaSave, FaTimes, FaLock, FaTicketAlt, FaTrash, FaCreditCard, FaUserSlash, FaExclamationTriangle } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Header from './Header';
import '../admin/AdminDashboard.css'; // Réutilisation du même CSS pour la cohérence    

const API_URL = 'http://localhost:5000/api/client';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [formData, setFormData] = useState({ nom: '', email: '', motDePasse: '', confirmMotDePasse: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [sellingTickets, setSellingTickets] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const setupAuthRequest = () => {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      if (storedUser && storedUser.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${storedUser.token}`;
        return storedUser;
      }
      throw new Error('Non autorisé : utilisateur non connecté');
    };

    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser = setupAuthRequest();
        const [profileResponse, purchasedResponse, sellingResponse, paymentsResponse] = await Promise.all([
          axios.get(`${API_URL}/profile`, { params: { id: storedUser.id } }),
          axios.get(`${API_URL}/tickets/purchased`),
          axios.get(`${API_URL}/tickets/selling`),
          axios.get(`${API_URL}/payments`),
        ]);

        setUser(profileResponse.data);
        setFormData({ nom: profileResponse.data.nom, email: profileResponse.data.email, motDePasse: '', confirmMotDePasse: '' });
        setPurchasedTickets(purchasedResponse.data.tickets);
        setSellingTickets(sellingResponse.data.tickets);
        setPayments(paymentsResponse.data.payments);
      } catch (err) {
        setError(`Erreur : ${err.response?.data?.message || err.message}`);
        console.error('Erreur fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!formData.nom || !formData.email) {
      setError('Le nom et l\'email sont requis');
      return;
    }
    try {
      setLoading(true);
      const response = await axios.put(`${API_URL}/profile`, {
        nom: formData.nom,
        email: formData.email,
      });
      setUser(response.data);
      setIsEditing(false);
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Erreur : ${err.response?.data?.message || err.message}`);
      console.error('Erreur update profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (formData.motDePasse !== formData.confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (formData.motDePasse.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      setLoading(true);
      await axios.put(`${API_URL}/profile/password`, {
        motDePasse: formData.motDePasse,
      });
      setIsChangingPassword(false);
      setFormData({ ...formData, motDePasse: '', confirmMotDePasse: '' });
      setSuccess('Mot de passe mis à jour avec succès');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(`Erreur : ${err.response?.data?.message || err.message}`);
      console.error('Erreur password update:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTicket = async (ticketId) => {
    if (window.confirm('Voulez-vous vraiment supprimer ce ticket ?')) {
      try {
        setLoading(true);
        await axios.delete(`${API_URL}/tickets/${ticketId}`);
        setSellingTickets(sellingTickets.filter((ticket) => ticket.id !== ticketId));
        setSuccess('Ticket supprimé avec succès');
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError(`Erreur : ${err.response?.data?.message || err.message}`);
        console.error('Erreur delete ticket:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Voulez-vous vraiment demander la suppression de votre compte ? Cette action est irréversible.')) {
      try {
        setLoading(true);
        await axios.post(`${API_URL}/profile/delete-request`);
        setSuccess('Demande de suppression de compte envoyée. Un administrateur examinera votre demande.');
        setTimeout(() => setSuccess(''), 5000);
      } catch (err) {
        setError(`Erreur : ${err.response?.data?.message || err.message}`);
        console.error('Erreur delete account request:', err);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setFormData({ nom: user?.nom || '', email: user?.email || '', motDePasse: '', confirmMotDePasse: '' });
    setError('');
    setSuccess('');
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
        <div className="dot-loader">
          <div className="dot"></div>
          <div className="dot"></div>
          <div className="dot"></div>
        </div>
        {error && <p className="error-text">{error}</p>}
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-main">
        <Header title="Mon Profil" />
        <div className="dashboard-content">
          <div className="feature-header">
            <div className="feature-header-content">
              <h2 className="feature-title">Mon Profil</h2>
              <p className="feature-description">Gérez vos informations personnelles, vos tickets et votre historique de paiements.</p>
              {!isEditing && !isChangingPassword && (
                <div className="feature-actions">
                  <button className="btn btn-feature" onClick={() => setIsEditing(true)} aria-label="Modifier le profil">
                    <FaUserEdit /> Modifier
                  </button>
                  <button
                    className="btn btn-feature btn-feature-secondary"
                    onClick={() => setIsChangingPassword(true)}
                    aria-label="Changer le mot de passe"
                  >
                    <FaLock /> Changer Mot de Passe
                  </button>
                  <button
                    className="btn btn-feature"
                    style={{ backgroundColor: 'var(--error)', color: 'white' }}
                    onClick={handleDeleteAccount}
                    aria-label="Demander la suppression du compte"
                  >
                    <FaUserSlash /> Supprimer Compte
                  </button>
                </div>
              )}
            </div>
            <FaUserEdit className="feature-icon" />
          </div>

          {error && (
            <div className="error-alert">
              <FaExclamationTriangle />
              <span>{error}</span>
            </div>
          )}
          {success && (
            <div className="success-alert">
              <FaSave />
              <span>{success}</span>
            </div>
          )}

          <div className="dashboard-section profile-section">
            <div className="profile-card">
              <div className="card-header" style={{ background: 'var(--primary-gradient)', color: 'white' }}>
                <div className="card-title">
                  Profil Utilisateur
                  <span className="card-status" data-status={user?.estBloque ? 'blocked' : 'active'}>
                    {user?.estBloque ? 'Bloqué' : 'Actif'}
                  </span>
                </div>
              </div>
              <div className="profile-avatar">
                <div className="profile-avatar-placeholder">{user?.nom?.charAt(0) || 'U'}</div>
              </div>
              <div className="card-body">
                {!isChangingPassword ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                        <FaUserEdit style={{ fontSize: '1.5rem' }} />
                      </div>
                      <div>
                        <div className="info-label" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '5px' }}>Nom</div>
                        {isEditing ? (
                          <input
                            id="nom"
                            type="text"
                            name="nom"
                            value={formData.nom}
                            onChange={handleChange}
                            className="form-control"
                            aria-required="true"
                          />
                        ) : (
                          <div className="info-value">{user.nom}</div>
                        )}
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                        <FaUserEdit style={{ fontSize: '1.5rem' }} />
                      </div>
                      <div>
                        <div className="info-label" style={{ backgroundColor: 'rgba(255, 192, 0, 0.1)', color: 'var(--secondary)', padding: '5px 10px', borderRadius: '5px' }}>Email</div>
                        {isEditing ? (
                          <input
                            id="email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-control"
                            aria-required="true"
                          />
                        ) : (
                          <div className="info-value">{user.email}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3">
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                        <FaLock style={{ fontSize: '1.5rem' }} />
                      </div>
                      <div>
                        <div className="info-label" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '5px' }}>Nouveau Mot de Passe</div>
                        <input
                          id="motDePasse"
                          type="password"
                          name="motDePasse"
                          value={formData.motDePasse}
                          onChange={handleChange}
                          className="form-control"
                          aria-required="true"
                        />
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                        <FaLock style={{ fontSize: '1.5rem' }} />
                      </div>
                      <div>
                        <div className="info-label" style={{ backgroundColor: 'rgba(255, 192, 0, 0.1)', color: 'var(--secondary)', padding: '5px 10px', borderRadius: '5px' }}>Confirmer Mot de Passe</div>
                        <input
                          id="confirmMotDePasse"
                          type="password"
                          name="confirmMotDePasse"
                          value={formData.confirmMotDePasse}
                          onChange={handleChange}
                          className="form-control"
                          aria-required="true"
                        />
                      </div>
                    </div>
                  </div>
                )}
                {(isEditing || isChangingPassword) && (
                  <div className="profile-actions d-flex gap-2 justify-end">
                    <button
                      className="btn btn-success"
                      onClick={isEditing ? handleSave : handlePasswordChange}
                      aria-label="Sauvegarder les modifications"
                    >
                      <FaSave /> Sauvegarder
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={handleCancel}
                      aria-label="Annuler les modifications"
                    >
                      <FaTimes /> Annuler
                    </button>
                  </div>
                )}
                <div className="info-item mt-3">
                  <div className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                    <FaUserEdit style={{ fontSize: '1.5rem' }} />
                  </div>
                  <div>
                    <div className="info-label" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)', padding: '5px 10px', borderRadius: '5px' }}>Rôle</div>
                    <div className="info-value">{user.role}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="d-flex align-center gap-2">
                <FaTicketAlt style={{ color: 'var(--primary)' }} />
                Mes Tickets Achetés
              </h2>
            </div>
            {purchasedTickets.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">
                  <FaTicketAlt />
                </div>
                <p>Aucun ticket acheté.</p>
              </div>
            ) : (
              <div className="ticket-list">
                {purchasedTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="ticket-card"
                    style={{ animation: `fadeInUp ${0.3 + index * 0.05}s ease-out` }}
                  >
                    <div className="ticket-header" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                      <FaTicketAlt style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                      {ticket.equipe1} vs {ticket.equipe2}
                    </div>
                    <div className="ticket-body">
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)', padding: '5px 10px', borderRadius: '5px' }}>Match</span>
                          <div className="info-value">{ticket.equipe1} vs {ticket.equipe2}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(255, 192, 0, 0.1)', color: 'var(--secondary)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(255, 192, 0, 0.1)', color: 'var(--secondary)', padding: '5px 10px', borderRadius: '5px' }}>Lieu</span>
                          <div className="info-value">{ticket.lieu}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(0, 149, 255, 0.1)', color: 'var(--info)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(0, 149, 255, 0.1)', color: 'var(--info)', padding: '5px 10px', borderRadius: '5px' }}>Date</span>
                          <div className="info-value">{new Date(ticket.date).toLocaleString()}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(255, 61, 87, 0.1)', color: 'var(--error)' }}>
                          <FaCreditCard style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(255, 61, 87, 0.1)', color: 'var(--error)', padding: '5px 10px', borderRadius: '5px' }}>Prix</span>
                          <div className="info-value">{ticket.prix}€</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                          <FaUserEdit style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '5px' }}>Vendeur</span>
                          <div className="info-value">{ticket.vendeur_nom}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)', padding: '5px 10px', borderRadius: '5px' }}>Date d'achat</span>
                          <div className="info-value">{new Date(ticket.dateAchat).toLocaleString()}</div>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="d-flex align-center gap-2">
                <FaTicketAlt style={{ color: 'var(--primary)' }} />
                Mes Tickets en Vente
              </h2>
            </div>
            {sellingTickets.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">
                  <FaTicketAlt />
                </div>
                <p>Aucun ticket en vente.</p>
              </div>
            ) : (
              <div className="ticket-list">
                {sellingTickets.map((ticket, index) => (
                  <div
                    key={ticket.id}
                    className="ticket-card"
                    style={{ animation: `fadeInUp ${0.3 + index * 0.05}s ease-out` }}
                  >
                    <div className="ticket-header" style={{ backgroundColor: 'var(--accent)', color: 'white' }}>
                      <FaTicketAlt style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                      {ticket.equipe1} vs {ticket.equipe2}
                    </div>
                    <div className="ticket-body">
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)', padding: '5px 10px', borderRadius: '5px' }}>Match</span>
                          <div className="info-value">{ticket.equipe1} vs {ticket.equipe2}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(255, 192, 0, 0.1)', color: 'var(--secondary)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(255, 192, 0, 0.1)', color: 'var(--secondary)', padding: '5px 10px', borderRadius: '5px' }}>Lieu</span>
                          <div className="info-value">{ticket.lieu}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(0, 149, 255, 0.1)', color: 'var(--info)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(0, 149, 255, 0.1)', color: 'var(--info)', padding: '5px 10px', borderRadius: '5px' }}>Date</span>
                          <div className="info-value">{new Date(ticket.date).toLocaleString()}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(255, 61, 87, 0.1)', color: 'var(--error)' }}>
                          <FaCreditCard style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(255, 61, 87, 0.1)', color: 'var(--error)', padding: '5px 10px', borderRadius: '5px' }}>Prix</span>
                          <div className="info-value">{ticket.prix}€</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                          <FaUserEdit style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '5px' }}>Statut</span>
                          <div className="info-value">{ticket.estVendu ? 'Vendu' : 'En vente'}</div>
                        </span>
                      </div>
                      {!ticket.estVendu && (
                        <div className="ticket-actions d-flex gap-2">
                          <button
                            className="btn btn-danger btn-small"
                            onClick={() => handleDeleteTicket(ticket.id)}
                            aria-label={`Supprimer le ticket ${ticket.id}`}
                          >
                            <FaTrash style={{ fontSize: '1.2rem' }} /> Supprimer
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="d-flex align-center gap-2">
                <FaCreditCard style={{ color: 'var(--primary)' }} />
                Historique des Paiements
              </h2>
            </div>
            {payments.length === 0 ? (
              <div className="no-data">
                <div className="no-data-icon">
                  <FaCreditCard />
                </div>
                <p>Aucun paiement effectué.</p>
              </div>
            ) : (
              <div className="payment-list">
                {payments.map((payment, index) => (
                  <div
                    key={payment.id}
                    className="payment-card"
                    style={{ animation: `fadeInUp ${0.3 + index * 0.05}s ease-out` }}
                  >
                    <div className="ticket-header" style={{ backgroundColor: 'var(--purple)', color: 'white' }}>
                      <FaCreditCard style={{ fontSize: '1.5rem', marginRight: '10px' }} />
                      Paiement #{payment.id}
                    </div>
                    <div className="ticket-body">
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(107, 72, 255, 0.1)', color: 'var(--purple)' }}>
                          <FaCreditCard style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(107, 72, 255, 0.1)', color: 'var(--purple)', padding: '5px 10px', borderRadius: '5px' }}>Montant</span>
                          <div className="info-value">{payment.montant} MAD</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)' }}>
                          <FaCreditCard style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(220, 53, 69, 0.1)', color: 'var(--primary)', padding: '5px 10px', borderRadius: '5px' }}>Méthode</span>
                          <div className="info-value">{payment.methode}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(0, 149, 255, 0.1)', color: 'var(--info)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(0, 149, 255, 0.1)', color: 'var(--info)', padding: '5px 10px', borderRadius: '5px' }}>Date</span>
                          <div className="info-value">{new Date(payment.date_paiement).toLocaleString()}</div>
                        </span>
                      </div>
                      <div className="ticket-info-item">
                        <span className="info-icon" style={{ background: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)' }}>
                          <FaTicketAlt style={{ fontSize: '1.5rem' }} />
                        </span>
                        <span>
                          <span className="info-label" style={{ backgroundColor: 'rgba(40, 167, 69, 0.1)', color: 'var(--accent)', padding: '5px 10px', borderRadius: '5px' }}>Match</span>
                          <div className="info-value">{payment.equipe1} vs {payment.equipe2}</div>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
