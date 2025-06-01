// src/components/auth/ForgotPassword.js
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../api/api";
import { FaGoogle, FaFacebookF, FaTwitter, FaExclamationTriangle } from "react-icons/fa";
import "./Auth.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/password-reset/request-reset", { email });
      if (response.data.redirect) {
        navigate("/verify-code", { state: { email } });
      }
    } catch (err) {
      setError(err.response?.data.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/google`;
  };

  const handleFacebookAuth = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/facebook`;
  };

  const handleTwitterAuth = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/auth/twitter`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Réinitialisation du mot de passe</h2>
        <h3>Revente Tickets CAN 2025</h3>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Entrez votre email"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Envoi en cours..." : "Envoyer le code"}
          </button>
        </form>

        <div className="auth-separator">
          <span></span>
          <p>OU</p>
          <span></span>
        </div>

        <div className="social-auth">
          <button className="social-auth-btn google" onClick={handleGoogleAuth}>
            <FaGoogle />
            <span>Google</span>
          </button>
          <button className="social-auth-btn facebook" onClick={handleFacebookAuth}>
            <FaFacebookF />
            <span>Facebook</span>
          </button>
          <button className="social-auth-btn twitter" onClick={handleTwitterAuth}>
            <FaTwitter />
            <span>Twitter</span>
          </button>
        </div>

        <p className="auth-redirect">
          Retour à la connexion ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;