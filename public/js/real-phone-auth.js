/**
 * Real Phone.email SMS OTP Authentication System
 * Simple implementation like working test file
 * Client ID: 12468569854913964682
 */
class RealPhoneAuthManager {
    constructor() {
        this.currentUser = null;
        this.authChangeListeners = [];
        this.clientId = '12468569854913964682';
        this.init();
    }

    init() {
        // Check for existing session
        this.checkExistingSession();
        
        // Setup callback FIRST
        this.setupPhoneEmailCallback();
        
        // Load SDK
        this.loadPhoneEmailSDK();
        
        // Initialize auth button
        setTimeout(() => {
            this.initAuthButton();
        }, 1000);
    }

    setupPhoneEmailCallback() {
        // Global callback for Phone.email
        window.phoneEmailListener = (userObj) => {
            console.log('Phone.email SUCCESS:', userObj);
            this.handlePhoneEmailSuccess(userObj);
        };
        console.log('Callback setup done');
    }

    loadPhoneEmailSDK() {
        // Check if already loaded
        if (document.querySelector('script[src*="phone.email"]')) {
            console.log('SDK already loaded');
            return;
        }
        
        const script = document.createElement('script');
        script.src = 'https://www.phone.email/sign_in_button_v1.js';
        script.async = true;
        document.head.appendChild(script);
        console.log('SDK loading...');
    }

    initAuthButton() {
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            authButton.replaceWith(authButton.cloneNode(true));
            const newAuthButton = document.getElementById('auth-button');
            
            newAuthButton.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.isLoggedIn()) {
                    this.showUserMenu();
                } else {
                    this.showLoginModal();
                }
            });
            
            this.updateAuthButton();
            console.log('Auth button ready');
        }
    }

    updateAuthButton() {
        const authButton = document.getElementById('auth-button');
        if (authButton) {
            if (this.isLoggedIn()) {
                const user = this.getCurrentUser();
                authButton.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span class="hidden md:inline">${user?.name || 'User'}</span>
                `;
            } else {
                authButton.innerHTML = `
                    <i class="fas fa-user"></i>
                    <span class="hidden md:inline">Login</span>
                `;
            }
        }
    }

    showLoginModal() {
        console.log('Opening login modal');
        
        // Remove existing
        const existing = document.getElementById('loginModal');
        if (existing) existing.remove();
        
        // Create modal - EXACT same structure as working test file
        const modalHTML = `
            <div id="loginModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4" style="z-index: 99999;">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                    <!-- Header -->
                    <div class="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 class="text-2xl font-bold text-gray-900">Login</h2>
                        <button onclick="window.realPhoneAuth.closeLoginModal()" 
                                class="text-gray-400 hover:text-gray-600 transition-colors">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Content -->
                    <div class="p-8">
                        <!-- Logo -->
                        <div class="flex justify-center mb-6">
                            <img id="login-logo" src="" 
                                 alt="Satyam Gold" 
                                 class="w-20 h-20 rounded-full shadow-lg object-contain"
                                 onerror="this.src='https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_100012467.png'">
                        </div>
                        
                        <!-- Title -->
                        <div class="text-center mb-8">
                            <h3 class="text-xl font-semibold text-gray-900 mb-2">Welcome to Satyam Gold</h3>
                            <p class="text-gray-600 text-sm">Enter your mobile number to receive OTP</p>
                        </div>
                        
                        <!-- Phone.email Widget - SAME AS WORKING TEST FILE -->
                        <div class="mb-6">
                            <div class="pe_signin_button" data-client-id="12468569854913964682"></div>
                        </div>
                        
                        <!-- Footer Text -->
                        <div class="text-center">
                            <p class="text-xs text-gray-500 leading-relaxed">
                                By continuing, you agree to Satyam Gold's<br>
                                <a href="#" class="text-blue-600 hover:underline">Terms of Use</a> and 
                                <a href="#" class="text-blue-600 hover:underline">Privacy Policy</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.body.style.overflow = 'hidden';
        
        // Load logo from site settings
        setTimeout(() => {
            this.loadSiteLogo();
            this.reloadWidgetInModal();
        }, 300);
    }
    
    loadSiteLogo() {
        // Try to get logo from site settings
        fetch('/api/settings')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.settings) {
                    const logoSetting = data.settings.find(s => s.key === 'site_logo');
                    if (logoSetting && logoSetting.value) {
                        const logoImg = document.getElementById('login-logo');
                        if (logoImg) {
                            logoImg.src = logoSetting.value;
                        }
                    }
                }
            })
            .catch(err => {
                console.log('Failed to load site logo, using default');
                const logoImg = document.getElementById('login-logo');
                if (logoImg) {
                    logoImg.src = 'https://base44.app/api/apps/68a375197577ce82d3f4980e/files/04925dbc9_100012467.png';
                }
            });
    }

    reloadWidgetInModal() {
        console.log('Reloading widget in modal...');
        
        // Remove old script
        const oldScript = document.querySelector('script[src*="phone.email"]');
        if (oldScript) {
            oldScript.remove();
        }
        
        // Add fresh script
        const newScript = document.createElement('script');
        newScript.src = 'https://www.phone.email/sign_in_button_v1.js?' + Date.now();
        newScript.async = true;
        newScript.onload = () => {
            console.log('Widget SDK reloaded');
        };
        document.head.appendChild(newScript);
    }

    async handlePhoneEmailSuccess(userObj) {
        console.log('Processing authentication...');
        
        try {
            // Extract phone
            let phone = userObj.phone_number || userObj.user_phone_number || userObj.phone || '';
            console.log('Phone:', phone);
            
            // Check database first for existing user
            try {
                const response = await fetch(`/api/users?phone_number=${encodeURIComponent(phone)}`);
                const result = await response.json();
                
                if (result.success && result.user) {
                    // Existing user found in database - direct login
                    console.log('Existing user from database - direct login');
                    const existingUser = {
                        id: result.user.id,
                        phone: result.user.phone_number,
                        name: result.user.name,
                        email: result.user.email,
                        address: result.user.address,
                        pincode: result.user.pincode,
                        city: result.user.city,
                        state: result.user.state,
                        verified: true,
                        loginTime: new Date().toISOString(),
                        isNewUser: false
                    };
                    await this.completeLogin(existingUser);
                    return;
                }
            } catch (error) {
                console.log('User not found in database, checking localStorage...');
            }
            
            // Check localStorage as fallback
            const allUsers = JSON.parse(localStorage.getItem('satyam_all_users') || '{}');
            const existingUser = phone ? allUsers[phone] : null;
            
            if (existingUser) {
                // Existing user from localStorage - direct login
                console.log('Existing user from localStorage - direct login');
                await this.completeLogin(existingUser);
            } else {
                // New user - collect name
                console.log('New user - collecting name');
                this.closeLoginModal();
                this.showNameCollection(phone, userObj);
            }
            
        } catch (error) {
            console.error('Auth error:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    showNameCollection(phone, userObj) {
        const nameHTML = `
            <div id="nameModal" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4" style="z-index: 99999;">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
                    <div class="text-center mb-6">
                        <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                            </svg>
                        </div>
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">Phone Verified!</h2>
                        <p class="text-gray-600">Enter your name to complete registration</p>
                        ${phone ? `<p class="text-sm text-gray-500 mt-2">${phone}</p>` : ''}
                    </div>
                    
                    <div class="space-y-4">
                        <input type="text" 
                               id="nameInput" 
                               placeholder="Enter your full name"
                               class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:ring-2 focus:ring-green-200 transition-all"
                               maxlength="50">
                        
                        <button id="completeBtn" 
                                class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                                disabled>
                            Complete Registration
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', nameHTML);
        
        setTimeout(() => {
            const nameInput = document.getElementById('nameInput');
            const completeBtn = document.getElementById('completeBtn');
            
            if (nameInput && completeBtn) {
                nameInput.focus();
                
                nameInput.addEventListener('input', (e) => {
                    completeBtn.disabled = e.target.value.trim().length < 2;
                });
                
                const complete = () => {
                    const name = nameInput.value.trim();
                    if (name.length >= 2) {
                        this.completeNewUser(name, phone, userObj);
                    }
                };
                
                nameInput.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') complete();
                });
                
                completeBtn.addEventListener('click', complete);
            }
        }, 100);
    }

    completeNewUser(name, phone, userObj) {
        const userData = {
            id: Date.now(),
            phone: phone || ('User_' + Date.now()),
            name: name,
            email: userObj.email || '',
            verified: true,
            loginTime: new Date().toISOString(),
            isNewUser: true
        };
        
        const nameModal = document.getElementById('nameModal');
        if (nameModal) nameModal.remove();
        
        this.completeLogin(userData);
    }

    async completeLogin(userData) {
        console.log('Login complete:', userData);
        
        // Save to database first
        try {
            const response = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    phone_number: userData.phone,
                    name: userData.name,
                    email: userData.email || null
                })
            });
            
            const result = await response.json();
            console.log('Database save result:', result);
            
            if (result.success && result.user) {
                // Update userData with database info
                userData.id = result.user.id;
                userData.address = result.user.address;
                userData.pincode = result.user.pincode;
                userData.city = result.user.city;
                userData.state = result.user.state;
            }
        } catch (error) {
            console.error('Failed to save to database:', error);
            // Continue with login even if database save fails
        }
        
        // Save session
        localStorage.setItem('satyam_user_data', JSON.stringify(userData));
        localStorage.setItem('satyam_session_token', 'verified_' + Date.now());
        
        // Save to all users
        const allUsers = JSON.parse(localStorage.getItem('satyam_all_users') || '{}');
        if (userData.phone) {
            allUsers[userData.phone] = userData;
            localStorage.setItem('satyam_all_users', JSON.stringify(allUsers));
        }
        
        this.currentUser = userData;
        this.closeLoginModal();
        this.updateAuthButton();
        this.notifyAuthChange(userData);
        
        const msg = userData.isNewUser ? 
            `Welcome ${userData.name}! Registration complete.` : 
            `Welcome back ${userData.name}!`;
        
        this.showSuccess(msg);
    }

    closeLoginModal() {
        const modal = document.getElementById('loginModal');
        if (modal) {
            modal.remove();
            document.body.style.overflow = '';
        }
    }

    showUserMenu() {
        const user = this.getCurrentUser();
        if (!user) return;
        
        const menuHTML = `
            <div id="userMenu" class="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4" style="z-index: 99999;">
                <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                    <div class="flex items-center justify-between mb-6">
                        <h3 class="text-xl font-bold text-gray-900">My Account</h3>
                        <button onclick="window.realPhoneAuth.closeUserMenu()" class="text-gray-400 hover:text-gray-600">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                            </svg>
                        </button>
                    </div>
                    
                    <div class="space-y-3">
                        <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl flex items-center gap-3">
                            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                                <i class="fas fa-user text-white"></i>
                            </div>
                            <div>
                                <p class="font-semibold text-gray-900">${user.name}</p>
                                <p class="text-sm text-gray-600">${user.phone}</p>
                            </div>
                        </div>
                        
                        <button onclick="window.location.href='/orders.html'" 
                                class="w-full p-4 text-left hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors">
                            <div class="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-box text-orange-600"></i>
                            </div>
                            <div>
                                <p class="font-medium text-gray-900">My Orders</p>
                                <p class="text-xs text-gray-500">Track orders</p>
                            </div>
                        </button>
                        
                        <button onclick="window.realPhoneAuth.logout()" 
                                class="w-full p-4 text-left hover:bg-red-50 rounded-xl flex items-center gap-3 text-red-600 transition-colors">
                            <div class="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                <i class="fas fa-sign-out-alt text-red-600"></i>
                            </div>
                            <div>
                                <p class="font-medium">Logout</p>
                                <p class="text-xs text-red-500">Sign out</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', menuHTML);
        document.body.style.overflow = 'hidden';
    }

    closeUserMenu() {
        const menu = document.getElementById('userMenu');
        if (menu) {
            menu.remove();
            document.body.style.overflow = '';
        }
    }

    checkExistingSession() {
        const userData = localStorage.getItem('satyam_user_data');
        const sessionToken = localStorage.getItem('satyam_session_token');
        
        if (userData && sessionToken) {
            try {
                this.currentUser = JSON.parse(userData);
                this.notifyAuthChange(this.currentUser);
                this.updateAuthButton();
                console.log('Session restored:', this.currentUser);
            } catch (error) {
                this.logout();
            }
        }
    }

    showError(msg) {
        this.showToast(msg, 'error');
    }

    showSuccess(msg) {
        this.showToast(msg, 'success');
    }

    showToast(msg, type = 'info') {
        const existing = document.getElementById('toast');
        if (existing) existing.remove();
        
        const colors = {
            error: '#ef4444',
            success: '#10b981',
            info: '#3b82f6'
        };
        
        const icons = {
            error: 'exclamation-circle',
            success: 'check-circle',
            info: 'info-circle'
        };
        
        const toast = document.createElement('div');
        toast.id = 'toast';
        toast.className = 'fixed top-20 right-4 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 transform transition-transform duration-300 translate-x-full';
        toast.style.backgroundColor = colors[type];
        toast.style.zIndex = '100000';
        toast.style.maxWidth = '350px';
        
        toast.innerHTML = `
            <i class="fas fa-${icons[type]}"></i>
            <span>${msg}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 hover:bg-black hover:bg-opacity-20 rounded p-1">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.transform = 'translateX(100%)';
                setTimeout(() => toast.remove(), 300);
            }
        }, 5000);
    }

    // Public API
    onAuthStateChanged(callback) {
        this.authChangeListeners.push(callback);
        callback(this.currentUser);
        return () => {
            const idx = this.authChangeListeners.indexOf(callback);
            if (idx > -1) this.authChangeListeners.splice(idx, 1);
        };
    }

    notifyAuthChange(user) {
        this.authChangeListeners.forEach(cb => {
            try { cb(user); } catch (e) { console.error(e); }
        });
    }

    getCurrentUser() {
        return this.currentUser;
    }

    isLoggedIn() {
        return !!this.currentUser;
    }

    login() {
        this.showLoginModal();
    }

    logout() {
        localStorage.removeItem('satyam_user_data');
        localStorage.removeItem('satyam_session_token');
        this.currentUser = null;
        this.closeLoginModal();
        this.closeUserMenu();
        this.updateAuthButton();
        this.notifyAuthChange(null);
        this.showSuccess('Logged out successfully!');
    }

    async getUserData() {
        if (!this.currentUser) throw new Error('Not logged in');
        return this.currentUser;
    }
}

// Initialize
const realPhoneAuth = new RealPhoneAuthManager();
window.realPhoneAuth = realPhoneAuth;

if (typeof module !== 'undefined' && module.exports) {
    module.exports = realPhoneAuth;
}