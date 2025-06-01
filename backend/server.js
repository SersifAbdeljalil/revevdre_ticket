// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const clientRoutes = require('./routes/clientRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const matchRoutes = require('./routes/matchRoutes');
const passwordResetRoutes = require('./routes/passwordReset'); // Ajout des routes passwordReset
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

// Définition des routes API
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/client', clientRoutes);
app.use('/api', matchRoutes);
app.use('/api/tickets', (req, res, next) => {
  console.log('Route /api/tickets interceptée');
  next();
}, ticketRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/password-reset', passwordResetRoutes); // Ajout des routes de réinitialisation

// Routes utilitaires
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