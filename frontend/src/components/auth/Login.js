// src/components/auth/Login.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginAPI } from '../../api/authAPI';
import { FaGoogle, FaFacebookF, FaTwitter } from 'react-icons/fa';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    motDePasse: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
 
  const navigate = useNavigate();
 
  const { email, motDePasse } = formData;
 
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
   
    try {
      const response = await loginAPI(email, motDePasse);
      
      // Rediriger selon le rôle de l'utilisateur
      if (response && response.user && response.user.role === 'administrateur') {
        navigate('/admin'); // Rediriger vers le dashboard administrateur
      } else {
        navigate('/'); // Rediriger vers la page d'accueil pour les clients
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue lors de la connexion');
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
 
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Connexion</h2>
        <h3>Revente Tickets CAN 2025</h3>
       
        {error && <div className="error-message">{error}</div>}
       
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
            <input
              type="password"
              id="motDePasse"
              name="motDePasse"
              value={motDePasse}
              onChange={handleChange}
              required
              placeholder="Entrez votre mot de passe"
            />
          </div>
          <div className="forgot-password">
            <Link to="/forgot-password">Mot de passe oublié?</Link>
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
          Pas encore de compte? <Link to="/signup">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;