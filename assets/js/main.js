/**
 * Main JavaScript for Cathrine Marchen Asmussen website
 */

(function() {
    'use strict';

    // Mobile Menu Toggle
    function initMobileMenu() {
        const menuToggle = document.querySelector('.mobile-menu-toggle');
        const mainNav = document.querySelector('.main-nav');

        if (!menuToggle || !mainNav) return;

        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            mainNav.classList.toggle('active');

            // Prevent body scroll when menu is open
            if (mainNav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mainNav.contains(e.target) && !menuToggle.contains(e.target)) {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });

        // Close menu when clicking a link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                menuToggle.classList.remove('active');
                mainNav.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    // Contact Form Handler
    function initContactForm() {
        const form = document.getElementById('contactForm');
        const formMessage = document.getElementById('formMessage');

        if (!form) return;

        form.addEventListener('submit', function(e) {
            e.preventDefault();

            // Get form data
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Create mailto link (since this is a static site)
            const mailtoLink = `mailto:mail@cathrinemarchenasmussen.dk?subject=${encodeURIComponent(formData.subject)}&body=${encodeURIComponent(
                `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
            )}`;

            // Open mail client
            window.location.href = mailtoLink;

            // Show success message
            if (formMessage) {
                formMessage.textContent = 'Opening your email client...';
                formMessage.className = 'form-message success';
                formMessage.style.display = 'block';

                // Reset form
                setTimeout(() => {
                    form.reset();
                    formMessage.style.display = 'none';
                }, 3000);
            }
        });
    }

    // Lazy Load Vimeo Videos (Optional Enhancement)
    function initLazyVideos() {
        const videoWrappers = document.querySelectorAll('.video-wrapper');

        if ('IntersectionObserver' in window) {
            const videoObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const iframe = entry.target.querySelector('iframe');
                        if (iframe && iframe.dataset.src) {
                            iframe.src = iframe.dataset.src;
                            videoObserver.unobserve(entry.target);
                        }
                    }
                });
            }, {
                rootMargin: '50px'
            });

            videoWrappers.forEach(wrapper => {
                videoObserver.observe(wrapper);
            });
        }
    }

    // Smooth Scroll for anchor links
    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;

                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Set active navigation item based on current page
    function setActiveNav() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.main-nav a');

        navLinks.forEach(link => {
            const linkPath = new URL(link.href).pathname;
            if (currentPath === linkPath) {
                link.classList.add('active');
            }
        });
    }

    // Initialize all functions when DOM is ready
    function init() {
        initMobileMenu();
        initContactForm();
        initSmoothScroll();
        setActiveNav();
        // initLazyVideos(); // Uncomment if you want lazy loading
    }

    // Run init when DOM is fully loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();