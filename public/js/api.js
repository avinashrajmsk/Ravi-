// API functions for Satyam Gold website

class API {
    constructor() {
        this.baseUrl = '';
        this.loading = false;
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            },
        };

        const config = { ...defaultOptions, ...options };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Site Settings
    async getSiteSettings() {
        return this.request('/api/settings');
    }

    async updateSiteSettings(settings) {
        return this.request('/api/settings', {
            method: 'PUT',
            body: JSON.stringify(settings)
        });
    }

    // Products
    async getProducts(limit = 20, offset = 0) {
        return this.request(`/api/products?limit=${limit}&offset=${offset}`);
    }

    async getProduct(id) {
        return this.request(`/api/products/${id}`);
    }

    async addProduct(product) {
        return this.request('/api/products', {
            method: 'POST',
            body: JSON.stringify(product)
        });
    }

    async updateProduct(id, product) {
        return this.request(`/api/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    }

    async deleteProduct(id) {
        return this.request(`/api/products/${id}`, {
            method: 'DELETE'
        });
    }

    // Orders
    async getOrders(limit = 20, offset = 0) {
        return this.request(`/api/orders?limit=${limit}&offset=${offset}`);
    }

    async getOrder(id) {
        return this.request(`/api/orders/${id}`);
    }

    async createOrder(order) {
        return this.request('/api/orders', {
            method: 'POST',
            body: JSON.stringify(order)
        });
    }

    async updateOrderStatus(id, status) {
        return this.request(`/api/orders/${id}/status`, {
            method: 'PUT',
            body: JSON.stringify({ status })
        });
    }

    // Hero Images
    async getHeroImages() {
        return this.request('/api/hero-images');
    }

    async addHeroImage(image) {
        return this.request('/api/hero-images', {
            method: 'POST',
            body: JSON.stringify(image)
        });
    }

    async updateHeroImage(id, image) {
        return this.request(`/api/hero-images/${id}`, {
            method: 'PUT',
            body: JSON.stringify(image)
        });
    }

    async deleteHeroImage(id) {
        return this.request(`/api/hero-images/${id}`, {
            method: 'DELETE'
        });
    }

    // Admin Authentication
    async adminLogin(credentials) {
        return this.request('/api/admin/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    async adminLogout() {
        return this.request('/api/admin/logout', {
            method: 'POST'
        });
    }

    async changeAdminPassword(passwords) {
        return this.request('/api/admin/change-password', {
            method: 'PUT',
            body: JSON.stringify(passwords)
        });
    }

    async checkAdminAuth() {
        return this.request('/api/admin/check-auth');
    }

    // Image Upload
    async uploadImage(file) {
        const formData = new FormData();
        formData.append('image', file);
        
        return this.request('/api/upload-image', {
            method: 'POST',
            body: formData,
            headers: {} // Remove Content-Type to let browser set boundary
        });
    }

    // Bulk Order Request
    async submitBulkOrderRequest(request) {
        return this.request('/api/bulk-order', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    }

    // Contact Form
    async submitContactForm(form) {
        return this.request('/api/contact', {
            method: 'POST',
            body: JSON.stringify(form)
        });
    }
}

// Utility functions
const utils = {
    // Show loading spinner
    showLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.remove('hidden');
        }
    },

    // Hide loading spinner
    hideLoading() {
        const spinner = document.getElementById('loading-spinner');
        if (spinner) {
            spinner.classList.add('hidden');
        }
    },

    // Show toast notification
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 z-50 p-4 rounded-lg text-white max-w-sm transform translate-x-full transition-transform duration-300 ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
        }`;
        
        toast.innerHTML = `
            <div class="flex items-center gap-3">
                <i class="fas fa-${
                    type === 'success' ? 'check-circle' : 
                    type === 'error' ? 'exclamation-circle' : 
                    type === 'warning' ? 'exclamation-triangle' : 'info-circle'
                }"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-auto">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }, 5000);
    },

    // Format currency
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0
        }).format(amount);
    },

    // Format date
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    },

    // Generate order number
    generateOrderNumber() {
        const now = new Date();
        const timestamp = now.getFullYear().toString().substr(-2) + 
                         (now.getMonth() + 1).toString().padStart(2, '0') + 
                         now.getDate().toString().padStart(2, '0') + 
                         now.getHours().toString().padStart(2, '0') + 
                         now.getMinutes().toString().padStart(2, '0') + 
                         now.getSeconds().toString().padStart(2, '0');
        return `SG-${timestamp}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;
    },

    // Validate email
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    // Validate phone
    validatePhone(phone) {
        return /^[6-9]\d{9}$/.test(phone);
    },

    // Debounce function
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
    },

    // Scroll to section
    scrollToSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) {
            const headerHeight = document.querySelector('header').offsetHeight;
            const sectionTop = section.offsetTop - headerHeight - 20;
            
            window.scrollTo({
                top: sectionTop,
                behavior: 'smooth'
            });
        }
    },

    // Create modal
    createModal(title, content, actions = []) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">${title}</h3>
                    <button class="modal-close" onclick="this.closest('.modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
                ${actions.length > 0 ? `
                    <div class="p-6 border-t flex gap-3 justify-end">
                        ${actions.map(action => `
                            <button class="btn ${action.class || 'btn-secondary'}" onclick="${action.onclick || ''}">
                                ${action.text}
                            </button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        `;
        
        document.getElementById('modals-container').appendChild(modal);
        
        // Show modal
        setTimeout(() => {
            modal.classList.add('active');
        }, 100);
        
        return modal;
    }
};

// Create global API instance
window.api = new API();
window.utils = utils;