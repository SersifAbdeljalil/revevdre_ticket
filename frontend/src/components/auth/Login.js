// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../../api/authAPI';
import { FaGoogle, FaFacebookF, FaTwitter, FaEye, FaEyeSlash, FaExclamationTriangle } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const { email, motDePasse } = formData;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      console.log('Tentative de connexion avec:', { email }); // Débogage
      const response = await loginAPI(email, motDePasse);
      console.log('Réponse loginAPI dans Login.js:', response); // Débogage

      // Rediriger selon le rôle de l'utilisateur
      if (response.user && response.user.role === 'administrateur') {
        console.log('Redirection vers /admin'); // Débogage
        navigate('/admin');
      } else {
        console.log('Redirection vers /matches'); // Débogage
        navigate('/matches');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      setError(err.message || 'Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = () => {
    console.log('Authentification Google'); // Débogage
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  const handleFacebookAuth = () => {
    console.log('Authentification Facebook'); // Débogage
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/facebook`;
  };

  const handleTwitterAuth = () => {
    console.log('Authentification Twitter'); // Débogage
    window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/auth/twitter`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
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
                placeholder="Entrez votre mot de passe"
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
          </div>
          <div className="forgot-password">
            <Link to="/forgot-password">Mot de passe oublié ?</Link>
          </div>

          <button
            type="submit"
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Connexion en cours...' : 'Se connecter'}
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
          Pas encore de compte ? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;