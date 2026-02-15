<?php
/**
 * JWT Authentication Middleware
 * Handles token generation, validation, and user authentication
 */

require_once __DIR__ . '/helpers.php';
require_once __DIR__ . '/response.php';
require_once __DIR__ . '/../config/config.php';

/**
 * Generate JWT token
 */
function generateJWT($userId, $email, $role) {
    $header = json_encode(['typ' => 'JWT', 'alg' => JWT_ALGORITHM]);
    
    $payload = json_encode([
        'user_id' => $userId,
        'email' => $email,
        'role' => $role,
        'iat' => time(),
        'exp' => time() + JWT_EXPIRY
    ]);
    
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    return $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
}

/**
 * Verify JWT token
 */
function verifyJWT($token) {
    $parts = explode('.', $token);
    
    if (count($parts) !== 3) {
        return null;
    }
    
    list($base64UrlHeader, $base64UrlPayload, $base64UrlSignature) = $parts;
    
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, JWT_SECRET, true);
    $base64UrlSignatureCheck = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    if ($base64UrlSignature !== $base64UrlSignatureCheck) {
        return null;
    }
    
    $payload = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $base64UrlPayload)), true);
    
    if (isset($payload['exp']) && $payload['exp'] < time()) {
        return null;
    }
    
    return $payload;
}

/**
 * Get authenticated user from token
 */
function getAuthenticatedUser() {
    $token = getAuthToken();
    
    if (!$token) {
        return null;
    }
    
    $payload = verifyJWT($token);
    
    if (!$payload) {
        return null;
    }
    
    return $payload;
}

/**
 * Require authentication middleware
 */
function requireAuth() {
    $user = getAuthenticatedUser();
    
    if (!$user) {
        sendUnauthorized('Authentication required');
    }
    
    return $user;
}

/**
 * Require specific role middleware
 */
function requireRole($allowedRoles) {
    $user = requireAuth();
    
    if (!hasRole($user['role'], $allowedRoles)) {
        sendForbidden('Insufficient permissions');
    }
    
    return $user;
}

