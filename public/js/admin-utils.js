/**
 * Admin Utility Functions for Satyam Gold Admin Panel
 */
class AdminUtils {
    constructor() {
        this.toastContainer = null;
        this.init();
    }

    init() {
        this.createToastContainer();
    }

    createToastContainer() {
        if (!this.toastContainer) {
            this.toastContainer = document.createElement('div');
            this.toastContainer.id = 'admin-toast-container';
            this.toastContainer.className = 'fixed top-4 right-4 z-50 space-y-2';
            document.body.appendChild(this.toastContainer);
        }
    }

    showToast(message, type = 'info', duration = 5000) {
        const toast = document.createElement('div');
        const toastId = 'admin-toast-' + Date.now();
        toast.id = toastId;
        
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
            <button onclick="adminUtils.removeToast('${toastId}')" class="ml-2 hover:bg-black hover:bg-opacity-20 rounded p-1">
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

    showLoading(message = 'Loading...', target = null) {
        const loadingHTML = `
            <div class="admin-loading flex items-center justify-center p-8">
                <div class="text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p class="text-gray-600">${message}</p>
                </div>
            </div>
        `;
        
        if (target) {
            target.innerHTML = loadingHTML;
        } else {
            // Show global loading
            const existingLoader = document.getElementById('admin-global-loading');
            if (existingLoader) {
                existingLoader.remove();
            }
            
            const loader = document.createElement('div');
            loader.id = 'admin-global-loading';
            loader.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
            loader.innerHTML = `
                <div class="bg-white rounded-lg p-6">
                    <div class="text-center">
                        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p class="text-gray-600">${message}</p>
                    </div>
                </div>
            `;
            
            document.body.appendChild(loader);
        }
    }

    hideLoading(target = null) {
        if (target) {
            const loading = target.querySelector('.admin-loading');
            if (loading) {
                loading.remove();
            }
        } else {
            const loader = document.getElementById('admin-global-loading');
            if (loader) {
                loader.remove();
            }
        }
    }

    createModal(title, content, options = {}) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        
        const modalContent = document.createElement('div');
        modalContent.className = `bg-white rounded-lg w-full ${options.size === 'large' ? 'max-w-4xl' : options.size === 'small' ? 'max-w-sm' : 'max-w-md'} max-h-96 overflow-y-auto`;
        
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
                <div class="flex justify-end space-x-3 p-6 border-t bg-gray-50">
                    <button class="modal-cancel btn btn-outline">Cancel</button>
                    <button class="modal-confirm btn btn-primary">${options.confirmText || 'Confirm'}</button>
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

    confirmAction(message, callback) {
        const content = `
            <div class="text-center">
                <div class="mb-4">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-4xl mb-2"></i>
                </div>
                <p class="text-gray-700 mb-6">${message}</p>
            </div>
        `;
        
        this.createModal('Confirm Action', content, {
            showFooter: true,
            confirmText: 'Yes, Continue',
            onConfirm: callback
        });
    }

    formatPrice(price) {
        return `₹${Number(price).toLocaleString('en-IN')}`;
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    validateRequired(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('border-red-500');
                isValid = false;
            } else {
                field.classList.remove('border-red-500');
            }
        });
        
        return isValid;
    }

    serializeForm(form) {
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    populateForm(form, data) {
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = !!data[key];
                } else if (field.type === 'radio') {
                    if (field.value === String(data[key])) {
                        field.checked = true;
                    }
                } else {
                    field.value = data[key] || '';
                }
            }
        });
    }

    clearForm(form) {
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.type === 'checkbox' || input.type === 'radio') {
                input.checked = false;
            } else {
                input.value = '';
            }
            input.classList.remove('border-red-500');
        });
    }

    generateId(prefix = 'item') {
        return prefix + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
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

    exportToCSV(data, filename) {
        if (!data || data.length === 0) {
            this.showToast('No data to export', 'warning');
            return;
        }
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => headers.map(header => {
                const value = row[header] || '';
                return `"${String(value).replace(/"/g, '""')}"`;
            }).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename || 'export.csv');
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    sortTable(table, column, direction = 'asc') {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        
        rows.sort((a, b) => {
            const aVal = a.children[column].textContent.trim();
            const bVal = b.children[column].textContent.trim();
            
            // Try to parse as number
            const aNum = parseFloat(aVal.replace(/[₹,]/g, ''));
            const bNum = parseFloat(bVal.replace(/[₹,]/g, ''));
            
            if (!isNaN(aNum) && !isNaN(bNum)) {
                return direction === 'asc' ? aNum - bNum : bNum - aNum;
            }
            
            // String comparison
            return direction === 'asc' 
                ? aVal.localeCompare(bVal)
                : bVal.localeCompare(aVal);
        });
        
        rows.forEach(row => tbody.appendChild(row));
    }

    addTableSorting(table) {
        const headers = table.querySelectorAll('th[data-sortable]');
        
        headers.forEach((header, index) => {
            header.style.cursor = 'pointer';
            header.innerHTML += ' <i class="fas fa-sort text-gray-400 ml-1"></i>';
            
            header.addEventListener('click', () => {
                const currentSort = header.getAttribute('data-sort') || 'asc';
                const newSort = currentSort === 'asc' ? 'desc' : 'asc';
                
                // Reset all headers
                headers.forEach(h => {
                    h.setAttribute('data-sort', '');
                    h.querySelector('i').className = 'fas fa-sort text-gray-400 ml-1';
                });
                
                // Set current header
                header.setAttribute('data-sort', newSort);
                header.querySelector('i').className = `fas fa-sort-${newSort === 'asc' ? 'up' : 'down'} text-gray-600 ml-1`;
                
                this.sortTable(table, index, newSort);
            });
        });
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

    // Admin-specific utilities
    checkAdminAuth() {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            window.location.href = '/admin.html';
            return false;
        }
        return true;
    }

    getAdminToken() {
        return localStorage.getItem('admin_token');
    }

    logout() {
        localStorage.removeItem('admin_token');
        this.showToast('Logged out successfully', 'success');
        setTimeout(() => {
            window.location.href = '/admin.html';
        }, 1000);
    }

    formatOrderStatus(status) {
        const statusMap = {
            'pending': { label: 'Pending', class: 'bg-yellow-100 text-yellow-800' },
            'processing': { label: 'Processing', class: 'bg-blue-100 text-blue-800' },
            'shipped': { label: 'Shipped', class: 'bg-purple-100 text-purple-800' },
            'delivered': { label: 'Delivered', class: 'bg-green-100 text-green-800' },
            'cancelled': { label: 'Cancelled', class: 'bg-red-100 text-red-800' }
        };
        
        const statusInfo = statusMap[status] || { label: status, class: 'bg-gray-100 text-gray-800' };
        return `<span class="px-2 py-1 rounded-full text-xs font-medium ${statusInfo.class}">${statusInfo.label}</span>`;
    }
}

// Initialize admin utils
const adminUtils = new AdminUtils();

// Make available globally
window.adminUtils = adminUtils;

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = adminUtils;
}