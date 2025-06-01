// src/components/auth/VerifyCode.js
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../api/api";
import { FaGoogle, FaFacebookF, FaTwitter, FaExclamationTriangle } from "react-icons/fa";
import "./Auth.css";

const VerifyCode = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/password-reset/verify-code", { email, code });
      navigate("/reset-password", { state: { email, code } });
    } catch (err) {
      setError(err.response?.data.error || "Code invalide.");
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
        <h2>Vérifier le Code</h2>
        <h3>Revente Tickets CAN 2025</h3>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="code">Code à 6 chiffres</label>
            <input
              type="text"
              id="code"
              name="code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
              placeholder="Entrez le code à 6 chiffres"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Vérification en cours..." : "Vérifier"}
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
          Retour à la réinitialisation ? <Link to="/forgot-password">Retour</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyCode;