<?php
/**
 * Admin Routes
 * Handles admin operations
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Get all users
 */
function handleGetUsers() {
    $user = requireRole('admin');
    
    $pdo = getDbConnection();
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    try {
        $stmt = $pdo->prepare("
            SELECT id, name, email, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $users = $stmt->fetchAll();
        
        // Get total count
        $countStmt = $pdo->query("SELECT COUNT(*) as total FROM users");
        $total = $countStmt->fetch()['total'];
        
        sendSuccess([
            'users' => $users,
            'total' => $total,
            'limit' => $limit,
            'offset' => $offset
        ]);
        
    } catch (PDOException $e) {
        error_log("Get users error: " . $e->getMessage());
        sendError('Failed to fetch users', 500);
    }
}

/**
 * Delete user
 */
function handleDeleteUser($userId) {
    $user = requireRole('admin');
    
    if ($userId == $user['user_id']) {
        sendError('Cannot delete your own account', 400);
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if user exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        if (!$stmt->fetch()) {
            sendNotFound('User not found');
        }
        
        // Delete user (cascade will handle related records)
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        
        sendSuccess(null, 'User deleted successfully');
        
    } catch (PDOException $e) {
        error_log("Delete user error: " . $e->getMessage());
        sendError('Failed to delete user', 500);
    }
}

/**
 * Get all jobs (admin view)
 */
function handleGetAllJobs() {
    $user = requireRole('admin');
    
    $pdo = getDbConnection();
    
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 50;
    $offset = isset($_GET['offset']) ? (int)$_GET['offset'] : 0;
    
    try {
        $stmt = $pdo->prepare("
            SELECT j.*, u.name as client_name, u.email as client_email
            FROM jobs j
            JOIN users u ON j.client_id = u.id
            ORDER BY j.created_at DESC
            LIMIT ? OFFSET ?
        ");
        $stmt->execute([$limit, $offset]);
        $jobs = $stmt->fetchAll();
        
        sendSuccess($jobs);
        
    } catch (PDOException $e) {
        error_log("Get all jobs error: " . $e->getMessage());
        sendError('Failed to fetch jobs', 500);
    }
}

/**
 * Delete job
 */
function handleDeleteJob($jobId) {
    $user = requireRole('admin');
    
    $pdo = getDbConnection();
    
    try {
        // Check if job exists
        $stmt = $pdo->prepare("SELECT id FROM jobs WHERE id = ?");
        $stmt->execute([$jobId]);
        
        if (!$stmt->fetch()) {
            sendNotFound('Job not found');
        }
        
        // Delete job (cascade will handle related records)
        $stmt = $pdo->prepare("DELETE FROM jobs WHERE id = ?");
        $stmt->execute([$jobId]);
        
        sendSuccess(null, 'Job deleted successfully');
        
    } catch (PDOException $e) {
        error_log("Delete job error: " . $e->getMessage());
        sendError('Failed to delete job', 500);
    }
}

