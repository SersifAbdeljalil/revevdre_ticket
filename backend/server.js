// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { pool } = require('./config/db');
const authRoutes = require('./routes/authRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Fonction pour tester la connexion à la base de données
const testDbConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connexion à la base de données MySQL établie avec succès');
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

// Route de test
app.get('/', (req, res) => {
  res.send('API de Revente Tickets CAN 2025');
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Une erreur est survenue sur le serveur' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});