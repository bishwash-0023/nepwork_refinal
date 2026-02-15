<?php
/**
 * Messages Routes
 * Handles messaging between users
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/validator.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Send a message
 */
function handleCreateMessage() {
    $user = requireAuth();
    
    $data = getJsonBody();
    
    if (!$data) {
        sendError('Invalid JSON data');
    }
    
    $errors = validateMessage($data);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if job exists
        $stmt = $pdo->prepare("SELECT id, client_id FROM jobs WHERE id = ?");
        $stmt->execute([$data['job_id']]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        // Verify user is part of this job (client or freelancer with accepted proposal)
        $isClient = $job['client_id'] == $user['user_id'];
        $isFreelancer = false;
        
        if (!$isClient) {
            $stmt = $pdo->prepare("
                SELECT id FROM proposals 
                WHERE job_id = ? AND freelancer_id = ? AND status = 'accepted'
            ");
            $stmt->execute([$data['job_id'], $user['user_id']]);
            $isFreelancer = $stmt->fetch() !== false;
        }
        
        if (!$isClient && !$isFreelancer && $user['role'] !== 'admin') {
            sendForbidden('You are not authorized to send messages for this job');
        }
        
        // Verify receiver is part of the job
        $receiverIsClient = $data['receiver_id'] == $job['client_id'];
        $receiverIsFreelancer = false;
        
        if (!$receiverIsClient) {
            $stmt = $pdo->prepare("
                SELECT id FROM proposals 
                WHERE job_id = ? AND freelancer_id = ? AND status = 'accepted'
            ");
            $stmt->execute([$data['job_id'], $data['receiver_id']]);
            $receiverIsFreelancer = $stmt->fetch() !== false;
        }
        
        if (!$receiverIsClient && !$receiverIsFreelancer) {
            sendError('Invalid receiver for this job', 400);
        }
        
        if ($data['receiver_id'] == $user['user_id']) {
            sendError('Cannot send message to yourself', 400);
        }
        
        // Create message
        $stmt = $pdo->prepare("
            INSERT INTO messages (job_id, sender_id, receiver_id, message, created_at)
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['job_id'],
            $user['user_id'],
            $data['receiver_id'],
            trim($data['message']),
            getCurrentTimestamp()
        ]);
        
        $messageId = $pdo->lastInsertId();
        
        // Fetch created message
        $stmt = $pdo->prepare("
            SELECT m.*, 
                   s.name as sender_name, 
                   r.name as receiver_name
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE m.id = ?
        ");
        $stmt->execute([$messageId]);
        $message = $stmt->fetch();
        
        sendSuccess($message, 'Message sent successfully', 201);
        
    } catch (PDOException $e) {
        error_log("Create message error: " . $e->getMessage());
        sendError('Failed to send message', 500);
    }
}

/**
 * Get messages for a job
 */
function handleGetJobMessages($jobId) {
    $user = requireAuth();
    
    $pdo = getDbConnection();
    
    try {
        // Check if job exists
        $stmt = $pdo->prepare("SELECT id, client_id FROM jobs WHERE id = ?");
        $stmt->execute([$jobId]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        // Verify user is part of this job
        $isClient = $job['client_id'] == $user['user_id'];
        $isFreelancer = false;
        
        if (!$isClient) {
            $stmt = $pdo->prepare("
                SELECT id FROM proposals 
                WHERE job_id = ? AND freelancer_id = ? AND status = 'accepted'
            ");
            $stmt->execute([$jobId, $user['user_id']]);
            $isFreelancer = $stmt->fetch() !== false;
        }
        
        if (!$isClient && !$isFreelancer && $user['role'] !== 'admin') {
            sendForbidden('You are not authorized to view messages for this job');
        }
        
        // Get messages
        $stmt = $pdo->prepare("
            SELECT m.*, 
                   s.name as sender_name, 
                   r.name as receiver_name
            FROM messages m
            JOIN users s ON m.sender_id = s.id
            JOIN users r ON m.receiver_id = r.id
            WHERE m.job_id = ?
            ORDER BY m.created_at ASC
        ");
        $stmt->execute([$jobId]);
        $messages = $stmt->fetchAll();
        
        sendSuccess($messages);
        
    } catch (PDOException $e) {
        error_log("Get messages error: " . $e->getMessage());
        sendError('Failed to fetch messages', 500);
    }
}

