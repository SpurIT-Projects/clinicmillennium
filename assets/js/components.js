// Additional JavaScript Components

// Auto Scroll to Top on Page Change
class AutoScrollManager {
    constructor() {
        this.setupAutoScroll();
    }

    setupAutoScroll() {
        // Save scroll position when leaving page
        window.addEventListener('beforeunload', () => {
            sessionStorage.setItem('scrollPosition', window.pageYOffset.toString());
        });

        // Restore scroll position or scroll to top
        window.addEventListener('load', () => {
            // For fresh page loads, scroll to top
            if (performance.navigation.type === performance.navigation.TYPE_NAVIGATE) {
                window.scrollTo(0, 0);
            }
            // For back/forward navigation, restore position
            else if (performance.navigation.type === performance.navigation.TYPE_BACK_FORWARD) {
                const savedPosition = sessionStorage.getItem('scrollPosition');
                if (savedPosition) {
                    window.scrollTo(0, parseInt(savedPosition, 10));
                }
            }
        });

        // Handle internal navigation
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href]');
            if (link && this.isInternalLink(link)) {
                // For anchor links, handle smooth scrolling
                if (link.getAttribute('href').startsWith('#')) {
                    return; // Let smooth scrolling handle this
                }
                // For other internal links, scroll to top
                window.scrollTo(0, 0);
            }
        });
    }

    isInternalLink(link) {
        return link.hostname === window.location.hostname;
    }
}

// Advanced Form Handler
class FormHandler {
    constructor() {
        this.setupAdvancedValidation();
        this.setupFormStorage();
    }

    setupAdvancedValidation() {
        const forms = document.querySelectorAll('form');
        
        forms.forEach(form => {
            // Real-time validation
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', () => this.validateRealTime(input));
            });

            // Form submission
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });
    }

    validateRealTime(input) {
        const value = input.value.trim();
        const type = input.type;

        // Phone number formatting
        if (type === 'tel') {
            const formatted = this.formatPhoneNumber(value);
            if (formatted !== value) {
                input.value = formatted;
            }
        }

        // Name validation
        if (input.name === 'name' || input.placeholder?.includes('имя')) {
            if (value.length > 0 && value.length < 2) {
                this.showValidationMessage(input, 'Минимум 2 символа', 'warning');
            } else if (value.length >= 2) {
                this.showValidationMessage(input, 'Отлично!', 'success');
            }
        }

        // Email validation
        if (type === 'email' && value.length > 0) {
            const isValid = this.validateEmail(value);
            if (isValid) {
                this.showValidationMessage(input, 'Email корректный', 'success');
            } else {
                this.showValidationMessage(input, 'Проверьте формат email', 'warning');
            }
        }
    }

    formatPhoneNumber(phone) {
        // Remove all non-digits
        const digits = phone.replace(/\D/g, '');
        
        // Belarus phone number formatting
        if (digits.startsWith('375')) {
            return digits.replace(/(\d{3})(\d{2})(\d{3})(\d{2})(\d{2})/, '+$1 ($2) $3-$4-$5');
        } else if (digits.startsWith('80')) {
            return digits.replace(/(\d{2})(\d{2})(\d{3})(\d{2})(\d{2})/, '$1 ($2) $3-$4-$5');
        } else if (digits.length === 9) {
            return digits.replace(/(\d{2})(\d{3})(\d{2})(\d{2})/, '($1) $2-$3-$4');
        }
        
        return phone;
    }

    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    showValidationMessage(input, message, type) {
        // Remove existing messages
        const existingMsg = input.parentNode.querySelector('.validation-message');
        if (existingMsg) {
            existingMsg.remove();
        }

        // Create new message
        const msgElement = document.createElement('div');
        msgElement.className = `validation-message ${type}`;
        msgElement.textContent = message;
        msgElement.style.cssText = `
            font-size: 0.75rem;
            margin-top: 0.25rem;
            color: ${type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#ef4444'};
        `;

        input.parentNode.appendChild(msgElement);

        // Auto remove after 3 seconds
        setTimeout(() => {
            if (msgElement.parentNode) {
                msgElement.remove();
            }
        }, 3000);
    }

    handleSubmit(e) {
        e.preventDefault();
        const form = e.target;
        
        // Collect form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Add timestamp and source
        data.timestamp = new Date().toISOString();
        data.source = 'clinic_millennium_website';
        
        // Log for development (in production, send to server)
        console.log('Form submitted:', data);
        
        // Call the main form submission handler
        submitForm(form);
    }

    setupFormStorage() {
        // Auto-save form data to localStorage
        const forms = document.querySelectorAll('form');
        
        forms.forEach((form, formIndex) => {
            const storageKey = `form_data_${formIndex}`;
            
            // Load saved data
            this.loadFormData(form, storageKey);
            
            // Save data on input
            form.addEventListener('input', () => {
                this.saveFormData(form, storageKey);
            });
            
            // Clear saved data on successful submission
            form.addEventListener('formSubmitted', () => {
                localStorage.removeItem(storageKey);
            });
        });
    }

    saveFormData(form, storageKey) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        localStorage.setItem(storageKey, JSON.stringify(data));
    }

    loadFormData(form, storageKey) {
        try {
            const savedData = localStorage.getItem(storageKey);
            if (savedData) {
                const data = JSON.parse(savedData);
                Object.entries(data).forEach(([name, value]) => {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field) {
                        field.value = value;
                    }
                });
            }
        } catch (e) {
            console.warn('Could not load saved form data:', e);
        }
    }
}

// Interactive Statistics Counter
class StatisticsAnimator {
    constructor() {
        this.setupCounters();
    }

    setupCounters() {
        const counters = document.querySelectorAll('.stat-number');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
                    this.animateCounter(entry.target);
                    entry.target.classList.add('counted');
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    }

    animateCounter(element) {
        const text = element.textContent;
        const number = parseInt(text.replace(/\D/g, ''), 10);
        const suffix = text.replace(/[\d\s]/g, '');
        
        if (isNaN(number)) return;

        const duration = 2000;
        const steps = 60;
        const increment = number / steps;
        let current = 0;
        let step = 0;

        const timer = setInterval(() => {
            current += increment;
            step++;
            
            if (step >= steps) {
                current = number;
                clearInterval(timer);
            }
            
            element.textContent = Math.floor(current) + suffix;
        }, duration / steps);
    }
}

// Image Optimization and Lazy Loading
class ImageOptimizer {
    constructor() {
        this.setupLazyLoading();
        this.setupImageErrorHandling();
        this.setupImagePreloading();
    }

    setupLazyLoading() {
        // Intersection Observer for lazy loading
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadImage(entry.target);
                    imageObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px'
        });

        // Observe all images
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            if (img.src && !img.complete) {
                imageObserver.observe(img);
            }
        });
    }

    loadImage(img) {
        // Add loading class
        img.classList.add('loading');
        
        // Create new image to test loading
        const newImg = new Image();
        
        newImg.onload = () => {
            img.classList.remove('loading');
            img.classList.add('loaded');
        };
        
        newImg.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
        };
        
        newImg.src = img.src;
    }

    setupImageErrorHandling() {
        document.addEventListener('error', (e) => {
            if (e.target.tagName === 'IMG') {
                this.handleImageError(e.target);
            }
        }, true);
    }

    handleImageError(img) {
        // Add error class
        img.classList.add('error');
        
        // Set placeholder image or hide
        img.style.display = 'none';
        
        console.warn('Image failed to load:', img.src);
    }

    setupImagePreloading() {
        // Preload critical images
        const criticalImages = [
            'https://clinicmillennium.by/assets/img/about_clinic.webp',
            'https://clinicmillennium.by/img/pluses/9.svg',
            'https://clinicmillennium.by/img/pluses/16.svg',
            'https://clinicmillennium.by/img/pluses/11.svg',
            'https://clinicmillennium.by/img/pluses/12.svg'
        ];

        criticalImages.forEach(src => {
            const img = new Image();
            img.src = src;
        });
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.metrics = {};
        this.setupMonitoring();
    }

    setupMonitoring() {
        // Core Web Vitals
        if ('web-vitals' in window) {
            // This would be imported from web-vitals library
            // getCLS, getFID, getFCP, getLCP, getTTFB
        }

        // Basic performance metrics
        window.addEventListener('load', () => {
            setTimeout(() => this.recordMetrics(), 0);
        });

        // Monitor resource loading
        this.monitorResources();
        
        // Monitor user interactions
        this.monitorInteractions();
    }

    recordMetrics() {
        const navigation = performance.getEntriesByType('navigation')[0];
        
        if (navigation) {
            this.metrics = {
                loadTime: Math.round(navigation.loadEventEnd - navigation.loadEventStart),
                domContentLoaded: Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart),
                firstPaint: this.getFirstPaint(),
                firstContentfulPaint: this.getFirstContentfulPaint(),
                resourceCount: performance.getEntriesByType('resource').length
            };
            
            console.log('Performance Metrics:', this.metrics);
        }
    }

    getFirstPaint() {
        const paint = performance.getEntriesByType('paint').find(p => p.name === 'first-paint');
        return paint ? Math.round(paint.startTime) : null;
    }

    getFirstContentfulPaint() {
        const paint = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint');
        return paint ? Math.round(paint.startTime) : null;
    }

    monitorResources() {
        // Monitor slow resources
        const resources = performance.getEntriesByType('resource');
        resources.forEach(resource => {
            if (resource.duration > 1000) { // Slower than 1s
                console.warn('Slow resource:', resource.name, `${Math.round(resource.duration)}ms`);
            }
        });
    }

    monitorInteractions() {
        // Track form interactions
        document.addEventListener('submit', (e) => {
            console.log('Form submitted:', e.target.className);
        });

        // Track button clicks
        document.addEventListener('click', (e) => {
            if (e.target.matches('button, .btn')) {
                console.log('Button clicked:', e.target.textContent.trim());
            }
        });
    }
}

// Accessibility Enhancements
class AccessibilityEnhancer {
    constructor() {
        this.setupKeyboardNavigation();
        this.setupAriaLabels();
        this.setupFocusManagement();
    }

    setupKeyboardNavigation() {
        // Enable keyboard navigation for custom elements
        const interactiveElements = document.querySelectorAll('.service-card, .doctor-card, .portfolio-item');
        
        interactiveElements.forEach((element, index) => {
            element.setAttribute('tabindex', '0');
            element.setAttribute('role', 'button');
            
            element.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    element.click();
                }
            });
        });
    }

    setupAriaLabels() {
        // Add aria labels to buttons without text
        const iconButtons = document.querySelectorAll('button:not([aria-label])');
        iconButtons.forEach(button => {
            const icon = button.querySelector('i');
            if (icon) {
                button.setAttribute('aria-label', this.getAriaLabel(icon.className));
            }
        });
    }

    getAriaLabel(iconClass) {
        const labels = {
            'fa-phone': 'Позвонить',
            'fa-envelope': 'Написать email',
            'fa-calendar': 'Записаться на прием',
            'fa-arrow-up': 'Вверх страницы',
            'fa-times': 'Закрыть',
            'fa-bars': 'Меню'
        };

        for (const [className, label] of Object.entries(labels)) {
            if (iconClass.includes(className)) {
                return label;
            }
        }
        
        return 'Кнопка';
    }

    setupFocusManagement() {
        // Trap focus in modals
        document.addEventListener('keydown', (e) => {
            const modal = document.querySelector('.modal.show');
            if (modal && e.key === 'Tab') {
                this.trapFocus(e, modal);
            }
        });
    }

    trapFocus(e, container) {
        const focusableElements = container.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }
}

// Initialize all components
document.addEventListener('DOMContentLoaded', () => {
    new AutoScrollManager();
    new FormHandler();
    new StatisticsAnimator();
    new ImageOptimizer();
    new PerformanceMonitor();
    new AccessibilityEnhancer();
});

// Export for potential external use
window.ClinicComponents = {
    AutoScrollManager,
    FormHandler,
    StatisticsAnimator,
    ImageOptimizer,
    PerformanceMonitor,
    AccessibilityEnhancer
};