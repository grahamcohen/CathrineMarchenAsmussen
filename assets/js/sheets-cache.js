/**
 * Shared Google Sheets Cache Manager
 * Used by all loaders (video, about, portrait)
 */

(function() {
    'use strict';

    const SHEETS_API_URL = 'https://script.google.com/macros/s/AKfycbyYDLIpvGYdJYIjvAPZVvttG376D9kaieeIPSaamNJEpDYve98CQqKmtcYFbRXZ03m9/exec';
    const CACHE_KEY = 'cathrine_sheets_data';
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Get cached data if still valid
    window.getCathrineSheetsCache = function() {
        try {
            const cached = localStorage.getItem(CACHE_KEY);
            if (!cached) return null;
            
            const { data, timestamp } = JSON.parse(cached);
            const now = Date.now();
            
            if (now - timestamp < CACHE_DURATION) {
                console.log('Using cached sheets data');
                return data;
            }
            
            console.log('Cache expired');
            return null;
        } catch (e) {
            console.error('Error reading cache:', e);
            return null;
        }
    };

    // Save data to cache
    window.setCathrineSheetsCache = function(data) {
        try {
            const cacheObject = {
                 data,
                timestamp: Date.now()
            };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cacheObject));
            console.log('Data cached successfully');
        } catch (e) {
            console.error('Error saving cache:', e);
        }
    };

    // Fetch from Google Sheets with automatic caching
    window.fetchCathrineSheets = async function() {
        // Check cache first
        const cached = window.getCathrineSheetsCache();
        if (cached) {
            return cached;
        }

        // Fetch fresh data
        console.log('Fetching fresh data from Google Sheets...');
        const response = await fetch(SHEETS_API_URL);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Data fetched successfully');
        
        // Cache it
        window.setCathrineSheetsCache(data);
        
        return data;
    };

    // Clear all cache
    window.clearCathrineCache = function() {
        localStorage.removeItem(CACHE_KEY);
        console.log('All cache cleared');
    };

})();
