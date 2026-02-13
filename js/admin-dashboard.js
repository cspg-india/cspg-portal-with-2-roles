// Admin Dashboard Module
const AdminDashboard = (function() {
    'use strict';

    let currentTab = 'overview';
    let currentFilter = 'all';
    let currentPaymentFilter = 'all';
    let allSubmissions = [];

    // Initialize dashboard
    function init() {
        if (!Admin.requireAuth()) return;

        const session = Admin.getSession();
        
        // Render admin info
        document.getElementById('adminName').textContent = session.name;
        document.getElementById('adminEmail').textContent = session.email;

        // Setup navigation
        setupNavigation();

        // Setup filters
        setupFilters();

        // Setup search
        setupSearch();

        // Render initial data
        renderOverview();
        renderSubmissions();
        renderPayments();
        renderUsers();
        renderActivityLog();

        // Setup event listeners
        setupEventListeners();

        // Update badges
        updateBadges();
    }

    // Setup navigation tabs
    function setupNavigation() {
        const tabs = document.querySelectorAll('.nav-tab');
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const tabName = tab.dataset.tab;
                switchTab(tabName);
            });
        });
    }

    // Switch between tabs
    function switchTab(tabName) {
        // Update nav tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.toggle('active', section.id === tabName);
        });

        currentTab = tabName;
    }

    // Setup filters
    function setupFilters() {
        // Status filters
        const statusFilters = document.querySelectorAll('#statusFilters .filter-btn');
        statusFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                statusFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentFilter = btn.dataset.status;
                renderSubmissions();
            });
        });

        // Payment filters
        const paymentFilters = document.querySelectorAll('#paymentFilters .filter-btn');
        paymentFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                paymentFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                currentPaymentFilter = btn.dataset.payment;
                renderPayments();
            });
        });
    }

    // Setup search
    function setupSearch() {
        const searchBox = document.getElementById('searchBox');
        if (searchBox) {
            searchBox.addEventListener('input', UI.debounce(() => {
                renderSubmissions();
            }, 300));
        }
    }

    // Update badge counts
    function updateBadges() {
        const stats = Admin.getStatistics();
        document.getElementById('submissionCount').textContent = stats.totalSubmissions;
        document.getElementById('pendingPaymentCount').textContent = stats.paymentBreakdown.pending;
        document.getElementById('userCount').textContent = stats.totalUsers;
    }

    // Render overview section
    function renderOverview() {
        const stats = Admin.getStatistics();
        const container = document.getElementById('statsContainer');

        container.innerHTML = `
            <div class="admin-stat-card">
                <div class="stat-number">${stats.totalSubmissions}</div>
                <div class="stat-title">Total Submissions</div>
            </div>
            
            <div class="admin-stat-card users">
                <div class="stat-number">${stats.totalUsers}</div>
                <div class="stat-title">Registered Users</div>
            </div>
            
            <div class="admin-stat-card pending">
                <div class="stat-number">${stats.paymentBreakdown.pending}</div>
                <div class="stat-title">Pending Payments</div>
            </div>
            
            <div class="admin-stat-card revenue">
                <div class="stat-number">₹${stats.totalRevenue.toLocaleString()}</div>
                <div class="stat-title">Total Revenue</div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-number">${stats.statusBreakdown.underReview}</div>
                <div class="stat-title">Under Review</div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-number">${stats.statusBreakdown.accepted}</div>
                <div class="stat-title">Accepted</div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-number">${stats.statusBreakdown.published}</div>
                <div class="stat-title">Published</div>
            </div>

            <div class="admin-stat-card">
                <div class="stat-number">${stats.paymentBreakdown.paid}</div>
                <div class="stat-title">Paid</div>
            </div>
        `;

        // Render recent submissions
        renderRecentSubmissions(stats.recentSubmissions);
    }

    // Render recent submissions
    function renderRecentSubmissions(submissions) {
        const container = document.getElementById('recentSubmissionsTable');
        
        if (submissions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: 2rem;">No submissions yet</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Payment</th>
                    </tr>
                </thead>
                <tbody>
        `;

        submissions.slice(0, 5).forEach(sub => {
            html += `
                <tr>
                    <td><span class="submission-id">${sub.id}</span></td>
                    <td><strong>${UI.sanitizeHTML(sub.title.substring(0, 50))}...</strong></td>
                    <td>${UI.sanitizeHTML(sub.correspondingAuthor)}</td>
                    <td>${UI.formatDate(sub.dateSubmitted)}</td>
                    <td><span class="status-badge ${UI.getStatusClass(sub.status)}">${sub.status}</span></td>
                    <td><span class="status-badge ${UI.getStatusClass(sub.paymentStatus)}">${sub.paymentStatus}</span></td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Render submissions table
    function renderSubmissions() {
        const searchQuery = document.getElementById('searchBox')?.value || '';
        let submissions = searchQuery ? 
            Admin.searchSubmissions(searchQuery) : 
            Admin.getAllSubmissions();

        // Apply filter
        if (currentFilter !== 'all') {
            submissions = submissions.filter(s => s.status === currentFilter);
        }

        allSubmissions = submissions;
        const container = document.getElementById('submissionsTable');

        if (submissions.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: 2rem;">No submissions found</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Title</th>
                        <th>Author</th>
                        <th>Email</th>
                        <th>Journal</th>
                        <th>Date</th>
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
                    <td><strong>${UI.sanitizeHTML(sub.title.substring(0, 40))}...</strong></td>
                    <td>${UI.sanitizeHTML(sub.correspondingAuthor)}</td>
                    <td>${UI.sanitizeHTML(sub.authorEmail)}</td>
                    <td>${UI.sanitizeHTML(sub.journal)}</td>
                    <td>${UI.formatDate(sub.dateSubmitted)}</td>
                    <td>
                        <select class="status-select" onchange="AdminDashboard.updateStatus('${sub.id}', this.value)">
                            <option value="Under Review" ${sub.status === 'Under Review' ? 'selected' : ''}>Under Review</option>
                            <option value="Accepted" ${sub.status === 'Accepted' ? 'selected' : ''}>Accepted</option>
                            <option value="Rejected" ${sub.status === 'Rejected' ? 'selected' : ''}>Rejected</option>
                            <option value="Published" ${sub.status === 'Published' ? 'selected' : ''}>Published</option>
                            <option value="Revision Required" ${sub.status === 'Revision Required' ? 'selected' : ''}>Revision Required</option>
                        </select>
                    </td>
                    <td>
                        <select class="payment-select" onchange="AdminDashboard.quickUpdatePayment('${sub.id}', this.value)">
                            <option value="Pending" ${sub.paymentStatus === 'Pending' ? 'selected' : ''}>Pending</option>
                            <option value="Paid" ${sub.paymentStatus === 'Paid' ? 'selected' : ''}>Paid</option>
                            <option value="Failed" ${sub.paymentStatus === 'Failed' ? 'selected' : ''}>Failed</option>
                        </select>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-edit" onclick="AdminDashboard.viewSubmission('${sub.id}')">View</button>
                            <button class="btn-action btn-view-file" onclick="AdminDashboard.openPaymentModal('${sub.id}')">Payment</button>
                            <button class="btn-action btn-delete" onclick="AdminDashboard.confirmDeleteSubmission('${sub.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Render payments table
    function renderPayments() {
        let payments = Admin.getPaymentRecords();

        // Apply filter
        if (currentPaymentFilter !== 'all') {
            payments = payments.filter(p => p.paymentStatus === currentPaymentFilter);
        }

        const container = document.getElementById('paymentsTable');

        if (payments.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: 2rem;">No payment records found</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Submission ID</th>
                        <th>Title</th>
                        <th>Status</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Transaction ID</th>
                        <th>Date Paid</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        payments.forEach(payment => {
            html += `
                <tr>
                    <td><span class="submission-id">${payment.id}</span></td>
                    <td>${UI.sanitizeHTML(payment.title.substring(0, 40))}...</td>
                    <td><span class="status-badge ${UI.getStatusClass(payment.paymentStatus)}">${payment.paymentStatus}</span></td>
                    <td>${payment.paymentAmount ? '₹' + payment.paymentAmount.toLocaleString() : '-'}</td>
                    <td>${payment.paymentMethod || '-'}</td>
                    <td>${payment.transactionId || '-'}</td>
                    <td>${payment.paymentDate ? UI.formatDate(payment.paymentDate) : '-'}</td>
                    <td>
                        <button class="btn-action btn-edit" onclick="AdminDashboard.openPaymentModal('${payment.id}')">
                            ${payment.paymentStatus === 'Paid' ? 'View' : 'Process'}
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Render users table
    function renderUsers() {
        const users = Admin.getAllUsers();
        const container = document.getElementById('usersTable');

        if (users.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: 2rem;">No users registered</p>';
            return;
        }

        let html = `
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Institution</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Registered</th>
                        <th>Submissions</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
        `;

        users.forEach(user => {
            const userSubmissions = Admin.getUserSubmissions(user.id);
            html += `
                <tr>
                    <td><strong>${UI.sanitizeHTML(user.firstName + ' ' + user.lastName)}</strong></td>
                    <td>${UI.sanitizeHTML(user.email)}</td>
                    <td>${UI.sanitizeHTML(user.institution)}</td>
                    <td>${UI.sanitizeHTML(user.department || '-')}</td>
                    <td>${UI.sanitizeHTML(user.position || '-')}</td>
                    <td>${UI.formatDate(user.createdAt)}</td>
                    <td><span class="status-badge status-review">${userSubmissions.length}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" onclick="AdminDashboard.viewUser('${user.id}')">View</button>
                            <button class="btn-action btn-delete" onclick="AdminDashboard.confirmDeleteUser('${user.id}')">Delete</button>
                        </div>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    }

    // Render activity log
    function renderActivityLog() {
        const logs = Admin.getActionLogs(50);
        const container = document.getElementById('activityLogContainer');

        if (logs.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: var(--color-gray); padding: 2rem;">No activity logged yet</p>';
            return;
        }

        let html = '';
        logs.forEach(log => {
            html += `
                <div class="log-entry">
                    <div class="log-time">${new Date(log.timestamp).toLocaleString()}</div>
                    <div class="log-action">${getActionText(log.action)}</div>
                    <div class="log-details">
                        Admin: ${log.adminEmail} | Target: ${log.targetId}
                        ${log.details ? ' | ' + JSON.stringify(log.details) : ''}
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    }

    // Get action text
    function getActionText(action) {
        const actionMap = {
            'status_update': '📝 Updated submission status',
            'payment_update': '💰 Updated payment status',
            'delete_submission': '🗑️ Deleted submission',
            'delete_user': '👤 Deleted user'
        };
        return actionMap[action] || action;
    }

    // Update submission status
    function updateStatus(submissionId, newStatus) {
        if (confirm(`Change status to "${newStatus}"?`)) {
            Admin.updateSubmissionStatus(submissionId, newStatus);
            renderSubmissions();
            renderOverview();
            updateBadges();
        }
    }

    // Quick update payment
    function quickUpdatePayment(submissionId, newStatus) {
        if (newStatus === 'Paid') {
            openPaymentModal(submissionId);
        } else {
            if (confirm(`Change payment status to "${newStatus}"?`)) {
                Admin.updatePaymentStatus(submissionId, newStatus);
                renderSubmissions();
                renderPayments();
                renderOverview();
                updateBadges();
            }
        }
    }

    // Confirm delete submission
    function confirmDeleteSubmission(submissionId) {
        if (confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
            Admin.deleteSubmission(submissionId);
            renderSubmissions();
            renderOverview();
            renderActivityLog();
            updateBadges();
            alert('Submission deleted successfully');
        }
    }

    // Confirm delete user
    function confirmDeleteUser(userId) {
        if (confirm('Are you sure you want to delete this user? This will also delete all their submissions. This action cannot be undone.')) {
            Admin.deleteUser(userId);
            renderUsers();
            renderSubmissions();
            renderOverview();
            renderActivityLog();
            updateBadges();
            alert('User and their submissions deleted successfully');
        }
    }

    // Download file function
    function downloadFile(submissionId) {
        Submission.downloadFile(submissionId);
    }

    // View submission details with download button
    function viewSubmission(submissionId) {
        const submissions = Admin.getAllSubmissions();
        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) return;

        const modal = document.getElementById('editModal');
        const content = document.getElementById('editModalContent');

        const hasFile = submission.fileData ? true : false;

        content.innerHTML = `
            <div class="modal-header">
                <h2>Submission Details</h2>
                <button class="modal-close" onclick="AdminDashboard.closeModal('editModal')">&times;</button>
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
                    <label>Uploaded File:</label>
                    <span>
                        ${submission.fileName} (${UI.formatFileSize(submission.fileSize)})
                        ${hasFile ? `<br><button class="btn-download" onclick="AdminDashboard.downloadFile('${submission.id}')" style="margin-top: 0.5rem;">📥 Download Document</button>` : ''}
                    </span>
                </div>
                <div class="detail-row">
                    <label>Date Submitted:</label>
                    <span>${UI.formatDate(submission.dateSubmitted)}</span>
                </div>
                <div class="detail-row">
                    <label>Last Updated:</label>
                    <span>${UI.formatDate(submission.lastUpdated)}</span>
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

    // Open payment modal
    function openPaymentModal(submissionId) {
        const submissions = Admin.getAllSubmissions();
        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) return;

        const modal = document.getElementById('paymentModal');
        const content = document.getElementById('paymentModalContent');

        const isPaid = submission.paymentStatus === 'Paid';

        content.innerHTML = `
            <div class="modal-header">
                <h2>Payment Management</h2>
                <button class="modal-close" onclick="AdminDashboard.closeModal('paymentModal')">&times;</button>
            </div>
            <div class="modal-body payment-modal-content">
                <div class="payment-summary">
                    <h3>Submission Details</h3>
                    <div class="summary-row">
                        <span>Submission ID:</span>
                        <strong>${submission.id}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Title:</span>
                        <strong>${UI.sanitizeHTML(submission.title)}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Author:</span>
                        <strong>${UI.sanitizeHTML(submission.correspondingAuthor)}</strong>
                    </div>
                    <div class="summary-row">
                        <span>Current Status:</span>
                        <span class="status-badge ${UI.getStatusClass(submission.paymentStatus)}">${submission.paymentStatus}</span>
                    </div>
                </div>

                ${isPaid ? `
                    <div style="background: #e8f5e9; padding: 1.5rem; border-radius: 12px;">
                        <h3 style="color: #27ae60; margin-bottom: 1rem;">✓ Payment Received</h3>
                        <p><strong>Amount:</strong> ₹${submission.paymentAmount?.toLocaleString() || 'N/A'}</p>
                        <p><strong>Method:</strong> ${submission.paymentMethod || 'N/A'}</p>
                        <p><strong>Transaction ID:</strong> ${submission.transactionId || 'N/A'}</p>
                        <p><strong>Date:</strong> ${submission.paymentDate ? UI.formatDate(submission.paymentDate) : 'N/A'}</p>
                    </div>
                ` : `
                    <form id="paymentForm" class="payment-form">
                        <div class="form-group">
                            <label class="form-label">PAYMENT STATUS *</label>
                            <select class="form-select" id="paymentStatus" required>
                                <option value="Paid">Mark as Paid</option>
                                <option value="Failed">Mark as Failed</option>
                            </select>
                        </div>

                        <div id="paidFields">
                            <div class="form-row">
                                <div class="form-group">
                                    <label class="form-label">AMOUNT (₹) *</label>
                                    <input type="number" class="form-input" id="amount" placeholder="5000" required>
                                </div>
                                <div class="form-group">
                                    <label class="form-label">PAYMENT METHOD *</label>
                                    <select class="form-select" id="method" required>
                                        <option value="">Select method</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Card">Credit/Debit Card</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Cheque">Cheque</option>
                                    </select>
                                </div>
                            </div>

                            <div class="form-group">
                                <label class="form-label">TRANSACTION ID</label>
                                <input type="text" class="form-input" id="transactionId" placeholder="TXN123456789">
                            </div>
                        </div>

                        <button type="submit" class="btn-primary">Update Payment</button>
                    </form>
                `}
            </div>
        `;

        if (!isPaid) {
            const form = content.querySelector('#paymentForm');
            const statusSelect = content.querySelector('#paymentStatus');
            const paidFields = content.querySelector('#paidFields');

            statusSelect.addEventListener('change', () => {
                paidFields.style.display = statusSelect.value === 'Paid' ? 'block' : 'none';
            });

            form.addEventListener('submit', (e) => {
                e.preventDefault();
                const status = statusSelect.value;
                
                const details = {};
                if (status === 'Paid') {
                    details.amount = parseFloat(document.getElementById('amount').value);
                    details.method = document.getElementById('method').value;
                    details.transactionId = document.getElementById('transactionId').value;
                }

                Admin.updatePaymentStatus(submissionId, status, details);
                closeModal('paymentModal');
                renderSubmissions();
                renderPayments();
                renderOverview();
                updateBadges();

                alert('Payment status updated successfully!');
            });
        }

        modal.style.display = 'flex';
    }

    // View user details
    function viewUser(userId) {
        const users = Admin.getAllUsers();
        const user = users.find(u => u.id === userId);
        if (!user) return;

        const userSubmissions = Admin.getUserSubmissions(userId);

        const modal = document.getElementById('userModal');
        const content = document.getElementById('userModalContent');

        content.innerHTML = `
            <div class="modal-header">
                <h2>User Details</h2>
                <button class="modal-close" onclick="AdminDashboard.closeModal('userModal')">&times;</button>
            </div>
            <div class="modal-body">
                <h3 style="margin-bottom: 1rem;">Personal Information</h3>
                <div class="user-details">
                    <div class="detail-row">
                        <label>Name:</label>
                        <span>${UI.sanitizeHTML(user.firstName + ' ' + user.lastName)}</span>
                    </div>
                    <div class="detail-row">
                        <label>Email:</label>
                        <span>${UI.sanitizeHTML(user.email)}</span>
                    </div>
                    <div class="detail-row">
                        <label>Institution:</label>
                        <span>${UI.sanitizeHTML(user.institution)}</span>
                    </div>
                    <div class="detail-row">
                        <label>Department:</label>
                        <span>${UI.sanitizeHTML(user.department || 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <label>Position:</label>
                        <span>${UI.sanitizeHTML(user.position || 'N/A')}</span>
                    </div>
                    <div class="detail-row">
                        <label>Registered:</label>
                        <span>${UI.formatDate(user.createdAt)}</span>
                    </div>
                </div>

                <h3 style="margin: 2rem 0 1rem;">Submissions (${userSubmissions.length})</h3>
                ${userSubmissions.length > 0 ? `
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Title</th>
                                <th>Status</th>
                                <th>Payment</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userSubmissions.map(sub => `
                                <tr>
                                    <td>${sub.id}</td>
                                    <td>${UI.sanitizeHTML(sub.title.substring(0, 40))}...</td>
                                    <td><span class="status-badge ${UI.getStatusClass(sub.status)}">${sub.status}</span></td>
                                    <td><span class="status-badge ${UI.getStatusClass(sub.paymentStatus)}">${sub.paymentStatus}</span></td>
                                    <td>${UI.formatDate(sub.dateSubmitted)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                ` : '<p style="color: var(--color-gray);">No submissions yet</p>'}
            </div>
        `;

        modal.style.display = 'flex';
    }

    // Close modal
    function closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'none';
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

    // Export submissions
    function exportSubmissions() {
        const data = allSubmissions.map(sub => ({
            'Submission ID': sub.id,
            'Title': sub.title,
            'Author': sub.correspondingAuthor,
            'Email': sub.authorEmail,
            'Institution': sub.affiliation,
            'Journal': sub.journal,
            'Keywords': sub.keywords,
            'Status': sub.status,
            'Payment Status': sub.paymentStatus,
            'Date Submitted': sub.dateSubmitted,
            'File Name': sub.fileName
        }));

        Admin.exportToCSV(data, `submissions-${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Export payments
    function exportPayments() {
        const data = Admin.getPaymentRecords().map(p => ({
            'Submission ID': p.id,
            'Title': p.title,
            'Payment Status': p.paymentStatus,
            'Amount': p.paymentAmount || 0,
            'Method': p.paymentMethod || '',
            'Transaction ID': p.transactionId || '',
            'Date Paid': p.paymentDate || '',
            'Date Submitted': p.dateSubmitted
        }));

        Admin.exportToCSV(data, `payments-${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Export users
    function exportUsers() {
        const data = Admin.getAllUsers().map(u => ({
            'Name': `${u.firstName} ${u.lastName}`,
            'Email': u.email,
            'Institution': u.institution,
            'Department': u.department || '',
            'Position': u.position || '',
            'Registered': u.createdAt
        }));

        Admin.exportToCSV(data, `users-${new Date().toISOString().split('T')[0]}.csv`);
    }

    // Setup event listeners
    function setupEventListeners() {
        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Admin.logout();
            });
        }

        // Settings button
        const settingsBtn = document.getElementById('settingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                const modal = document.getElementById('settingsModal');
                if (modal) {
                    modal.style.display = 'flex';
                }
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
        const modals = ['editModal', 'paymentModal', 'userModal', 'settingsModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) {
                        if (modalId === 'settingsModal') {
                            closeSettingsModal();
                        } else {
                            closeModal(modalId);
                        }
                    }
                });
            }
        });
    }

    // Handle settings update
    async function handleSettingsUpdate() {
        const messageContainer = document.getElementById('settingsMessageContainer');
        messageContainer.innerHTML = '';

        const currentPassword = document.getElementById('currentPassword').value;
        const newEmail = document.getElementById('newEmail').value.trim();
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            UI.showError(messageContainer, 'Please fill in password fields');
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
            await Admin.changeCredentials(currentPassword, newEmail, newPassword);
            UI.showSuccess(messageContainer, 'Credentials updated successfully!');
            
            setTimeout(() => {
                closeSettingsModal();
                Admin.logout();
            }, 2000);
        } catch (error) {
            UI.showError(messageContainer, error.message);
        }
    }

    return {
        init,
        updateStatus,
        quickUpdatePayment,
        viewSubmission,
        openPaymentModal,
        viewUser,
        closeModal,
        closeSettingsModal,
        confirmDeleteSubmission,
        confirmDeleteUser,
        downloadFile,
        exportSubmissions,
        exportPayments,
        exportUsers
    };
})();

// Initialize admin dashboard when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AdminDashboard.init);
} else {
    AdminDashboard.init();
}
