// Authentication Module
const Auth = (function() {
    'use strict';

    // Hash password using SHA-256
    async function hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hash = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hash))
            .map(b => b.toString(16).padStart(2, '0'))
            .join('');
    }

    // Sanitize input to prevent XSS
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Generate unique ID
    function generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Register new user
    async function register(userData) {
        const users = Storage.getUsers();
        
        // Validate email doesn't exist
        if (users.find(u => u.email === userData.email && !u.deleted)) {
            throw new Error('An account with this email already exists');
        }

        // Validate password match
        if (userData.password !== userData.confirmPassword) {
            throw new Error('Passwords do not match');
        }

        // Create user object
        const user = {
            id: generateId(),
            firstName: sanitizeInput(userData.firstName),
            lastName: sanitizeInput(userData.lastName),
            email: sanitizeInput(userData.email),
            passwordHash: await hashPassword(userData.password),
            institution: sanitizeInput(userData.institution),
            department: sanitizeInput(userData.department || ''),
            position: sanitizeInput(userData.position || ''),
            createdAt: new Date().toISOString(),
            deleted: false
        };

        users.push(user);
        Storage.setUsers(users);
        
        return user;
    }

    // Login user
    async function login(email, password) {
        const users = Storage.getUsers();
        const passwordHash = await hashPassword(password);
        
        const user = users.find(u => 
            u.email === email && u.passwordHash === passwordHash && !u.deleted
        );

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Create session
        const session = {
            userId: user.id,
            email: user.email,
            fullName: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            institution: user.institution,
            department: user.department,
            position: user.position,
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        Storage.setSession(session);
        return session;
    }

    // Logout user
    function logout() {
        Storage.clearSession();
        window.location.href = 'login.html';
    }

    // Check if user is authenticated
    function isAuthenticated() {
        const session = Storage.getSession();
        if (!session) return false;

        // Check if session expired
        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
            Storage.clearSession();
            return false;
        }

        return true;
    }

    // Get current user
    function getCurrentUser() {
        return Storage.getSession();
    }

    // Require authentication (redirect if not authenticated)
    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    // Change password
    async function changePassword(currentPassword, newPassword) {
        const session = getCurrentUser();
        if (!session) {
            throw new Error('No active session');
        }

        const users = Storage.getUsers();
        const currentPasswordHash = await hashPassword(currentPassword);
        const user = users.find(u => u.id === session.userId && u.passwordHash === currentPasswordHash);

        if (!user) {
            throw new Error('Current password is incorrect');
        }

        // Update password
        user.passwordHash = await hashPassword(newPassword);
        user.passwordChangedAt = new Date().toISOString();
        Storage.setUsers(users);

        return true;
    }

    return {
        register,
        login,
        logout,
        isAuthenticated,
        getCurrentUser,
        requireAuth,
        hashPassword,
        changePassword
    };
})();
