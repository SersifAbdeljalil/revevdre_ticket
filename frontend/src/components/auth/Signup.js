// src/components/auth/Signup.js
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signupAPI } from '../../api/authAPI';
import { FaGoogle, FaFacebookF, FaTwitter, FaEye, FaEyeSlash } from 'react-icons/fa';
import './Auth.css';

const Signup = () => {
  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    motDePasse: '',
    confirmMotDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0
  });

  const navigate = useNavigate();

  const { nom, email, motDePasse, confirmMotDePasse } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Vérifier la force du mot de passe à chaque changement
  useEffect(() => {
    const checkPasswordStrength = () => {
      let score = 0;

      // Attributions de points pour différents critères
      if (motDePasse.length >= 8) score += 1;
      if (/[A-Z]/.test(motDePasse)) score += 1;
      if (/[a-z]/.test(motDePasse)) score += 1;
      if (/[0-9]/.test(motDePasse)) score += 1;
      if (/[!@#$%^&*(),.?":{}|<>]/.test(motDePasse)) score += 1;

      setPasswordStrength({ score });
    };

    checkPasswordStrength();
  }, [motDePasse]);

  // Fonction pour déterminer la classe CSS du niveau de force
  const getStrengthClass = () => {
    if (passwordStrength.score === 0) return '';
    if (passwordStrength.score <= 2) return 'weak';
    if (passwordStrength.score <= 4) return 'medium';
    return 'strong';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!nom || nom.length < 2) {
      setError('Le nom doit contenir au moins 2 caractères');
      setLoading(false);
      return;
    }

    if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)) {
      setError('Veuillez entrer un email valide');
      setLoading(false);
      return;
    }

    if (motDePasse !== confirmMotDePasse) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (passwordStrength.score <= 2) {
      setError('Le mot de passe est trop faible. Ajoutez des caractères spéciaux, chiffres et lettres majuscules.');
      setLoading(false);
      return;
    }

    try {
      const response = await signupAPI(nom, email, motDePasse);
      localStorage.setItem('token', response.token); // Stocker le token JWT
      navigate('/matches'); // Rediriger vers la page des matchs après inscription
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  // Fonctions pour l'authentification sociale
  const handleGoogleAuth = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const handleFacebookAuth = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/facebook`;
  };

  const handleTwitterAuth = () => {
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/twitter`;
  };

  // Toggle pour afficher/masquer le mot de passe
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle pour afficher/masquer la confirmation du mot de passe
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Inscription</h2>
        <h3>Revente Tickets CAN 2025</h3>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nom">Nom complet</label>
            <input
              type="text"
              id="nom"
              name="nom"
              value={nom}
              onChange={handleChange}
              required
              placeholder="Entrez votre nom complet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={email}
              onChange={handleChange}
              required
              placeholder="Entrez votre email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="motDePasse">Mot de passe</label>
            <div className="password-input-container">
              <input
                type={showPassword ? "text" : "password"}
                id="motDePasse"
                name="motDePasse"
                value={motDePasse}
                onChange={handleChange}
                required
                placeholder="Créez un mot de passe"
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            {/* Barre de force du mot de passe */}
            {motDePasse.length > 0 && (
              <div className="password-strength-meter">
                <div className="strength-bar">
                  <div
                    className={`strength-bar-fill ${getStrengthClass()}`}
                    style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                  ></div>
                </div>
                <p className={`strength-text ${getStrengthClass()}`}>
                  {passwordStrength.score <= 2 && "Faible"}
                  {passwordStrength.score > 2 && passwordStrength.score <= 4 && "Moyen"}
                  {passwordStrength.score > 4 && "Fort"}
                </p>
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="confirmMotDePasse">Confirmer le mot de passe</label>
            <div className="password-input-container">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmMotDePasse"
                name="confirmMotDePasse"
                value={confirmMotDePasse}
                onChange={handleChange}
                required
                placeholder="Confirmez votre mot de passe"
                minLength="6"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={toggleConfirmPasswordVisibility}
                aria-label={showConfirmPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Inscription en cours...' : 'S\'inscrire'}
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
          Déjà inscrit ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;