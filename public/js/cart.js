// Shopping Cart functionality

class ShoppingCart {
    constructor() {
        this.items = [];
        this.isOpen = false;
        this.loadFromStorage();
        this.bindEvents();
    }

    // Load cart from localStorage
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('satyam_gold_cart');
            if (saved) {
                this.items = JSON.parse(saved);
                this.updateUI();
            }
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            this.items = [];
        }
    }

    // Save cart to localStorage
    saveToStorage() {
        try {
            localStorage.setItem('satyam_gold_cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }

    // Add item to cart
    async addItem(product, weight = '1kg') {
        const existingItemIndex = this.items.findIndex(
            item => item.id === product.id && item.weight === weight
        );

        if (existingItemIndex > -1) {
            // Item exists, increment quantity
            this.items[existingItemIndex].quantity += 1;
        } else {
            // New item
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image_url,
                weight: weight,
                unit: product.unit,
                quantity: 1
            });
        }

        this.saveToStorage();
        this.updateUI();
        this.showAddedNotification(product.name, weight);
        
        // Save to database if user is logged in
        await this.saveToDatabase(product, weight);
    }
    
    // Save cart item to database
    async saveToDatabase(product, weight) {
        if (!window.auth || !auth.isLoggedIn()) {
            return; // Skip if not logged in
        }
        
        const user = auth.getCurrentUser();
        if (!user || !user.phone) {
            return;
        }
        
        try {
            await fetch('/api/cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_phone: user.phone,
                    product_id: product.id,
                    product_name: product.name,
                    product_price: product.price,
                    product_image: product.image_url,
                    quantity: 1,
                    weight: weight
                })
            });
            console.log('Cart item saved to database');
        } catch (error) {
            console.error('Failed to save cart to database:', error);
        }
    }
    
    // Load cart from database
    async loadFromDatabase() {
        if (!window.auth || !auth.isLoggedIn()) {
            return;
        }
        
        const user = auth.getCurrentUser();
        if (!user || !user.phone) {
            return;
        }
        
        try {
            const response = await fetch(`/api/cart?phone=${encodeURIComponent(user.phone)}`);
            const data = await response.json();
            
            if (data.success && data.cart_items && data.cart_items.length > 0) {
                // Merge database cart with local cart
                data.cart_items.forEach(dbItem => {
                    const existingIndex = this.items.findIndex(
                        item => item.id === dbItem.product_id && item.weight === dbItem.weight
                    );
                    
                    if (existingIndex === -1) {
                        this.items.push({
                            id: dbItem.product_id,
                            name: dbItem.product_name,
                            price: dbItem.product_price,
                            image: dbItem.product_image,
                            weight: dbItem.weight,
                            quantity: dbItem.quantity
                        });
                    }
                });
                
                this.saveToStorage();
                this.updateUI();
                console.log('Cart loaded from database');
            }
        } catch (error) {
            console.error('Failed to load cart from database:', error);
        }
    }

    // Remove item from cart
    removeItem(productId, weight) {
        this.items = this.items.filter(
            item => !(item.id === productId && item.weight === weight)
        );
        this.saveToStorage();
        this.updateUI();
        utils.showToast('Item removed from cart', 'info');
    }

    // Update item quantity
    updateQuantity(productId, weight, newQuantity) {
        const itemIndex = this.items.findIndex(
            item => item.id === productId && item.weight === weight
        );

        if (itemIndex > -1) {
            if (newQuantity <= 0) {
                this.removeItem(productId, weight);
            } else {
                this.items[itemIndex].quantity = newQuantity;
                this.saveToStorage();
                this.updateUI();
            }
        }
    }

    // Get cart total
    getTotal() {
        return this.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);
    }

    // Get total items count
    getTotalItems() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    }

    // Clear cart
    clear() {
        this.items = [];
        this.saveToStorage();
        this.updateUI();
    }

    // Show cart
    show() {
        this.isOpen = true;
        document.getElementById('cart-sidebar').classList.remove('translate-x-full');
        document.getElementById('cart-backdrop').classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    // Hide cart
    hide() {
        this.isOpen = false;
        document.getElementById('cart-sidebar').classList.add('translate-x-full');
        document.getElementById('cart-backdrop').classList.add('hidden');
        document.body.style.overflow = '';
    }

    // Toggle cart
    toggle() {
        if (this.isOpen) {
            this.hide();
        } else {
            this.show();
        }
    }

    // Update UI elements
    updateUI() {
        this.updateCartCounter();
        this.updateCartItems();
        this.updateCartTotal();
        this.toggleCartVisibility();
    }

    // Update cart counter
    updateCartCounter() {
        const counter = document.getElementById('cart-count');
        const totalItems = this.getTotalItems();
        
        if (totalItems > 0) {
            counter.textContent = totalItems;
            counter.classList.remove('hidden');
        } else {
            counter.classList.add('hidden');
        }
    }

    // Update cart items display
    updateCartItems() {
        const cartList = document.getElementById('cart-list');
        const emptyCart = document.getElementById('empty-cart');
        
        if (this.items.length === 0) {
            cartList.classList.add('hidden');
            emptyCart.classList.remove('hidden');
        } else {
            cartList.classList.remove('hidden');
            emptyCart.classList.add('hidden');
            
            cartList.innerHTML = this.items.map(item => this.createCartItemHTML(item)).join('');
        }
    }

    // Create cart item HTML
    createCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}" data-weight="${item.weight}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image" 
                     onerror="this.src='/images/placeholder-product.jpg'">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-weight">${item.weight}</div>
                    <div class="cart-item-price">${utils.formatCurrency(item.price * item.quantity)}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, '${item.weight}', ${item.quantity - 1})">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity(${item.id}, '${item.weight}', ${item.quantity + 1})">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="remove-item ml-2" onclick="cart.removeItem(${item.id}, '${item.weight}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Update cart total
    updateCartTotal() {
        const totalElement = document.getElementById('cart-total');
        if (totalElement) {
            totalElement.textContent = utils.formatCurrency(this.getTotal());
        }
    }

    // Toggle cart footer visibility
    toggleCartVisibility() {
        const footer = document.getElementById('cart-footer');
        if (this.items.length > 0) {
            footer.classList.remove('hidden');
        } else {
            footer.classList.add('hidden');
        }
    }

    // Show added notification
    showAddedNotification(productName, weight) {
        utils.showToast(`${productName} (${weight}) added to cart`, 'success');
        
        // Animate cart icon
        const cartBtn = document.getElementById('cart-btn');
        cartBtn.classList.add('animate-pulse');
        setTimeout(() => {
            cartBtn.classList.remove('animate-pulse');
        }, 1000);
    }

    // Bind event listeners
    bindEvents() {
        // Cart button
        document.getElementById('cart-btn').addEventListener('click', () => {
            this.toggle();
        });

        // Close cart
        document.getElementById('close-cart').addEventListener('click', () => {
            this.hide();
        });

        // Cart backdrop
        document.getElementById('cart-backdrop').addEventListener('click', () => {
            this.hide();
        });

        // Checkout button
        document.getElementById('checkout-btn').addEventListener('click', () => {
            this.openCheckoutModal();
        });

        // Escape key to close cart
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.hide();
            }
        });
    }

    // Open checkout modal
    openCheckoutModal() {
        if (this.items.length === 0) {
            utils.showToast('Your cart is empty', 'warning');
            return;
        }

        // Require login for checkout
        if (!auth.isLoggedIn()) {
            utils.showToast('Please login to proceed with checkout', 'warning');
            auth.showLoginModal();
            return;
        }

        const modal = utils.createModal(
            'Checkout',
            this.createCheckoutFormHTML(),
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\'.modal\').remove()'
                },
                {
                    text: 'Place Order',
                    class: 'btn-primary',
                    onclick: 'cart.processCheckout(this.closest(\'.modal\'))'
                }
            ]
        );

        // Add form validation
        this.bindCheckoutForm(modal);
    }

    // Create checkout form HTML
    createCheckoutFormHTML() {
        const orderSummary = this.items.map(item => `
            <div class="flex justify-between items-center py-2 border-b">
                <div>
                    <div class="font-medium">${item.name}</div>
                    <div class="text-sm text-gray-500">${item.weight} × ${item.quantity}</div>
                </div>
                <div class="font-medium">${utils.formatCurrency(item.price * item.quantity)}</div>
            </div>
        `).join('');

        // Get current user details for auto-fill (from localStorage with database data)
        const currentUser = auth.getCurrentUser();
        const userName = currentUser?.name || '';
        const userPhone = currentUser?.phone_number || currentUser?.phone || '';
        const userEmail = currentUser?.email || '';
        const userAddress = currentUser?.address || '';
        const userPincode = currentUser?.pincode || '';

        return `
            <div class="space-y-6">
                <!-- Order Summary -->
                <div>
                    <h4 class="font-semibold mb-4">Order Summary</h4>
                    <div class="border rounded-lg p-4">
                        ${orderSummary}
                        <div class="flex justify-between items-center pt-4 font-bold text-lg">
                            <span>Total:</span>
                            <span class="text-primary">${utils.formatCurrency(this.getTotal())}</span>
                        </div>
                    </div>
                </div>

                <!-- Customer Details -->
                <form id="checkout-form" class="space-y-4">
                    <div class="form-group">
                        <label for="customer_name">Full Name *</label>
                        <input type="text" id="customer_name" name="customer_name" class="form-control" 
                               value="${userName}" required>
                        ${userName ? '<p class="text-sm text-green-600 mt-1"><i class="fas fa-check-circle mr-1"></i>Auto-filled from your profile</p>' : ''}
                    </div>

                    <div class="form-group">
                        <label for="customer_email">Email Address (Optional)</label>
                        <input type="email" id="customer_email" name="customer_email" class="form-control" 
                               value="${userEmail}" placeholder="Enter your email address">
                    </div>

                    <div class="form-group">
                        <label for="customer_phone">Phone Number *</label>
                        <input type="tel" id="customer_phone" name="customer_phone" class="form-control" 
                               value="${userPhone}" required readonly>
                        ${userPhone ? '<p class="text-sm text-green-600 mt-1"><i class="fas fa-check-circle mr-1"></i>Verified phone number from login</p>' : ''}
                    </div>

                    <div class="form-group">
                        <label for="customer_address">Delivery Address *</label>
                        <textarea id="customer_address" name="customer_address" rows="4" class="form-control" required
                                  placeholder="Please provide your complete address including:&#10;• House/Building No. and Street&#10;• Landmark (if any)&#10;• City, State">${userAddress}</textarea>
                        ${userAddress ? '<p class="text-sm text-green-600 mt-1"><i class="fas fa-check-circle mr-1"></i>Auto-filled from your previous order</p>' : ''}
                    </div>

                    <div class="form-group">
                        <label for="customer_pincode">PIN Code *</label>
                        <input type="text" id="customer_pincode" name="customer_pincode" class="form-control" 
                               value="${userPincode}" pattern="[0-9]{6}" maxlength="6" required
                               placeholder="Enter 6-digit PIN code">
                        ${userPincode ? '<p class="text-sm text-green-600 mt-1"><i class="fas fa-check-circle mr-1"></i>Auto-filled from your previous order</p>' : ''}
                    </div>

                    <div class="form-group">
                        <label for="order_notes">Special Instructions (Optional)</label>
                        <textarea id="order_notes" name="order_notes" rows="2" class="form-control" 
                                  placeholder="Any special instructions for delivery (e.g., delivery time preference, contact person, etc.)"></textarea>
                    </div>

                    <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h5 class="font-semibold text-blue-800 mb-2">
                            <i class="fas fa-info-circle mr-2"></i>Order Information
                        </h5>
                        <ul class="text-sm text-blue-700 space-y-1">
                            <li>• We will call you to confirm the order before processing</li>
                            <li>• Delivery typically takes 1-2 business days</li>
                            <li>• <strong>Cash on Delivery</strong> available</li>
                            <li>• Free delivery on orders above ₹500</li>
                        </ul>
                    </div>
                </form>
            </div>
        `;
    }

    // Bind checkout form events
    bindCheckoutForm(modal) {
        const form = modal.querySelector('#checkout-form');
        const phoneInput = form.querySelector('#customer_phone');
        const emailInput = form.querySelector('#customer_email');

        // Phone validation
        phoneInput.addEventListener('input', (e) => {
            const value = e.target.value.replace(/\D/g, '');
            e.target.value = value;
            
            if (value.length === 10) {
                e.target.classList.remove('border-red-500');
                e.target.classList.add('border-green-500');
            } else {
                e.target.classList.remove('border-green-500');
                e.target.classList.add('border-red-500');
            }
        });

        // Email validation
        emailInput.addEventListener('blur', (e) => {
            if (utils.validateEmail(e.target.value)) {
                e.target.classList.remove('border-red-500');
                e.target.classList.add('border-green-500');
            } else {
                e.target.classList.remove('border-green-500');
                e.target.classList.add('border-red-500');
            }
        });
    }

    // Process checkout
    async processCheckout(modal) {
        const form = modal.querySelector('#checkout-form');
        const formData = new FormData(form);
        
        // Validate form
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        // Validate phone
        const phone = formData.get('customer_phone');
        if (!utils.validatePhone(phone)) {
            utils.showToast('Please enter a valid 10-digit phone number', 'error');
            return;
        }

        // Validate email
        const email = formData.get('customer_email');
        if (!utils.validateEmail(email)) {
            utils.showToast('Please enter a valid email address', 'error');
            return;
        }

        try {
            utils.showLoading();
            
            const customerAddress = formData.get('customer_address');
            const customerPincode = formData.get('customer_pincode');
            const customerPhone = formData.get('customer_phone');
            const customerName = formData.get('customer_name');
            const customerEmail = formData.get('customer_email');
            
            // Save address to user profile in database
            try {
                await fetch('/api/users', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        phone_number: customerPhone,
                        name: customerName,
                        email: customerEmail,
                        address: customerAddress,
                        pincode: customerPincode
                    })
                });
                
                // Update local storage with new address data
                const currentUser = auth.getCurrentUser();
                if (currentUser) {
                    currentUser.address = customerAddress;
                    currentUser.pincode = customerPincode;
                    localStorage.setItem('satyam_user_data', JSON.stringify(currentUser));
                }
            } catch (err) {
                console.error('Failed to update user address:', err);
                // Continue with order even if address save fails
            }
            
            const orderData = {
                order_number: utils.generateOrderNumber(),
                customer_name: customerName,
                customer_email: customerEmail,
                customer_phone: customerPhone,
                customer_address: customerAddress + '\nPIN: ' + customerPincode,
                order_notes: formData.get('order_notes'),
                items: this.items,
                total_amount: this.getTotal(),
                status: 'Pending',
                payment_method: 'Cash on Delivery'
            };

            const result = await api.createOrder(orderData);
            
            if (result.success) {
                utils.showToast('Order placed successfully!', 'success');
                modal.remove();
                this.clear();
                this.hide();
                
                // Show order confirmation
                this.showOrderConfirmation(result.order);
            } else {
                throw new Error(result.message || 'Failed to place order');
            }
            
        } catch (error) {
            console.error('Checkout error:', error);
            utils.showToast('Failed to place order. Please try again.', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Show order confirmation
    showOrderConfirmation(order) {
        const modal = utils.createModal(
            'Order Confirmed!',
            `
                <div class="text-center space-y-4">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                        <i class="fas fa-check text-2xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold">Thank you for your order!</h3>
                    <p class="text-gray-600">Your order has been placed successfully.</p>
                    
                    <div class="bg-gray-50 rounded-lg p-4 text-left">
                        <div class="space-y-2">
                            <div><strong>Order Number:</strong> ${order.order_number}</div>
                            <div><strong>Total Amount:</strong> ${utils.formatCurrency(order.total_amount)}</div>
                            <div><strong>Status:</strong> <span class="text-yellow-600">${order.status}</span></div>
                        </div>
                    </div>
                    
                    <p class="text-sm text-gray-500">
                        We'll contact you shortly to confirm your order details and delivery time.
                        You can track your order status by contacting us.
                    </p>
                </div>
            `,
            [
                {
                    text: 'Continue Shopping',
                    class: 'btn-primary',
                    onclick: 'this.closest(\'.modal\').remove(); utils.scrollToSection(\'products\')'
                }
            ]
        );
    }
}

// Initialize cart
window.cart = new ShoppingCart();
