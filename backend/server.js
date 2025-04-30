// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const { protect } = require('./middleware/authMiddleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Fonction pour tester la connexion à la base de données
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connexion à la base de données MySQL établie avec succès');
    
    // Vérification de la structure de la base de données
    const [tables] = await connection.query('SHOW TABLES');
    console.log('Tables disponibles dans la base de données:');
    tables.forEach(table => {
      console.log(`- ${Object.values(table)[0]}`);
    });
    
    connection.release();
    return true;
  } catch (error) {
    console.error('Erreur de connexion à la base de données MySQL:', error);
    return false;
  }
};

// Tester la connexion à la base de données
testDbConnection();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes); // Nouvelles routes admin

// Route pour vérifier la version de l'API
app.get('/api/version', (req, res) => {
  res.json({ 
    version: '1.0.0',
    name: 'API Revente Tickets CAN 2025',
    description: 'API pour la plateforme de revente de tickets de la CAN 2025'
  });
});

// Route d'API protégée de test pour vérifier l'authentification
app.get('/api/profile', protect, (req, res) => {
  res.json({
    message: 'Profil accessible',
    user: req.user
  });
});

// Route de test
app.get('/', (req, res) => {
  res.send('API de Revente Tickets CAN 2025');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs générales
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
  console.log(`API accessible à l'adresse: http://localhost:${PORT}`);
});