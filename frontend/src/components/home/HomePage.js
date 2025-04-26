// src/components/home/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaTicketAlt, FaArrowRight, FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';
import useInitAnimations from './Animation';
import './HomePage.css';

const HomePage = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [menuOpen, setMenuOpen] = useState(false);

  // Initialiser toutes les animations
  useInitAnimations();

  // Effet pour détecter le scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setScrolled(scrollTop > 50);

      // Déterminer quelle section est active
      const sections = ['hero', 'about', 'features', 'matches', 'contact'];
      for (const section of sections) {
        const element = document.getElementById(section);
        if (!element) continue;
        
        const rect = element.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Fonction de scroll vers les sections
  const scrollToSection = (sectionId) => {
    setMenuOpen(false); // Fermer le menu mobile après un clic
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 70,
        behavior: 'smooth'
      });
    }
  };

  // Toggle le menu mobile
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Données de matchs fictives
  const upcomingMatches = [
    { id: 1, team1: 'Maroc', team2: 'Nigeria', date: '15 Juin 2025', time: '20:00', venue: 'Stade Mohammed V, Casablanca' },
    { id: 2, team1: 'Côte d\'Ivoire', team2: 'Égypte', date: '18 Juin 2025', time: '17:30', venue: 'Stade Félix Houphouët-Boigny, Abidjan' },
    { id: 3, team1: 'Sénégal', team2: 'Algérie', date: '21 Juin 2025', time: '19:00', venue: 'Stade Léopold Sédar Senghor, Dakar' }
  ];

  return (
    <div className="home-page">
      {/* Navigation fixe sur la page d'accueil */}
      <header className={`home-header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <FaTicketAlt className="logo-icon" />
              <span>Revente Tickets CAN 2025</span>
            </div>
            
            {/* Hamburger menu pour mobile */}
            <div className={`hamburger ${menuOpen ? 'active' : ''}`} onClick={toggleMenu}>
              <span></span>
              <span></span>
              <span></span>
            </div>
            
            <nav className={`home-nav ${menuOpen ? 'active' : ''}`}>
              <ul>
                <li><a href="#hero" onClick={() => scrollToSection('hero')} className={activeSection === 'hero' ? 'active' : ''}>Accueil</a></li>
                <li><a href="#about" onClick={() => scrollToSection('about')} className={activeSection === 'about' ? 'active' : ''}>À propos</a></li>
                <li><a href="#features" onClick={() => scrollToSection('features')} className={activeSection === 'features' ? 'active' : ''}>Services</a></li>
                <li><a href="#matches" onClick={() => scrollToSection('matches')} className={activeSection === 'matches' ? 'active' : ''}>Matchs</a></li>
                <li><a href="#contact" onClick={() => scrollToSection('contact')} className={activeSection === 'contact' ? 'active' : ''}>Contact</a></li>
              </ul>
            </nav>
            
            <div className="auth-btns">
              <Link to="/login" className="login-btn">Connexion</Link>
              <Link to="/signup" className="signup-btn">Inscription</Link>
            </div>
          </div>
        </div>
      </header>
      
      {/* Section Hero */}
      <section id="hero" className="hero-section">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">Achetez et revendez vos tickets pour la <span>CAN 2025</span></h1>
            <p className="hero-subtitle">Plateforme sécurisée pour les fans de football africain</p>
            <div className="hero-buttons">
              <Link to="/tickets" className="primary-btn">Voir les tickets disponibles</Link>
              <Link to="/signup" className="secondary-btn">Créer un compte <FaArrowRight /></Link>
            </div>
          </div>
          <div className="hero-image">
            <div className="stadium-image"></div>
          </div>
        </div>
        <div className="scroll-indicator" onClick={() => scrollToSection('about')}>
          <div className="mouse"></div>
          <p>Défiler vers le bas</p>
        </div>
      </section>
      
      {/* Section À propos */}
      <section id="about" className="about-section">
      <div className="container">
          <div className="section-header fade-in">
            <h2>À propos de nous</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="about-content">
            <div className="about-image fade-in"></div>
            <div className="about-text fade-in">
              <h3>Votre plateforme fiable pour la Coupe d'Afrique des Nations 2025</h3>
              <p>Revente Tickets CAN 2025 est la première plateforme africaine dédiée à l'achat et la revente sécurisée de billets pour les matchs de la Coupe d'Afrique des Nations.</p>
              <p>Notre mission est de connecter les passionnés de football africain tout en garantissant des transactions sûres et transparentes. Nous vérifions l'authenticité de chaque billet mis en vente sur notre plateforme pour vous assurer une expérience sans souci.</p>
              <div className="about-stats">
                <div className="stat-item">
                  <span className="stat-number">10K+</span>
                  <span className="stat-text">Utilisateurs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">52</span>
                  <span className="stat-text">Matchs</span>
                </div>
                <div className="stat-item">
                  <span className="stat-number">24</span>
                  <span className="stat-text">Équipes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Fonctionnalités */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header fade-in">
            <h2>Nos services</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="features-grid">
            <div className="feature-card fade-in">
              <div className="feature-icon buy-icon"></div>
              <h3>Achat de tickets</h3>
              <p>Achetez des billets pour tous les matchs de la CAN 2025 en quelques clics seulement.</p>
            </div>
            
            <div className="feature-card fade-in" style={{animationDelay: '0.2s'}}>
              <div className="feature-icon sell-icon"></div>
              <h3>Revente sécurisée</h3>
              <p>Revendez vos billets en toute sécurité si vous ne pouvez pas assister à un match.</p>
            </div>
            
            <div className="feature-card fade-in" style={{animationDelay: '0.4s'}}>
              <div className="feature-icon verify-icon"></div>
              <h3>Vérification d'authenticité</h3>
              <p>Chaque billet est vérifié pour garantir son authenticité avant la mise en vente.</p>
            </div>
            
            <div className="feature-card fade-in" style={{animationDelay: '0.6s'}}>
              <div className="feature-icon transfer-icon"></div>
              <h3>Transfert électronique</h3>
              <p>Recevez vos e-tickets instantanément sur votre email ou dans votre compte.</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Section Matchs */}
      <section id="matches" className="matches-section">
        <div className="container">
          <div className="section-header fade-in">
            <h2>Prochains matchs</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="matches-grid">
            {upcomingMatches.map((match, index) => (
              <div className="match-card fade-in" key={match.id} style={{animationDelay: `${index * 0.2}s`}}>
                <div className="match-date">{match.date}</div>
                <div className="match-teams">
                  <div className="team team1">
                    <div className={`team-flag flag-${match.team1.toLowerCase()}`}></div>
                    <span className="team-name">{match.team1}</span>
                  </div>
                  <div className="match-info">
                    <div className="match-time">{match.time}</div>
                    <div className="match-vs">VS</div>
                  </div>
                  <div className="team team2">
                    <div className={`team-flag flag-${match.team2.toLowerCase()}`}></div>
                    <span className="team-name">{match.team2}</span>
                  </div>
                </div>
                <div className="match-venue">{match.venue}</div>
                <Link to={`/tickets/match/${match.id}`} className="match-ticket-btn">Voir les tickets</Link>
              </div>
            ))}
          </div>
          
          <div className="view-all-container fade-in">
            <Link to="/matches" className="view-all-btn">
              Voir tous les matchs <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
      
      {/* Section Contact */}
      <section id="contact" className="contact-section">
        <div className="container">
          <div className="section-header fade-in">
            <h2>Contactez-nous</h2>
            <div className="section-divider"></div>
          </div>
          
          <div className="contact-container">
            <div className="contact-info fade-in">
              <h3>Besoin d'aide?</h3>
              <p>Notre équipe est là pour répondre à toutes vos questions concernant l'achat ou la revente de tickets pour la CAN 2025.</p>
              
              <div className="contact-items">
                <div className="contact-item">
                  <FaEnvelope className="contact-icon" />
                  <div className="contact-text">
                    <h4>Email</h4>
                    <p>support@reventetickets-can2025.com</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaPhoneAlt className="contact-icon" />
                  <div className="contact-text">
                    <h4>Téléphone</h4>
                    <p>+212 5XX XX XX XX</p>
                  </div>
                </div>
                
                <div className="contact-item">
                  <FaMapMarkerAlt className="contact-icon" />
                  <div className="contact-text">
                    <h4>Adresse</h4>
                    <p>123 Avenue Mohammed V, Casablanca, Maroc</p>
                  </div>
                </div>
              </div>
              
              <div className="social-links">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaFacebook />
                </a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaTwitter />
                </a>
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link">
                  <FaInstagram />
                </a>
              </div>
            </div>
            
            <div className="contact-form fade-in">
              <form>
                <div className="form-group">
                  <label htmlFor="name">Nom complet</label>
                  <input type="text" id="name" placeholder="Votre nom" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input type="email" id="email" placeholder="Votre email" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="subject">Sujet</label>
                  <input type="text" id="subject" placeholder="Sujet de votre message" required />
                </div>
                
                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea id="message" rows="5" placeholder="Votre message" required></textarea>
                </div>
                
                <button type="submit" className="submit-btn">Envoyer le message</button>
              </form>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="home-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-logo">
              <FaTicketAlt className="logo-icon" />
              <span>Revente Tickets CAN 2025</span>
            </div>
            
            <div className="footer-links">
              <div className="footer-column">
                <h4>Navigation</h4>
                <ul>
                  <li><a href="#hero" onClick={() => scrollToSection('hero')}>Accueil</a></li>
                  <li><a href="#about" onClick={() => scrollToSection('about')}>À propos</a></li>
                  <li><a href="#features" onClick={() => scrollToSection('features')}>Services</a></li>
                  <li><a href="#matches" onClick={() => scrollToSection('matches')}>Matchs</a></li>
                  <li><a href="#contact" onClick={() => scrollToSection('contact')}>Contact</a></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Compte</h4>
                <ul>
                  <li><Link to="/login">Connexion</Link></li>
                  <li><Link to="/signup">Inscription</Link></li>
                  <li><Link to="/profile">Mon profil</Link></li>
                  <li><Link to="/tickets">Mes tickets</Link></li>
                </ul>
              </div>
              
              <div className="footer-column">
                <h4>Légal</h4>
                <ul>
                  <li><Link to="/terms">Conditions d'utilisation</Link></li>
                  <li><Link to="/privacy">Politique de confidentialité</Link></li>
                  <li><Link to="/refund">Politique de remboursement</Link></li>
                  <li><Link to="/faq">FAQ</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} Revente Tickets CAN 2025. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;