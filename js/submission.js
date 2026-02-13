// Submission Module
const Submission = (function () {
    'use strict';

    const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
    const ALLOWED_TYPES = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    // Generate unique submission ID
    function generateId() {
        return 'SUB-' + Date.now().toString(36).toUpperCase() + '-' +
            Math.random().toString(36).substr(2, 5).toUpperCase();
    }

    // Validate file
    function validateFile(file) {
        if (!file) {
            throw new Error('No file selected');
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error('File size exceeds 50MB limit');
        }

        if (!ALLOWED_TYPES.includes(file.type)) {
            throw new Error('Invalid file type. Please upload PDF or Word document');
        }

        return true;
    }

    // Create submission
    // Create submission
    async function createSubmission(formData, file) {
        const user = Auth.getCurrentUser();
        console.log('=== SUBMISSION CREATE START ===');
        console.log('User from session:', user);
        console.log('User userId:', user ? user.userId : 'NO USER');

        if (!user) {
            throw new Error('User not authenticated');
        }

        // Validate file
        validateFile(file);

        // DO NOT store file data - it causes localStorage issues
        // Just store file metadata instead
        const submission = {
            id: generateId(),
            userId: user.userId,
            title: formData.title,
            abstract: formData.abstract,
            keywords: formData.keywords,
            journal: formData.journal,
            correspondingAuthor: formData.correspondingAuthor,
            authorEmail: formData.authorEmail,
            coAuthors: formData.coAuthors,
            affiliation: formData.affiliation,
            status: 'Under Review',
            paymentStatus: 'Pending',
            fileName: file.name,
            fileSize: file.size,
            fileType: file.type,
            // IMPORTANT: NOT storing fileData - this was causing the issue!
            dateSubmitted: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            deleted: false
        };

        console.log('Submission object created:', submission);

        // Submit to Google Services (without file data)
        try {
            const result = await API.submitManuscript(submission, file);
            if (result && result.fileUpload && result.fileUpload.fileUrl) {
                submission.fileUrl = result.fileUpload.fileUrl;
            }
        } catch (error) {
            console.error('External submission error:', error);
        }

        // Save to local storage
        try {
            Storage.addSubmission(submission);
            console.log('✅ Submission saved to storage');

            // Verify it was saved
            const allSubs = Storage.getSubmissions();
            console.log('Total submissions now:', allSubs.length);
            console.log('All submissions:', allSubs);

            const userSubs = Storage.getUserSubmissions(user.userId);
            console.log('User submissions:', userSubs);
            console.log('=== SUBMISSION CREATE END ===');
        } catch (error) {
            console.error('❌ Failed to save submission:', error);
            throw new Error('Failed to save submission: ' + error.message);
        }

        return submission;
    }

    // Get user submissions
    function getUserSubmissions() {
        const user = Auth.getCurrentUser();
        if (!user) {
            console.error('❌ Cannot get submissions - No user logged in');
            return [];
        }

        console.log('📋 Getting submissions for user:', user.fullName, '(', user.userId, ')');
        const submissions = Storage.getUserSubmissions(user.userId);
        console.log('   Found:', submissions.length, 'submissions');
        return submissions;
    }

    // Get submission by ID
    function getSubmissionById(submissionId) {
        const submissions = Storage.getSubmissions();
        return submissions.find(s => s.id === submissionId && !s.deleted);
    }

    // Download file
    function downloadFile(submissionId) {
        const submission = getSubmissionById(submissionId);
        if (!submission) return;

        if (submission.fileUrl) {
            window.open(submission.fileUrl, '_blank');
            return;
        }

        if (!submission.fileData) {
            alert('File not available for download');
            return;
        }

        // Create download link
        const link = document.createElement('a');
        link.href = submission.fileData;
        link.download = submission.fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Update submission status
    function updateStatus(submissionId, status) {
        return Storage.updateSubmission(submissionId, {
            status,
            lastUpdated: new Date().toISOString()
        });
    }

    // Update payment status
    function updatePaymentStatus(submissionId, paymentStatus) {
        return Storage.updateSubmission(submissionId, {
            paymentStatus,
            lastUpdated: new Date().toISOString()
        });
    }

    // Get submission statistics
    function getStats() {
        const submissions = getUserSubmissions();
        console.log('📊 Computing stats for', submissions.length, 'submissions');

        const stats = {
            total: submissions.length,
            underReview: submissions.filter(s => s.status === 'Under Review').length,
            accepted: submissions.filter(s => s.status === 'Accepted').length,
            rejected: submissions.filter(s => s.status === 'Rejected').length,
            pendingPayment: submissions.filter(s => s.paymentStatus === 'Pending').length,
            paidSubmissions: submissions.filter(s => s.paymentStatus === 'Paid').length
        };

        console.log('   Stats:', stats);
        return stats;
    }

    return {
        createSubmission,
        getUserSubmissions,
        getSubmissionById,
        downloadFile,
        updateStatus,
        updatePaymentStatus,
        getStats,
        validateFile
    };
})();
