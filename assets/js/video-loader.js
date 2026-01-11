/**
 * Dynamic Video Loader for Cathrine Marchen Asmussen Website
 * Loads video markdown files and renders them dynamically
 */

(function() {
    'use strict';

    // Detect base path for GitHub Pages
    function getBasePath() {
        const path = window.location.pathname;
        // If we're on GitHub Pages (path starts with /repo-name/)
        if (path.includes('/CathrineMarchenAsmussen/')) {
            return '/CathrineMarchenAsmussen/';
        }
        return '/';
    }

    const BASE_PATH = getBasePath();

    // List of all video files
    const VIDEO_FILES = [
        '01-who-am-i.md',
        '02-a-world-without-evil.md',
        '03-ask-for-a-miracle.md',
        '04-the-power-of-blood.md',
        '05-the-world-is-one-united-soul.md',
        '06-a-sikh-is-not-afraid.md',
        '07-faith-hope-and-love.md',
        '08-can-the-dinosaurs-resurrect.md',
        '09-you-just-give-from-your-heart.md',
        '10-the-jewish-violin.md',
        '11-the-boys-camp.md',
        '12-hunting-the-only-one.md',
        '13-naser-and-me.md',
        '14-zezils-world.md',
        '15-a-mothers-tale.md',
        '16-ghetto-princess.md'
    ];

    // Simple YAML frontmatter parser
    function parseFrontmatter(content) {
        const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
        const match = content.match(frontmatterRegex);

        if (!match) {
            console.error('No frontmatter found');
            return null;
        }

        const yaml = match[1];
        const data = {};
        const lines = yaml.split('\n');

        let currentKey = null;
        let currentArray = null;
        let inMultiline = false;
        let multilineContent = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // Skip empty lines
            if (!line.trim()) continue;

            // Check for array items
            if (line.match(/^\s+- /)) {
                const value = line.replace(/^\s+- /, '').trim().replace(/^["']|["']$/g, '');
                if (currentArray) {
                    currentArray.push(value);
                }
                continue;
            }

            // Check for multiline content continuation
            if (inMultiline) {
                if (line.startsWith('  ') && !line.match(/^\s+- /)) {
                    multilineContent.push(line.substring(2));
                    continue;
                } else {
                    // End of multiline
                    data[currentKey] = multilineContent.join('\n').trim();
                    inMultiline = false;
                    multilineContent = [];
                }
            }

            // Check for key-value pairs
            const keyMatch = line.match(/^(\w+):\s*(.*)$/);
            if (keyMatch) {
                const key = keyMatch[1];
                let value = keyMatch[2].trim();

                // Remove quotes
                value = value.replace(/^["']|["']$/g, '');

                if (value === '|') {
                    // Start multiline
                    currentKey = key;
                    inMultiline = true;
                    multilineContent = [];
                } else if (value === '') {
                    // Start array
                    currentArray = [];
                    data[key] = currentArray;
                    currentKey = key;
                } else {
                    // Simple value
                    data[key] = value;
                    currentKey = key;
                    currentArray = null;
                }
            }
        }

        // Handle remaining multiline content
        if (inMultiline && multilineContent.length > 0) {
            data[currentKey] = multilineContent.join('\n').trim();
        }

        return data;
    }

    // Extract Vimeo ID from URL
    function getVimeoId(url) {
        if (!url) return null;
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    // Create slug from title
    function createSlug(title) {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
    }

    // Load a single video file
    async function loadVideo(filename) {
        try {
            console.log('Loading:', filename);
            const videoPath = `${BASE_PATH}content/videos/${filename}`.replace(/\/\//g, '/');
            console.log('Fetching from:', videoPath);
            const response = await fetch(videoPath);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const content = await response.text();
            const data = parseFrontmatter(content);

            if (!data) {
                throw new Error(`Failed to parse frontmatter in ${filename}`);
            }

            // Apply language-specific fields if Danish is selected
            const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
            if (currentLang === 'da') {
                if (data.title_da) data.title = data.title_da;
                if (data.subtitle_da) data.subtitle = data.subtitle_da;
                if (data.description_da) data.description = data.description_da;
                if (data.faith_da) data.faith = data.faith_da;
                if (data.awards_da) data.awards = data.awards_da;
            }

            // Add computed fields
            data.slug = createSlug(data.title);
            data.vimeo_id = getVimeoId(data.vimeo_url);
            data.filename = filename;

            console.log('Loaded video:', data.title);
            return data;
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            return null;
        }
    }

    // Load all videos
    async function loadAllVideos() {
        console.log('Loading all videos...');
        const promises = VIDEO_FILES.map(filename => loadVideo(filename));
        const videos = await Promise.all(promises);
        const validVideos = videos.filter(v => v !== null);

        // Sort by order field
        validVideos.sort((a, b) => {
            const orderA = parseInt(a.order) || 999;
            const orderB = parseInt(b.order) || 999;
            return orderA - orderB;
        });

        console.log(`Loaded ${validVideos.length} videos`);
        return validVideos;
    }

    // Render filmography grid
    function renderFilmography(videos) {
        const grid = document.getElementById('filmography-grid');
        if (!grid) {
            console.error('filmography-grid element not found');
            return;
        }

        if (videos.length === 0) {
            grid.innerHTML = '<div class="loading-message">No videos found</div>';
            return;
        }

        grid.innerHTML = '';

        videos.forEach(video => {
            const card = document.createElement('article');
            card.className = 'film-card';

            const link = document.createElement('a');
            // Use order as primary identifier, slug for SEO
            link.href = `film.html?id=${video.order}&slug=${video.slug}`;
            link.className = 'film-card-link';

            const img = document.createElement('img');
            img.src = video.thumbnail;
            img.alt = video.title;
            img.className = 'film-thumbnail';
            img.onerror = function() {
                console.error('Failed to load image:', video.thumbnail);
                this.src = 'assets/images/.gitkeep'; // Fallback
            };

            link.appendChild(img);
            card.appendChild(link);

            // Add title below image
            const titleElement = document.createElement('h3');
            titleElement.className = 'film-card-title';
            titleElement.textContent = video.title;

            // Add subtitle if present
            if (video.subtitle) {
                const subtitleElement = document.createElement('span');
                subtitleElement.className = 'film-card-subtitle';
                subtitleElement.textContent = video.subtitle;
                titleElement.appendChild(document.createElement('br'));
                titleElement.appendChild(subtitleElement);
            }

            card.appendChild(titleElement);

            grid.appendChild(card);
        });

        console.log(`Rendered ${videos.length} video cards`);
    }

    // Render film detail page
    async function renderFilmDetail() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');
        const slug = params.get('slug');

        console.log('Rendering film detail for id:', id, 'slug:', slug);

        if (!id && !slug) {
            console.error('No id or slug parameter found');
            window.location.href = 'filmography.html';
            return;
        }

        const videos = await loadAllVideos();

        // Try to find by id first (stable across languages), then by slug (backwards compat)
        let video;
        if (id) {
            video = videos.find(v => v.order == id);
        }
        if (!video && slug) {
            video = videos.find(v => v.slug === slug);
        }

        if (!video) {
            console.error('Video not found for id:', id, 'slug:', slug);
            window.location.href = 'filmography.html';
            return;
        }

        // Update URL to include both id and current language's slug (for SEO)
        const currentUrl = new URL(window.location);
        if (currentUrl.searchParams.get('id') != video.order || currentUrl.searchParams.get('slug') !== video.slug) {
            currentUrl.searchParams.set('id', video.order);
            currentUrl.searchParams.set('slug', video.slug);
            window.history.replaceState({}, '', currentUrl);
        }

        // Update page title
        document.title = `${video.title} - Cathrine Marchen Asmussen`;

        // Render film detail
        const detailContainer = document.getElementById('film-detail');
        if (!detailContainer) {
            console.error('film-detail element not found');
            return;
        }

        // Build filmstriben links HTML
        const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
        const watchOnText = currentLang === 'da' ? 'Se på Filmstriben' : 'Watch on Filmstriben';
        let filmstribenHTML = '';
        if (video.filmstriben && Array.isArray(video.filmstriben) && video.filmstriben.length > 0) {
            filmstribenHTML = `
                <div class="film-links-section">
                    ${video.filmstriben.map((link, i) => `
                        <a href="${link}" target="_blank" rel="noopener" class="filmstriben-link">
                            ${watchOnText} ${video.filmstriben.length > 1 ? `(${i + 1})` : ''}
                        </a>
                    `).join('')}
                </div>
            `;
        }

        // Build faith icon HTML
        let faithHTML = '';
        if (video.faith_icon && video.faith) {
            faithHTML = `
                <div class="film-faith-icon">
                    <img src="${video.faith_icon}" alt="${video.faith}" class="faith-icon-large">
                </div>
            `;
        }

        // Convert markdown bold to HTML
        function convertMarkdown(text) {
            return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        }

        // Check if this is part of MY FAITH series and extract series info
        let myFaithHTML = '';
        let seriesInfo = '';
        const isMyFaithSeries = video.description && (video.description.includes('MY FAITH') || video.description.includes('MIN TRO'));

        if (isMyFaithSeries) {
            // Extract series-related lines from description
            const descLines = video.description.split('\n').filter(line => line.trim());
            const seriesLines = descLines.filter(line => {
                const lower = line.toLowerCase();
                return (
                    line.includes('MY FAITH') || line.includes('MIN TRO') ||
                    line.includes('anthology series') || line.includes('antologiserien') ||
                    line.includes('ten independent films') || line.includes('ti selvstændige') ||
                    line.includes('all ages') || line.includes('alle aldre') ||
                    // English patterns
                    line.includes('is a Buddhist') || line.includes('is a Jehovah Witness') ||
                    line.includes('is a Pentecostal Christian') || line.includes('is a Witch') ||
                    line.includes('is a Hindu') || line.includes('is a Sikh') ||
                    line.includes('is a Danish Protestant Church Christian') ||
                    line.includes('has faith in Science') || line.includes('is a Jew') ||
                    line.includes('is a Sufi Muslim') ||
                    // Danish patterns
                    lower.includes('er buddhist') || lower.includes('er jehovas vidne') ||
                    lower.includes('er pinsekirke') || lower.includes('er heks') ||
                    lower.includes('er hinduist') || lower.includes('er sikh') ||
                    lower.includes('er folkekirke') || lower.includes('har tro på videnskab') ||
                    lower.includes('er jøde') || lower.includes('er sufi-muslim')
                );
            });

            if (seriesLines.length > 0) {
                // Combine all series lines into one text block
                const fullText = seriesLines.join(' ');

                let sentence1 = '';
                let sentence2 = '';
                let sentence3 = '';

                // Check if Danish or English
                if (fullText.includes('MIN TRO')) {
                    // Danish patterns
                    const s1Match = fullText.match(/Filmen indgår i antologiserien MIN TRO[^.]*udfordringer\./);
                    const s2Match = fullText.match(/Serien består af ti selvstændige film[^.]*\(7\+\)\./);
                    // Match character religion - Danish pattern
                    const s3Match = fullText.match(/(?:^|\s)([\wæøåÆØÅ\s-]+(?:er |har tro på )[^.]+\.)\s*$/);

                    sentence1 = s1Match ? s1Match[0].trim().replace(/\.$/, '') : '';
                    sentence2 = s2Match ? s2Match[0].trim().replace(/\.$/, '') : '';
                    sentence3 = s3Match ? s3Match[1].trim().replace(/\.$/, '') : '';
                } else {
                    // English patterns
                    const s1Match = fullText.match(/The film is part of the anthology series MY FAITH[^.]*challenges\./);
                    const s2Match = fullText.match(/The series consists of ten independent films[^.]*\(7\+\)\./);
                    // Match character religion - English pattern
                    const s3Match = fullText.match(/(?:^|\s)([\w\s]+(?:is a|has faith in)[^.]+\.)\s*$/);

                    sentence1 = s1Match ? s1Match[0].trim().replace(/\.$/, '') : '';
                    sentence2 = s2Match ? s2Match[0].trim().replace(/\.$/, '') : '';
                    sentence3 = s3Match ? s3Match[1].trim().replace(/\.$/, '') : '';
                }

                seriesInfo = `
                    <div class="series-info">
                        <img src="assets/images/MinTro.png" alt="MY FAITH series" class="series-logo">
                        <div class="series-text">
                            ${sentence1 ? `<p>${convertMarkdown(sentence1)}</p>` : ''}
                            ${sentence2 ? `<p>${convertMarkdown(sentence2)}</p>` : ''}
                            ${sentence3 ? `<p>${convertMarkdown(sentence3)}</p>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        // Build awards HTML - handle multi-line awards
        let awardsHTML = '';
        if (video.awards) {
            const awardLines = video.awards.split('\n').filter(line => line.trim());
            awardsHTML = awardLines.map(line => `<p class="film-awards">${convertMarkdown(line)}</p>`).join('');
        }

        // Build description HTML (exclude series info lines)
        const descriptionLines = video.description ? video.description.split('\n').filter(line => {
            const trimmed = line.trim();
            if (!trimmed) return false;
            const lower = trimmed.toLowerCase();
            // Exclude series info lines (English and Danish)
            if (trimmed.includes('MY FAITH') || trimmed.includes('MIN TRO') ||
                trimmed.includes('anthology series') || trimmed.includes('antologiserien') ||
                trimmed.includes('ten independent films') || trimmed.includes('ti selvstændige') ||
                trimmed.includes('all ages') || trimmed.includes('alle aldre') ||
                // English patterns
                trimmed.includes('is a Buddhist') || trimmed.includes('is a Jehovah Witness') ||
                trimmed.includes('is a Pentecostal Christian') || trimmed.includes('is a Witch') ||
                trimmed.includes('is a Hindu') || trimmed.includes('is a Sikh') ||
                trimmed.includes('is a Danish Protestant Church Christian') ||
                trimmed.includes('has faith in Science') || trimmed.includes('is a Jew') ||
                trimmed.includes('is a Sufi Muslim') ||
                // Danish patterns
                lower.includes('er buddhist') || lower.includes('er jehovas vidne') ||
                lower.includes('er pinsekirke') || lower.includes('er heks') ||
                lower.includes('er hinduist') || lower.includes('er sikh') ||
                lower.includes('er folkekirke') || lower.includes('har tro på videnskab') ||
                lower.includes('er jøde') || lower.includes('er sufi-muslim')) {
                return false;
            }
            return true;
        }) : [];
        const descriptionHTML = descriptionLines.map(line => `<p>${convertMarkdown(line)}</p>`).join('');

        // Build title HTML with optional subtitle
        let titleHTML = `<h2 class="film-detail-title">${video.title}</h2>`;
        if (video.subtitle) {
            titleHTML = `
                <h2 class="film-detail-title">
                    ${video.title}
                    <span class="film-subtitle">${video.subtitle}</span>
                </h2>
            `;
        }

        detailContainer.innerHTML = `
            <div class="film-player">
                <div class="video-wrapper video-wrapper-large">
                    <iframe src="https://player.vimeo.com/video/${video.vimeo_id}"
                            frameborder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowfullscreen>
                    </iframe>
                </div>
            </div>

            <div class="film-header">
                ${titleHTML}
            </div>

            <div class="film-info-section">
                <p class="film-meta">${video.year} · ${video.duration}</p>
                ${awardsHTML}
                ${faithHTML}
            </div>

            <div class="film-description-full">
                ${descriptionHTML}
            </div>

            ${seriesInfo}
            ${filmstribenHTML}

            <div class="film-navigation">
                <a href="filmography.html" class="btn btn-primary">← ${currentLang === 'da' ? 'Tilbage til Filmografi' : 'Back to Filmography'}</a>
            </div>
        `;

        console.log('Film detail rendered successfully');
    }

    // Initialize based on page
    async function init() {
        console.log('Initializing video loader...');
        console.log('Current path:', window.location.pathname);

        const grid = document.getElementById('filmography-grid');
        const detail = document.getElementById('film-detail');

        if (grid) {
            console.log('Found filmography grid');
            const videos = await loadAllVideos();

            // Show all films on both homepage and filmography page
            console.log('Showing all films');
            renderFilmography(videos);
        }

        if (detail) {
            console.log('Found film detail container');
            await renderFilmDetail();
        }

        console.log('Initialization complete');
    }

    // Run init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for debugging
    window.videoLoader = {
        loadAllVideos,
        loadVideo,
        parseFrontmatter,
        VIDEO_FILES
    };

})();
