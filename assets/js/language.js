/**
 * Language Switcher for Cathrine Marchen Asmussen Website
 * Handles EN/DA language switching with localStorage persistence
 */

(function() {
    'use strict';

    // Get current language from localStorage or default to 'en'
    function getCurrentLanguage() {
        return localStorage.getItem('site-language') || 'en';
    }

    // Set language and reload page
    function setLanguage(lang) {
        localStorage.setItem('site-language', lang);
        window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
        location.reload();
    }

    // Update UI based on current language
    function updateLanguageUI() {
        const currentLang = getCurrentLanguage();
        const langLinks = document.querySelectorAll('.lang-link, .current-lang');

        // Update language switcher display
        document.querySelectorAll('.current-lang').forEach(el => {
            el.textContent = currentLang.toUpperCase();
        });

        // Update navigation text
        const navTexts = {
            en: {
                filmography: 'Filmography',
                portrait: 'Portrait',
                about: 'About'
            },
            da: {
                filmography: 'Filmografi',
                portrait: 'Portræt',
                about: 'Om'
            }
        };

        const nav = document.querySelector('.main-nav');
        if (nav) {
            const links = nav.querySelectorAll('a');
            links.forEach(link => {
                if (link.href.includes('filmography.html')) {
                    link.textContent = navTexts[currentLang].filmography;
                } else if (link.href.includes('portrait.html')) {
                    link.textContent = navTexts[currentLang].portrait;
                } else if (link.href.includes('about.html')) {
                    link.textContent = navTexts[currentLang].about;
                }
            });
        }
    }

    // Initialize language switcher
    function init() {
        const currentLang = getCurrentLanguage();

        // Set up click handlers for language links
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('lang-link') || e.target.classList.contains('current-lang')) {
                e.preventDefault();
                const newLang = currentLang === 'en' ? 'da' : 'en';
                setLanguage(newLang);
            }
        });

        // Update UI on page load
        updateLanguageUI();
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose getCurrentLanguage for other scripts
    window.getCurrentLanguage = getCurrentLanguage;

})();
