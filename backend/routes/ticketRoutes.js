const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const multer = require('multer');
const { jsPDF } = require('jspdf');

// Configuration de multer pour l'upload des PDF
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/tickets/');
  },
  filename: (req, file, cb) => {
    cb(null, `ticket_${Date.now()}_${file.originalname}`);
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seuls les fichiers PDF sont autorisés'), false);
    }
  }
});

// Récupérer tous les tickets disponibles à la vente
router.get('/', async (req, res) => {
  try {
    const { matchId, status, minPrice, maxPrice } = req.query;

    let query = `
      SELECT 
        t.id, t.prix, t.estRevendu, t.pdf_path,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE 1=1
    `;

    const queryParams = [];

    if (matchId) {
      query += ' AND t.match_id = ?';
      queryParams.push(matchId);
    }

    if (status === 'available') {
      query += ' AND t.estRevendu = 0';
    } else if (status === 'sold') {
      query += ' AND t.estRevendu = 1';
    }

    if (minPrice) {
      query += ' AND t.prix >= ?';
      queryParams.push(minPrice);
    }

    if (maxPrice) {
      query += ' AND t.prix <= ?';
      queryParams.push(maxPrice);
    }

    query += ' ORDER BY m.date ASC, t.prix ASC';

    const [tickets] = await pool.query(query, queryParams);

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: Boolean(ticket.estRevendu),
      pdfPath: ticket.pdf_path,
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    }));

    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les tickets mis en vente par l'utilisateur connecté
router.get('/my-sales', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await pool.query(
      `
      SELECT 
        t.id, t.prix, t.estRevendu, t.pdf_path,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      WHERE t.vendeurId = ?
      ORDER BY t.estRevendu ASC, m.date ASC
      `,
      [userId]
    );

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      prix: ticket.prix,
      estRevendu: Boolean(ticket.estRevendu),
      pdfPath: ticket.pdf_path,
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
    }));

    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets mis en vente:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer les tickets achetés par l'utilisateur connecté
router.get('/my-purchases', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const [tickets] = await pool.query(
      `
      SELECT 
        t.id, t.prix, t.pdf_path,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail,
        ha.date_achat as dateAchat
      FROM historique_achat ha
      JOIN ticket t ON ha.ticket_id = t.id
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE ha.client_id = ?
      ORDER BY ha.date_achat DESC
      `,
      [userId]
    );

    const formattedTickets = tickets.map((ticket) => ({
      id: ticket.id,
      prix: ticket.prix,
      estVendu: Boolean(ticket.estRevendu), // Adapté pour ticketAPI.js
      pdfPath: ticket.pdf_path,
      dateAchat: ticket.dateAchat,
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    }));

    res.status(200).json({ tickets: formattedTickets });
  } catch (error) {
    console.error('Erreur lors de la récupération des tickets achetés:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Récupérer un ticket spécifique par son ID
router.get('/:id', async (req, res) => {
  try {
    const ticketId = req.params.id;

    const [tickets] = await pool.query(
      `
      SELECT 
        t.id, t.prix, t.estRevendu, t.pdf_path,
        m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
        u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      JOIN utilisateur u ON t.vendeurId = u.id
      WHERE t.id = ?
      `,
      [ticketId]
    );

    if (tickets.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const ticket = tickets[0];

    const formattedTicket = {
      id: ticket.id,
      prix: ticket.prix,
      estVendu: Boolean(ticket.estRevendu), // Adapté pour ticketAPI.js
      pdfPath: ticket.pdf_path,
      match: {
        id: ticket.matchId,
        date: ticket.date,
        lieu: ticket.lieu,
        equipe1: ticket.equipe1,
        equipe2: ticket.equipe2,
      },
      vendeur: {
        id: ticket.vendeurId,
        nom: ticket.vendeurNom,
        email: ticket.vendeurEmail,
      },
    };

    res.status(200).json({ ticket: formattedTicket });
  } catch (error) {
    console.error('Erreur lors de la récupération du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Créer un nouveau ticket à vendre avec upload PDF
router.post('/', protect, upload.single('pdf'), async (req, res) => {
  try {
    const { prix, matchId } = req.body;
    const vendeurId = req.user.id;
    const pdfFile = req.file;

    if (!prix || !matchId || !pdfFile) {
      return res.status(400).json({ message: 'Le prix, l\'ID du match et un fichier PDF sont requis' });
    }

    const [matchRows] = await pool.query('SELECT * FROM matchs WHERE id = ?', [matchId]);
    if (matchRows.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }

    const pdfPath = `/uploads/tickets/${pdfFile.filename}`;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      const [result] = await connection.query(
        'INSERT INTO ticket (prix, match_id, vendeurId, estRevendu, pdf_path) VALUES (?, ?, ?, 0, ?)',
        [prix, matchId, vendeurId, pdfPath]
      );

      await connection.query(
        'INSERT INTO ticket_pdf_history (ticket_id, pdf_path, vendeur_id) VALUES (?, ?, ?)',
        [result.insertId, pdfPath, vendeurId]
      );

      await connection.commit();

      const [newTicket] = await pool.query(
        `
        SELECT 
          t.id, t.prix, t.estRevendu, t.pdf_path,
          m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
          u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
        FROM ticket t
        JOIN matchs m ON t.match_id = m.id
        JOIN utilisateur u ON t.vendeurId = u.id
        WHERE t.id = ?
        `,
        [result.insertId]
      );

      const ticket = newTicket[0];

      const formattedTicket = {
        id: ticket.id,
        prix: ticket.prix,
        estVendu: Boolean(ticket.estRevendu), // Adapté pour ticketAPI.js
        pdfPath: ticket.pdf_path,
        match: {
          id: ticket.matchId,
          date: ticket.date,
          lieu: ticket.lieu,
          equipe1: ticket.equipe1,
          equipe2: ticket.equipe2,
        },
        vendeur: {
          id: ticket.vendeurId,
          nom: ticket.vendeurNom,
          email: ticket.vendeurEmail,
        },
      };

      res.status(201).json({
        message: 'Ticket mis en vente avec succès',
        ticket: formattedTicket,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de la création du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Acheter un ticket et générer un nouveau PDF
router.post('/:id/purchase', protect, async (req, res) => {
  try {
    const ticketId = req.params.id;
    const acheteurId = req.user.id;
    const { methode, cardNumber, cvv, expiryMonth, expiryYear, password, phoneNumber } = req.body;

    const [ticketRows] = await pool.query(
      'SELECT id, prix, vendeurId, estRevendu, match_id, pdf_path FROM ticket WHERE id = ?',
      [ticketId]
    );

    if (ticketRows.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const ticket = ticketRows[0];

    if (ticket.estRevendu) {
      return res.status(400).json({ message: 'Ce ticket a déjà été vendu' });
    }

    if (ticket.vendeurId === acheteurId) {
      return res.status(400).json({ message: 'Vous ne pouvez pas acheter votre propre ticket' });
    }

    const [matchRows] = await pool.query('SELECT date, equipe1, equipe2, lieu FROM matchs WHERE id = ?', [
      ticket.match_id,
    ]);
    if (matchRows.length === 0) {
      return res.status(404).json({ message: 'Match non trouvé' });
    }
    const match = matchRows[0];

    if (new Date(match.date) < new Date()) {
      return res.status(400).json({ message: 'Ce match a déjà eu lieu' });
    }

    const [acheteurRows] = await pool.query('SELECT nom FROM utilisateur WHERE id = ?', [acheteurId]);
    const [vendeurRows] = await pool.query('SELECT nom FROM utilisateur WHERE id = ?', [ticket.vendeurId]);
    if (acheteurRows.length === 0 || vendeurRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
    const acheteurNom = acheteurRows[0].nom;
    const vendeurNom = vendeurRows[0].nom;

    // Générer un nouveau PDF avec le nom de l'acheteur
    const doc = new jsPDF();
    doc.text(`Match: ${match.equipe1} vs ${match.equipe2}`, 20, 20);
    doc.text(`Lieu: ${match.lieu}`, 20, 30);
    doc.text(`Date: ${new Date(match.date).toLocaleString('fr-FR')}`, 20, 40);
    doc.text(`Prix: ${ticket.prix} MAD`, 20, 50);
    doc.text(`Vendeur: ${acheteurNom}`, 20, 60); // Remplacer le vendeur par l'acheteur
    doc.text(`Ticket ID: ${ticketId}`, 20, 70);

    const newPdfFilename = `ticket_${ticketId}_${Date.now()}.pdf`;
    const newPdfPath = path.join(__dirname, '../uploads/tickets/', newPdfFilename);
    await doc.save(newPdfPath);

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Marquer le ticket comme vendu
      await connection.query('UPDATE ticket SET estRevendu = 1, pdf_path = ? WHERE id = ?', [
        `/uploads/tickets/${newPdfFilename}`,
        ticketId,
      ]);

      // Mettre à jour l'historique des PDF
      await connection.query(
        'UPDATE ticket_pdf_history SET is_current = 0 WHERE ticket_id = ? AND is_current = 1',
        [ticketId]
      );
      await connection.query(
        'INSERT INTO ticket_pdf_history (ticket_id, pdf_path, vendeur_id, acheteur_id) VALUES (?, ?, ?, ?)',
        [ticketId, `/uploads/tickets/${newPdfFilename}`, ticket.vendeurId, acheteurId]
      );

      // Enregistrer le paiement
      await connection.query(
        'INSERT INTO paiement (montant, methode, client_id, ticket_id, date_paiement, card_number, cvv, expiry_month, expiry_year, password, phone_number) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?)',
        [
          ticket.prix,
          methode || 'carte',
          acheteurId,
          ticketId,
          cardNumber || null,
          cvv || null,
          expiryMonth || null,
          expiryYear || null,
          password || null,
          phoneNumber || null,
        ]
      );

      // Enregistrer l'achat
      await connection.query(
        'INSERT INTO historique_achat (client_id, ticket_id, date_achat) VALUES (?, ?, NOW())',
        [acheteurId, ticketId]
      );

      await connection.commit();

      res.status(200).json({
        message: 'Ticket acheté avec succès',
        ticketId,
        pdfPath: `/uploads/tickets/${newPdfFilename}`,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de l\'achat du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Mettre un ticket acheté en revente avec un nouveau PDF
router.post('/:id/resell', protect, upload.single('pdf'), async (req, res) => {
  try {
    const ticketId = req.params.id;
    const userId = req.user.id;
    const { prix } = req.body;
    const pdfFile = req.file;

    if (!prix || !pdfFile) {
      return res.status(400).json({ message: 'Le prix et un fichier PDF sont requis' });
    }

    const [ticketRows] = await pool.query(
      `
      SELECT 
        t.id, t.match_id, t.estRevendu, t.vendeurId,
        m.date
      FROM ticket t
      JOIN matchs m ON t.match_id = m.id
      WHERE t.id = ?
      `,
      [ticketId]
    );

    if (ticketRows.length === 0) {
      return res.status(404).json({ message: 'Ticket non trouvé' });
    }

    const ticket = ticketRows[0];

    // Vérifier si l'utilisateur est le propriétaire actuel (acheteur ou vendeur initial)
    const [purchaseRows] = await pool.query(
      'SELECT client_id FROM historique_achat WHERE ticket_id = ? AND client_id = ?',
      [ticketId, userId]
    );

    if (purchaseRows.length === 0 && ticket.vendeurId !== userId) {
      return res.status(403).json({ message: 'Vous n\'êtes pas autorisé à revendre ce ticket' });
    }

    if (new Date(ticket.date) < new Date()) {
      return res.status(400).json({ message: 'Ce match a déjà eu lieu' });
    }

    const pdfPath = `/uploads/tickets/${pdfFile.filename}`;

    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Mettre à jour le ticket pour le rendre disponible à la revente
      await connection.query(
        'UPDATE ticket SET estRevendu = 0, prix = ?, vendeurId = ?, pdf_path = ? WHERE id = ?',
        [prix, userId, pdfPath, ticketId]
      );

      // Mettre à jour l'historique des PDF
      await connection.query(
        'UPDATE ticket_pdf_history SET is_current = 0 WHERE ticket_id = ? AND is_current = 1',
        [ticketId]
      );
      await connection.query(
        'INSERT INTO ticket_pdf_history (ticket_id, pdf_path, vendeur_id) VALUES (?, ?, ?)',
        [ticketId, pdfPath, userId]
      );

      // Supprimer l'entrée d'achat de l'historique si elle existe
      await connection.query('DELETE FROM historique_achat WHERE ticket_id = ? AND client_id = ?', [
        ticketId, userId,
      ]);

      await connection.commit();

      const [updatedTicket] = await pool.query(
        `
        SELECT 
          t.id, t.prix, t.estRevendu, t.pdf_path,
          m.id as matchId, m.date, m.lieu, m.equipe1, m.equipe2,
          u.id as vendeurId, u.nom as vendeurNom, u.email as vendeurEmail 
        FROM ticket t
        JOIN matchs m ON t.match_id = m.id
        JOIN utilisateur u ON t.vendeurId = u.id
        WHERE t.id = ?
        `,
        [ticketId]
      );

      const ticketData = updatedTicket[0];

      const formattedTicket = {
        id: ticketData.id,
        prix: ticketData.prix,
        estVendu: Boolean(ticketData.estRevendu),
        pdfPath: ticketData.pdf_path,
        match: {
          id: ticketData.matchId,
          date: ticketData.date,
          lieu: ticketData.lieu,
          equipe1: ticketData.equipe1,
          equipe2: ticketData.equipe2,
        },
        vendeur: {
          id: ticketData.vendeurId,
          nom: ticketData.vendeurNom,
          email: ticketData.vendeurEmail,
        },
      };

      res.status(200).json({
        message: 'Ticket mis en revente avec succès',
        ticket: formattedTicket,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Erreur lors de la mise en revente du ticket:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// Servir les fichiers PDF
router.get('/pdf/:filename', protect, (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, '../uploads/tickets/', filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error('Erreur lors de l\'envoi du fichier PDF:', err);
      res.status(404).json({ message: 'Fichier PDF non trouvé' });
    }
  });
});

module.exports = router;