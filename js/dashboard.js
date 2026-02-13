// User Dashboard Module
const UserDashboard = (function () {
    'use strict';

    let currentUser = null;

    // Initialize dashboard
    function init() {
        console.log('=== DASHBOARD INIT START ===');

        if (!Auth.requireAuth()) {
            console.log('User not authenticated, redirecting...');
            return;
        }

        currentUser = Auth.getCurrentUser();
        console.log('Current user after requireAuth:', currentUser);

        if (!currentUser) {
            console.error('❌ Current user is null!');
            Auth.logout();
            return;
        }

        console.log('User ID:', currentUser.userId);
        console.log('User email:', currentUser.email);

        // Render user info
        renderUserInfo();

        // Render stats
        renderStats();

        // Render submissions
        renderSubmissions();

        // Setup event listeners
        setupEventListeners();

        console.log('=== DASHBOARD INIT END ===');
    }

    // Render user info in header
    function renderUserInfo() {
        const userNameElement = document.getElementById('userName');
        const userEmailElement = document.getElementById('userEmail');
        const userInstitutionElement = document.getElementById('userInstitution');

        if (userNameElement) {
            userNameElement.textContent = currentUser.fullName;
        }

        if (userEmailElement) {
            userEmailElement.textContent = currentUser.email;
        }

        if (userInstitutionElement) {
            userInstitutionElement.textContent = currentUser.institution;
        }
    }

    // Render statistics
    function renderStats() {
        const stats = Submission.getStats();

        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <div class="stat-icon">📄</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.total}</div>
                    <div class="stat-label">Total Submissions</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">⏳</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.underReview}</div>
                    <div class="stat-label">Under Review</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.accepted}</div>
                    <div class="stat-label">Accepted</div>
                </div>
            </div>
            
            <div class="stat-card">
                <div class="stat-icon">💰</div>
                <div class="stat-content">
                    <div class="stat-value">${stats.pendingPayment}</div>
                    <div class="stat-label">Pending Payment</div>
                </div>
            </div>
        `;
    }

    // Render submissions table
    function renderSubmissions() {
        const submissions = Submission.getUserSubmissions();
        console.log('Submissions in renderSubmissions:', submissions);

        const submissionsContainer = document.getElementById('submissionsContainer');

        if (!submissionsContainer) {
            console.error('submissionsContainer element not found');
            return;
        }

        if (submissions.length === 0) {
            console.log('No submissions found, showing empty state');
            submissionsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📝</div>
                    <h3>No Submissions Yet</h3>
                    <p>Submit your first manuscript to get started</p>
                </div>
            `;
            return;
        }

        // Sort submissions by date (newest first)
        submissions.sort((a, b) => new Date(b.dateSubmitted) - new Date(a.dateSubmitted));

        let html = `
            <div class="submissions-header">
                <h2>Your Submissions</h2>
            </div>
            <div class="submissions-table">
                <table>
                    <thead>
                        <tr>
                            <th>Submission ID</th>
                            <th>Title</th>
                            <th>Journal</th>
                            <th>Date Submitted</th>
                            <th>Status</th>
                            <th>Payment</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
        `;

        submissions.forEach(sub => {
            html += `
                <tr>
                    <td><span class="submission-id">${sub.id}</span></td>
                    <td><strong>${UI.sanitizeHTML(sub.title)}</strong></td>
                    <td>${UI.sanitizeHTML(sub.journal)}</td>
                    <td>${UI.formatDate(sub.dateSubmitted)}</td>
                    <td><span class="status-badge ${UI.getStatusClass(sub.status)}">${sub.status}</span></td>
                    <td><span class="status-badge ${UI.getStatusClass(sub.paymentStatus)}">${sub.paymentStatus}</span></td>
                    <td>
                        <button class="btn-view" onclick="UserDashboard.viewSubmission('${sub.id}')">View</button>
                    </td>
                </tr>
            `;
        });

        html += `
                    </tbody>
                </table>
            </div>
        `;

        console.log('Rendering submissions table with', submissions.length, 'submissions');
        submissionsContainer.innerHTML = html;
    }

    // View submission details
    function viewSubmission(submissionId) {
        const submission = Submission.getSubmissionById(submissionId);
        if (!submission) return;

        const modal = document.getElementById('submissionModal');
        const modalContent = document.getElementById('modalContent');

        if (!modal || !modalContent) return;

        modalContent.innerHTML = `
            <div class="modal-header">
                <h2>Submission Details</h2>
                <button class="modal-close" onclick="UserDashboard.closeModal()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="detail-row">
                    <label>Submission ID:</label>
                    <span>${submission.id}</span>
                </div>
                <div class="detail-row">
                    <label>Title:</label>
                    <span>${UI.sanitizeHTML(submission.title)}</span>
                </div>
                <div class="detail-row">
                    <label>Journal:</label>
                    <span>${UI.sanitizeHTML(submission.journal)}</span>
                </div>
                <div class="detail-row">
                    <label>Corresponding Author:</label>
                    <span>${UI.sanitizeHTML(submission.correspondingAuthor)}</span>
                </div>
                <div class="detail-row">
                    <label>Email:</label>
                    <span>${UI.sanitizeHTML(submission.authorEmail)}</span>
                </div>
                <div class="detail-row">
                    <label>Co-Authors:</label>
                    <span>${UI.sanitizeHTML(submission.coAuthors || 'N/A')}</span>
                </div>
                <div class="detail-row">
                    <label>Affiliation:</label>
                    <span>${UI.sanitizeHTML(submission.affiliation)}</span>
                </div>
                <div class="detail-row">
                    <label>Keywords:</label>
                    <span>${UI.sanitizeHTML(submission.keywords)}</span>
                </div>
                <div class="detail-row">
                    <label>Abstract:</label>
                    <p class="abstract-text">${UI.sanitizeHTML(submission.abstract)}</p>
                </div>
                <div class="detail-row">
                    <label>File:</label>
                    <span>${submission.fileName} (${UI.formatFileSize(submission.fileSize)})</span>
                    ${submission.fileUrl ? `<a href="${submission.fileUrl}" target="_blank" style="margin-left: 10px; color: var(--color-accent); text-decoration: none;">View File ↗️</a>` : ''}
                </div>
                <div class="detail-row">
                    <label>Date Submitted:</label>
                    <span>${UI.formatDate(submission.dateSubmitted)}</span>
                </div>
                <div class="detail-row">
                    <label>Status:</label>
                    <span class="status-badge ${UI.getStatusClass(submission.status)}">${submission.status}</span>
                </div>
                <div class="detail-row">
                    <label>Payment Status:</label>
                    <span class="status-badge ${UI.getStatusClass(submission.paymentStatus)}">${submission.paymentStatus}</span>
                </div>
            </div>
        `;

        modal.style.display = 'flex';
    }

    // Close modal
    function closeModal() {
        const modal = document.getElementById('submissionModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Open settings modal
    function openSettings() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'flex';
        }
    }

    // Close settings modal
    function closeSettingsModal() {
        const modal = document.getElementById('settingsModal');
        if (modal) {
            modal.style.display = 'none';
            document.getElementById('settingsForm').reset();
            document.getElementById('settingsMessageContainer').innerHTML = '';
        }
    }

    // Setup event listeners
    function setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Auth.logout();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openSettings();
            });
        }

        // Settings form
        const settingsForm = document.getElementById('settingsForm');
        if (settingsForm) {
            settingsForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await handleSettingsUpdate();
            });
        }

        // Modal close on outside click
        const submissionModal = document.getElementById('submissionModal');
        if (submissionModal) {
            submissionModal.addEventListener('click', (e) => {
                if (e.target === submissionModal) {
                    closeModal();
                }
            });
        }

        const settingsModal = document.getElementById('settingsModal');
        if (settingsModal) {
            settingsModal.addEventListener('click', (e) => {
                if (e.target === settingsModal) {
                    closeSettingsModal();
                }
            });
        }
    }

    // Handle settings update
    async function handleSettingsUpdate() {
        const messageContainer = document.getElementById('settingsMessageContainer');
        messageContainer.innerHTML = '';

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            UI.showError(messageContainer, 'Please fill in all fields');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            UI.showError(messageContainer, 'New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            UI.showError(messageContainer, 'New password must be at least 6 characters');
            return;
        }

        try {
            await Auth.changePassword(currentPassword, newPassword);
            UI.showSuccess(messageContainer, 'Password updated successfully!');

            setTimeout(() => {
                closeSettingsModal();
                Auth.logout();
            }, 2000);
        } catch (error) {
            UI.showError(messageContainer, error.message);
        }
    }

    // Refresh dashboard
    function refresh() {
        renderStats();
        renderSubmissions();
    }

    return {
        init,
        refresh,
        viewSubmission,
        closeModal,
        closeSettingsModal
    };
})();

// Initialize dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', UserDashboard.init);
} else {
    UserDashboard.init();
}
