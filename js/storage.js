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
            const data = localStorage.getItem(KEYS.SUBMISSIONS);
            console.log('Raw submissions from storage:', data);
            const parsed = JSON.parse(data || '[]');
            console.log('Parsed submissions:', parsed);
            return parsed;
        } catch (e) {
            console.error('Error parsing submissions:', e);
            return [];
        }
    }

    // Set submissions
    function setSubmissions(submissions) {
        try {
            const json = JSON.stringify(submissions);
            console.log('Setting submissions, size:', json.length, 'bytes');
            localStorage.setItem(KEYS.SUBMISSIONS, json);
            console.log('✅ Submissions saved');
        } catch (e) {
            console.error('❌ Error saving submissions:', e);
            throw e;
        }
    }

    // Get user submissions
    function getUserSubmissions(userId) {
        console.log('🔍 Getting submissions for user:', userId);
        const submissions = getSubmissions();
        console.log('   Total submissions in storage:', submissions.length);
        
        const filtered = submissions.filter(s => {
            const matches = s.userId === userId && !s.deleted;
            if (!matches) {
                console.log('   Skipping:', s.id, '(userId:', s.userId, ', deleted:', s.deleted, ')');
            }
            return matches;
        });
        
        console.log('   User submissions found:', filtered.length);
        return filtered;
    }

    // Add submission
    function addSubmission(submission) {
        try {
            console.log('📝 Adding new submission...');
            console.log('   ID:', submission.id);
            console.log('   User ID:', submission.userId);
            console.log('   Title:', submission.title);
            
            const submissions = getSubmissions();
            console.log('   Current count:', submissions.length);
            
            submissions.push(submission);
            console.log('   After push count:', submissions.length);
            
            setSubmissions(submissions);
            
            // Verify it was saved
            const check = getSubmissions();
            console.log('   Verified count:', check.length);
            console.log('✅ Submission added successfully!');
            
            return submission;
        } catch (error) {
            console.error('❌ Error adding submission:', error);
            throw error;
        }
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
