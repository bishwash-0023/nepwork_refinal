<?php
/**
 * Applications Routes
 * Handles job application submission and retrieval
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/validator.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Submit application for a job
 */
function handleCreateApplication()
{
    $user = requireRole(['freelancer', 'admin']);

    $data = getJsonBody();

    if (!$data) {
        sendError('Invalid JSON data');
    }

    // Basic validation
    if (!isset($data['job_id'])) {
        sendError('Job ID is required');
    }

    $pdo = getDbConnection();

    try {
        // Check if job exists
        $stmt = $pdo->prepare("SELECT id, client_id, status FROM jobs WHERE id = ?");
        $stmt->execute([$data['job_id']]);
        $job = $stmt->fetch();

        if (!$job) {
            sendNotFound('Job not found');
        }

        if ($job['status'] !== 'open') {
            sendError('This job is no longer accepting applications', 400);
        }

        if ($job['client_id'] == $user['user_id']) {
            sendError('You cannot apply for your own job', 400);
        }

        // Check if already applied
        $stmt = $pdo->prepare("SELECT id FROM applications WHERE job_id = ? AND user_id = ?");
        $stmt->execute([$data['job_id'], $user['user_id']]);
        if ($stmt->fetch()) {
            sendError('You have already applied for this job', 409);
        }

        $pdo->beginTransaction();

        // Create application
        $stmt = $pdo->prepare("
            INSERT INTO applications (job_id, user_id, status, created_at)
            VALUES (?, ?, 'pending', ?)
        ");
        $now = getCurrentTimestamp();
        $stmt->execute([$data['job_id'], $user['user_id'], $now]);

        $applicationId = $pdo->lastInsertId();

        // Create application details
        $stmt = $pdo->prepare("
            INSERT INTO application_details (
                application_id, resume_path, eligibility_path, biodata_path, 
                cover_letter, additional_info, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ");

        $stmt->execute([
            $applicationId,
            $data['resume_path'] ?? null,
            $data['eligibility_path'] ?? null,
            $data['biodata_path'] ?? null,
            trim($data['cover_letter'] ?? ''),
            trim($data['additional_info'] ?? ''),
            $now
        ]);

        $pdo->commit();

        sendSuccess(['application_id' => $applicationId], 'Application submitted successfully', 201);

    }
    catch (PDOException $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        error_log("Create application error: " . $e->getMessage());
        sendError('Failed to submit application: ' . $e->getMessage(), 500);
    }
}

/**
 * Get applications for a specific job
 */
function handleGetJobApplications($jobId)
{
    $user = requireRole(['client', 'admin']);

    $pdo = getDbConnection();

    try {
        // Verify job ownership
        $stmt = $pdo->prepare("SELECT client_id FROM jobs WHERE id = ?");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();

        if (!$job) {
            sendNotFound('Job not found');
        }

        if ($job['client_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            sendForbidden('You can only view applications for your own jobs');
        }

        $stmt = $pdo->prepare("
            SELECT a.*, u.name as applicant_name, u.email as applicant_email
            FROM applications a
            JOIN users u ON a.user_id = u.id
            WHERE a.job_id = ?
            ORDER BY a.created_at DESC
        ");
        $stmt->execute([$jobId]);
        $applications = $stmt->fetchAll();

        sendSuccess($applications);

    }
    catch (PDOException $e) {
        error_log("Get job applications error: " . $e->getMessage());
        sendError('Failed to fetch applications', 500);
    }
}

/**
 * Get deep details of an application
 */
function handleGetApplicationDetails($applicationId)
{
    $user = requireAuth();

    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("
            SELECT a.*, ad.resume_path, ad.eligibility_path, ad.biodata_path, 
                   ad.cover_letter, ad.additional_info,
                   u.name as applicant_name, u.email as applicant_email,
                   j.title as job_title, j.client_id
            FROM applications a
            JOIN application_details ad ON a.id = ad.application_id
            JOIN users u ON a.user_id = u.id
            JOIN jobs j ON a.job_id = j.id
            WHERE a.id = ?
        ");
        $stmt->execute([$applicationId]);
        $details = $stmt->fetch();

        if (!$details) {
            sendNotFound('Application details not found');
        }

        // Security: only applicant, job owner, or admin can view details
        if ($details['user_id'] != $user['user_id'] &&
        $details['client_id'] != $user['user_id'] &&
        $user['role'] !== 'admin') {
            sendForbidden('You do not have permission to view this application');
        }

        sendSuccess($details);

    }
    catch (PDOException $e) {
        error_log("Get application details error: " . $e->getMessage());
        sendError('Failed to fetch details', 500);
    }
}
