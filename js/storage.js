// Storage Module
const Storage = (function() {
    'use strict';

    const KEYS = {
        USERS: 'cspg_users',
        SESSION: 'cspg_session',
        SUBMISSIONS: 'cspg_submissions'
    };

    // Get users
    function getUsers() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
        } catch (e) {
            console.error('Error parsing users:', e);
            return [];
        }
    }

    // Set users
    function setUsers(users) {
        localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    }

    // Get session
    function getSession() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.SESSION));
        } catch (e) {
            return null;
        }
    }

    // Set session
    function setSession(session) {
        localStorage.setItem(KEYS.SESSION, JSON.stringify(session));
    }

    // Clear session
    function clearSession() {
        localStorage.removeItem(KEYS.SESSION);
    }

    // Get submissions
    function getSubmissions() {
        try {
            return JSON.parse(localStorage.getItem(KEYS.SUBMISSIONS) || '[]');
        } catch (e) {
            console.error('Error parsing submissions:', e);
            return [];
        }
    }

    // Set submissions
    function setSubmissions(submissions) {
        localStorage.setItem(KEYS.SUBMISSIONS, JSON.stringify(submissions));
    }

    // Get user submissions
    function getUserSubmissions(userId) {
        const submissions = getSubmissions();
        return submissions.filter(s => s.userId === userId && !s.deleted);
    }

    // Add submission
    function addSubmission(submission) {
        const submissions = getSubmissions();
        submissions.push(submission);
        setSubmissions(submissions);
        return submission;
    }

    // Update submission
    function updateSubmission(submissionId, updates) {
        const submissions = getSubmissions();
        const index = submissions.findIndex(s => s.id === submissionId);
        if (index !== -1) {
            submissions[index] = { ...submissions[index], ...updates };
            setSubmissions(submissions);
            return submissions[index];
        }
        return null;
    }

    // Delete submission (soft delete)
    function deleteSubmission(submissionId) {
        const submissions = getSubmissions();
        const index = submissions.findIndex(s => s.id === submissionId);
        if (index !== -1) {
            submissions[index].deleted = true;
            submissions[index].deletedAt = new Date().toISOString();
            setSubmissions(submissions);
            return true;
        }
        return false;
    }

    // Delete user (soft delete)
    function deleteUser(userId) {
        const users = getUsers();
        const index = users.findIndex(u => u.id === userId);
        if (index !== -1) {
            users[index].deleted = true;
            users[index].deletedAt = new Date().toISOString();
            setUsers(users);
            
            // Also delete user's submissions
            const submissions = getSubmissions();
            submissions.forEach(sub => {
                if (sub.userId === userId) {
                    sub.deleted = true;
                    sub.deletedAt = new Date().toISOString();
                }
            });
            setSubmissions(submissions);
            
            return true;
        }
        return false;
    }

    return {
        getUsers,
        setUsers,
        getSession,
        setSession,
        clearSession,
        getSubmissions,
        setSubmissions,
        getUserSubmissions,
        addSubmission,
        updateSubmission,
        deleteSubmission,
        deleteUser
    };
})();
