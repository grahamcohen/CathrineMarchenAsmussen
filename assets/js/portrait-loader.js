/**
 * Portrait Page Content Loader - Supports Multiple Portraits
 */

(function() {
    'use strict';

    function getCurrentLanguage() {
        return window.getCurrentLanguage ? window.getCurrentLanguage() : 'en';
    }

    async function loadPortraitContent() {
        try {
            const sheetsData = await window.fetchCathrineSheets();
            const portraitData = sheetsData.portrait;
            
            if (!portraitData || !Array.isArray(portraitData) || portraitData.length === 0) {
                console.error('No portrait data found');
                return;
            }

            console.log('Portrait data loaded:', portraitData);

            const currentLang = getCurrentLanguage();
            
            // Get description from first row only
            const firstRow = portraitData[0];
            const sharedDescription = currentLang === 'da' && firstRow.description_da ? firstRow.description_da : firstRow.description;
            
            // Process all portrait videos (just year, duration, vimeoId)
            const portraits = portraitData.map(data => {
                return {
                    year: data.year,
                    duration: data.duration,
                    vimeoId: data.vimeoId
                };
            });

            updatePortraitPage(portraits, sharedDescription);
        } catch (error) {
            console.error('Error loading portrait content:', error);
        }
    }

    function updatePortraitPage(portraits, description) {
        // Render all portrait videos
        const videosContainer = document.getElementById('portrait-videos-container');
        if (videosContainer && portraits.length > 0) {
            videosContainer.innerHTML = '';
            
            portraits.forEach((portrait, index) => {
                const videoSection = document.createElement('div');
                videoSection.className = 'portrait-video-section';
                if (index > 0) {
                    videoSection.style.marginTop = '4rem';
                }

                videoSection.innerHTML = `
                    <div class="film-player">
                        <div class="video-wrapper video-wrapper-large">
                            <iframe src="https://player.vimeo.com/video/${portrait.vimeoId}" 
                                    frameborder="0" 
                                    allow="autoplay; fullscreen; picture-in-picture" 
                                    allowfullscreen>
                            </iframe>
                        </div>
                    </div>
                    <div class="film-info-section">
                        <p class="film-meta">${portrait.year} · ${portrait.duration}</p>
                    </div>
                `;

                videosContainer.appendChild(videoSection);
            });
        }

        // Display description from first portrait at the bottom (below all videos)
        const descriptionEl = document.getElementById('portrait-description');
        if (descriptionEl && description) {
            const lines = description.split('\n').filter(l => l.trim());
            descriptionEl.innerHTML = lines.map(line => `<p>${line}</p>`).join('');
        }

        console.log('Portrait page updated successfully');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadPortraitContent);
    } else {
        loadPortraitContent();
    }

})();
