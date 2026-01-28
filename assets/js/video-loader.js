/**
 * Dynamic Video Loader - Google Sheets Version
 */

(function() {
    'use strict';

    function getBasePath() {
        const path = window.location.pathname;
        if (path.includes('/CathrineMarchenAsmussen/')) {
            return '/CathrineMarchenAsmussen/';
        }
        return '/';
    }

    const BASE_PATH = getBasePath();

    function createSlug(title) {
        return title.toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/--+/g, '-');
    }

    function getVimeoId(url) {
        if (!url) return null;
        const match = url.match(/vimeo\.com\/(\d+)/);
        return match ? match[1] : null;
    }

    async function loadAllVideos() {
        const data = await window.fetchCathrineSheets();
        if (!data || !data.films) {
            console.error('No films data found');
            return [];
        }

        const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
        
        const videos = data.films.map(film => {
            const video = { ...film };
            
            if (currentLang === 'da') {
                if (video.title_da) video.title = video.title_da;
                if (video.subtitle_da) video.subtitle = video.subtitle_da;
                if (video.description_da) video.description = video.description_da;
                if (video.faith_da) video.faith_text = video.faith_da;
                if (video.award_da) video.awards = video.award_da;
            } else {
                if (video.faith_icon) video.faith_text = video.faith_icon;
                if (video.award) video.awards = video.award;
            }

            const iconPath = video.faith;
            video.faith_icon = iconPath;
            video.faith = video.faith_text;

            video.filmstriben = [];
            if (video.filmstriben_url_1) video.filmstriben.push(video.filmstriben_url_1);
            if (video.filmstriben_url_2) video.filmstriben.push(video.filmstriben_url_2);
            if (video.filmstriben_url_3) video.filmstriben.push(video.filmstriben_url_3);

            video.slug = createSlug(video.title);
            video.vimeo_id = getVimeoId(video.vimeo_url);
            
            return video;
        });

        videos.sort((a, b) => {
            const orderA = parseInt(a.order) || 999;
            const orderB = parseInt(b.order) || 999;
            return orderA - orderB;
        });

        console.log(`Loaded ${videos.length} videos`);
        return videos;
    }

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
            link.href = `film.html?id=${video.order}&slug=${video.slug}`;
            link.className = 'film-card-link';

            const img = document.createElement('img');
            img.src = video.thumbnail;
            img.alt = video.title;
            img.className = 'film-thumbnail';
            img.onerror = function() {
                console.error('Failed to load image:', video.thumbnail);
                this.src = 'assets/images/.gitkeep';
            };

            link.appendChild(img);
            card.appendChild(link);

            const titleElement = document.createElement('h3');
            titleElement.className = 'film-card-title';
            titleElement.textContent = video.title;

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

        const currentUrl = new URL(window.location);
        if (currentUrl.searchParams.get('id') != video.order || currentUrl.searchParams.get('slug') !== video.slug) {
            currentUrl.searchParams.set('id', video.order);
            currentUrl.searchParams.set('slug', video.slug);
            window.history.replaceState({}, '', currentUrl);
        }

        document.title = `${video.title} - Cathrine Marchen Asmussen`;

        const detailContainer = document.getElementById('film-detail');
        if (!detailContainer) {
            console.error('film-detail element not found');
            return;
        }

        const currentLang = window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
        const watchOnText = currentLang === 'da' ? 'Se på Filmstriben' : 'Watch on Filmstriben';
        
        let filmstribenHTML = '';
        if (video.filmstriben && video.filmstriben.length > 0) {
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

        let faithHTML = '';
        if (video.faith_icon && video.faith) {
            faithHTML = `
                <div class="film-faith-icon">
                    <img src="${video.faith_icon}" alt="${video.faith}" class="faith-icon-large">
                </div>
            `;
        }

        function convertMarkdown(text) {
            if (!text) return '';
            return text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        }

        let seriesInfo = '';
        const isMyFaithSeries = video.description && (video.description.includes('MY FAITH') || video.description.includes('MIN TRO'));

        if (isMyFaithSeries) {
            const descLines = video.description.split('\n').filter(line => line.trim());
            const seriesLines = descLines.filter(line => {
                const lower = line.toLowerCase();
                return (
                    line.includes('MY FAITH') || line.includes('MIN TRO') ||
                    line.includes('anthology series') || line.includes('antologiserien') ||
                    line.includes('ten independent films') || line.includes('ti selvstændige') ||
                    line.includes('all ages') || line.includes('alle aldre') ||
                    line.includes('is a Buddhist') || line.includes('is a Jehovah Witness') ||
                    line.includes('is a Pentecostal Christian') || line.includes('is a Witch') ||
                    line.includes('is a Hindu') || line.includes('is a Sikh') ||
                    line.includes('is a Danish Protestant Church Christian') ||
                    line.includes('has faith in Science') || line.includes('is a Jew') ||
                    line.includes('is a Sufi Muslim') ||
                    lower.includes('er buddhist') || lower.includes('er jehovas vidne') ||
                    lower.includes('er pinsekirke') || lower.includes('er heks') ||
                    lower.includes('er hindu') || lower.includes('er sikh') ||
                    lower.includes('er folkekirke') || lower.includes('tror på naturvidenskab') ||
                    lower.includes('er jøde') || lower.includes('er sufi-muslim')
                );
            });

            if (seriesLines.length > 0) {
                const fullText = seriesLines.join(' ');
                let sentence1 = '', sentence2 = '', sentence3 = '';

                if (fullText.includes('MIN TRO')) {
                    const s1Match = fullText.match(/Filmen indgår i antologiserien MIN TRO[^.]*udfordringer\./);
                    const s2Match = fullText.match(/Serien består af ti selvstændige film[^.]*\(7\+\)\./);
                    const s3Match = fullText.match(/(?:^|\s)([\wæøåÆØÅ\s-]+(?:er |tror på |har tro på )[^.]+\.?)\s*$/);
                    sentence1 = s1Match ? s1Match[0].trim() : '';
                    sentence2 = s2Match ? s2Match[0].trim() : '';
                    sentence3 = s3Match ? s3Match[1].trim() : '';
                } else {
                    const s1Match = fullText.match(/The film is part of the anthology series MY FAITH[^.]*challenges\./);
                    const s2Match = fullText.match(/The series consists of ten independent films[^.]*\(7\+\)\./);
                    const s3Match = fullText.match(/(?:^|\s)([\w\s]+(?:is a|has faith in)[^.]+\.?)\s*$/);
                    sentence1 = s1Match ? s1Match[0].trim() : '';
                    sentence2 = s2Match ? s2Match[0].trim() : '';
                    sentence3 = s3Match ? s3Match[1].trim() : '';
                }

                seriesInfo = `
                    <div class="series-info">
                        <div class="series-text">
                            ${sentence1 ? `<p>${convertMarkdown(sentence1)}</p>` : ''}
                            ${sentence2 ? `<p>${convertMarkdown(sentence2)}</p>` : ''}
                            ${sentence3 ? `<p>${convertMarkdown(sentence3)}</p>` : ''}
                        </div>
                    </div>
                `;
            }
        }

        let awardsHTML = '';
        if (video.awards) {
            const awardLines = video.awards.split('\n').filter(line => line.trim());
            awardsHTML = awardLines.map(line => `<p class="film-awards">${convertMarkdown(line)}</p>`).join('');
        }

        const descriptionLines = video.description ? video.description.split('\n').filter(line => {
            const trimmed = line.trim();
            if (!trimmed) return false;
            const lower = trimmed.toLowerCase();
            if (trimmed.includes('MY FAITH') || trimmed.includes('MIN TRO') ||
                trimmed.includes('anthology series') || trimmed.includes('antologiserien') ||
                trimmed.includes('ten independent films') || trimmed.includes('ti selvstændige') ||
                trimmed.includes('all ages') || trimmed.includes('alle aldre') ||
                trimmed.includes('is a Buddhist') || trimmed.includes('is a Jehovah Witness') ||
                trimmed.includes('is a Pentecostal Christian') || trimmed.includes('is a Witch') ||
                trimmed.includes('is a Hindu') || trimmed.includes('is a Sikh') ||
                trimmed.includes('is a Danish Protestant Church Christian') ||
                trimmed.includes('has faith in Science') || trimmed.includes('is a Jew') ||
                trimmed.includes('is a Sufi Muslim') ||
                lower.includes('er buddhist') || lower.includes('er jehovas vidne') ||
                lower.includes('er pinsekirke') || lower.includes('er heks') ||
                lower.includes('er hindu') || lower.includes('er sikh') ||
                lower.includes('er folkekirke') || lower.includes('tror på naturvidenskab') ||
                lower.includes('er jøde') || lower.includes('er sufi-muslim')) {
                return false;
            }
            return true;
        }) : [];
        const descriptionHTML = descriptionLines.map(line => `<p>${convertMarkdown(line)}</p>`).join('');

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
                <a href="filmography.html" class="btn btn-primary">← ${currentLang === 'da' ? 'Tilbage til Dokumentar' : 'Back to Documentary'}</a>
            </div>
        `;

        console.log('Film detail rendered successfully');
    }

    async function init() {
        console.log('Initializing video loader...');
        console.log('Current path:', window.location.pathname);

        const grid = document.getElementById('filmography-grid');
        const detail = document.getElementById('film-detail');

        if (grid) {
            console.log('Found filmography grid');
            const videos = await loadAllVideos();
            renderFilmography(videos);
        }

        if (detail) {
            console.log('Found film detail container');
            await renderFilmDetail();
        }

        console.log('Initialization complete');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    window.videoLoader = {
        loadAllVideos
    };

})();
