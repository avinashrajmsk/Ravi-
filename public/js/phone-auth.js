// Phone.email SMS OTP Authentication System
// CLIENT ID: 12468569854913964682
// API Key: pyYJ37IeK21p6wySS7IdaB0bXzsfcSde

// Phone.email API configuration
const PHONE_EMAIL_CONFIG = {
    CLIENT_ID: '12468569854913964682',
    API_KEY: 'pyYJ37IeK21p6wySS7IdaB0bXzsfcSde',
    BASE_URL: 'https://api.phone.email'
};

class PhoneAuthManager {
    constructor() {
        this.currentUser = null;
        this.authChangeListeners = [];
        this.otpSession = null;
        this.init();
    }

    async init() {
        // Check if user is logged in from localStorage
        const savedUser = localStorage.getItem('satyam_gold_user');
        if (savedUser) {
            try {
                this.currentUser = JSON.parse(savedUser);
                this.updateAuthUI(true);
            } catch (e) {
                localStorage.removeItem('satyam_gold_user');
            }
        }
    }

    // Check if user is logged in
    isLoggedIn() {
        return !!this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Add auth change listener
    onAuthChange(callback) {
        this.authChangeListeners.push(callback);
    }

    // Update UI based on auth state
    updateAuthUI(isLoggedIn) {
        const authButton = document.getElementById('auth-button');
        const userInfo = document.getElementById('user-info');
        
        if (authButton) {
            if (isLoggedIn) {
                const userName = this.currentUser?.name || `+${this.currentUser?.phone}`;
                const userInitial = this.currentUser?.name?.charAt(0) || 'U';
                
                authButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            ${userInitial}
                        </div>
                        <span class="hidden md:block text-sm">${userName}</span>
                        <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                `;
                authButton.onclick = () => this.showUserMenu();
            } else {
                authButton.innerHTML = `
                    <i class="fas fa-user mr-2"></i>
                    <span class="hidden md:inline">Login</span>
                `;
                authButton.onclick = () => this.showLoginModal();
            }
        }
    }

    // Show login modal with mobile number input (Flipkart-style)
    showLoginModal() {
        const modal = utils.createModal(
            'Login to Your Account',
            this.createLoginFormHTML(),
            []
        );
        
        // Add mobile login form handler
        modal.querySelector('#mobile-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.sendOTP(new FormData(e.target));
        });

        // Add OTP verification form handler
        modal.querySelector('#otp-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.verifyOTP(new FormData(e.target));
        });

        // Add back to mobile button handler
        modal.querySelector('#back-to-mobile').addEventListener('click', () => {
            this.showMobileStep();
        });
    }

    // Create login form HTML (Flipkart-style)
    createLoginFormHTML() {
        return `
            <!-- Mobile Number Step -->
            <div id="mobile-step">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-mobile-alt text-2xl text-primary"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Login</h3>
                    <p class="text-gray-600 text-sm">We will send you an <strong>One Time Password</strong> on this mobile number</p>
                </div>

                <form id="mobile-form" class="space-y-4">
                    <div class="form-group">
                        <label for="mobile_number" class="block text-sm font-medium text-gray-700 mb-2">Enter Mobile Number</label>
                        <div class="relative">
                            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <span class="text-gray-500 text-sm">+91</span>
                            </div>
                            <input 
                                type="tel" 
                                id="mobile_number" 
                                name="mobile" 
                                class="form-control pl-12" 
                                required
                                placeholder="Enter 10-digit mobile number"
                                pattern="[6-9][0-9]{9}"
                                maxlength="10"
                                title="Enter a valid 10-digit mobile number starting with 6-9"
                            >
                        </div>
                        <p class="text-xs text-gray-500 mt-1">By continuing, you agree to Satyam Gold's Terms of Use and Privacy Policy.</p>
                    </div>
                    
                    <button type="submit" class="w-full bg-primary hover:bg-accent text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        SEND OTP
                    </button>
                </form>
            </div>

            <!-- OTP Verification Step -->
            <div id="otp-step" class="hidden">
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-shield-alt text-2xl text-green-600"></i>
                    </div>
                    <h3 class="text-xl font-semibold mb-2">Verify with OTP</h3>
                    <p class="text-gray-600 text-sm">OTP sent to <span id="sent-to-number" class="font-medium"></span></p>
                </div>

                <form id="otp-form" class="space-y-4">
                    <div class="form-group">
                        <label for="otp_code" class="block text-sm font-medium text-gray-700 mb-2">Enter OTP</label>
                        <input 
                            type="text" 
                            id="otp_code" 
                            name="otp" 
                            class="form-control text-center text-2xl tracking-widest" 
                            required
                            placeholder="000000"
                            maxlength="6"
                            pattern="[0-9]{6}"
                            title="Enter 6-digit OTP"
                        >
                    </div>

                    <div class="flex space-x-3">
                        <button type="button" id="back-to-mobile" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors">
                            Change Number
                        </button>
                        <button type="submit" class="flex-1 bg-primary hover:bg-accent text-white py-3 px-4 rounded-lg font-medium transition-colors">
                            VERIFY OTP
                        </button>
                    </div>

                    <div class="text-center">
                        <button type="button" id="resend-otp" class="text-sm text-primary hover:text-accent font-medium" disabled>
                            Resend OTP in <span id="resend-timer">30</span>s
                        </button>
                    </div>
                </form>
            </div>
        `;
    }

    // Send OTP to mobile number
    async sendOTP(formData) {
        const mobile = formData.get('mobile');
        
        // Validate Indian mobile number
        if (!/^[6-9][0-9]{9}$/.test(mobile)) {
            utils.showToast('Please enter a valid 10-digit mobile number', 'error');
            return;
        }

        const fullMobile = `91${mobile}`; // Add country code

        try {
            utils.showLoading();

            const response = await fetch(`${PHONE_EMAIL_CONFIG.BASE_URL}/authentication/sendotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PHONE_EMAIL_CONFIG.API_KEY}`
                },
                body: JSON.stringify({
                    client_id: PHONE_EMAIL_CONFIG.CLIENT_ID,
                    phone_number: fullMobile
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send OTP');
            }

            if (data.success) {
                this.otpSession = {
                    phone: fullMobile,
                    session_id: data.session_id,
                    display_phone: `+91 ${mobile}`
                };

                // Show OTP step
                this.showOTPStep();
                utils.showToast('OTP sent successfully!', 'success');
            } else {
                throw new Error(data.message || 'Failed to send OTP');
            }

        } catch (error) {
            console.error('Send OTP error:', error);
            utils.showToast('Failed to send OTP: ' + error.message, 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Verify OTP
    async verifyOTP(formData) {
        const otp = formData.get('otp');
        
        if (!this.otpSession) {
            utils.showToast('Please request OTP first', 'error');
            return;
        }

        if (!/^[0-9]{6}$/.test(otp)) {
            utils.showToast('Please enter a valid 6-digit OTP', 'error');
            return;
        }

        try {
            utils.showLoading();

            const response = await fetch(`${PHONE_EMAIL_CONFIG.BASE_URL}/authentication/verifyotp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${PHONE_EMAIL_CONFIG.API_KEY}`
                },
                body: JSON.stringify({
                    client_id: PHONE_EMAIL_CONFIG.CLIENT_ID,
                    phone_number: this.otpSession.phone,
                    session_id: this.otpSession.session_id,
                    otp_code: otp
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to verify OTP');
            }

            if (data.success) {
                // Create user object
                const user = {
                    id: `phone_${this.otpSession.phone}`,
                    phone: this.otpSession.phone,
                    name: null, // Will ask for name later if needed
                    created_at: new Date().toISOString(),
                    login_method: 'phone'
                };

                // Save user
                this.currentUser = user;
                localStorage.setItem('satyam_gold_user', JSON.stringify(user));

                // Update UI
                this.updateAuthUI(true);

                // Notify listeners
                this.authChangeListeners.forEach(callback => callback(this.currentUser));

                utils.showToast('Login successful!', 'success');
                document.querySelector('.modal')?.remove();

                // Ask for name if first time
                if (!user.name) {
                    this.showNameModal();
                }

            } else {
                throw new Error(data.message || 'Invalid OTP');
            }

        } catch (error) {
            console.error('Verify OTP error:', error);
            utils.showToast('Failed to verify OTP: ' + error.message, 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Show OTP verification step
    showOTPStep() {
        const modal = document.querySelector('.modal');
        const mobileStep = modal.querySelector('#mobile-step');
        const otpStep = modal.querySelector('#otp-step');
        const sentToNumber = modal.querySelector('#sent-to-number');

        mobileStep.classList.add('hidden');
        otpStep.classList.remove('hidden');
        sentToNumber.textContent = this.otpSession.display_phone;

        // Start resend timer
        this.startResendTimer();
    }

    // Show mobile number step
    showMobileStep() {
        const modal = document.querySelector('.modal');
        const mobileStep = modal.querySelector('#mobile-step');
        const otpStep = modal.querySelector('#otp-step');

        otpStep.classList.add('hidden');
        mobileStep.classList.remove('hidden');
        
        // Clear OTP session
        this.otpSession = null;
    }

    // Start resend OTP timer
    startResendTimer() {
        const resendButton = document.querySelector('#resend-otp');
        const timerSpan = document.querySelector('#resend-timer');
        let timeLeft = 30;

        resendButton.disabled = true;
        
        const timer = setInterval(() => {
            timeLeft--;
            timerSpan.textContent = timeLeft;

            if (timeLeft <= 0) {
                clearInterval(timer);
                resendButton.disabled = false;
                resendButton.textContent = 'Resend OTP';
                resendButton.onclick = () => this.resendOTP();
            }
        }, 1000);
    }

    // Resend OTP
    async resendOTP() {
        if (!this.otpSession) return;

        const mobile = this.otpSession.phone.slice(2); // Remove country code
        const formData = new FormData();
        formData.set('mobile', mobile);
        
        await this.sendOTP(formData);
    }

    // Show name collection modal for first-time users
    showNameModal() {
        const modal = utils.createModal(
            'Complete Your Profile',
            `
                <div class="text-center mb-6">
                    <div class="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i class="fas fa-user text-2xl text-primary"></i>
                    </div>
                    <h3 class="text-lg font-semibold mb-2">What should we call you?</h3>
                    <p class="text-gray-600 text-sm">Help us personalize your experience</p>
                </div>

                <form id="name-form" class="space-y-4">
                    <div class="form-group">
                        <label for="user_name" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            id="user_name" 
                            name="name" 
                            class="form-control" 
                            required
                            placeholder="Enter your full name"
                            minlength="2"
                        >
                    </div>
                    
                    <div class="flex space-x-3">
                        <button type="button" onclick="this.closest('.modal').remove()" class="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors">
                            Skip
                        </button>
                        <button type="submit" class="flex-1 bg-primary hover:bg-accent text-white py-3 px-4 rounded-lg font-medium transition-colors">
                            Save
                        </button>
                    </div>
                </form>
            `,
            []
        );

        // Handle name form submission
        modal.querySelector('#name-form').addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            this.updateUserName(formData.get('name'));
        });
    }

    // Update user name
    updateUserName(name) {
        if (this.currentUser && name) {
            this.currentUser.name = name.trim();
            localStorage.setItem('satyam_gold_user', JSON.stringify(this.currentUser));
            this.updateAuthUI(true);
            utils.showToast('Profile updated successfully!', 'success');
        }
        document.querySelector('.modal')?.remove();
    }

    // Show user menu
    showUserMenu() {
        const existingMenu = document.getElementById('user-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const userName = this.currentUser?.name || 'User';
        const userPhone = this.currentUser?.phone ? `+${this.currentUser.phone}` : '';

        const menu = document.createElement('div');
        menu.id = 'user-menu';
        menu.className = 'absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50';
        menu.innerHTML = `
            <div class="p-3 border-b">
                <div class="font-medium text-sm">${userName}</div>
                <div class="text-xs text-gray-500">${userPhone}</div>
            </div>
            <div class="py-1">
                <button onclick="auth.showProfile()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    <i class="fas fa-user mr-2"></i>Profile
                </button>
                <button onclick="auth.showOrders()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    <i class="fas fa-shopping-bag mr-2"></i>My Orders
                </button>
                <button onclick="auth.showCart()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    <i class="fas fa-shopping-cart mr-2"></i>My Cart
                </button>
                <hr class="my-1">
                <button onclick="auth.logout()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 text-red-600">
                    <i class="fas fa-sign-out-alt mr-2"></i>Logout
                </button>
            </div>
        `;

        const authButton = document.getElementById('auth-button');
        authButton.style.position = 'relative';
        authButton.appendChild(menu);

        // Close menu when clicking outside
        setTimeout(() => {
            document.addEventListener('click', (e) => {
                if (!menu.contains(e.target) && !authButton.contains(e.target)) {
                    menu.remove();
                }
            }, { once: true });
        }, 100);
    }

    // Show user profile
    showProfile() {
        document.getElementById('user-menu')?.remove();
        
        const modal = utils.createModal(
            'My Profile',
            `
                <div class="space-y-4">
                    <div class="text-center">
                        <div class="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                            ${this.currentUser?.name?.charAt(0) || 'U'}
                        </div>
                        <h3 class="text-lg font-semibold">${this.currentUser?.name || 'User'}</h3>
                        <p class="text-gray-600">+${this.currentUser?.phone}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="grid grid-cols-1 gap-4 text-sm">
                            <div>
                                <span class="font-medium text-gray-700">Account Created:</span>
                                <p class="text-gray-600">${new Date(this.currentUser?.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Login Method:</span>
                                <p class="text-gray-600">Mobile Number (SMS OTP)</p>
                            </div>
                        </div>
                    </div>

                    <button onclick="auth.showEditProfile()" class="w-full bg-primary hover:bg-accent text-white py-2 px-4 rounded-lg font-medium transition-colors">
                        Edit Profile
                    </button>
                </div>
            `,
            [
                {
                    text: 'Close',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\\.modal\\).remove()'
                }
            ]
        );
    }

    // Show edit profile modal
    showEditProfile() {
        document.querySelector('.modal')?.remove();
        
        const modal = utils.createModal(
            'Edit Profile',
            `
                <form id="edit-profile-form" class="space-y-4">
                    <div class="form-group">
                        <label for="edit_name" class="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                        <input 
                            type="text" 
                            id="edit_name" 
                            name="name" 
                            class="form-control" 
                            required
                            value="${this.currentUser?.name || ''}"
                            placeholder="Enter your full name"
                            minlength="2"
                        >
                    </div>
                    
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Mobile Number</label>
                        <input 
                            type="text" 
                            class="form-control bg-gray-100" 
                            value="+${this.currentUser?.phone}"
                            disabled
                        >
                        <p class="text-xs text-gray-500 mt-1">Mobile number cannot be changed</p>
                    </div>
                </form>
            `,
            [
                {
                    text: 'Cancel',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\\.modal\\).remove()'
                },
                {
                    text: 'Save Changes',
                    class: 'btn-primary',
                    onclick: 'auth.saveProfileChanges()'
                }
            ]
        );
    }

    // Save profile changes
    saveProfileChanges() {
        const form = document.getElementById('edit-profile-form');
        const formData = new FormData(form);
        const name = formData.get('name');

        if (name && name.trim()) {
            this.updateUserName(name.trim());
        } else {
            utils.showToast('Please enter a valid name', 'error');
        }
    }

    // Show user orders
    async showOrders() {
        document.getElementById('user-menu')?.remove();
        
        try {
            utils.showLoading();
            
            // Fetch user orders from API
            const response = await fetch(`/api/orders/user/${this.currentUser.id}`);
            let orders = [];
            
            if (response.ok) {
                const data = await response.json();
                orders = data.orders || [];
            }

            const ordersHTML = orders.length > 0 ? 
                orders.map(order => `
                    <div class="border rounded-lg p-4 mb-3">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <h4 class="font-semibold">Order #${order.id}</h4>
                                <p class="text-sm text-gray-600">${new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                            <span class="px-2 py-1 rounded text-xs font-medium ${this.getOrderStatusClass(order.status)}">${order.status}</span>
                        </div>
                        <div class="text-sm text-gray-700">
                            <p><strong>Items:</strong> ${order.total_items} items</p>
                            <p><strong>Amount:</strong> ₹${order.total_amount}</p>
                            ${order.status_message ? `<p><strong>Status:</strong> ${order.status_message}</p>` : ''}
                        </div>
                    </div>
                `).join('') : 
                `<div class="text-center py-8">
                    <i class="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p class="text-gray-600 mb-4">You haven't placed any orders yet. Start shopping to see your order history here.</p>
                    <button onclick="this.closest('.modal').remove(); utils.scrollToSection('products')" class="btn btn-primary">
                        Start Shopping
                    </button>
                </div>`;
            
            const modal = utils.createModal(
                'My Orders',
                ordersHTML,
                [
                    {
                        text: 'Close',
                        class: 'btn-secondary',
                        onclick: 'this.closest(\\.modal\\).remove()'
                    }
                ]
            );
            
        } catch (error) {
            console.error('Error fetching orders:', error);
            utils.showToast('Failed to load orders', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Show user cart
    showCart() {
        document.getElementById('user-menu')?.remove();
        
        // Get cart items from localStorage
        const cartItems = JSON.parse(localStorage.getItem('cart') || '[]');
        
        const cartHTML = cartItems.length > 0 ?
            `<div class="space-y-3 max-h-64 overflow-y-auto">
                ${cartItems.map(item => `
                    <div class="flex items-center space-x-3 p-3 border rounded-lg">
                        <img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover rounded">
                        <div class="flex-1">
                            <h4 class="font-medium text-sm">${item.name}</h4>
                            <p class="text-xs text-gray-600">Qty: ${item.quantity}</p>
                        </div>
                        <div class="text-right">
                            <p class="font-semibold text-sm">₹${item.price * item.quantity}</p>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="mt-4 pt-4 border-t">
                <div class="flex justify-between items-center mb-4">
                    <span class="font-semibold">Total: ₹${cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)}</span>
                </div>
                <button onclick="this.closest('.modal').remove(); cart.showCart()" class="w-full bg-primary hover:bg-accent text-white py-2 px-4 rounded-lg font-medium transition-colors">
                    View Full Cart
                </button>
            </div>` :
            `<div class="text-center py-8">
                <i class="fas fa-shopping-cart text-4xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold mb-2">Your Cart is Empty</h3>
                <p class="text-gray-600 mb-4">Add some products to your cart to see them here.</p>
                <button onclick="this.closest('.modal').remove(); utils.scrollToSection('products')" class="btn btn-primary">
                    Start Shopping
                </button>
            </div>`;

        const modal = utils.createModal(
            'My Cart',
            cartHTML,
            [
                {
                    text: 'Close',
                    class: 'btn-secondary',
                    onclick: 'this.closest(\\.modal\\).remove()'
                }
            ]
        );
    }

    // Get order status CSS class
    getOrderStatusClass(status) {
        switch (status?.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-purple-100 text-purple-800';
            case 'shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'delivered':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    }

    // Logout
    async logout() {
        document.getElementById('user-menu')?.remove();
        
        try {
            // Clear user data
            this.currentUser = null;
            localStorage.removeItem('satyam_gold_user');
            
            // Update UI
            this.updateAuthUI(false);
            
            // Notify listeners
            this.authChangeListeners.forEach(callback => callback(null));
            
            utils.showToast('Logged out successfully', 'success');
            
        } catch (error) {
            console.error('Logout error:', error);
            utils.showToast('Logout failed', 'error');
        }
    }

    // Require login for action
    requireLogin(callback, message = 'Please login to continue') {
        if (this.isLoggedIn()) {
            callback();
        } else {
            utils.showToast(message, 'warning');
            this.showLoginModal();
        }
    }
}

// Initialize Phone auth manager
window.auth = new PhoneAuthManager();