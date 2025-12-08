// Admin Panel JavaScript

class AdminPanel {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentSettingsTab = 'branding';
        this.orders = [];
        this.products = [];
        this.heroImages = [];
        this.settings = {};
        this.loginFormBound = false; // Flag to prevent duplicate binding
        
        this.init();
    }

    async init() {
        try {
            // Check admin authentication
            const isAuthenticated = await this.checkAuth();
            
            if (!isAuthenticated) {
                this.showLoginModal();
                return;
            }
            
            // Show admin content
            document.getElementById('admin-content').classList.remove('hidden');
            
            // Load initial data
            await this.loadDashboardData();
            await this.loadSettings();
            
            // Bind events
            this.bindEvents();
            
            // Apply loaded settings to UI
            this.applySettingsToUI();
            
        } catch (error) {
            console.error('Admin panel initialization error:', error);
            utils.showToast('Failed to load admin panel', 'error');
            this.showLoginModal();
        }
    }

    // Check admin authentication
    async checkAuth() {
        const token = localStorage.getItem('admin_token');
        
        if (!token) {
            return false;
        }
        
        try {
            const response = await fetch('/api/admin/auth', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            return data.success;
            
        } catch (error) {
            console.error('Auth check error:', error);
            return false;
        }
    }
    
    // Show admin login modal
    showLoginModal() {
        const modal = document.getElementById('admin-login-modal');
        modal.classList.remove('hidden');
        
        // Bind login form if not already bound
        if (!this.loginFormBound) {
            this.bindLoginForm();
            this.loginFormBound = true;
        }
    }
    
    // Bind login form submission
    bindLoginForm() {
        const form = document.getElementById('admin-login-form');
        if (!form) {
            console.error('Login form not found!');
            return;
        }
        
        // Remove any existing listener first
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);
        
        // Add fresh event listener
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Form submitted!');
            
            const formData = new FormData(e.target);
            const email = formData.get('email');
            const password = formData.get('password');
            
            console.log('Login attempt:', { email, password: password ? '***' : 'empty' });
            
            if (!email || !password) {
                utils.showToast('Please enter email and password', 'error');
                return;
            }
            
            await this.handleLogin(formData);
        });
        
        console.log('Login form bound successfully');
    }
    
    // Handle admin login
    async handleLogin(formData) {
        const email = formData.get('email');
        const password = formData.get('password');
        
        try {
            utils.showLoading();
            
            const response = await fetch('/api/admin/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Store token
                localStorage.setItem('admin_token', data.token);
                
                // Hide login modal
                document.getElementById('admin-login-modal').classList.add('hidden');
                
                // Show admin content
                document.getElementById('admin-content').classList.remove('hidden');
                
                // Initialize admin panel
                await this.loadDashboardData();
                await this.loadSettings();
                this.bindEvents();
                this.applySettingsToUI();
                
                utils.showToast('Login successful!', 'success');
                
            } else {
                utils.showToast(data.message || 'Login failed', 'error');
            }
            
        } catch (error) {
            console.error('Login error:', error);
            utils.showToast('Login failed', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Bind event listeners
    bindEvents() {
        // Section navigation
        document.querySelectorAll('.nav-tab, .nav-tab-mobile').forEach(tab => {
            tab.addEventListener('click', () => {
                const section = tab.dataset.section;
                this.showSection(section);
            });
        });

        // Settings tabs
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                this.showSettingsTab(tabName);
            });
        });

        // Form submissions
        document.getElementById('password-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.changeAdminPassword();
        });

        // Real-time preview updates
        document.getElementById('site_logo').addEventListener('input', this.updateLogoPreview.bind(this));
        
        // Order filters
        document.getElementById('order-status-filter').addEventListener('change', this.filterOrders.bind(this));
        document.getElementById('order-date-filter').addEventListener('change', this.filterOrders.bind(this));
        document.getElementById('order-search').addEventListener('input', 
            utils.debounce(this.filterOrders.bind(this), 500)
        );

        // Quick order filters
        document.getElementById('quick-order-status-filter')?.addEventListener('change', this.renderQuickOrders.bind(this));
        document.getElementById('quick-order-search')?.addEventListener('input', 
            utils.debounce(this.renderQuickOrders.bind(this), 500)
        );

        // Logout
        document.getElementById('logout-btn').addEventListener('click', this.logout.bind(this));
    }

    // Show section
    showSection(sectionName) {
        // Hide all sections
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Show target section
        document.getElementById(`${sectionName}-section`).classList.add('active');
        
        // Update navigation
        document.querySelectorAll('.nav-tab, .nav-tab-mobile').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelectorAll(`[data-section="${sectionName}"]`).forEach(tab => {
            tab.classList.add('active');
        });
        
        this.currentSection = sectionName;
        
        // Load section-specific data
        switch (sectionName) {
            case 'orders':
                this.loadOrders();
                break;
            case 'quick-orders':
                this.loadQuickOrders();
                break;
            case 'products':
                this.loadProducts();
                break;
            case 'settings':
                this.loadHeroImages();
                break;
        }
    }

    // Show settings tab
    showSettingsTab(tabName) {
        // Hide all tabs
        document.querySelectorAll('.settings-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Show target tab
        document.getElementById(`${tabName}-tab`).classList.add('active');
        
        // Update tab navigation
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        
        this.currentSettingsTab = tabName;
    }

    // Load dashboard data
    async loadDashboardData() {
        try {
            utils.showLoading();
            
            // Load orders for stats
            const ordersResponse = await api.getOrders(100, 0);
            if (ordersResponse.success) {
                this.orders = ordersResponse.orders;
                this.updateDashboardStats();
                this.renderRecentOrders();
            }
            
            // Load products count
            const productsResponse = await api.getProducts(100, 0);
            if (productsResponse.success) {
                this.products = productsResponse.products;
                document.getElementById('total-products').textContent = this.products.length;
            }
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
        } finally {
            utils.hideLoading();
        }
    }

    // Update dashboard stats
    updateDashboardStats() {
        const totalOrders = this.orders.length;
        const pendingOrders = this.orders.filter(order => order.status === 'Pending').length;
        const totalRevenue = this.orders.reduce((sum, order) => sum + order.total_amount, 0);
        
        document.getElementById('total-orders').textContent = totalOrders;
        document.getElementById('pending-orders').textContent = pendingOrders;
        document.getElementById('total-revenue').textContent = utils.formatCurrency(totalRevenue);
    }

    // Render recent orders
    renderRecentOrders() {
        const container = document.getElementById('recent-orders');
        const recentOrders = this.orders.slice(0, 5);
        
        if (recentOrders.length === 0) {
            container.innerHTML = '<p class="text-gray-500">No orders found</p>';
            return;
        }
        
        container.innerHTML = recentOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-number">${order.order_number}</div>
                        <div class="order-date">${utils.formatDate(order.created_at)}</div>
                    </div>
                    <span class="order-status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
                </div>
                
                <div class="order-customer">
                    <div class="customer-name">${order.customer_name}</div>
                    <div class="customer-details">${order.customer_email}</div>
                </div>
                
                <div class="order-total">Total: ${utils.formatCurrency(order.total_amount)}</div>
                
                <div class="order-actions">
                    <button onclick="admin.viewOrder(${order.id})" class="btn btn-sm btn-secondary">
                        View Details
                    </button>
                    ${order.status === 'Pending' ? `
                        <button onclick="admin.updateOrderStatus(${order.id}, 'Confirmed')" class="btn btn-sm btn-primary">
                            Confirm
                        </button>
                    ` : ''}
                </div>
            </div>
        `).join('');
    }

    // Load orders
    async loadOrders() {
        try {
            utils.showLoading();
            
            const response = await api.getOrders();
            if (response.success) {
                this.orders = response.orders;
                this.renderOrders();
            }
            
        } catch (error) {
            console.error('Failed to load orders:', error);
            utils.showToast('Failed to load orders', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Render orders
    renderOrders(ordersToRender = this.orders) {
        const container = document.getElementById('orders-list');
        
        if (ordersToRender.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No orders found</p>';
            return;
        }
        
        container.innerHTML = ordersToRender.map(order => this.createOrderCard(order)).join('');
    }

    // Create order card HTML
    createOrderCard(order) {
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
        
        return `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <div class="order-number">${order.order_number}</div>
                        <div class="order-date">${utils.formatDate(order.created_at)}</div>
                    </div>
                    <select class="order-status-select" onchange="admin.updateOrderStatus(${order.id}, this.value)">
                        <option value="Pending" ${order.status === 'Pending' ? 'selected' : ''}>Pending</option>
                        <option value="Confirmed" ${order.status === 'Confirmed' ? 'selected' : ''}>Confirmed</option>
                        <option value="Processing" ${order.status === 'Processing' ? 'selected' : ''}>Processing</option>
                        <option value="Shipped" ${order.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="Out For Delivery" ${order.status === 'Out For Delivery' ? 'selected' : ''}>Out For Delivery</option>
                        <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
                    </select>
                </div>
                
                <div class="order-customer">
                    <div class="customer-name">${order.customer_name}</div>
                    <div class="customer-details">
                        <div>${order.customer_email}</div>
                        <div>${order.customer_phone}</div>
                        <div class="mt-1">${order.customer_address}</div>
                    </div>
                </div>
                
                <div class="order-items">
                    <h4 class="font-semibold mb-2">Items:</h4>
                    ${items.map(item => `
                        <div class="order-item">
                            <div>
                                <div class="item-name">${item.name}</div>
                                <div class="item-details">${item.weight} × ${item.quantity}</div>
                            </div>
                            <div class="item-price">${utils.formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
                
                <div class="order-total">Total: ${utils.formatCurrency(order.total_amount)}</div>
            </div>
        `;
    }

    // Filter orders
    filterOrders() {
        const statusFilter = document.getElementById('order-status-filter').value;
        const dateFilter = document.getElementById('order-date-filter').value;
        const searchTerm = document.getElementById('order-search').value.toLowerCase();
        
        let filteredOrders = this.orders;
        
        // Filter by status
        if (statusFilter) {
            filteredOrders = filteredOrders.filter(order => order.status === statusFilter);
        }
        
        // Filter by date
        if (dateFilter) {
            filteredOrders = filteredOrders.filter(order => {
                const orderDate = new Date(order.created_at).toISOString().split('T')[0];
                return orderDate === dateFilter;
            });
        }
        
        // Filter by search term
        if (searchTerm) {
            filteredOrders = filteredOrders.filter(order => 
                order.order_number.toLowerCase().includes(searchTerm) ||
                order.customer_name.toLowerCase().includes(searchTerm) ||
                order.customer_email.toLowerCase().includes(searchTerm)
            );
        }
        
        this.renderOrders(filteredOrders);
    }

    // Update order status
    async updateOrderStatus(orderId, newStatus) {
        try {
            const response = await api.updateOrderStatus(orderId, newStatus);
            if (response.success) {
                // Update local data
                const order = this.orders.find(o => o.id === orderId);
                if (order) {
                    order.status = newStatus;
                }
                
                utils.showToast('Order status updated successfully', 'success');
                this.updateDashboardStats();
            }
        } catch (error) {
            console.error('Failed to update order status:', error);
            utils.showToast('Failed to update order status', 'error');
        }
    }

    // Load products
    async loadProducts() {
        try {
            utils.showLoading();
            
            const response = await api.getProducts();
            if (response.success) {
                this.products = response.products;
                this.renderProducts();
            }
            
        } catch (error) {
            console.error('Failed to load products:', error);
            utils.showToast('Failed to load products', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Render products
    renderProducts() {
        const container = document.getElementById('products-grid');
        
        if (this.products.length === 0) {
            container.innerHTML = '<div class="col-span-full text-center py-12"><p class="text-gray-500">No products found</p></div>';
            return;
        }
        
        container.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
    }

    // Create product card HTML
    createProductCard(product) {
        return `
            <div class="product-card-admin">
                <img src="${product.image_url}" alt="${product.name}" class="product-image-admin"
                     onerror="this.src='/images/placeholder-product.jpg'">
                
                <div class="product-info-admin">
                    <h3 class="product-name-admin">${product.name}</h3>
                    <p class="product-description-admin">${product.description || ''}</p>
                    
                    <div class="product-price-admin">₹${product.price}/${product.unit}</div>
                    
                    <div class="product-meta">
                        <span>Category: ${product.category}</span>
                        <span>${product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
                    </div>
                    
                    <div class="product-actions-admin">
                        <button onclick="admin.editProduct(${product.id})" class="btn btn-sm btn-secondary">
                            <i class="fas fa-edit mr-1"></i>
                            Edit
                        </button>
                        <button onclick="admin.deleteProduct(${product.id})" class="btn btn-sm btn-danger">
                            <i class="fas fa-trash mr-1"></i>
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // Show add product modal
    showAddProductModal() {
        const modal = utils.createModal(
            'Add New Product',
            this.createProductFormHTML(),
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                },
                {
                    text: 'Add Product',
                    class: 'btn-primary',
                    onclick: 'admin.saveProduct(this.closest(\'.modal\'))'
                }
            ]
        );
    }

    // Create product form HTML
    createProductFormHTML(product = null) {
        return `
            <form id="product-form" class="space-y-4">
                <input type="hidden" id="product_id" value="${product ? product.id : ''}">
                
                <div class="form-group">
                    <label for="product_name">Product Name *</label>
                    <input type="text" id="product_name" name="name" class="form-control" 
                           value="${product ? product.name : ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="product_description">Description</label>
                    <textarea id="product_description" name="description" rows="3" class="form-control"
                              placeholder="Product description...">${product ? product.description || '' : ''}</textarea>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="product_price">Current Price *</label>
                        <input type="number" id="product_price" name="price" class="form-control" 
                               value="${product ? product.price : ''}" step="0.01" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="product_original_price">Original Price (for discount)</label>
                        <input type="number" id="product_original_price" name="original_price" class="form-control" 
                               value="${product ? (product.original_price || '') : ''}" step="0.01" 
                               placeholder="Leave empty for no discount">
                    </div>
                </div>
                
                <div class="grid md:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label for="product_unit">Unit</label>
                        <select id="product_unit" name="unit" class="form-control">
                            <option value="kg" ${product && product.unit === 'kg' ? 'selected' : ''}>Kilogram (kg)</option>
                            <option value="g" ${product && product.unit === 'g' ? 'selected' : ''}>Gram (g)</option>
                            <option value="piece" ${product && product.unit === 'piece' ? 'selected' : ''}>Piece</option>
                            <option value="packet" ${product && product.unit === 'packet' ? 'selected' : ''}>Packet</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="product_loved_by">Loved By (in thousands)</label>
                        <input type="number" id="product_loved_by" name="loved_by" class="form-control" 
                               value="${product ? (product.loved_by || 0) : 0}" step="1" min="0"
                               placeholder="e.g., 5 for 5k">
                        <p class="text-sm text-gray-500 mt-1">Enter number only, will display as "5k"</p>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="product_category">Category</label>
                    <input type="text" id="product_category" name="category" class="form-control"
                           value="${product ? product.category || 'General' : 'General'}">
                </div>
                
                <div class="form-group">
                    <label for="product_weight_options">Weight Options (comma separated)</label>
                    <input type="text" id="product_weight_options" name="weight_options" class="form-control"
                           value="${product ? product.weight_options || '1' : '1'}"
                           placeholder="1,5,10,25">
                    <p class="text-sm text-gray-500 mt-1">e.g., 1,5,10,25 (without units)</p>
                </div>
                
                <div class="form-group">
                    <label>Product Image</label>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex-1">
                            <input type="url" id="product_image_url" name="image_url" class="form-control"
                                   value="${product ? product.image_url || '' : ''}"
                                   placeholder="https://example.com/image.jpg">
                            <p class="text-sm text-gray-500 mt-1">Recommended: 800 x 600 pixels (4:3 ratio)</p>
                        </div>
                        <button type="button" onclick="admin.uploadImage('product_image_url')" class="btn btn-secondary">
                            <i class="fas fa-upload mr-2"></i>
                            Upload Image
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="product_in_stock" name="in_stock" 
                               ${product && product.in_stock ? 'checked' : ''}>
                        <span>In Stock</span>
                    </label>
                </div>
            </form>
        `;
    }

    // Edit product
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        const modal = utils.createModal(
            'Edit Product',
            this.createProductFormHTML(product),
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                },
                {
                    text: 'Update Product',
                    class: 'btn-primary',
                    onclick: 'admin.saveProduct(this.closest(\'.modal\'), true)'
                }
            ]
        );
    }

    // Save product
    async saveProduct(modal, isEdit = false) {
        const form = modal.querySelector('#product-form');
        const formData = new FormData(form);
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        try {
            utils.showLoading();
            
            const productData = {
                name: formData.get('name'),
                description: formData.get('description'),
                price: parseFloat(formData.get('price')),
                original_price: formData.get('original_price') ? parseFloat(formData.get('original_price')) : null,
                unit: formData.get('unit'),
                category: formData.get('category'),
                weight_options: formData.get('weight_options'),
                image_url: formData.get('image_url'),
                in_stock: formData.has('in_stock'),
                loved_by: parseInt(formData.get('loved_by')) || 0
            };
            
            let response;
            if (isEdit) {
                const productId = document.getElementById('product_id').value;
                response = await api.updateProduct(productId, productData);
            } else {
                response = await api.addProduct(productData);
            }
            
            if (response.success) {
                utils.showToast(`Product ${isEdit ? 'updated' : 'added'} successfully`, 'success');
                modal.remove();
                await this.loadProducts();
            }
            
        } catch (error) {
            console.error('Failed to save product:', error);
            utils.showToast(`Failed to ${isEdit ? 'update' : 'add'} product`, 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Delete product
    async deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        if (!confirm(`Are you sure you want to delete "${product.name}"?`)) {
            return;
        }
        
        try {
            utils.showLoading();
            
            const response = await api.deleteProduct(productId);
            if (response.success) {
                utils.showToast('Product deleted successfully', 'success');
                await this.loadProducts();
            }
            
        } catch (error) {
            console.error('Failed to delete product:', error);
            utils.showToast('Failed to delete product', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Load settings
    async loadSettings() {
        try {
            const response = await api.getSiteSettings();
            if (response.success) {
                this.settings = response.settings;
                this.populateSettingsForm();
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        }
    }

    // Populate settings form
    populateSettingsForm() {
        // Branding
        this.setFormValue('site_name', this.settings.site_name);
        this.setFormValue('site_logo', this.settings.site_logo);
        
        // Contact
        this.setFormValue('phone_number', this.settings.phone_number);
        this.setFormValue('whatsapp_number', this.settings.whatsapp_number);
        this.setFormValue('email_address', this.settings.email_address);
        this.setFormValue('business_address', this.settings.business_address);
        this.setFormValue('facebook_url', this.settings.facebook_url);
        this.setFormValue('instagram_url', this.settings.instagram_url);
        this.setFormValue('whatsapp_chat_url', this.settings.whatsapp_chat_url);
        
        // Customization
        this.setFormValue('primary_color', this.settings.primary_color);
        this.setFormValue('secondary_color', this.settings.secondary_color);
        this.setFormValue('footer_text', this.settings.footer_text);
        
        // Update logo preview
        this.updateLogoPreview();
    }

    // Set form value helper
    setFormValue(id, value) {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    }

    // Apply settings to UI
    applySettingsToUI() {
        // This method can be used to apply theme changes in real-time
        if (this.settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', this.settings.primary_color);
        }
    }

    // Update logo preview
    updateLogoPreview() {
        const logoUrl = document.getElementById('site_logo').value;
        const preview = document.getElementById('logo-preview');
        
        if (logoUrl) {
            preview.innerHTML = `<img src="${logoUrl}" alt="Logo Preview" class="w-full h-full object-cover rounded-lg"
                                      onerror="this.parentElement.innerHTML='<i class=\\"fas fa-image text-gray-400\\"></i>'">`;
        } else {
            preview.innerHTML = '<i class="fas fa-image text-gray-400"></i>';
        }
    }

    // Load hero images
    async loadHeroImages() {
        try {
            const response = await api.getHeroImages();
            if (response.success) {
                this.heroImages = response.images;
                this.renderHeroImages();
            }
        } catch (error) {
            console.error('Failed to load hero images:', error);
        }
    }

    // Render hero images
    renderHeroImages() {
        const container = document.getElementById('hero-images-list');
        
        if (this.heroImages.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">No hero images found</p>';
            return;
        }
        
        container.innerHTML = this.heroImages.map(image => `
            <div class="hero-image-card">
                <img src="${image.image_url}" alt="${image.title}" class="hero-image-preview"
                     onerror="this.src='/images/placeholder-hero.jpg'">
                
                <div class="hero-image-info">
                    <div class="hero-image-title">${image.title || 'No Title'}</div>
                    <div class="hero-image-subtitle">${image.subtitle || 'No Subtitle'}</div>
                    ${image.button_text ? `<span class="hero-image-button">${image.button_text}</span>` : ''}
                </div>
                
                <div class="hero-image-actions">
                    <button onclick="admin.editHeroImage(${image.id})" class="btn btn-sm btn-secondary">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="admin.deleteHeroImage(${image.id})" class="btn btn-sm btn-danger">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Show add hero image modal
    showAddHeroImageModal() {
        const modal = utils.createModal(
            'Add Hero Image',
            this.createHeroImageFormHTML(),
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                },
                {
                    text: 'Add Image',
                    class: 'btn-primary',
                    onclick: 'admin.saveHeroImage(this.closest(\'.modal\'))'
                }
            ]
        );
    }

    // Create hero image form HTML
    createHeroImageFormHTML(image = null) {
        return `
            <form id="hero-image-form" class="space-y-4">
                <input type="hidden" id="hero_image_id" value="${image ? image.id : ''}">
                
                <div class="form-group">
                    <label>Hero Image</label>
                    <div class="flex flex-col sm:flex-row gap-4">
                        <div class="flex-1">
                            <input type="url" id="hero_image_url" name="image_url" class="form-control"
                                   value="${image ? image.image_url || '' : ''}"
                                   placeholder="https://example.com/hero-image.jpg" required>
                            <p class="text-sm text-gray-500 mt-1">Recommended: 1920 x 1080 pixels (16:9 ratio)</p>
                        </div>
                        <button type="button" onclick="admin.uploadImage('hero_image_url')" class="btn btn-secondary">
                            <i class="fas fa-upload mr-2"></i>
                            Upload Image
                        </button>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="hero_title">Title</label>
                    <input type="text" id="hero_title" name="title" class="form-control"
                           value="${image ? image.title || '' : ''}"
                           placeholder="Main headline text">
                </div>
                
                <div class="form-group">
                    <label for="hero_subtitle">Subtitle</label>
                    <textarea id="hero_subtitle" name="subtitle" rows="2" class="form-control"
                              placeholder="Supporting text or description">${image ? image.subtitle || '' : ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="hero_button_text">Button Text</label>
                    <input type="text" id="hero_button_text" name="button_text" class="form-control"
                           value="${image ? image.button_text || '' : ''}"
                           placeholder="e.g., Shop Now, Learn More">
                </div>
                
                <div class="form-group">
                    <label for="hero_button_link">Button Link</label>
                    <input type="text" id="hero_button_link" name="button_link" class="form-control"
                           value="${image ? image.button_link || '' : ''}"
                           placeholder="e.g., #products, /shop">
                </div>
                
                <div class="form-group">
                    <label for="hero_sort_order">Sort Order</label>
                    <input type="number" id="hero_sort_order" name="sort_order" class="form-control"
                           value="${image ? image.sort_order || 0 : 0}"
                           placeholder="0">
                </div>
                
                <div class="form-group">
                    <label class="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" id="hero_active" name="active" 
                               ${image && image.active ? 'checked' : 'checked'}>
                        <span>Active</span>
                    </label>
                </div>
            </form>
        `;
    }

    // Save hero image
    async saveHeroImage(modal, isEdit = false) {
        const form = modal.querySelector('#hero-image-form');
        const formData = new FormData(form);
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }
        
        try {
            utils.showLoading();
            
            const imageData = {
                image_url: formData.get('image_url'),
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                button_text: formData.get('button_text'),
                button_link: formData.get('button_link'),
                sort_order: parseInt(formData.get('sort_order')) || 0,
                active: formData.has('active')
            };
            
            let response;
            if (isEdit) {
                const imageId = document.getElementById('hero_image_id').value;
                response = await api.updateHeroImage(imageId, imageData);
            } else {
                response = await api.addHeroImage(imageData);
            }
            
            if (response.success) {
                utils.showToast(`Hero image ${isEdit ? 'updated' : 'added'} successfully`, 'success');
                modal.remove();
                await this.loadHeroImages();
            }
            
        } catch (error) {
            console.error('Failed to save hero image:', error);
            utils.showToast(`Failed to ${isEdit ? 'update' : 'add'} hero image`, 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Edit hero image
    editHeroImage(imageId) {
        const image = this.heroImages.find(img => img.id === imageId);
        if (!image) return;
        
        const modal = utils.createModal(
            'Edit Hero Image',
            this.createHeroImageFormHTML(image),
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                },
                {
                    text: 'Update Image',
                    class: 'btn-primary',
                    onclick: 'admin.saveHeroImage(this.closest(\'.modal\'), true)'
                }
            ]
        );
    }

    // Delete hero image
    async deleteHeroImage(imageId) {
        const image = this.heroImages.find(img => img.id === imageId);
        if (!image) return;
        
        if (!confirm('Are you sure you want to delete this hero image?')) {
            return;
        }
        
        try {
            utils.showLoading();
            
            const response = await api.deleteHeroImage(imageId);
            if (response.success) {
                utils.showToast('Hero image deleted successfully', 'success');
                await this.loadHeroImages();
            }
            
        } catch (error) {
            console.error('Failed to delete hero image:', error);
            utils.showToast('Failed to delete hero image', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Save all settings
    async saveAllSettings() {
        try {
            utils.showLoading();
            
            const settings = {
                // Branding
                site_name: document.getElementById('site_name').value,
                site_logo: document.getElementById('site_logo').value,
                
                // Contact
                phone_number: document.getElementById('phone_number').value,
                whatsapp_number: document.getElementById('whatsapp_number').value,
                email_address: document.getElementById('email_address').value,
                business_address: document.getElementById('business_address').value,
                facebook_url: document.getElementById('facebook_url').value,
                instagram_url: document.getElementById('instagram_url').value,
                whatsapp_chat_url: document.getElementById('whatsapp_chat_url').value,
                
                // Customization
                primary_color: document.getElementById('primary_color').value,
                secondary_color: document.getElementById('secondary_color').value,
                footer_text: document.getElementById('footer_text').value
            };
            
            const response = await api.updateSiteSettings(settings);
            if (response.success) {
                this.settings = { ...this.settings, ...settings };
                this.applySettingsToUI();
                utils.showToast('Settings saved successfully', 'success');
            }
            
        } catch (error) {
            console.error('Failed to save settings:', error);
            utils.showToast('Failed to save settings', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Change admin password
    async changeAdminPassword() {
        const form = document.getElementById('password-form');
        const formData = new FormData(form);
        
        const currentPassword = formData.get('current_password');
        const newPassword = formData.get('new_password');
        const confirmPassword = formData.get('confirm_password');
        
        if (newPassword !== confirmPassword) {
            utils.showToast('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            utils.showToast('Password must be at least 6 characters long', 'error');
            return;
        }
        
        try {
            utils.showLoading();
            
            const response = await api.changeAdminPassword({
                current_password: currentPassword,
                new_password: newPassword
            });
            
            if (response.success) {
                utils.showToast('Password changed successfully', 'success');
                form.reset();
            }
            
        } catch (error) {
            console.error('Failed to change password:', error);
            utils.showToast('Failed to change password', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Upload image (placeholder for future implementation)
    uploadImage(inputId) {
        utils.showToast('Image upload feature will be implemented with R2 storage', 'info');
    }

    // View order details
    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const items = Array.isArray(order.items) ? order.items : JSON.parse(order.items || '[]');
        
        const modal = utils.createModal(
            `Order Details - ${order.order_number}`,
            `
                <div class="space-y-6">
                    <div class="grid md:grid-cols-2 gap-6">
                        <div>
                            <h4 class="font-semibold mb-3">Customer Information</h4>
                            <div class="space-y-2 text-sm">
                                <div><strong>Name:</strong> ${order.customer_name}</div>
                                <div><strong>Email:</strong> ${order.customer_email}</div>
                                <div><strong>Phone:</strong> ${order.customer_phone}</div>
                                <div><strong>Address:</strong><br>${order.customer_address}</div>
                            </div>
                        </div>
                        
                        <div>
                            <h4 class="font-semibold mb-3">Order Information</h4>
                            <div class="space-y-2 text-sm">
                                <div><strong>Order Number:</strong> ${order.order_number}</div>
                                <div><strong>Date:</strong> ${utils.formatDate(order.created_at)}</div>
                                <div><strong>Status:</strong> 
                                    <span class="order-status status-${order.status.toLowerCase().replace(' ', '-')}">${order.status}</span>
                                </div>
                                <div><strong>Total:</strong> ${utils.formatCurrency(order.total_amount)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 class="font-semibold mb-3">Order Items</h4>
                        <div class="space-y-2">
                            ${items.map(item => `
                                <div class="flex justify-between items-center p-3 bg-gray-50 rounded">
                                    <div>
                                        <div class="font-medium">${item.name}</div>
                                        <div class="text-sm text-gray-500">${item.weight} × ${item.quantity}</div>
                                    </div>
                                    <div class="font-medium">${utils.formatCurrency(item.price * item.quantity)}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `,
            [
                {
                    text: 'Close',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                }
            ]
        );
    }

    // Logout
    logout() {
        if (confirm('Are you sure you want to logout?')) {
            // Clear any stored authentication
            localStorage.removeItem('admin_token');
            // Redirect to main site
            window.location.href = '/';
        }
    }

    // Quick Orders Management
    async loadQuickOrders() {
        try {
            const response = await fetch('/api/quick-orders');
            const data = await response.json();
            
            if (data.success) {
                this.quickOrders = data.orders;
                this.renderQuickOrders();
            }
        } catch (error) {
            console.error('Failed to load quick orders:', error);
            utils.showToast('Failed to load quick orders', 'error');
        }
    }

    renderQuickOrders() {
        const container = document.getElementById('quick-orders-list');
        
        if (!this.quickOrders || this.quickOrders.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-4"></i>
                    <p>No quick order messages found</p>
                </div>
            `;
            return;
        }
        
        const filteredOrders = this.filterQuickOrders();
        
        if (filteredOrders.length === 0) {
            container.innerHTML = `
                <div class="p-8 text-center text-gray-500">
                    <i class="fas fa-search text-4xl mb-4"></i>
                    <p>No orders match your search criteria</p>
                </div>
            `;
            return;
        }

        container.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50">
                        <tr>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Message</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody class="bg-white divide-y divide-gray-200">
                        ${filteredOrders.map(order => `
                            <tr class="hover:bg-gray-50">
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    ${new Date(order.created_at).toLocaleDateString()} <br>
                                    <span class="text-xs text-gray-500">${new Date(order.created_at).toLocaleTimeString()}</span>
                                </td>
                                <td class="px-6 py-4 text-sm">
                                    <div class="font-medium text-gray-900">${order.customer_name}</div>
                                    <div class="text-gray-500">${order.customer_phone}</div>
                                </td>
                                <td class="px-6 py-4 text-sm text-gray-900 max-w-xs">
                                    <div class="truncate" title="${order.message}">${order.message}</div>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getQuickOrderStatusClass(order.status)}">
                                        ${order.status}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                                    <button onclick="admin.showQuickOrderDetails(${order.id})" class="text-primary hover:text-accent">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    ${order.status === 'pending' ? `
                                        <button onclick="admin.updateQuickOrderStatus(${order.id}, 'processed')" class="text-green-600 hover:text-green-700" title="Mark as Processed">
                                            <i class="fas fa-check"></i>
                                        </button>
                                        <button onclick="admin.updateQuickOrderStatus(${order.id}, 'ignored')" class="text-red-600 hover:text-red-700" title="Mark as Ignored">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    ` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    filterQuickOrders() {
        if (!this.quickOrders) return [];
        
        const statusFilter = document.getElementById('quick-order-status-filter')?.value || '';
        const searchFilter = document.getElementById('quick-order-search')?.value.toLowerCase() || '';
        
        return this.quickOrders.filter(order => {
            const matchesStatus = !statusFilter || order.status === statusFilter;
            const matchesSearch = !searchFilter || 
                order.customer_name.toLowerCase().includes(searchFilter) ||
                order.customer_phone.includes(searchFilter) ||
                order.message.toLowerCase().includes(searchFilter);
            
            return matchesStatus && matchesSearch;
        });
    }

    getQuickOrderStatusClass(status) {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'processed':
                return 'bg-green-100 text-green-800';
            case 'ignored':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    async showQuickOrderDetails(orderId) {
        const order = this.quickOrders.find(o => o.id === orderId);
        if (!order) return;

        const modal = utils.createModal(
            'Quick Order Details',
            `
                <div class="space-y-4">
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Customer Information</h4>
                        <p><strong>Name:</strong> ${order.customer_name}</p>
                        <p><strong>Phone:</strong> ${order.customer_phone}</p>
                        <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Order Message</h4>
                        <p class="whitespace-pre-wrap">${order.message}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <h4 class="font-semibold mb-2">Current Status</h4>
                        <span class="inline-flex px-2 py-1 text-xs font-semibold rounded-full ${this.getQuickOrderStatusClass(order.status)}">
                            ${order.status}
                        </span>
                    </div>
                    
                    ${order.admin_notes ? `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Admin Notes</h4>
                            <p class="whitespace-pre-wrap">${order.admin_notes}</p>
                        </div>
                    ` : ''}
                    
                    <div>
                        <h4 class="font-semibold mb-2">Add Admin Notes</h4>
                        <textarea id="admin-notes-input" class="form-control" rows="3" 
                                  placeholder="Add notes about this order...">${order.admin_notes || ''}</textarea>
                    </div>
                </div>
            `,
            [
                {
                    text: 'Close',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\\.modal\\).remove()'
                },
                {
                    text: 'Save Notes',
                    class: 'btn-primary',
                    onclick: `admin.saveQuickOrderNotes(${order.id})`
                }
            ]
        );
    }

    async saveQuickOrderNotes(orderId) {
        const notes = document.getElementById('admin-notes-input')?.value || '';
        
        try {
            utils.showLoading();
            
            const response = await fetch('/api/quick-orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: orderId,
                    admin_notes: notes,
                    status: this.quickOrders.find(o => o.id === orderId)?.status
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                utils.showToast('Notes saved successfully', 'success');
                document.querySelector('.modal')?.remove();
                await this.loadQuickOrders();
            } else {
                throw new Error(data.message);
            }
            
        } catch (error) {
            console.error('Failed to save notes:', error);
            utils.showToast('Failed to save notes', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    async updateQuickOrderStatus(orderId, newStatus) {
        const order = this.quickOrders.find(o => o.id === orderId);
        if (!order) return;

        try {
            utils.showLoading();
            
            const response = await fetch('/api/quick-orders', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    id: orderId,
                    status: newStatus,
                    admin_notes: order.admin_notes || ''
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                utils.showToast(`Order marked as ${newStatus}`, 'success');
                await this.loadQuickOrders();
            } else {
                throw new Error(data.message);
            }
            
        } catch (error) {
            console.error('Failed to update status:', error);
            utils.showToast('Failed to update status', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    async refreshQuickOrders() {
        await this.loadQuickOrders();
        utils.showToast('Quick orders refreshed', 'success');
    }
}

// Initialize admin panel
document.addEventListener('DOMContentLoaded', () => {
    window.admin = new AdminPanel();
});