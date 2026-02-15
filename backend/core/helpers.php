<?php
/**
 * Helper Functions
 * Reusable utility functions
 */

/**
 * Sanitize string output
 */
function sanitize($string) {
    return htmlspecialchars($string, ENT_QUOTES, 'UTF-8');
}

/**
 * Generate random string
 */
function generateRandomString($length = 32) {
    return bin2hex(random_bytes($length / 2));
}

/**
 * Get current timestamp
 */
function getCurrentTimestamp() {
    return date('Y-m-d H:i:s');
}

/**
 * Format date for display
 */
function formatDate($date, $format = 'Y-m-d H:i:s') {
    return date($format, strtotime($date));
}

/**
 * Check if string is valid email
 */
function isValidEmail($email) {
    return filter_var($email, FILTER_VALIDATE_EMAIL) !== false;
}

/**
 * Get request body as JSON
 */
function getJsonBody() {
    $json = file_get_contents('php://input');
    $data = json_decode($json, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return null;
    }
    
    return $data;
}

/**
 * Get authorization token from header
 */
function getAuthToken() {
    $headers = getallheaders();
    
    if (isset($headers['Authorization'])) {
        $authHeader = $headers['Authorization'];
        if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
            return $matches[1];
        }
    }
    
    return null;
}

/**
 * Check if user has required role
 */
function hasRole($userRole, $requiredRoles) {
    if (!is_array($requiredRoles)) {
        $requiredRoles = [$requiredRoles];
    }
    return in_array($userRole, $requiredRoles);
}

/**
 * Calculate average rating
 */
function calculateAverageRating($ratings) {
    if (empty($ratings)) {
        return 0;
    }
    return round(array_sum($ratings) / count($ratings), 2);
}

