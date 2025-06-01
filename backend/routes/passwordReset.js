// routes/passwordReset.js
const express = require("express");
const { pool } = require("../config/db"); // Utiliser le pool de connexions de mysql2/promise
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

const router = express.Router();

// Transporteur pour envoyer des emails
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USER || "sersif.a366@ucd.ac.ma",
    pass: process.env.EMAIL_PASS || "plle hlae hyrj myrl",
  },
});

// Route pour demander un code de réinitialisation
router.post("/request-reset", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email requis." });
    }

    const resetCode = crypto.randomInt(100000, 999999); // Générer un code à 6 chiffres

    // Vérifier si l'utilisateur existe
    const [results] = await pool.execute("SELECT * FROM utilisateur WHERE email = ?", [email]);

    if (results.length === 0) {
      return res.status(404).json({ error: "Email non trouvé." });
    }

    // Mettre à jour la base de données avec le code de réinitialisation
    await pool.execute("UPDATE utilisateur SET reset_code = ? WHERE email = ?", [resetCode, email]);

    // Envoyer l'email avec le code
    await transporter.sendMail({
      from: process.env.EMAIL_USER || "sersif.a366@ucd.ac.ma",
      to: email,
      subject: "Code de réinitialisation du mot de passe",
      text: `Votre code de réinitialisation est : ${resetCode}`,
    });

    res.json({ message: "Code envoyé avec succès.", redirect: true });
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Route pour vérifier le code de réinitialisation
router.post("/verify-code", async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ error: "Email et code requis." });
    }

    const [results] = await pool.execute("SELECT reset_code FROM utilisateur WHERE email = ?", [email]);

    if (results.length === 0 || results[0].reset_code !== parseInt(code)) {
      return res.status(400).json({ error: "Code incorrect." });
    }

    res.json({ message: "Code valide." });
  } catch (error) {
    console.error("Erreur lors de la vérification du code:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

// Route pour réinitialiser le mot de passe
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: "Email, code et nouveau mot de passe requis." });
    }

    const [results] = await pool.execute("SELECT reset_code FROM utilisateur WHERE email = ?", [email]);

    if (results.length === 0 || results[0].reset_code !== parseInt(code)) {
      return res.status(400).json({ error: "Code invalide." });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.execute(
      "UPDATE utilisateur SET motDePasse = ?, reset_code = NULL WHERE email = ?",
      [hashedPassword, email]
    );

    res.json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({ error: "Erreur serveur." });
  }
});

module.exports = router;