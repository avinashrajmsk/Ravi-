// Main JavaScript for Satyam Gold website

class SatyamGoldApp {
    constructor() {
        this.currentSlide = 0;
        this.slides = [];
        this.products = [];
        this.siteSettings = {};
        this.productsLoaded = 0;
        this.productsLimit = 8;
        
        this.init();
    }

    async init() {
        try {
            // Load site settings first
            await this.loadSiteSettings();
            
            // Initialize components
            this.bindEvents();
            await this.loadHeroSlider();
            await this.loadProducts();
            
            // Update UI with settings
            this.applySiteSettings();
            
        } catch (error) {
            console.error('App initialization error:', error);
            utils.showToast('Failed to load website data', 'error');
        }
    }

    // Load site settings
    async loadSiteSettings() {
        try {
            const response = await api.getSiteSettings();
            if (response.success) {
                this.siteSettings = response.settings;
            }
        } catch (error) {
            console.error('Failed to load site settings:', error);
            // Use default settings
            this.siteSettings = {
                site_name: 'SATYAM GOLD',
                site_logo: 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_100012467.png',
                primary_color: '#F97316',
                secondary_color: '#FED7AA',
                footer_text: '© 2024 SATYAM GOLD. All rights reserved. Delivering freshness to your doorstep.',
                phone_number: '9631816666',
                whatsapp_number: '6201530654',
                email_address: 'avinash@gmail.com',
                whatsapp_chat_url: 'https://wa.me/916201530654'
            };
        }
    }

    // Apply site settings to UI
    applySiteSettings() {
        const settings = this.siteSettings;
        
        // Update site name and logo
        const siteName = document.getElementById('site-name');
        const siteLogo = document.getElementById('site-logo');
        const footerLogo = document.getElementById('footer-logo');
        
        if (siteName && settings.site_name) {
            siteName.textContent = settings.site_name;
            document.title = settings.site_name + ' - Premium Quality Products';
        }
        
        if (siteLogo && settings.site_logo) {
            siteLogo.src = settings.site_logo;
        }
        
        if (footerLogo && settings.site_logo) {
            footerLogo.src = settings.site_logo;
        }

        // Update contact information
        this.updateContactInfo(settings);
        
        // Update footer text
        const footerText = document.getElementById('footer-text');
        if (footerText && settings.footer_text) {
            footerText.textContent = settings.footer_text;
        }

        // Update colors (if custom colors are set)
        if (settings.primary_color) {
            document.documentElement.style.setProperty('--primary-color', settings.primary_color);
        }
        
        if (settings.secondary_color) {
            document.documentElement.style.setProperty('--secondary-color', settings.secondary_color);
        }
    }

    // Update contact information
    updateContactInfo(settings) {
        const phoneElement = document.getElementById('contact-phone');
        const whatsappElement = document.getElementById('contact-whatsapp');
        const emailElement = document.getElementById('contact-email');
        
        if (phoneElement && settings.phone_number) {
            phoneElement.textContent = settings.phone_number;
        }
        
        if (whatsappElement && settings.whatsapp_number) {
            whatsappElement.textContent = settings.whatsapp_number;
        }
        
        if (emailElement && settings.email_address) {
            emailElement.textContent = settings.email_address;
        }

        // Update social media links
        const whatsappLink = document.getElementById('whatsapp-link');
        const facebookLink = document.getElementById('facebook-link');
        const instagramLink = document.getElementById('instagram-link');
        
        if (whatsappLink && settings.whatsapp_chat_url) {
            whatsappLink.href = settings.whatsapp_chat_url;
        }
        
        if (facebookLink && settings.facebook_url) {
            facebookLink.href = settings.facebook_url;
            facebookLink.style.display = settings.facebook_url ? 'flex' : 'none';
        }
        
        if (instagramLink && settings.instagram_url) {
            instagramLink.href = settings.instagram_url;
            instagramLink.style.display = settings.instagram_url ? 'flex' : 'none';
        }
    }

    // Bind event listeners
    bindEvents() {
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const mobileMenu = document.getElementById('mobile-menu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Navigation smooth scrolling
        document.querySelectorAll('nav a[href^="#"]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                utils.scrollToSection(targetId);
                
                // Close mobile menu if open
                if (mobileMenu) {
                    mobileMenu.classList.add('hidden');
                }
            });
        });

        // Quick order form
        const quickOrderForm = document.getElementById('quick-order-form');
        if (quickOrderForm) {
            quickOrderForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleQuickOrder(new FormData(quickOrderForm));
            });
        }

        // Load more products
        const loadMoreBtn = document.getElementById('load-more-products');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreProducts();
            });
        }

        // Scroll effects
        window.addEventListener('scroll', this.handleScroll.bind(this));
    }

    // Load hero slider
    async loadHeroSlider() {
        try {
            const response = await api.getHeroImages();
            if (response.success && response.images.length > 0) {
                this.slides = response.images;
            } else {
                // Default hero slide
                this.slides = [
                    {
                        id: 1,
                        image_url: 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/6336e6cce_100016130.png',
                        title: 'GOLD HARVEST WHEAT FLOUR',
                        subtitle: 'Grown Without Chemicals. Packed With Goodness',
                        button_text: 'Shop Now',
                        button_link: '#products'
                    }
                ];
            }
            
            this.renderHeroSlider();
            this.startSliderAutoplay();
            
        } catch (error) {
            console.error('Failed to load hero slider:', error);
            this.slides = []; // Empty slides on error
        }
    }

    // Render hero slider
    renderHeroSlider() {
        const sliderContainer = document.getElementById('slider-container');
        const dotsContainer = document.getElementById('slider-dots');
        
        if (!sliderContainer || this.slides.length === 0) return;

        // Render slides
        sliderContainer.innerHTML = this.slides.map(slide => `
            <div class="hero-slide" style="background-image: linear-gradient(rgba(249, 115, 22, 0.1), rgba(234, 88, 12, 0.1)), url('${slide.image_url}')">
                <div class="hero-content">
                    <div class="max-w-3xl">
                        <h2 class="hero-title">${slide.title || ''}</h2>
                        <p class="hero-subtitle">${slide.subtitle || ''}</p>
                        ${slide.button_text ? `
                            <a href="${slide.button_link || '#products'}" class="hero-cta" onclick="utils.scrollToSection('products'); return false;">
                                ${slide.button_text}
                            </a>
                        ` : ''}
                    </div>
                </div>
            </div>
        `).join('');

        // Render dots (if more than one slide)
        if (this.slides.length > 1 && dotsContainer) {
            dotsContainer.innerHTML = this.slides.map((_, index) => `
                <button class="slider-dot ${index === 0 ? 'active' : ''}" onclick="app.goToSlide(${index})"></button>
            `).join('');
        }

        // Bind navigation
        this.bindSliderNavigation();
    }

    // Bind slider navigation
    bindSliderNavigation() {
        const prevBtn = document.getElementById('prev-slide');
        const nextBtn = document.getElementById('next-slide');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousSlide());
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextSlide());
        }

        // Hide navigation if only one slide
        if (this.slides.length <= 1) {
            if (prevBtn) prevBtn.style.display = 'none';
            if (nextBtn) nextBtn.style.display = 'none';
        }
    }

    // Slider navigation methods
    nextSlide() {
        this.currentSlide = (this.currentSlide + 1) % this.slides.length;
        this.updateSlider();
    }

    previousSlide() {
        this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
        this.updateSlider();
    }

    goToSlide(index) {
        this.currentSlide = index;
        this.updateSlider();
    }

    updateSlider() {
        const container = document.getElementById('slider-container');
        const dots = document.querySelectorAll('.slider-dot');
        
        if (container) {
            container.style.transform = `translateX(-${this.currentSlide * 100}%)`;
        }
        
        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentSlide);
        });
    }

    startSliderAutoplay() {
        if (this.slides.length > 1) {
            setInterval(() => {
                this.nextSlide();
            }, 5000); // 5 seconds
        }
    }

    // Load products
    async loadProducts() {
        try {
            const response = await api.getProducts(this.productsLimit, this.productsLoaded);
            if (response.success) {
                this.products = [...this.products, ...response.products];
                this.productsLoaded += response.products.length;
                this.renderProducts();
                
                // Hide load more button if no more products
                if (response.products.length < this.productsLimit) {
                    const loadMoreBtn = document.getElementById('load-more-products');
                    if (loadMoreBtn) {
                        loadMoreBtn.style.display = 'none';
                    }
                }
            }
        } catch (error) {
            console.error('Failed to load products:', error);
            this.renderDefaultProducts();
        }
    }

    // Render default products (fallback)
    renderDefaultProducts() {
        const defaultProducts = [
            {
                id: 1,
                name: 'Sattu',
                description: 'Premium quality atta made with traditional methods',
                price: 60,
                unit: 'kg',
                image_url: '/images/sattu.jpg',
                weight_options: '1,5,10',
                in_stock: 1
            },
            {
                id: 4,
                name: 'Premium Wheat Atta',
                description: 'Stone-milled whole wheat flour made from the finest quality wheat grains. Rich in fiber and nutrition',
                price: 40,
                unit: 'kg',
                image_url: '/images/wheat-atta.jpg',
                weight_options: '1,5,10,25',
                in_stock: 1
            }
        ];
        
        this.products = defaultProducts;
        this.renderProducts();
    }

    // Render products
    renderProducts() {
        const grid = document.getElementById('products-grid');
        if (!grid) return;

        grid.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
    }

    // Create product card HTML - New Design
    createProductCard(product) {
        const weightOptions = product.weight_options ? product.weight_options.split(',') : ['1'];
        const isInStock = product.in_stock === 1;
        const originalPrice = product.original_price || Math.round(product.price * 1.08);
        const discount = Math.round(((originalPrice - product.price) / originalPrice) * 100);
        const lovedBy = product.loved_by || 0;
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                ${discount > 0 ? `<div class="discount-badge">${discount}% OFF</div>` : ''}
                
                <div class="product-image-container">
                    <img src="${product.image_url}" alt="${product.name}" 
                         onerror="this.src='/images/placeholder-product.jpg'">
                </div>
                
                <div class="product-details">
                    <h3 class="product-title">${product.name}</h3>
                    <div class="product-weight">${weightOptions[0]} ${product.unit}</div>
                    
                    <div class="price-section">
                        <span class="current-price">₹${product.price}</span>
                        ${discount > 0 ? `<span class="original-price">₹${originalPrice}</span>` : ''}
                    </div>
                    
                    <div class="loved-by-section">
                        <i class="fas fa-heart loved-heart ${lovedBy > 0 ? 'active' : 'inactive'}" 
                           onclick="app.toggleLove(${product.id})" 
                           data-product-id="${product.id}"></i>
                        <span class="loved-text">Loved by <span class="loved-count" id="loved-count-${product.id}">${lovedBy}</span></span>
                    </div>
                    
                    ${isInStock ? `
                        <div class="product-buttons">
                            <div class="product-buttons-row">
                                <button class="btn-add-cart" onclick="app.addToCart(${product.id}, event)">
                                    ADD TO CART
                                </button>
                                <button class="btn-buy-now" onclick="app.buyNow(${product.id}, event)">
                                    BUY NOW
                                </button>
                            </div>
                            <button class="btn-bulk-order" onclick="app.bulkOrder(${product.id})">
                                <i class="fab fa-whatsapp"></i>
                                BULK ORDER
                            </button>
                        </div>
                    ` : `
                        <button class="btn-add-cart" style="background: #9CA3AF;" disabled>
                            OUT OF STOCK
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    // Add to cart
    addToCart(productId, event) {
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            return;
        }

        // Get selected weight - default to first option
        let weight = '1kg';
        if (event && event.target) {
            const productCard = event.target.closest('.product-card');
            if (productCard) {
                const selectedWeight = productCard.querySelector('.weight-option.selected');
                if (selectedWeight) {
                    weight = selectedWeight.textContent;
                }
            }
        }
        
        // Use first weight option from product if available
        if (product.weight_options) {
            const weights = product.weight_options.split(',');
            weight = weights[0] + (product.unit || 'kg');
        }

        console.log('Adding to cart:', product.name, weight);
        cart.addItem(product, weight);
    }

    // Buy now - Require login and open checkout
    buyNow(productId, event) {
        console.log('Buy Now clicked for product:', productId);
        
        const product = this.products.find(p => p.id === productId);
        if (!product) {
            console.error('Product not found:', productId);
            utils.showToast('Product not found', 'error');
            return;
        }
        
        if (!auth.isLoggedIn()) {
            utils.showToast('Please login to buy products', 'warning');
            auth.showLoginModal();
            return;
        }
        
        // Add to cart first
        this.addToCart(productId, event);
        
        // Show cart sidebar
        setTimeout(() => {
            cart.show();
        }, 300);
        
        utils.showToast('Product added! Proceed to checkout.', 'success');
    }

    // Bulk order - Direct WhatsApp redirect with admin tracking
    async bulkOrder(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;

        // Create WhatsApp message
        const message = `Hello! I'm interested in bulk order for:\n\n` +
                       `📦 Product: ${product.name}\n` +
                       `💰 Price: ₹${product.price}/${product.unit}\n` +
                       `📝 Description: ${product.description}\n\n` +
                       `Please share bulk pricing and availability. Thank you!`;
        
        // Get user details if available
        const user = auth.getCurrentUser();
        const customerName = user?.name || 'Guest User';
        const customerPhone = user?.phone_number || user?.phone || 'Not Available';
        
        // Save quick order to admin panel
        try {
            await fetch('/api/quick-orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    customer_name: customerName,
                    customer_phone: customerPhone,
                    message: message
                })
            });
        } catch (error) {
            console.error('Failed to save quick order:', error);
        }
        
        const encodedMessage = encodeURIComponent(message);
        const whatsappUrl = `https://wa.me/916201530654?text=${encodedMessage}`;
        
        // Open WhatsApp in new tab
        window.open(whatsappUrl, '_blank');
        
        utils.showToast('Bulk order request sent! Check your WhatsApp.', 'success');
    }

    // Toggle love (heart icon) - requires login
    async toggleLove(productId) {
        // Check if user is logged in
        if (!auth.isLoggedIn()) {
            utils.showToast('Please login to add products to your favorites', 'warning');
            auth.showLoginModal();
            return;
        }

        try {
            const product = this.products.find(p => p.id === productId);
            if (!product) return;

            const heartIcon = document.querySelector(`.loved-heart[data-product-id="${productId}"]`);
            const lovedCountEl = document.getElementById(`loved-count-${productId}`);
            
            if (!heartIcon || !lovedCountEl) return;

            // Toggle loved status
            const isCurrentlyLoved = heartIcon.classList.contains('active');
            const currentCount = parseInt(lovedCountEl.textContent) || 0;
            
            if (isCurrentlyLoved) {
                // Unlike - decrease count
                const newCount = Math.max(0, currentCount - 1);
                lovedCountEl.textContent = newCount + 'k';
                heartIcon.classList.remove('active');
                heartIcon.classList.add('inactive');
                product.loved_by = newCount;
                utils.showToast('Removed from favorites', 'info');
            } else {
                // Like - increase count
                const newCount = currentCount + 1;
                lovedCountEl.textContent = newCount + 'k';
                heartIcon.classList.remove('inactive');
                heartIcon.classList.add('active');
                product.loved_by = newCount;
                utils.showToast('Added to favorites!', 'success');
            }

            // Update in backend
            await this.updateProductLoved(productId, product.loved_by);

        } catch (error) {
            console.error('Toggle love error:', error);
            utils.showToast('Failed to update. Please try again.', 'error');
        }
    }

    // Update product loved count in backend
    async updateProductLoved(productId, lovedCount) {
        try {
            await fetch(`/api/products/${productId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    loved_by: lovedCount
                })
            });
        } catch (error) {
            console.error('Failed to update loved count:', error);
        }
    }

    // Load more products
    async loadMoreProducts() {
        const btn = document.getElementById('load-more-products');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Loading...';
        btn.disabled = true;
        
        await this.loadProducts();
        
        btn.innerHTML = originalText;
        btn.disabled = false;
    }

    // Handle quick order form
    async handleQuickOrder(formData) {
        try {
            utils.showLoading();
            
            const orderData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                requirements: formData.get('requirements')
            };

            const result = await api.submitContactForm(orderData);
            
            if (result.success) {
                utils.showToast('Your message has been sent successfully!', 'success');
                document.getElementById('quick-order-form').reset();
            } else {
                throw new Error(result.message || 'Failed to send message');
            }
            
        } catch (error) {
            console.error('Quick order error:', error);
            utils.showToast('Failed to send message. Please try again.', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Open bulk order modal
    openBulkOrderModal(product = null) {
        const modal = utils.createModal(
            'Bulk Order Request',
            `
                <form id="bulk-order-form" class="space-y-4">
                    ${product ? `
                        <div class="bg-gray-50 p-4 rounded-lg">
                            <h4 class="font-semibold mb-2">Selected Product:</h4>
                            <div class="flex items-center gap-3">
                                <img src="${product.image_url}" alt="${product.name}" class="w-16 h-16 object-cover rounded"
                                     onerror="this.src='/images/placeholder-product.jpg'">
                                <div>
                                    <div class="font-medium">${product.name}</div>
                                    <div class="text-sm text-gray-500">₹${product.price}/${product.unit}</div>
                                </div>
                            </div>
                        </div>
                        <input type="hidden" name="product_name" value="${product.name}">
                    ` : ''}
                    
                    <div class="form-group">
                        <label for="bulk_name">Your Name *</label>
                        <input type="text" id="bulk_name" name="name" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="bulk_email">Email Address *</label>
                        <input type="email" id="bulk_email" name="email" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="bulk_phone">Phone Number *</label>
                        <input type="tel" id="bulk_phone" name="phone" class="form-control" required>
                    </div>

                    <div class="form-group">
                        <label for="bulk_quantity">Quantity Required</label>
                        <input type="text" id="bulk_quantity" name="quantity" class="form-control" 
                               placeholder="e.g., 100kg, 50 bags, etc.">
                    </div>

                    <div class="form-group">
                        <label for="bulk_requirements">Requirements *</label>
                        <textarea id="bulk_requirements" name="requirements" rows="4" class="form-control" required
                                  placeholder="Please describe your bulk order requirements in detail"></textarea>
                    </div>
                </form>
            `,
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                },
                {
                    text: 'Send Request',
                    class: 'btn-primary',
                    onclick: 'app.submitBulkOrder(this.closest(\'.modal\'))'
                }
            ]
        );
    }

    // Submit bulk order
    async submitBulkOrder(modal) {
        const form = modal.querySelector('#bulk-order-form');
        const formData = new FormData(form);
        
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        try {
            utils.showLoading();
            
            const result = await api.submitBulkOrderRequest(Object.fromEntries(formData));
            
            if (result.success) {
                utils.showToast('Bulk order request sent successfully!', 'success');
                modal.remove();
            } else {
                throw new Error(result.message || 'Failed to send request');
            }
            
        } catch (error) {
            console.error('Bulk order error:', error);
            utils.showToast('Failed to send request. Please try again.', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Handle scroll effects
    handleScroll() {
        const header = document.querySelector('header');
        
        if (window.scrollY > 100) {
            header.classList.add('shadow-lg');
        } else {
            header.classList.remove('shadow-lg');
        }
        
        // Animate elements on scroll
        this.animateOnScroll();
    }

    // Animate elements on scroll
    animateOnScroll() {
        const elements = document.querySelectorAll('.animate-on-scroll');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-fadeInUp');
            }
        });
    }
}

// Global functions
window.scrollToSection = function(sectionId) {
    utils.scrollToSection(sectionId);
};

window.openBulkOrderModal = function() {
    app.openBulkOrderModal();
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SatyamGoldApp();
});