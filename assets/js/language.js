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
        // Reload the page to apply the new language
        location.reload();
    }

    // Update UI based on current language
    function updateLanguageUI() {
        const currentLang = getCurrentLanguage();

        // Update language switcher to show both languages with current one highlighted
        const languageSwitcher = document.querySelector('.language-switcher');
        if (languageSwitcher) {
            if (currentLang === 'en') {
                languageSwitcher.innerHTML = `<span class="current-lang">EN</span> <span class="lang-divider">|</span> <a href="#" class="lang-link" data-lang="da">DA</a>`;
            } else {
                languageSwitcher.innerHTML = `<a href="#" class="lang-link" data-lang="en">EN</a> <span class="lang-divider">|</span> <span class="current-lang">DA</span>`;
            }
        }

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
                const href = link.getAttribute('href');
                if (href && href.includes('filmography.html')) {
                    link.textContent = navTexts[currentLang].filmography;
                } else if (href && href.includes('index.html')) {
                    link.textContent = navTexts[currentLang].filmography;
                } else if (href && href.includes('portrait.html')) {
                    link.textContent = navTexts[currentLang].portrait;
                } else if (href && href.includes('about.html')) {
                    link.textContent = navTexts[currentLang].about;
                }
            });
        }
    }

    // Initialize language switcher
    function init() {
        // Set up click handler for language switching
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('lang-link')) {
                e.preventDefault();
                const newLang = e.target.getAttribute('data-lang');
                if (newLang) {
                    setLanguage(newLang);
                }
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
