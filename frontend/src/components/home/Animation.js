// src/components/home/Animation.js
import { useEffect } from 'react';

/**
 * Hook pour observer les éléments et déclencher les animations au scroll
 */
export const useScrollAnimation = () => {
  useEffect(() => {
    // Définir les options pour l'observation
    const options = {
      root: null, // viewport
      rootMargin: '0px',
      threshold: 0.15, // élément visible à 15%
    };

    // Créer l'observer pour les animations au scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate');
          // Arrêter d'observer une fois l'animation déclenchée
          observer.unobserve(entry.target);
        }
      });
    }, options);

    // Sélectionner tous les éléments à animer
    const sections = [
      '.section-header',
      '.feature-card',
      '.match-card',
      '.about-text',
      '.about-image',
      '.contact-info',
      '.contact-form',
      '.fade-in'
    ];

    // Observer chaque élément
    sections.forEach((section) => {
      const elements = document.querySelectorAll(section);
      elements.forEach((el) => {
        observer.observe(el);
      });
    });

    // Nettoyer l'observer lors du démontage du composant
    return () => {
      sections.forEach((section) => {
        const elements = document.querySelectorAll(section);
        elements.forEach((el) => {
          observer.unobserve(el);
        });
      });
    };
  }, []);
};

/**
 * Animation pour le défilement parallaxe
 */
export const useParallaxEffect = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      // Éléments avec effet parallaxe
      const parallaxElements = document.querySelectorAll('.parallax');
      
      parallaxElements.forEach((element) => {
        const speed = element.dataset.speed || 0.5;
        const offset = scrollTop * speed;
        element.style.transform = `translateY(${offset}px)`;
      });
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
};

/**
 * Animation pour les nombres qui s'incrémentent
 */
export const useCounterAnimation = () => {
  useEffect(() => {
    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5,
    };

    const animateValue = (element, start, end, duration) => {
      let startTimestamp = null;
      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);
        const value = Math.floor(progress * (end - start) + start);
        element.textContent = value;
        if (progress < 1) {
          window.requestAnimationFrame(step);
        }
      };
      window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const counterElements = entry.target.querySelectorAll('.stat-number');
          counterElements.forEach((counter) => {
            const target = parseInt(counter.textContent, 10);
            animateValue(counter, 0, target, 1500);
          });
          observer.unobserve(entry.target);
        }
      });
    }, options);

    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
      observer.observe(statsSection);
    }

    return () => {
      if (statsSection) {
        observer.unobserve(statsSection);
      }
    };
  }, []);
};

/**
 * Hook pour initialiser toutes les animations
 */
export const useInitAnimations = () => {
  useScrollAnimation();
  useParallaxEffect();
  useCounterAnimation();
};

export default useInitAnimations;