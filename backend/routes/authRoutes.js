// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { protect } = require('../middleware/authMiddleware');
const notificationService = require('../services/notificationService');

// Route d'inscription
router.post('/signup', async (req, res) => {
  try {
    const { nom, email, motDePasse, role = 'client' } = req.body;
   
    // Vérifier si l'utilisateur existe déjà
    const [userRows] = await pool.execute(
      'SELECT * FROM utilisateur WHERE email = ?',
      [email]
    );
   
    if (userRows.length > 0) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
   
    // Hacher le mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(motDePasse, salt);
   
    // Insérer l'utilisateur dans la base de données
    const [result] = await pool.execute(
      'INSERT INTO utilisateur (nom, email, motDePasse, role) VALUES (?, ?, ?, ?)',
      [nom, email, hashedPassword, role]
    );
   
    const userId = result.insertId;
   
    // Insérer dans la table client ou administrateur selon le rôle
    if (role === 'client') {
      await pool.execute('INSERT INTO client (id) VALUES (?)', [userId]);
    } else if (role === 'administrateur') {
      await pool.execute('INSERT INTO administrateur (id) VALUES (?)', [userId]);
    }
   
    // Générer un token JWT
    const token = jwt.sign(
      { id: userId, role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    const user = {
      id: userId,
      nom,
      email,
      role
    };
    
    // Ajouter une notification pour l'administrateur
    await notificationService.addUserNotification(user);
   
    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      token,
      user
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ message: 'Erreur lors de la création du compte' });
  }
});

// Route de connexion
router.post('/login', async (req, res) => {
  try {
    const { email, motDePasse } = req.body;
   
    // Vérifier si l'utilisateur existe
    const [userRows] = await pool.execute(
      'SELECT * FROM utilisateur WHERE email = ?',
      [email]
    );
   
    if (userRows.length === 0) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
   
    const user = userRows[0];
   
    // Vérifier si l'utilisateur est bloqué
    if (user.estBloque) {
      return res.status(403).json({ message: 'Votre compte a été bloqué' });
    }
   
    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(motDePasse, user.motDePasse);
    if (!isMatch) {
      return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
    }
   
    // Générer un token JWT
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
   
    res.status(200).json({
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ message: 'Erreur lors de la connexion' });
  }
});

// Route pour obtenir les informations de l'utilisateur connecté
router.get('/me', protect, async (req, res) => {
  try {
    const [userRows] = await pool.execute(
      'SELECT id, nom, email, role FROM utilisateur WHERE id = ?',
      [req.user.id]
    );
   
    if (userRows.length === 0) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }
   
    res.status(200).json({
      user: userRows[0]
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des informations de l\'utilisateur:', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;