<?php
/**
 * Reviews Routes
 * Handles review submission
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/validator.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Create a review
 */
function handleCreateReview() {
    $user = requireAuth();
    
    $data = getJsonBody();
    
    if (!$data) {
        sendError('Invalid JSON data');
    }
    
    $errors = validateReview($data);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if job exists and is completed
        $stmt = $pdo->prepare("SELECT id, client_id, status FROM jobs WHERE id = ?");
        $stmt->execute([$data['job_id']]);
        $job = $stmt->fetch();
        
        if (!$job) {
            sendNotFound('Job not found');
        }
        
        if ($job['status'] !== 'completed') {
            sendError('Reviews can only be submitted for completed jobs', 400);
        }
        
        // Verify user is part of this job
        $isClient = $job['client_id'] == $user['user_id'];
        $isFreelancer = false;
        $acceptedProposal = null;
        
        if (!$isClient) {
            $stmt = $pdo->prepare("
                SELECT id, freelancer_id FROM proposals 
                WHERE job_id = ? AND freelancer_id = ? AND status = 'accepted'
            ");
            $stmt->execute([$data['job_id'], $user['user_id']]);
            $acceptedProposal = $stmt->fetch();
            $isFreelancer = $acceptedProposal !== false;
        }
        
        if (!$isClient && !$isFreelancer) {
            sendForbidden('You are not authorized to review this job');
        }
        
        // Verify reviewed_user_id is the other party
        if ($isClient) {
            // Client reviews freelancer
            if ($data['reviewed_user_id'] != $acceptedProposal['freelancer_id']) {
                sendError('Invalid user to review', 400);
            }
        } else {
            // Freelancer reviews client
            if ($data['reviewed_user_id'] != $job['client_id']) {
                sendError('Invalid user to review', 400);
            }
        }
        
        if ($data['reviewed_user_id'] == $user['user_id']) {
            sendError('Cannot review yourself', 400);
        }
        
        // Check if review already exists
        $stmt = $pdo->prepare("
            SELECT id FROM reviews 
            WHERE job_id = ? AND reviewer_id = ? AND reviewed_user_id = ?
        ");
        $stmt->execute([$data['job_id'], $user['user_id'], $data['reviewed_user_id']]);
        
        if ($stmt->fetch()) {
            sendError('You have already reviewed this user for this job', 409);
        }
        
        // Create review
        $stmt = $pdo->prepare("
            INSERT INTO reviews (job_id, reviewer_id, reviewed_user_id, rating, comment, created_at)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            $data['job_id'],
            $user['user_id'],
            $data['reviewed_user_id'],
            $data['rating'],
            trim($data['comment']),
            getCurrentTimestamp()
        ]);
        
        $reviewId = $pdo->lastInsertId();
        
        // Fetch created review
        $stmt = $pdo->prepare("
            SELECT r.*, 
                   reviewer.name as reviewer_name,
                   reviewed.name as reviewed_user_name
            FROM reviews r
            JOIN users reviewer ON r.reviewer_id = reviewer.id
            JOIN users reviewed ON r.reviewed_user_id = reviewed.id
            WHERE r.id = ?
        ");
        $stmt->execute([$reviewId]);
        $review = $stmt->fetch();
        
        sendSuccess($review, 'Review submitted successfully', 201);
        
    } catch (PDOException $e) {
        error_log("Create review error: " . $e->getMessage());
        sendError('Failed to submit review', 500);
    }
}

/**
 * Get reviews for a user
 */
function handleGetUserReviews($userId) {
    $pdo = getDbConnection();
    
    try {
        $stmt = $pdo->prepare("
            SELECT r.*, 
                   reviewer.name as reviewer_name,
                   j.title as job_title
            FROM reviews r
            JOIN users reviewer ON r.reviewer_id = reviewer.id
            JOIN jobs j ON r.job_id = j.id
            WHERE r.reviewed_user_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$userId]);
        $reviews = $stmt->fetchAll();
        
        // Calculate average rating
        $ratings = array_column($reviews, 'rating');
        $averageRating = calculateAverageRating($ratings);
        
        sendSuccess([
            'reviews' => $reviews,
            'average_rating' => $averageRating,
            'total_reviews' => count($reviews)
        ]);
        
    } catch (PDOException $e) {
        error_log("Get reviews error: " . $e->getMessage());
        sendError('Failed to fetch reviews', 500);
    }
}

