// services/notificationService.js
const { pool } = require('../config/db');

/**
 * Service pour gérer les notifications
 */
const notificationService = {
  /**
   * Ajouter une notification pour un nouvel utilisateur
   * @param {Object} user - Objet utilisateur nouvellement créé
   */
  async addUserNotification(user) {
    try {
      const titre = "Nouvel utilisateur inscrit";
      const contenu = `${user.nom} (${user.email}) vient de créer un compte.`;
      const type = "user";
      
      await pool.execute(
        'INSERT INTO notification (titre, contenu, type, entite_id, entite_type) VALUES (?, ?, ?, ?, ?)',
        [titre, contenu, type, user.id, 'utilisateur']
      );
      
      console.log('Notification de nouvel utilisateur créée');
    } catch (error) {
      console.error('Erreur lors de la création de la notification utilisateur:', error);
    }
  },
  
  /**
   * Ajouter une notification pour un nouveau ticket
   * @param {Object} ticket - Objet ticket nouvellement créé
   * @param {Object} user - Utilisateur qui a créé le ticket
   * @param {Object} match - Informations sur le match lié au ticket
   */
  async addTicketNotification(ticket, user, match) {
    try {
      const titre = "Nouveau ticket mis en vente";
      const matchInfo = `${match.equipe1} vs ${match.equipe2}`;
      const contenu = `${user.nom} a mis en vente un ticket pour le match ${matchInfo} au prix de ${ticket.prix}€.`;
      const type = "ticket";
      
      await pool.execute(
        'INSERT INTO notification (titre, contenu, type, entite_id, entite_type) VALUES (?, ?, ?, ?, ?)',
        [titre, contenu, type, ticket.id, 'ticket']
      );
      
      console.log('Notification de nouveau ticket créée');
    } catch (error) {
      console.error('Erreur lors de la création de la notification ticket:', error);
    }
  },
  
  /**
   * Ajouter une notification système
   * @param {string} titre - Titre de la notification
   * @param {string} contenu - Contenu de la notification
   */
  async addSystemNotification(titre, contenu) {
    try {
      const type = "system";
      
      await pool.execute(
        'INSERT INTO notification (titre, contenu, type) VALUES (?, ?, ?)',
        [titre, contenu, type]
      );
      
      console.log('Notification système créée');
    } catch (error) {
      console.error('Erreur lors de la création de la notification système:', error);
    }
  }
};

module.exports = notificationService;