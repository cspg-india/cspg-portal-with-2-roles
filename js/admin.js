// Admin Module
const Admin = (function() {
    'use strict';

    // Initialize admin account
    async function initializeAdmin() {
        const admins = getAdmins();
        if (admins.length === 0) {
            // Create default admin account
            const defaultPassword = 'CSPGAdmin@2025';
            const passwordHash = await Auth.hashPassword(defaultPassword);
            
            const adminAccount = {
                id: 'admin-' + Date.now(),
                email: 'admin@cspg.org',
                passwordHash: passwordHash,
                role: 'admin',
                name: 'System Administrator',
                createdAt: new Date().toISOString()
            };

            admins.push(adminAccount);
            localStorage.setItem('cspg_admins', JSON.stringify(admins));
        }
    }

    // Get admins from storage
    function getAdmins() {
        try {
            return JSON.parse(localStorage.getItem('cspg_admins') || '[]');
        } catch (e) {
            return [];
        }
    }

    // Admin login
    async function login(email, password) {
        const admins = getAdmins();
        const passwordHash = await Auth.hashPassword(password);
        
        const admin = admins.find(a => 
            a.email === email && a.passwordHash === passwordHash
        );

        if (!admin) {
            throw new Error('Invalid admin credentials');
        }

        // Create admin session
        const session = {
            adminId: admin.id,
            email: admin.email,
            name: admin.name,
            role: 'admin',
            loginTime: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        localStorage.setItem('cspg_admin_session', JSON.stringify(session));
        return session;
    }

    // Check if admin is authenticated
    function isAuthenticated() {
        const session = getSession();
        if (!session) return false;

        const expiresAt = new Date(session.expiresAt);
        if (expiresAt < new Date()) {
            clearSession();
            return false;
        }

        return true;
    }

    // Get admin session
    function getSession() {
        try {
            return JSON.parse(localStorage.getItem('cspg_admin_session'));
        } catch (e) {
            return null;
        }
    }

    // Clear admin session
    function clearSession() {
        localStorage.removeItem('cspg_admin_session');
    }

    // Logout admin
    function logout() {
        clearSession();
        window.location.href = 'admin-login.html';
    }

    // Require admin authentication
    function requireAuth() {
        if (!isAuthenticated()) {
            window.location.href = 'admin-login.html';
            return false;
        }
        return true;
    }

    // Change admin credentials
    async function changeCredentials(currentPassword, newEmail, newPassword) {
        const session = getSession();
        if (!session) {
            throw new Error('No active admin session');
        }

        const admins = getAdmins();
        const currentPasswordHash = await Auth.hashPassword(currentPassword);
        const adminIndex = admins.findIndex(a => a.id === session.adminId && a.passwordHash === currentPasswordHash);

        if (adminIndex === -1) {
            throw new Error('Current password is incorrect');
        }

        const admin = admins[adminIndex];

        // Update credentials
        if (newEmail && newEmail !== admin.email) {
            admin.email = newEmail;
            session.email = newEmail;
        }
        
        if (newPassword) {
            admin.passwordHash = await Auth.hashPassword(newPassword);
        }

        admin.credentialsChangedAt = new Date().toISOString();
        
        localStorage.setItem('cspg_admins', JSON.stringify(admins));
        localStorage.setItem('cspg_admin_session', JSON.stringify(session));

        return true;
    }

    // Get all submissions
    function getAllSubmissions() {
        return Storage.getSubmissions().filter(s => !s.deleted);
    }

    // Get all users
    function getAllUsers() {
        return Storage.getUsers().filter(u => !u.deleted);
    }

    // Update submission status
    function updateSubmissionStatus(submissionId, status) {
        const submission = Storage.updateSubmission(submissionId, {
            status,
            lastUpdated: new Date().toISOString()
        });

        logAction('status_update', submissionId, { status });
        return submission;
    }

    // Update payment status
    function updatePaymentStatus(submissionId, paymentStatus, paymentDetails = {}) {
        const updates = {
            paymentStatus,
            lastUpdated: new Date().toISOString()
        };

        if (paymentStatus === 'Paid') {
            updates.paymentDate = new Date().toISOString();
            updates.paymentAmount = paymentDetails.amount || 0;
            updates.paymentMethod = paymentDetails.method || 'Unknown';
            updates.transactionId = paymentDetails.transactionId || '';
        }

        const submission = Storage.updateSubmission(submissionId, updates);
        logAction('payment_update', submissionId, { paymentStatus, ...paymentDetails });
        return submission;
    }

    // Delete submission
    function deleteSubmission(submissionId) {
        Storage.deleteSubmission(submissionId);
        logAction('delete_submission', submissionId, {});
        return true;
    }

    // Delete user
    function deleteUser(userId) {
        Storage.deleteUser(userId);
        logAction('delete_user', userId, {});
        return true;
    }

    // Get payment records
    function getPaymentRecords() {
        const submissions = getAllSubmissions();
        return submissions.map(sub => ({
            id: sub.id,
            userId: sub.userId,
            title: sub.title,
            paymentStatus: sub.paymentStatus,
            paymentDate: sub.paymentDate,
            paymentAmount: sub.paymentAmount,
            paymentMethod: sub.paymentMethod,
            transactionId: sub.transactionId,
            dateSubmitted: sub.dateSubmitted
        }));
    }

    // Get statistics
    function getStatistics() {
        const submissions = getAllSubmissions();
        const users = getAllUsers();

        const stats = {
            totalUsers: users.length,
            totalSubmissions: submissions.length,
            statusBreakdown: {
                underReview: submissions.filter(s => s.status === 'Under Review').length,
                accepted: submissions.filter(s => s.status === 'Accepted').length,
                rejected: submissions.filter(s => s.status === 'Rejected').length,
                published: submissions.filter(s => s.status === 'Published').length,
                revision: submissions.filter(s => s.status === 'Revision Required').length
            },
            paymentBreakdown: {
                pending: submissions.filter(s => s.paymentStatus === 'Pending').length,
                paid: submissions.filter(s => s.paymentStatus === 'Paid').length,
                failed: submissions.filter(s => s.paymentStatus === 'Failed').length
            },
            totalRevenue: submissions
                .filter(s => s.paymentStatus === 'Paid')
                .reduce((sum, s) => sum + (s.paymentAmount || 0), 0),
            recentSubmissions: submissions
                .sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted))
                .slice(0, 10)
        };

        return stats;
    }

    // Search submissions
    function searchSubmissions(query) {
        const submissions = getAllSubmissions();
        const lowerQuery = query.toLowerCase();

        return submissions.filter(sub => 
            sub.id.toLowerCase().includes(lowerQuery) ||
            sub.title.toLowerCase().includes(lowerQuery) ||
            sub.authorEmail.toLowerCase().includes(lowerQuery) ||
            sub.correspondingAuthor.toLowerCase().includes(lowerQuery)
        );
    }

    // Get user submissions
    function getUserSubmissions(userId) {
        return Storage.getUserSubmissions(userId);
    }

    // Log admin action
    function logAction(action, targetId, details) {
        const logs = getActionLogs();
        const session = getSession();

        const log = {
            id: 'LOG-' + Date.now(),
            adminId: session ? session.adminId : 'unknown',
            adminEmail: session ? session.email : 'unknown',
            action,
            targetId,
            details,
            timestamp: new Date().toISOString()
        };

        logs.push(log);
        
        // Keep only last 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }

        localStorage.setItem('cspg_admin_logs', JSON.stringify(logs));
    }

    // Get action logs
    function getActionLogs(limit = 100) {
        try {
            const logs = JSON.parse(localStorage.getItem('cspg_admin_logs') || '[]');
            return logs.slice(-limit).reverse();
        } catch (e) {
            return [];
        }
    }

    // Export data to CSV
    function exportToCSV(data, filename) {
        const headers = Object.keys(data[0] || {});
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    const escaped = String(value || '').replace(/"/g, '""');
                    return escaped.includes(',') ? `"${escaped}"` : escaped;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    return {
        initializeAdmin,
        login,
        logout,
        isAuthenticated,
        requireAuth,
        getSession,
        changeCredentials,
        getAllSubmissions,
        getAllUsers,
        updateSubmissionStatus,
        updatePaymentStatus,
        deleteSubmission,
        deleteUser,
        getPaymentRecords,
        getStatistics,
        searchSubmissions,
        getUserSubmissions,
        getActionLogs,
        exportToCSV
    };
})();

// Initialize admin on load
if (typeof Auth !== 'undefined') {
    Admin.initializeAdmin();
}
