// Supabase Configuration and Authentication

// Supabase configuration
const SUPABASE_URL = 'https://pnigtdlekvlrbgmpqjcx.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuaWd0ZGxla3ZscmJnbXBxamN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY4MTU0NjMsImV4cCI6MjA3MjM5MTQ2M30.U8HBtp7MhNtFux7elCsojIWqzvSMqbVZeYoIHfCsxyY';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authChangeListeners = [];
        this.init();
    }

    async init() {
        // Check current session
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
            this.currentUser = session.user;
            this.updateAuthUI(true);
        }

        // Listen to auth changes
        supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            
            if (session?.user) {
                this.currentUser = session.user;
                this.updateAuthUI(true);
            } else {
                this.currentUser = null;
                this.updateAuthUI(false);
            }

            // Notify listeners
            this.authChangeListeners.forEach(callback => callback(this.currentUser));
        });
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
        const cartBtn = document.getElementById('cart-btn');
        
        if (authButton) {
            if (isLoggedIn) {
                authButton.innerHTML = `
                    <div class="flex items-center space-x-2">
                        <div class="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold">
                            ${this.currentUser?.user_metadata?.name?.charAt(0) || this.currentUser?.email?.charAt(0) || 'U'}
                        </div>
                        <span class="hidden md:block text-sm">${this.currentUser?.user_metadata?.name || 'User'}</span>
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

    // Show login modal
    showLoginModal() {
        const modal = utils.createModal(
            'Login to Your Account',
            this.createLoginFormHTML(),
            []
        );
        
        // Add Google login button click handler
        modal.querySelector('#google-login-btn').addEventListener('click', () => {
            this.loginWithGoogle();
        });

        // Add email login form handler
        modal.querySelector('#login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.loginWithEmail(new FormData(e.target));
        });

        // Add signup form handler
        modal.querySelector('#signup-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.signupWithEmail(new FormData(e.target));
        });

        // Toggle between login and signup
        modal.querySelector('#show-signup').addEventListener('click', (e) => {
            e.preventDefault();
            modal.querySelector('#login-section').classList.add('hidden');
            modal.querySelector('#signup-section').classList.remove('hidden');
        });

        modal.querySelector('#show-login').addEventListener('click', (e) => {
            e.preventDefault();
            modal.querySelector('#signup-section').classList.add('hidden');
            modal.querySelector('#login-section').classList.remove('hidden');
        });
    }

    // Create login form HTML
    createLoginFormHTML() {
        return `
            <!-- Google Login -->
            <div class="text-center mb-6">
                <button id="google-login-btn" class="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-3">
                    <svg class="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span>Continue with Google</span>
                </button>
            </div>

            <div class="text-center mb-6">
                <span class="bg-white px-3 text-gray-500 text-sm">OR</span>
                <div class="border-t border-gray-200 -mt-2"></div>
            </div>

            <!-- Login Section -->
            <div id="login-section">
                <h3 class="text-lg font-semibold mb-4 text-center">Login with Email</h3>
                <form id="login-form" class="space-y-4">
                    <div class="form-group">
                        <label for="login_email">Email Address</label>
                        <input type="email" id="login_email" name="email" class="form-control" required
                               placeholder="Enter your email">
                    </div>
                    
                    <div class="form-group">
                        <label for="login_password">Password</label>
                        <input type="password" id="login_password" name="password" class="form-control" required
                               placeholder="Enter your password">
                    </div>
                    
                    <button type="submit" class="w-full bg-primary hover:bg-accent text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Login
                    </button>
                    
                    <p class="text-center text-sm text-gray-600">
                        Don't have an account? 
                        <a href="#" id="show-signup" class="text-primary hover:text-accent font-medium">Sign up</a>
                    </p>
                </form>
            </div>

            <!-- Signup Section -->
            <div id="signup-section" class="hidden">
                <h3 class="text-lg font-semibold mb-4 text-center">Create Account</h3>
                <form id="signup-form" class="space-y-4">
                    <div class="form-group">
                        <label for="signup_name">Full Name</label>
                        <input type="text" id="signup_name" name="name" class="form-control" required
                               placeholder="Enter your full name">
                    </div>
                    
                    <div class="form-group">
                        <label for="signup_email">Email Address</label>
                        <input type="email" id="signup_email" name="email" class="form-control" required
                               placeholder="Enter your email">
                    </div>
                    
                    <div class="form-group">
                        <label for="signup_password">Password</label>
                        <input type="password" id="signup_password" name="password" class="form-control" required
                               placeholder="Create a password" minlength="6">
                    </div>
                    
                    <div class="form-group">
                        <label for="signup_confirm_password">Confirm Password</label>
                        <input type="password" id="signup_confirm_password" name="confirm_password" class="form-control" required
                               placeholder="Confirm your password">
                    </div>
                    
                    <button type="submit" class="w-full bg-primary hover:bg-accent text-white py-3 px-4 rounded-lg font-medium transition-colors">
                        Create Account
                    </button>
                    
                    <p class="text-center text-sm text-gray-600">
                        Already have an account? 
                        <a href="#" id="show-login" class="text-primary hover:text-accent font-medium">Login</a>
                    </p>
                </form>
            </div>
        `;
    }

    // Login with Google
    async loginWithGoogle() {
        try {
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin
                }
            });

            if (error) {
                utils.showToast('Google login failed: ' + error.message, 'error');
            }
        } catch (error) {
            console.error('Google login error:', error);
            utils.showToast('Google login failed', 'error');
        }
    }

    // Login with email
    async loginWithEmail(formData) {
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            utils.showLoading();
            
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                utils.showToast('Login failed: ' + error.message, 'error');
                return;
            }

            utils.showToast('Login successful!', 'success');
            document.querySelector('.modal')?.remove();
            
        } catch (error) {
            console.error('Login error:', error);
            utils.showToast('Login failed', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Signup with email
    async signupWithEmail(formData) {
        const name = formData.get('name');
        const email = formData.get('email');
        const password = formData.get('password');
        const confirmPassword = formData.get('confirm_password');

        if (password !== confirmPassword) {
            utils.showToast('Passwords do not match', 'error');
            return;
        }

        try {
            utils.showLoading();
            
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        name: name,
                    }
                }
            });

            if (error) {
                utils.showToast('Signup failed: ' + error.message, 'error');
                return;
            }

            if (data?.user && !data?.user?.email_confirmed_at) {
                utils.showToast('Please check your email for verification link', 'info');
            } else {
                utils.showToast('Account created successfully!', 'success');
            }
            
            document.querySelector('.modal')?.remove();
            
        } catch (error) {
            console.error('Signup error:', error);
            utils.showToast('Signup failed', 'error');
        } finally {
            utils.hideLoading();
        }
    }

    // Show user menu
    showUserMenu() {
        const existingMenu = document.getElementById('user-menu');
        if (existingMenu) {
            existingMenu.remove();
            return;
        }

        const menu = document.createElement('div');
        menu.id = 'user-menu';
        menu.className = 'absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border z-50';
        menu.innerHTML = `
            <div class="p-3 border-b">
                <div class="font-medium text-sm">${this.currentUser?.user_metadata?.name || 'User'}</div>
                <div class="text-xs text-gray-500">${this.currentUser?.email}</div>
            </div>
            <div class="py-1">
                <button onclick="auth.showProfile()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    <i class="fas fa-user mr-2"></i>Profile
                </button>
                <button onclick="auth.showOrders()" class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100">
                    <i class="fas fa-shopping-bag mr-2"></i>My Orders
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
                            ${this.currentUser?.user_metadata?.name?.charAt(0) || this.currentUser?.email?.charAt(0) || 'U'}
                        </div>
                        <h3 class="text-lg font-semibold">${this.currentUser?.user_metadata?.name || 'User'}</h3>
                        <p class="text-gray-600">${this.currentUser?.email}</p>
                    </div>
                    
                    <div class="bg-gray-50 p-4 rounded-lg">
                        <div class="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span class="font-medium text-gray-700">Account Created:</span>
                                <p class="text-gray-600">${new Date(this.currentUser?.created_at).toLocaleDateString()}</p>
                            </div>
                            <div>
                                <span class="font-medium text-gray-700">Email Verified:</span>
                                <p class="text-gray-600">${this.currentUser?.email_confirmed_at ? 'Yes' : 'No'}</p>
                            </div>
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

    // Show user orders (placeholder)
    showOrders() {
        document.getElementById('user-menu')?.remove();
        
        const modal = utils.createModal(
            'My Orders',
            `
                <div class="text-center py-8">
                    <i class="fas fa-shopping-bag text-4xl text-gray-300 mb-4"></i>
                    <h3 class="text-lg font-semibold mb-2">No Orders Yet</h3>
                    <p class="text-gray-600 mb-4">You haven't placed any orders yet. Start shopping to see your order history here.</p>
                    <button onclick="this.closest('.modal').remove(); utils.scrollToSection('products')" class="btn btn-primary">
                        Start Shopping
                    </button>
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
    async logout() {
        document.getElementById('user-menu')?.remove();
        
        try {
            const { error } = await supabase.auth.signOut();
            if (error) {
                utils.showToast('Logout failed: ' + error.message, 'error');
                return;
            }
            
            utils.showToast('Logged out successfully', 'success');
            
            // Clear cart if needed
            // cart.clear();
            
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

// Initialize auth manager
window.auth = new AuthManager();