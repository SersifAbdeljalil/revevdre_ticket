// src/components/admin/MatchManagement/AddMatch.js
import React, { useState, useEffect } from 'react';
import { FaTimes, FaCalendarAlt, FaMapMarkerAlt, FaUsers } from 'react-icons/fa';
import { addMatch, updateMatch } from '../../../api/adminAPI';
import '../AdminDashboard.css';

const AddMatch = ({ match, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    date: '',
    lieu: '',
    equipe1: '',
    equipe2: '',
    capacite: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  
  // Si on est en mode édition, pré-remplir le formulaire
  useEffect(() => {
    if (match) {
      const localDate = new Date(match.date);
      // Format YYYY-MM-DDThh:mm pour l'input datetime-local
      const formattedDate = localDate.toISOString().slice(0, 16);
      
      setFormData({
        date: formattedDate,
        lieu: match.lieu || '',
        equipe1: match.equipe1 || '',
        equipe2: match.equipe2 || '',
        capacite: match.capacite || ''
      });
    }
  }, [match]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Supprimer l'erreur si l'utilisateur corrige le champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.date) newErrors.date = "La date est requise";
    if (!formData.lieu) newErrors.lieu = "Le lieu est requis";
    if (!formData.equipe1) newErrors.equipe1 = "L'équipe 1 est requise";
    if (!formData.equipe2) newErrors.equipe2 = "L'équipe 2 est requise";
    if (formData.equipe1 === formData.equipe2) {
      newErrors.equipe1 = "Les équipes doivent être différentes";
      newErrors.equipe2 = "Les équipes doivent être différentes";
    }
    if (formData.capacite && (isNaN(formData.capacite) || parseInt(formData.capacite) <= 0)) {
      newErrors.capacite = "La capacité doit être un nombre positif";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      setLoading(true);
      
      if (match) {
        // Mode édition
        await updateMatch(match.id, formData);
      } else {
        // Mode ajout
        await addMatch(formData);
      }
      
      onSave();
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du match:', err);
      setErrors(prev => ({
        ...prev,
        form: err.message || 'Une erreur est survenue lors de l\'enregistrement du match'
      }));
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header" style={{ backgroundColor: '#00FF87', color: '#333' }}>
          <h2>{match ? 'Modifier le match' : 'Ajouter un match'}</h2>
          <button className="modal-close" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {errors.form && (
              <div className="error-alert" style={{ marginBottom: '15px' }}>
                {errors.form}
              </div>
            )}
            
            <div className="form-group">
              <label htmlFor="date">
                <FaCalendarAlt style={{ marginRight: '8px' }} />
                Date et heure du match
              </label>
              <input
                type="datetime-local"
                id="date"
                name="date"
                className={`form-control ${errors.date ? 'is-invalid' : ''}`}
                value={formData.date}
                onChange={handleChange}
              />
              {errors.date && <div className="error-message">{errors.date}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="lieu">
                <FaMapMarkerAlt style={{ marginRight: '8px' }} />
                Lieu / Stade
              </label>
              <input
                type="text"
                id="lieu"
                name="lieu"
                className={`form-control ${errors.lieu ? 'is-invalid' : ''}`}
                value={formData.lieu}
                onChange={handleChange}
                placeholder="Ex: Stade d'Ebimpé, Abidjan"
              />
              {errors.lieu && <div className="error-message">{errors.lieu}</div>}
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="equipe1">Équipe 1</label>
                <input
                  type="text"
                  id="equipe1"
                  name="equipe1"
                  className={`form-control ${errors.equipe1 ? 'is-invalid' : ''}`}
                  value={formData.equipe1}
                  onChange={handleChange}
                  placeholder="Ex: Côte d'Ivoire"
                />
                {errors.equipe1 && <div className="error-message">{errors.equipe1}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="equipe2">Équipe 2</label>
                <input
                  type="text"
                  id="equipe2"
                  name="equipe2"
                  className={`form-control ${errors.equipe2 ? 'is-invalid' : ''}`}
                  value={formData.equipe2}
                  onChange={handleChange}
                  placeholder="Ex: Nigéria"
                />
                {errors.equipe2 && <div className="error-message">{errors.equipe2}</div>}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="capacite">
                <FaUsers style={{ marginRight: '8px' }} />
                Capacité (nombre de places)
              </label>
              <input
                type="number"
                id="capacite"
                name="capacite"
                className={`form-control ${errors.capacite ? 'is-invalid' : ''}`}
                value={formData.capacite}
                onChange={handleChange}
                placeholder="Ex: 60000"
              />
              {errors.capacite && <div className="error-message">{errors.capacite}</div>}
              <small className="form-text text-muted">
                Laissez vide si la capacité n'est pas limitée.
              </small>
            </div>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-accent"
              onClick={onClose}
            >
              Annuler
            </button>
            
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={loading}
            >
              {loading 
                ? 'Enregistrement...' 
                : match ? 'Mettre à jour' : 'Ajouter le match'
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMatch;