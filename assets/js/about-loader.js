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
        let currentArray = null;

        yaml.split('\n').forEach(line => {
            if (line.match(/^(\w+):\s*\|/)) {
                // Save previous multiline field if exists
                if (isMultiline && currentKey) {
                    data[currentKey] = currentValue;
                }
                // Save previous array if exists
                if (currentArray) {
                    data[currentKey] = currentArray;
                    currentArray = null;
                }
                // Start of new multiline field
                const key = line.match(/^(\w+):/)[1];
                currentKey = key;
                currentValue = '';
                isMultiline = true;
            } else if (line.match(/^(\w+):\s*$/)) {
                // Save previous fields
                if (isMultiline && currentKey) {
                    data[currentKey] = currentValue;
                    isMultiline = false;
                }
                if (currentArray) {
                    data[currentKey] = currentArray;
                }
                // Start of array
                const key = line.match(/^(\w+):/)[1];
                currentKey = key;
                currentArray = [];
            } else if (line.match(/^  - "(.*)"/)) {
                // Array item
                const itemMatch = line.match(/^  - "(.*)"/);
                if (currentArray) {
                    currentArray.push(itemMatch[1]);
                }
            } else if (line.match(/^(\w+):\s*"(.*)"/)) {
                // Save previous fields
                if (isMultiline && currentKey) {
                    data[currentKey] = currentValue;
                    isMultiline = false;
                }
                if (currentArray) {
                    data[currentKey] = currentArray;
                    currentArray = null;
                }
                // Simple quoted string
                const match = line.match(/^(\w+):\s*"(.*)"/);
                data[match[1]] = match[2];
            } else if (line.match(/^(\w+):\s*(.*)/)) {
                // Save previous fields
                if (isMultiline && currentKey) {
                    data[currentKey] = currentValue;
                    isMultiline = false;
                }
                if (currentArray) {
                    data[currentKey] = currentArray;
                    currentArray = null;
                }
                // Simple unquoted value
                const match = line.match(/^(\w+):\s*(.*)/);
                if (!match[2].startsWith('[')) {
                    data[match[1]] = match[2];
                }
            } else if (isMultiline) {
                // Continuation of multiline field - include ALL lines (even empty ones)
                if (line.startsWith('  ')) {
                    currentValue += (currentValue ? '\n' : '') + line.substring(2);
                } else if (line.trim() === '') {
                    // Empty line within multiline - preserve it
                    currentValue += '\n';
                }
            }
        });

        // Save last field
        if (isMultiline && currentKey) {
            data[currentKey] = currentValue;
        }
        if (currentArray) {
            data[currentKey] = currentArray;
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
                if (data.acknowledgements_da) data.acknowledgements = data.acknowledgements_da;
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

        // Update acknowledgements
        const acknowledgementsEl = document.querySelector('.about-acknowledgements ul');
        if (acknowledgementsEl && data.acknowledgements && Array.isArray(data.acknowledgements)) {
            acknowledgementsEl.innerHTML = data.acknowledgements.map(ack =>
                `<li>${ack}</li>`
            ).join('');
        }

        // Update section headings
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
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadAboutContent);
    } else {
        loadAboutContent();
    }

})();
