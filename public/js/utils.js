/**
 * Utility functions for Satyam Gold website
 */
class Utils {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    init() {
        // Create toast container
        this.createToastContainer();
    }

    createToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'toast-container';
            this.toastContainer.className = 'fixed top-20 right-4 z-50 space-y-2';
            document.body.appendChild(this.toastContainer);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        const toastId = 'toast-' + Date.now();
        toast.id = toastId;
        
        // Set toast classes based on type
        let bgClass = 'bg-blue-500';
        let icon = 'fas fa-info-circle';
        
        switch (type) {
            case 'success':
                bgClass = 'bg-green-500';
                icon = 'fas fa-check-circle';
                break;
            case 'error':
                bgClass = 'bg-red-500';
                icon = 'fas fa-exclamation-circle';
                break;
            case 'warning':
                bgClass = 'bg-yellow-500';
                icon = 'fas fa-exclamation-triangle';
                break;
        }
        
        toast.className = `${bgClass} text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-3 min-w-64 max-w-sm transform transition-all duration-300 translate-x-full opacity-0`;
        
        toast.innerHTML = `
            <i class="${icon}"></i>
            <span class="flex-1">${message}</span>
            <button onclick="utils.removeToast('${toastId}')" class="ml-2 hover:bg-black hover:bg-opacity-20 rounded p-1">
                <i class="fas fa-times text-sm"></i>
            </button>
        `;
        
        this.toastContainer.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => {
            toast.classList.remove('translate-x-full', 'opacity-0');
        }, 10);
        
        // Auto remove
        setTimeout(() => {
            this.removeToast(toastId);
        }, duration);
        
        return toastId;
    }

    removeToast(toastId) {
        const toast = document.getElementById(toastId);
        if (toast) {
            toast.classList.add('translate-x-full', 'opacity-0');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    showLoading(message = 'Loading...') {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            const loadingText = spinner.querySelector('p');
            if (loadingText) {
                loadingText.textContent = message;
            }
            spinner.classList.remove('hidden');
        }
    }

    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    }

    formatPrice(price) {
        return `₹${Number(price).toLocaleString('en-IN')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    formatDateTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    validatePhone(phone) {
        const phoneRegex = /^[6-9]\d{9}$/;
        return phoneRegex.test(phone);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }

    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        
        const modalContent = document.createElement('div');
        modalContent.className = 'bg-white rounded-lg max-w-md w-full max-h-96 overflow-y-auto';
        
        modalContent.innerHTML = `
            <div class="flex items-center justify-between p-6 border-b">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button class="modal-close p-1 hover:bg-gray-100 rounded">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="p-6">
                ${content}
            </div>
            ${options.showFooter ? `
                <div class="flex justify-end space-x-3 p-6 border-t">
                    <button class="modal-cancel px-4 py-2 text-gray-600 border rounded hover:bg-gray-50">Cancel</button>
                    <button class="modal-confirm px-4 py-2 bg-primary text-white rounded hover:bg-accent">${options.confirmText || 'Confirm'}</button>
                </div>
            ` : ''}
        `;
        
        modal.appendChild(modalContent);
        
        // Event handlers
        const closeModal = () => {
            document.body.removeChild(modal);
            if (options.onClose) options.onClose();
        };
        
        modal.querySelector('.modal-close').addEventListener('click', closeModal);
        
        if (options.showFooter) {
            modal.querySelector('.modal-cancel').addEventListener('click', closeModal);
            modal.querySelector('.modal-confirm').addEventListener('click', () => {
                if (options.onConfirm) {
                    const result = options.onConfirm();
                    if (result !== false) {
                        closeModal();
                    }
                } else {
                    closeModal();
                }
            });
        }
        
        // Close on backdrop click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal();
            }
        });
        
        document.body.appendChild(modal);
        
        return modal;
    }

    generateId(prefix = 'id') {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Copied to clipboard!', 'success');
            }).catch(() => {
                this.fallbackCopyToClipboard(text);
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Copied to clipboard!', 'success');
        } catch (err) {
            this.showToast('Failed to copy to clipboard', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    sanitizeHtml(str) {
        const temp = document.createElement('div');
        temp.textContent = str;
        return temp.innerHTML;
    }

    truncateText(text, maxLength, suffix = '...') {
        if (text.length <= maxLength) {
            return text;
        }
        return text.substring(0, maxLength - suffix.length) + suffix;
    }

    isElementInViewport(el) {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    smoothScrollTo(element, duration = 1000) {
        const start = window.pageYOffset;
        const target = element.offsetTop;
        const startTime = performance.now();

        function animation(currentTime) {
            const timeElapsed = currentTime - startTime;
            const run = ease(timeElapsed, start, target - start, duration);
            window.scrollTo(0, run);
            
            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        function ease(t, b, c, d) {
            t /= d / 2;
            if (t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }

        requestAnimationFrame(animation);
    }

    getUrlParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    setUrlParameter(name, value) {
        const url = new URL(window.location);
        url.searchParams.set(name, value);
        window.history.pushState({ path: url.href }, '', url.href);
    }

    removeUrlParameter(name) {
        const url = new URL(window.location);
        url.searchParams.delete(name);
        window.history.pushState({ path: url.href }, '', url.href);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    getRandom(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }

    groupBy(array, key) {
        return array.reduce((groups, item) => {
            const group = item[key];
            groups[group] = groups[group] || [];
            groups[group].push(item);
            return groups;
        }, {});
    }

    removeDuplicates(array, key) {
        return array.filter((item, index, self) => 
            index === self.findIndex(t => t[key] === item[key])
        );
    }

    // Authentication helper methods
    requireAuth(callback, message = 'Please login to continue') {
        if (window.auth && window.auth.isLoggedIn()) {
            callback();
        } else {
            this.showToast(message, 'warning');
            if (window.auth && window.auth.login) {
                window.auth.login();
            }
        }
    }

    getCurrentUser() {
        if (window.auth && window.auth.getCurrentUser) {
            return window.auth.getCurrentUser();
        }
        return null;
    }

    isLoggedIn() {
        if (window.auth && window.auth.isLoggedIn) {
            return window.auth.isLoggedIn();
        }
        return false;
    }
}

// Global utility functions
function scrollToSection(sectionId) {
    utils.scrollToSection(sectionId);
}

function openBulkOrderModal() {
    const content = `
        <div class="text-center">
            <h4 class="text-lg font-semibold mb-4">Bulk Order Inquiry</h4>
            <p class="text-gray-600 mb-6">For bulk orders of 50+ items, please contact us directly via WhatsApp for special pricing and faster delivery.</p>
            <div class="space-y-4">
                <a href="https://wa.me/916201530654?text=Hi, I'm interested in bulk ordering from Satyam Gold" 
                   target="_blank" 
                   class="block w-full bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
                    <i class="fab fa-whatsapp mr-2"></i>
                    WhatsApp Us
                </a>
                <a href="tel:+919631816666" 
                   class="block w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors">
                    <i class="fas fa-phone mr-2"></i>
                    Call Us
                </a>
            </div>
        </div>
    `;
    
    utils.createModal('Bulk Orders', content);
}

// Initialize utils
const utils = new Utils();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = utils;
}

// Make available globally
window.utils = utils;