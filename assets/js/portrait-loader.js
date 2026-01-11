/**
 * Portrait Page Content Loader with Language Support
 * Loads and displays content from content/portrait.md with Danish translation support
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

        let currentKey = null;
        let currentValue = '';
        let isMultiline = false;
        let inFeaturedPortrait = false;
        let featuredPortraitData = {};

        yaml.split('\n').forEach(line => {
            // Handle featured_portrait nested object
            if (line.match(/^featured_portrait:/)) {
                inFeaturedPortrait = true;
                return;
            }

            if (inFeaturedPortrait) {
                if (line.match(/^  (\w+):\s*\|/)) {
                    // Start of multiline field in featured_portrait
                    const key = line.match(/^  (\w+):/)[1];
                    currentKey = key;
                    currentValue = '';
                    isMultiline = true;
                } else if (line.match(/^  (\w+):\s*"(.*)"/)) {
                    // Simple quoted string in featured_portrait
                    const match = line.match(/^  (\w+):\s*"(.*)"/);
                    featuredPortraitData[match[1]] = match[2];
                    isMultiline = false;
                } else if (line.match(/^  (\w+):\s*(.*)/)) {
                    // Simple value in featured_portrait
                    const match = line.match(/^  (\w+):\s*(.*)/);
                    featuredPortraitData[match[1]] = match[2];
                    isMultiline = false;
                } else if (isMultiline && line.startsWith('    ')) {
                    // Continuation of multiline in featured_portrait
                    currentValue += (currentValue ? '\n' : '') + line.substring(4);
                } else if (isMultiline && currentKey) {
                    // End of multiline
                    featuredPortraitData[currentKey] = currentValue;
                    isMultiline = false;
                    currentKey = null;
                } else if (!line.startsWith('  ')) {
                    // End of featured_portrait object
                    if (isMultiline && currentKey) {
                        featuredPortraitData[currentKey] = currentValue;
                    }
                    inFeaturedPortrait = false;
                    data.featured_portrait = featuredPortraitData;
                }
            } else {
                // Top-level fields
                if (line.match(/^(\w+):\s*\|/)) {
                    const key = line.match(/^(\w+):/)[1];
                    currentKey = key;
                    currentValue = '';
                    isMultiline = true;
                } else if (line.match(/^(\w+):\s*"(.*)"/)) {
                    const match = line.match(/^(\w+):\s*"(.*)"/);
                    data[match[1]] = match[2];
                    isMultiline = false;
                } else if (line.match(/^(\w+):\s*(.*)/)) {
                    const match = line.match(/^(\w+):\s*(.*)/);
                    if (!match[2].startsWith('[')) {
                        data[match[1]] = match[2];
                        isMultiline = false;
                    }
                } else if (isMultiline && line.startsWith('  ')) {
                    currentValue += (currentValue ? '\n' : '') + line.substring(2);
                } else if (isMultiline && currentKey) {
                    data[currentKey] = currentValue;
                    isMultiline = false;
                    currentKey = null;
                }
            }
        });

        // Save last multiline field
        if (isMultiline && currentKey) {
            if (inFeaturedPortrait) {
                featuredPortraitData[currentKey] = currentValue;
                data.featured_portrait = featuredPortraitData;
            } else {
                data[currentKey] = currentValue;
            }
        } else if (inFeaturedPortrait) {
            data.featured_portrait = featuredPortraitData;
        }

        return data;
    }

    // Load portrait content
    async function loadPortraitContent() {
        try {
            const response = await fetch('content/portrait.md');
            const text = await response.text();
            const data = parseFrontmatter(text);

            // Apply language-specific fields if Danish is selected
            const currentLang = getCurrentLanguage();
            if (currentLang === 'da') {
                if (data.intro_da) data.intro = data.intro_da;
                if (data.featured_portrait) {
                    if (data.featured_portrait.title_da) data.featured_portrait.title = data.featured_portrait.title_da;
                    if (data.featured_portrait.subtitle_da) data.featured_portrait.subtitle = data.featured_portrait.subtitle_da;
                    if (data.featured_portrait.description_da) data.featured_portrait.description = data.featured_portrait.description_da;
                }
            }

            updatePortraitPage(data);
        } catch (error) {
            console.error('Error loading portrait content:', error);
        }
    }

    // Update portrait page with content
    function updatePortraitPage(data) {
        // Update description (shown as intro on portrait page)
        const descriptionEl = document.querySelector('.film-description-full');
        if (descriptionEl && data.featured_portrait && data.featured_portrait.description) {
            descriptionEl.innerHTML = data.featured_portrait.description.split('\n\n').map(p =>
                `<p>${p.replace(/\n/g, '<br>')}</p>`
            ).join('');
        }

        // Update title if needed (though it's currently shown as static text)
        const titleEl = document.querySelector('.film-detail-title');
        if (titleEl && data.featured_portrait && data.featured_portrait.title) {
            titleEl.textContent = data.featured_portrait.title;
        }
    }

    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPortraitContent);
    } else {
        loadPortraitContent();
    }

})();
