// src/components/auth/ResetPassword.js
import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import api from "../../api/api";
import { FaGoogle, FaFacebookF, FaTwitter, FaEye, FaEyeSlash, FaExclamationTriangle } from "react-icons/fa";
import "./Auth.css";

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const code = location.state?.code || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/password-reset/reset-password", { email, code, newPassword });
      setError("Mot de passe réinitialisé avec succès !");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err) {
      setError(err.response?.data.error || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const password = e.target.value;
    setNewPassword(password);
    setPasswordStrength(calculatePasswordStrength(password));
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[@$!%*?&]/.test(password)) strength += 1;
    return strength;
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 1) return "red";
    if (passwordStrength === 2 || passwordStrength === 3) return "orange";
    if (passwordStrength >= 4) return "green";
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
        <h2>Réinitialiser le Mot de Passe</h2>
        <h3>Revente Tickets CAN 2025</h3>

        {error && (
          <div className="error-message">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="newPassword">Nouveau mot de passe</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={handlePasswordChange}
                required
                placeholder="Entrez votre nouveau mot de passe"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
            <div
              style={{
                height: "5px",
                width: "100%",
                backgroundColor: "#e0e0e0",
                marginTop: "5px",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${(passwordStrength / 5) * 100}%`,
                  backgroundColor: getStrengthColor(),
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
            <small style={{ color: getStrengthColor() }}>
              {passwordStrength <= 1
                ? "Mot de passe faible"
                : passwordStrength === 2 || passwordStrength === 3
                ? "Mot de passe moyen"
                : "Mot de passe fort"}
            </small>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading || passwordStrength < 3}
          >
            {loading ? "Réinitialisation en cours..." : "Réinitialiser"}
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
          Retour à la vérification ? <Link to="/verify-code" state={{ email }}>Retour</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;