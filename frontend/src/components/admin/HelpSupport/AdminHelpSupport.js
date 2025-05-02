// src/components/admin/HelpSupport/AdminHelpSupport.js
import React, { useState } from 'react';
import { 
  FaQuestionCircle, 
  FaBook, 
  FaFileAlt, 
  FaHeadset, 
  FaEnvelope, 
  FaChevronDown, 
  FaChevronUp,
  FaTicketAlt,
  FaUsers,
  FaUserShield,
  FaCalendarAlt,
  FaChartBar,
  FaBell
} from 'react-icons/fa';
import Header from '../Header';
import Sidebar from '../Sidebar';
import './AdminHelpSupport.css';

const AdminHelpSupport = () => {
  // État pour gérer les sections FAQ ouvertes
  const [openSection, setOpenSection] = useState(null);
  
  // Fonction pour gérer l'ouverture/fermeture des sections FAQ
  const toggleSection = (sectionId) => {
    if (openSection === sectionId) {
      setOpenSection(null);
    } else {
      setOpenSection(sectionId);
    }
  };
  
  // Données FAQ
  const faqSections = [
    {
      id: 'general',
      title: 'Questions générales',
      icon: <FaQuestionCircle />,
      questions: [
        {
          question: "Comment naviguer dans l'interface d'administration ?",
          answer: "L'interface d'administration est organisée avec une barre latérale à gauche qui vous permet d'accéder à différentes sections : Tableau de bord, Utilisateurs, Matchs, Tickets, Notifications et Aide & Support. Cliquez simplement sur l'icône correspondante pour accéder à la section souhaitée."
        },
        {
          question: "Comment me déconnecter de l'interface d'administration ?",
          answer: "Pour vous déconnecter, cliquez sur le bouton 'Déconnexion' situé en bas de la barre latérale gauche. Vous serez alors redirigé vers la page de connexion."
        },
        {
          question: "Comment revenir au site principal depuis l'interface d'administration ?",
          answer: "Pour revenir au site principal, cliquez sur le lien 'Site principal' dans la section PRINCIPAL de la barre latérale gauche."
        }
      ]
    },
    {
      id: 'users',
      title: 'Gestion des utilisateurs',
      icon: <FaUsers />,
      questions: [
        {
          question: "Comment bloquer un utilisateur ?",
          answer: "Pour bloquer un utilisateur, accédez à la section 'Utilisateurs', trouvez l'utilisateur concerné dans la liste, puis cliquez sur le bouton 'Bloquer' dans la colonne 'Actions'. Vous pouvez également ouvrir les détails de l'utilisateur en cliquant sur 'Détails', puis utiliser le bouton 'Bloquer' dans le modal qui s'affiche."
        },
        {
          question: "Comment voir les achats d'un utilisateur ?",
          answer: "Pour voir les achats d'un utilisateur, accédez à la section 'Utilisateurs', trouvez l'utilisateur concerné dans la liste, puis cliquez sur le bouton 'Détails'. Dans le modal qui s'affiche, vous trouverez la section 'Historique d'achats' qui liste tous les tickets achetés par cet utilisateur."
        },
        {
          question: "Comment rechercher un utilisateur spécifique ?",
          answer: "Pour rechercher un utilisateur, utilisez la barre de recherche en haut de la page 'Utilisateurs'. Vous pouvez rechercher par nom ou par email."
        }
      ]
    },
    {
      id: 'matches',
      title: 'Gestion des matchs',
      icon: <FaCalendarAlt />,
      questions: [
        {
          question: "Comment ajouter un nouveau match ?",
          answer: "Pour ajouter un nouveau match, accédez à la section 'Matchs', puis cliquez sur le bouton 'Ajouter un match'. Remplissez le formulaire avec les informations du match (équipes, date, lieu) et validez."
        },
        {
          question: "Comment modifier les informations d'un match ?",
          answer: "Pour modifier un match, accédez à la section 'Matchs', trouvez le match concerné dans la liste, puis cliquez sur le bouton 'Modifier'. Mettez à jour les informations dans le formulaire qui s'affiche et validez vos modifications."
        },
        {
          question: "Pourquoi je ne peux pas supprimer certains matchs ?",
          answer: "Vous ne pouvez pas supprimer un match si des tickets ont déjà été vendus pour celui-ci. Cela garantit l'intégrité des données et évite les problèmes avec les tickets déjà achetés."
        }
      ]
    },
    {
      id: 'tickets',
      title: 'Gestion des tickets',
      icon: <FaTicketAlt />,
      questions: [
        {
          question: "Comment voir les détails d'un ticket ?",
          answer: "Pour voir les détails d'un ticket, accédez à la section 'Tickets', trouvez le ticket concerné dans la liste, puis cliquez sur son numéro ou sur le bouton 'Détails'."
        },
        {
          question: "Comment suivre les ventes de tickets pour un match spécifique ?",
          answer: "Pour suivre les ventes de tickets d'un match, accédez à la section 'Tickets' et utilisez les filtres pour sélectionner le match concerné. Vous pouvez également consulter les statistiques dans le tableau de bord pour une vue d'ensemble."
        },
        {
          question: "Que signifie l'état 'vendu' d'un ticket ?",
          answer: "L'état 'vendu' indique que le ticket a été acheté par un utilisateur et n'est plus disponible à la vente. Vous pouvez voir qui a acheté ce ticket dans les détails du ticket."
        }
      ]
    },
    {
      id: 'notifications',
      title: 'Système de notifications',
      icon: <FaBell />,
      questions: [
        {
          question: "Comment fonctionnent les notifications ?",
          answer: "Le système de notifications vous alerte en temps réel lorsque de nouveaux utilisateurs s'inscrivent ou que de nouveaux tickets sont mis en vente. Le nombre de notifications non lues est indiqué par un badge sur l'icône de notifications dans la barre latérale."
        },
        {
          question: "Comment marquer les notifications comme lues ?",
          answer: "Pour marquer une notification comme lue, cliquez simplement dessus ou utilisez le bouton de marque à droite de la notification. Pour marquer toutes les notifications comme lues, utilisez le bouton 'Tout marquer comme lu' en haut du panneau de notifications."
        },
        {
          question: "Puis-je filtrer les notifications ?",
          answer: "Oui, dans la page complète des notifications, vous pouvez filtrer par type (utilisateur, ticket, système) ou par état (lues/non lues) en utilisant le menu déroulant en haut à droite."
        }
      ]
    }
  ];
  
  return (
    <div className="admin-dashboard">
      <Sidebar />
      <div className="admin-content">
        <Header title="Aide & Support" />
        
        <main className="admin-main help-support-container">
          {/* Bannière d'aide */}
          <div className="help-banner">
            <div className="help-banner-content">
              <h2><FaHeadset style={{ marginRight: '10px' }} /> Centre d'aide et de support</h2>
              <p>Bienvenue dans le centre d'aide de la plateforme d'administration CAN 2025. Vous trouverez ici des réponses à vos questions et des ressources pour vous aider à utiliser le système efficacement.</p>
            </div>
          </div>
          
          {/* Sections d'aide rapide */}
          <div className="quick-help-section">
            <div className="quick-help-card">
              <div className="quick-help-icon">
                <FaBook />
              </div>
              <h3>Documentation</h3>
              <p>Consultez notre documentation complète pour comprendre le fonctionnement de la plateforme.</p>
              <a href="#" className="help-link">Accéder à la documentation</a>
            </div>
            
            <div className="quick-help-card">
              <div className="quick-help-icon">
                <FaFileAlt />
              </div>
              <h3>Guides pratiques</h3>
              <p>Des tutoriels étape par étape pour les tâches courantes d'administration.</p>
              <a href="#" className="help-link">Voir les guides</a>
            </div>
            
            <div className="quick-help-card">
              <div className="quick-help-icon">
                <FaEnvelope />
              </div>
              <h3>Contact support</h3>
              <p>Besoin d'aide ? Contactez notre équipe de support technique.</p>
              <a href="mailto:support@can2025.org" className="help-link">Envoyer un email</a>
            </div>
          </div>
          
          {/* Section FAQ */}
          <div className="faq-section">
            <h2 className="section-title">Questions fréquemment posées</h2>
            
            <div className="faq-accordion">
              {faqSections.map(section => (
                <div key={section.id} className="faq-category">
                  <div 
                    className="faq-category-header"
                    onClick={() => toggleSection(section.id)}
                  >
                    <div className="faq-category-title">
                      <span className="faq-icon">{section.icon}</span>
                      <h3>{section.title}</h3>
                    </div>
                    <span className="faq-toggle-icon">
                      {openSection === section.id ? <FaChevronUp /> : <FaChevronDown />}
                    </span>
                  </div>
                  
                  {openSection === section.id && (
                    <div className="faq-category-content">
                      {section.questions.map((item, index) => (
                        <div key={index} className="faq-item">
                          <h4 className="faq-question">{item.question}</h4>
                          <p className="faq-answer">{item.answer}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Informations de contact */}
          <div className="contact-section">
            <h2 className="section-title">Besoin d'aide supplémentaire ?</h2>
            <p>Si vous ne trouvez pas la réponse à votre question, n'hésitez pas à contacter notre équipe de support :</p>
            
            <div className="contact-methods">
              <div className="contact-method">
                <h4><FaEnvelope style={{ marginRight: '8px' }} /> Email</h4>
                <p><a href="mailto:support@can2025.org">support@can2025.org</a></p>
              </div>
              
              <div className="contact-method">
                <h4><FaHeadset style={{ marginRight: '8px' }} /> Téléphone</h4>
                <p>+212 522 123 456</p>
                <p className="contact-hours">Lun-Ven: 9h-18h (GMT)</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminHelpSupport;