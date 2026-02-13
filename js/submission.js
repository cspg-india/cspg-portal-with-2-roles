// Submission Module
const Submission = (function() {
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

    // Convert file to base64 for storage
    async function fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Create submission
    async function createSubmission(formData, file) {
        const user = Auth.getCurrentUser();
        if (!user) {
            throw new Error('User not authenticated');
        }

        // Validate file
        validateFile(file);

        // Convert file to base64 for storage
        const fileData = await fileToBase64(file);

        // Create submission object
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
            fileData: fileData, // Store base64 encoded file
            dateSubmitted: new Date().toISOString(),
            lastUpdated: new Date().toISOString(),
            deleted: false
        };

        // Submit to Google Services
        try {
            await API.submitManuscript(submission, file);
        } catch (error) {
            console.error('External submission error:', error);
            // Continue with local storage even if external fails
        }

        // Save to local storage
        Storage.addSubmission(submission);

        return submission;
    }

    // Get user submissions
    function getUserSubmissions() {
        const user = Auth.getCurrentUser();
        if (!user) return [];
        
        return Storage.getUserSubmissions(user.userId);
    }

    // Get submission by ID
    function getSubmissionById(submissionId) {
        const submissions = Storage.getSubmissions();
        return submissions.find(s => s.id === submissionId && !s.deleted);
    }

    // Download file
    function downloadFile(submissionId) {
        const submission = getSubmissionById(submissionId);
        if (!submission || !submission.fileData) {
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
        
        return {
            total: submissions.length,
            underReview: submissions.filter(s => s.status === 'Under Review').length,
            accepted: submissions.filter(s => s.status === 'Accepted').length,
            rejected: submissions.filter(s => s.status === 'Rejected').length,
            pendingPayment: submissions.filter(s => s.paymentStatus === 'Pending').length,
            paidSubmissions: submissions.filter(s => s.paymentStatus === 'Paid').length
        };
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
