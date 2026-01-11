/**
 * About Page Content Loader with Language Support
 * Loads and displays content from content/about.md with Danish translation support
 */

(function() {
    'use strict';

    // Get current language
    function getCurrentLanguage() {
        return window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    }

    // Parse YAML frontmatter from markdown
    function parseFrontmatter(text) {
        const match = text.match(/^---\n([\s\S]*?)\n---/);
        if (!match) return {};

        const yaml = match[1];
        const data = {};

        // Parse simple YAML fields
        let currentKey = null;
        let currentValue = '';
        let isMultiline = false;

        yaml.split('\n').forEach(line => {
            if (line.match(/^(\w+):\s*\|/)) {
                // Start of multiline field
                const key = line.match(/^(\w+):/)[1];
                currentKey = key;
                currentValue = '';
                isMultiline = true;
            } else if (line.match(/^(\w+):\s*"(.*)"/)) {
                // Simple quoted string
                const match = line.match(/^(\w+):\s*"(.*)"/);
                data[match[1]] = match[2];
                isMultiline = false;
            } else if (line.match(/^(\w+):\s*(.*)/)) {
                // Simple unquoted value
                const match = line.match(/^(\w+):\s*(.*)/);
                if (!match[2].startsWith('[')) {
                    data[match[1]] = match[2];
                    isMultiline = false;
                }
            } else if (isMultiline && line.startsWith('  ')) {
                // Continuation of multiline field
                currentValue += (currentValue ? '\n' : '') + line.substring(2);
            } else if (isMultiline && currentKey && !line.startsWith('  ') && !line.match(/^\w+:/)) {
                // End of multiline field
                data[currentKey] = currentValue;
                isMultiline = false;
                currentKey = null;
            }
        });

        // Save last multiline field if any
        if (isMultiline && currentKey) {
            data[currentKey] = currentValue;
        }

        return data;
    }

    // Load about content
    async function loadAboutContent() {
        try {
            const response = await fetch('content/about.md');
            const text = await response.text();
            const data = parseFrontmatter(text);

            // Apply language-specific fields if Danish is selected
            const currentLang = getCurrentLanguage();
            if (currentLang === 'da') {
                if (data.profession_da) data.profession = data.profession_da;
                if (data.bio_da) data.bio = data.bio_da;
            }

            updateAboutPage(data, currentLang);
        } catch (error) {
            console.error('Error loading about content:', error);
        }
    }

    // Update about page with content
    function updateAboutPage(data, lang) {
        // Update profession
        const professionEl = document.querySelector('.about-intro .subtitle');
        if (professionEl && data.profession) {
            professionEl.textContent = data.profession;
        }

        // Update bio - preserve all line breaks and paragraphs
        const bioEl = document.querySelector('.about-bio');
        if (bioEl && data.bio) {
            // Split on double newlines for paragraphs, but preserve single line breaks within paragraphs
            const paragraphs = data.bio.split('\n\n');
            bioEl.innerHTML = paragraphs.map(p => {
                const trimmed = p.trim();
                if (!trimmed) return '';
                // Replace single newlines with <br> tags
                return `<p>${trimmed.replace(/\n/g, '<br>')}</p>`;
            }).filter(p => p).join('');
        }

        // Update section headings
        const acknowledgements = {
            en: 'Acknowledgements',
            da: 'Anerkendelser'
        };
        const moreInfo = {
            en: 'More Information',
            da: 'Mere information'
        };

        const acknowledgementHeading = document.querySelector('.about-acknowledgements h3');
        if (acknowledgementHeading) {
            acknowledgementHeading.textContent = acknowledgements[lang];
        }

        const linksHeading = document.querySelector('.about-links h3');
        if (linksHeading) {
            linksHeading.textContent = moreInfo[lang];
        }
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAboutContent);
    } else {
        loadAboutContent();
    }

})();
