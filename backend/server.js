// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const { protect } = require('./middleware/authMiddleware');

// Initialisation de l'application Express
const app = express();

// Middlewares de base
app.use(cors());
app.use(express.json());

// Middleware de logging pour le débogage
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

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

// Route simple pour tester le service de tickets
app.get('/api/test-tickets', (req, res) => {
  console.log('Route de test tickets appelée');
  res.status(200).json({ message: 'La route de test fonctionne' });
});

// Définition des routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Route de tickets avec logging
app.use('/api/tickets', (req, res, next) => {
  console.log('Route /api/tickets interceptée');
  next();
}, ticketRoutes);

app.use('/api/clients', clientRoutes);

// Routes utilitaires
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/version', (req, res) => {
  res.json({
    version: '1.0.0',
    name: 'API Revente Tickets CAN 2025',
    description: 'API pour la plateforme de revente de tickets de la CAN 2025'
  });
});

app.get('/api/profile', protect, (req, res) => {
  res.json({
    message: 'Profil accessible',
    user: req.user
  });
});

app.get('/', (req, res) => {
  res.send('API de Revente Tickets CAN 2025');
});

// Gestion des erreurs 404
app.use((req, res, next) => {
  console.log(`[404] Route non trouvée: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route non trouvée' });
});

// Gestion des erreurs générales
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${err.stack}`);
  res.status(500).json({
    message: 'Une erreur est survenue sur le serveur',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Démarrage du serveur après vérification de la connexion à la DB
const startServer = async () => {
  const dbConnected = await testDbConnection();
  
  if (dbConnected) {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Serveur démarré sur le port ${PORT}`);
      console.log(`API accessible à l'adresse: http://localhost:${PORT}`);
    });
  } else {
    console.error('Impossible de démarrer le serveur: problème de connexion à la base de données');
    process.exit(1);
  }
};

// Lancer le serveur
startServer();