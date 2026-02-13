// UI Utilities Module
const UI = (function() {
    'use strict';

    // Debounce function
    function debounce(func, wait) {
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

    // Show loading indicator
    function showLoading(element, message = 'Loading...') {
        element.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p>${message}</p>
            </div>
        `;
    }

    // Show error message
    function showError(element, message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        element.appendChild(errorDiv);
        
        setTimeout(() => errorDiv.remove(), 5000);
    }

    // Show success message
    function showSuccess(element, message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        element.appendChild(successDiv);
        
        setTimeout(() => successDiv.remove(), 5000);
    }

    // Format date
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    // Format file size
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    }

    // Sanitize HTML
    function sanitizeHTML(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    // Get status badge class
    function getStatusClass(status) {
        const statusMap = {
            'Under Review': 'status-review',
            'Accepted': 'status-accepted',
            'Rejected': 'status-rejected',
            'Pending': 'status-pending',
            'Paid': 'status-paid',
            'Published': 'status-accepted',
            'Revision Required': 'status-pending',
            'Failed': 'status-rejected'
        };
        return statusMap[status] || 'status-default';
    }

    // Animate element
    function animate(element, animationClass) {
        element.classList.add(animationClass);
        element.addEventListener('animationend', () => {
            element.classList.remove(animationClass);
        }, { once: true });
    }

    // Smooth scroll to element
    function scrollTo(element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Create element with properties
    function createElement(tag, props = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.keys(props).forEach(key => {
            if (key === 'className') {
                element.className = props[key];
            } else if (key === 'textContent') {
                element.textContent = props[key];
            } else {
                element.setAttribute(key, props[key]);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    // Toggle element visibility
    function toggle(element, show) {
        if (show === undefined) {
            element.style.display = element.style.display === 'none' ? 'block' : 'none';
        } else {
            element.style.display = show ? 'block' : 'none';
        }
    }

    return {
        debounce,
        showLoading,
        showError,
        showSuccess,
        formatDate,
        formatFileSize,
        sanitizeHTML,
        getStatusClass,
        animate,
        scrollTo,
        createElement,
        toggle
    };
})();
