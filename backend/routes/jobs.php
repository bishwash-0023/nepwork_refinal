<?php
/**
 * Jobs Routes
 * Handles job creation, listing, and details
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/validator.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Get all jobs (with filters)
 */
function handleGetJobs() {
    $pdo = getDbConnection();
    
    $status = $_GET['status'] ?? null;
    $clientId = $_GET['client_id'] ?? null;
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    try {
        $sql = "
            SELECT j.*, u.name as client_name, u.email as client_email
            FROM jobs j
            JOIN users u ON j.client_id = u.id
            WHERE 1=1
        ";
        
        $params = [];
        
        if ($status) {
            $sql .= " AND j.status = ?";
            $params[] = $status;
        }
        
        if ($clientId) {
            $sql .= " AND j.client_id = ?";
            $params[] = $clientId;
        }
        
        $sql .= " ORDER BY j.created_at DESC LIMIT ? OFFSET ?";
        $params[] = $limit;
        $params[] = $offset;
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);
        $jobs = $stmt->fetchAll();
        
        // Get total count
        $countSql = "SELECT COUNT(*) as total FROM jobs WHERE 1=1";
        $countParams = [];
        
        if ($status) {
            $countSql .= " AND status = ?";
            $countParams[] = $status;
        }
        
        if ($clientId) {
            $countSql .= " AND client_id = ?";
            $countParams[] = $clientId;
        }
        
        $countStmt = $pdo->prepare($countSql);
        $countStmt->execute($countParams);
        $total = $countStmt->fetch()['total'];
        
        sendSuccess([
            'jobs' => $jobs,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
        
    } catch (PDOException $e) {
        error_log("Get jobs error: " . $e->getMessage());
        sendError('Failed to fetch jobs', 500);
    }
}

/**
 * Get single job by ID
 */
function handleGetJob($jobId) {
    $pdo = getDbConnection();
    
    try {
        $stmt = $pdo->prepare("
            SELECT j.*, u.name as client_name, u.email as client_email
            FROM jobs j
            JOIN users u ON j.client_id = u.id
            WHERE j.id = ?
        ");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        sendSuccess($job);
        
    } catch (PDOException $e) {
        error_log("Get job error: " . $e->getMessage());
        sendError('Failed to fetch job', 500);
    }
}

/**
 * Create new job
 */
function handleCreateJob() {
    $user = requireRole(['client', 'admin']);
    
    $data = getJsonBody();
    
    if (!$data) {
        sendError('Invalid JSON data');
    }
    
    $errors = validateJob($data);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $pdo = getDbConnection();
    
    try {
        $imagePath = isset($data['image_path']) ? $data['image_path'] : null;
        
        $stmt = $pdo->prepare("
            INSERT INTO jobs (client_id, title, description, budget, status, image_path, created_at)
            VALUES (?, ?, ?, ?, 'open', ?, ?)
        ");
        
        $stmt->execute([
            $user['user_id'],
            trim($data['title']),
            trim($data['description']),
            $data['budget'],
            $imagePath,
            getCurrentTimestamp()
        ]);
        
        $jobId = $pdo->lastInsertId();
        
        // Fetch created job
        $stmt = $pdo->prepare("
            SELECT j.*, u.name as client_name, u.email as client_email
            FROM jobs j
            JOIN users u ON j.client_id = u.id
            WHERE j.id = ?
        ");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        sendSuccess($job, 'Job created successfully', 201);
        
    } catch (PDOException $e) {
        error_log("Create job error: " . $e->getMessage());
        sendError('Failed to create job', 500);
    }
}

/**
 * Update job status
 */
function handleUpdateJobStatus($jobId) {
    $user = requireAuth();
    
    $data = getJsonBody();
    
    if (!isset($data['status']) || !in_array($data['status'], ['open', 'in_progress', 'completed'])) {
        sendError('Valid status is required');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if user owns the job or is admin
        $stmt = $pdo->prepare("SELECT client_id FROM jobs WHERE id = ?");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        if ($job['client_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            sendForbidden('You can only update your own jobs');
        }
        
        $stmt = $pdo->prepare("UPDATE jobs SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $jobId]);
        
        // Fetch updated job
        $stmt = $pdo->prepare("
            SELECT j.*, u.name as client_name, u.email as client_email
            FROM jobs j
            JOIN users u ON j.client_id = u.id
            WHERE j.id = ?
        ");
        $stmt->execute([$jobId]);
        $updatedJob = $stmt->fetch();
        
        sendSuccess($updatedJob, 'Job status updated');
        
    } catch (PDOException $e) {
        error_log("Update job error: " . $e->getMessage());
        sendError('Failed to update job', 500);
    }
}

