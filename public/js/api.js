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
        return this.request(`/api/products?id=${id}`, {
            method: 'PUT',
            body: JSON.stringify(product)
        });
    }

    async deleteProduct(id) {
        return this.request(`/api/products?id=${id}`, {
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
        return this.request(`/api/orders`, {
            method: 'PUT',
            body: JSON.stringify({ order_id: id, status })
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

// Create global API instance
window.api = new API();