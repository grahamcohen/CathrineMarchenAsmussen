/**
 * About Page Content Loader - Uses Shared Cache
 */

(function() {
    'use strict';

    function getCurrentLanguage() {
        return window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    }

    async function loadAboutContent() {
        try {
            const sheetsData = await window.fetchCathrineSheets();
            const data = sheetsData.about;
            
            if (!data) {
                console.error('No about data found');
                return;
            }

            const currentLang = getCurrentLanguage();
            if (currentLang === 'da') {
                if (data.profession_da) data.profession = data.profession_da;
                if (data.bio_da) data.bio = data.bio_da;
                
                const acknowledgements_da = [];
                for (let i = 1; i <= 10; i++) {
                    const ack = data[`acknowledgement_${i}_da`];
                    if (ack && ack.trim()) acknowledgements_da.push(ack);
                }
                if (acknowledgements_da.length > 0) {
                    data.acknowledgements = acknowledgements_da;
                }
            } else {
                const acknowledgements = [];
                for (let i = 1; i <= 10; i++) {
                    const ack = data[`acknowledgement_${i}`];
                    if (ack && ack.trim()) acknowledgements.push(ack);
                }
                data.acknowledgements = acknowledgements;
            }

            updateAboutPage(data, currentLang);
        } catch (error) {
            console.error('Error loading about content:', error);
        }
    }

    function updateAboutPage(data, lang) {
        const professionEl = document.querySelector('.about-intro .subtitle');
        if (professionEl && data.profession) {
            professionEl.textContent = data.profession;
        }

        const bioEl = document.querySelector('.about-bio');
        if (bioEl && data.bio) {
            const paragraphs = data.bio.split('\n\n');
            bioEl.innerHTML = paragraphs.map(p => {
                const trimmed = p.trim();
                if (!trimmed) return '';
                return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            }).filter(p => p).join('');
        }

        const acknowledgementsEl = document.querySelector('.about-acknowledgements ul');
        if (acknowledgementsEl && data.acknowledgements && Array.isArray(data.acknowledgements)) {
            acknowledgementsEl.innerHTML = data.acknowledgements.map(ack =>
                `<li>${ack}</li>`
            ).join('');
        }

        const acknowledgementsHeading = {
            en: 'Acknowledgements',
            da: 'Udmærkelser'
        };
        const moreInfo = {
            en: 'More Information',
            da: 'Mere information'
        };

        const acknowledgementHeading = document.querySelector('.about-acknowledgements h3');
        if (acknowledgementHeading) {
            acknowledgementHeading.textContent = acknowledgementsHeading[lang];
        }

        const linksHeading = document.querySelector('.about-links h3');
        if (linksHeading) {
            linksHeading.textContent = moreInfo[lang];
        }

        console.log('About page updated successfully');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAboutContent);
    } else {
        loadAboutContent();
    }

})();
