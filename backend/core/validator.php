<?php
/**
 * Input Validation Functions
 */

require_once __DIR__ . '/helpers.php';

/**
 * Validate registration data
 */
function validateRegistration($data) {
    $errors = [];
    
    if (empty($data['name']) || strlen(trim($data['name'])) < 2) {
        $errors['name'] = 'Name must be at least 2 characters';
    }
    
    if (empty($data['email']) || !isValidEmail($data['email'])) {
        $errors['email'] = 'Valid email is required';
    }
    
    if (empty($data['password']) || strlen($data['password']) < 6) {
        $errors['password'] = 'Password must be at least 6 characters';
    }
    
    if (empty($data['role']) || !in_array($data['role'], ['client', 'freelancer'])) {
        $errors['role'] = 'Valid role (client or freelancer) is required';
    }
    
    return $errors;
}

/**
 * Validate login data
 */
function validateLogin($data) {
    $errors = [];
    
    if (empty($data['email']) || !isValidEmail($data['email'])) {
        $errors['email'] = 'Valid email is required';
    }
    
    if (empty($data['password'])) {
        $errors['password'] = 'Password is required';
    }
    
    return $errors;
}

/**
 * Validate job data
 */
function validateJob($data) {
    $errors = [];
    
    if (empty($data['title']) || strlen(trim($data['title'])) < 5) {
        $errors['title'] = 'Title must be at least 5 characters';
    }
    
    if (empty($data['description']) || strlen(trim($data['description'])) < 20) {
        $errors['description'] = 'Description must be at least 20 characters';
    }
    
    if (empty($data['budget']) || !is_numeric($data['budget']) || $data['budget'] <= 0) {
        $errors['budget'] = 'Valid budget amount is required';
    }
    
    return $errors;
}

/**
 * Validate proposal data
 */
function validateProposal($data) {
    $errors = [];
    
    if (empty($data['job_id']) || !is_numeric($data['job_id'])) {
        $errors['job_id'] = 'Valid job ID is required';
    }
    
    if (empty($data['bid_amount']) || !is_numeric($data['bid_amount']) || $data['bid_amount'] <= 0) {
        $errors['bid_amount'] = 'Valid bid amount is required';
    }
    
    if (empty($data['cover_letter']) || strlen(trim($data['cover_letter'])) < 10) {
        $errors['cover_letter'] = 'Cover letter must be at least 10 characters';
    }
    
    return $errors;
}

/**
 * Validate message data
 */
function validateMessage($data) {
    $errors = [];
    
    if (empty($data['job_id']) || !is_numeric($data['job_id'])) {
        $errors['job_id'] = 'Valid job ID is required';
    }
    
    if (empty($data['receiver_id']) || !is_numeric($data['receiver_id'])) {
        $errors['receiver_id'] = 'Valid receiver ID is required';
    }
    
    if (empty($data['message']) || strlen(trim($data['message'])) < 1) {
        $errors['message'] = 'Message cannot be empty';
    }
    
    return $errors;
}

/**
 * Validate review data
 */
function validateReview($data) {
    $errors = [];
    
    if (empty($data['job_id']) || !is_numeric($data['job_id'])) {
        $errors['job_id'] = 'Valid job ID is required';
    }
    
    if (empty($data['reviewed_user_id']) || !is_numeric($data['reviewed_user_id'])) {
        $errors['reviewed_user_id'] = 'Valid user ID is required';
    }
    
    if (empty($data['rating']) || !is_numeric($data['rating']) || $data['rating'] < 1 || $data['rating'] > 5) {
        $errors['rating'] = 'Rating must be between 1 and 5';
    }
    
    if (empty($data['comment']) || strlen(trim($data['comment'])) < 5) {
        $errors['comment'] = 'Comment must be at least 5 characters';
    }
    
    return $errors;
}

