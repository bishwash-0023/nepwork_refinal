<?php
/**
 * Proposals Routes
 * Handles proposal submission and retrieval
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/validator.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Submit proposal for a job
 */
function handleCreateProposal() {
    $user = requireRole(['freelancer', 'admin']);
    
    $data = getJsonBody();
    
    if (!$data) {
        sendError('Invalid JSON data');
    }
    
    $errors = validateProposal($data);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if job exists and is open
        $stmt = $pdo->prepare("SELECT id, status, client_id FROM jobs WHERE id = ?");
        $stmt->execute([$data['job_id']]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        if ($job['status'] !== 'open') {
            sendError('Job is not accepting proposals', 400);
        }
        
        if ($job['client_id'] == $user['user_id']) {
            sendError('You cannot submit a proposal for your own job', 400);
        }
        
        // Check if user already submitted a proposal
        $stmt = $pdo->prepare("SELECT id FROM proposals WHERE job_id = ? AND freelancer_id = ?");
        $stmt->execute([$data['job_id'], $user['user_id']]);
        
        if ($stmt->fetch()) {
            sendError('You have already submitted a proposal for this job', 409);
        }
        
        // Create proposal
        $stmt = $pdo->prepare("
            INSERT INTO proposals (job_id, freelancer_id, bid_amount, cover_letter, status, created_at)
            VALUES (?, ?, ?, ?, 'pending', ?)
        ");
        
        $stmt->execute([
            $data['job_id'],
            $user['user_id'],
            $data['bid_amount'],
            trim($data['cover_letter']),
            getCurrentTimestamp()
        ]);
        
        $proposalId = $pdo->lastInsertId();
        
        // Fetch created proposal
        $stmt = $pdo->prepare("
            SELECT p.*, u.name as freelancer_name, u.email as freelancer_email
            FROM proposals p
            JOIN users u ON p.freelancer_id = u.id
            WHERE p.id = ?
        ");
        $stmt->execute([$proposalId]);
        $proposal = $stmt->fetch();
        
        sendSuccess($proposal, 'Proposal submitted successfully', 201);
        
    } catch (PDOException $e) {
        error_log("Create proposal error: " . $e->getMessage());
        sendError('Failed to submit proposal', 500);
    }
}

/**
 * Get proposals for a job
 */
function handleGetJobProposals($jobId) {
    $user = requireAuth();
    
    $pdo = getDbConnection();
    
    try {
        // Check if job exists
        $stmt = $pdo->prepare("SELECT client_id FROM jobs WHERE id = ?");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        // Only job owner or admin can view proposals
        if ($job['client_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            sendForbidden('You can only view proposals for your own jobs');
        }
        
        $stmt = $pdo->prepare("
            SELECT p.*, u.name as freelancer_name, u.email as freelancer_email
            FROM proposals p
            JOIN users u ON p.freelancer_id = u.id
            WHERE p.job_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$jobId]);
        $proposals = $stmt->fetchAll();
        
        sendSuccess($proposals);
        
    } catch (PDOException $e) {
        error_log("Get proposals error: " . $e->getMessage());
        sendError('Failed to fetch proposals', 500);
    }
}

/**
 * Get proposals submitted by current user
 */
function handleGetMyProposals() {
    $user = requireRole(['freelancer', 'admin']);
    
    $pdo = getDbConnection();
    
    try {
        $stmt = $pdo->prepare("
            SELECT p.*, j.title as job_title, j.status as job_status, u.name as client_name
            FROM proposals p
            JOIN jobs j ON p.job_id = j.id
            JOIN users u ON j.client_id = u.id
            WHERE p.freelancer_id = ?
            ORDER BY p.created_at DESC
        ");
        $stmt->execute([$user['user_id']]);
        $proposals = $stmt->fetchAll();
        
        sendSuccess($proposals);
        
    } catch (PDOException $e) {
        error_log("Get my proposals error: " . $e->getMessage());
        sendError('Failed to fetch proposals', 500);
    }
}

/**
 * Accept or reject a proposal
 */
function handleUpdateProposalStatus($proposalId) {
    $user = requireRole(['client', 'admin']);
    
    $data = getJsonBody();
    
    if (!isset($data['status']) || !in_array($data['status'], ['accepted', 'rejected'])) {
        sendError('Valid status (accepted or rejected) is required');
    }
    
    $pdo = getDbConnection();
    
    try {
        // Get proposal with job info
        $stmt = $pdo->prepare("
            SELECT p.*, j.client_id, j.status as job_status
            FROM proposals p
            JOIN jobs j ON p.job_id = j.id
            WHERE p.id = ?
        ");
        $stmt->execute([$proposalId]);
        $proposal = $stmt->fetch();
        
        if (!$proposal) {
            sendNotFound('Proposal not found');
        }
        
        // Check if user owns the job
        if ($proposal['client_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            sendForbidden('You can only update proposals for your own jobs');
        }
        
        // Update proposal status
        $stmt = $pdo->prepare("UPDATE proposals SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $proposalId]);
        
        // If accepted, update job status and reject other proposals
        if ($data['status'] === 'accepted') {
            $stmt = $pdo->prepare("UPDATE jobs SET status = 'in_progress' WHERE id = ?");
            $stmt->execute([$proposal['job_id']]);
            
            $stmt = $pdo->prepare("
                UPDATE proposals 
                SET status = 'rejected' 
                WHERE job_id = ? AND id != ? AND status = 'pending'
            ");
            $stmt->execute([$proposal['job_id'], $proposalId]);
        }
        
        // Fetch updated proposal
        $stmt = $pdo->prepare("
            SELECT p.*, u.name as freelancer_name, u.email as freelancer_email
            FROM proposals p
            JOIN users u ON p.freelancer_id = u.id
            WHERE p.id = ?
        ");
        $stmt->execute([$proposalId]);
        $updatedProposal = $stmt->fetch();
        
        sendSuccess($updatedProposal, 'Proposal status updated');
        
    } catch (PDOException $e) {
        error_log("Update proposal error: " . $e->getMessage());
        sendError('Failed to update proposal', 500);
    }
}

