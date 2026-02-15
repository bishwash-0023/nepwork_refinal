<?php
/**
 * API Response Helpers
 * Standardized JSON responses
 */

/**
 * Send JSON response
 */
function sendResponse($data = null, $statusCode = 200, $message = null) {
    http_response_code($statusCode);
    header('Content-Type: application/json');
    
    $response = [
        'success' => $statusCode >= 200 && $statusCode < 300,
        'message' => $message,
        'data' => $data
    ];
    
    if ($data === null && $message === null) {
        $response = $data;
    }
    
    echo json_encode($response, JSON_PRETTY_PRINT);
    exit();
}

/**
 * Send success response
 */
function sendSuccess($data = null, $message = 'Success', $statusCode = 200) {
    sendResponse($data, $statusCode, $message);
}

/**
 * Send error response
 */
function sendError($message = 'Error occurred', $statusCode = 400, $errors = null) {
    $data = null;
    if ($errors !== null) {
        $data = ['errors' => $errors];
    }
    sendResponse($data, $statusCode, $message);
}

/**
 * Send unauthorized response
 */
function sendUnauthorized($message = 'Unauthorized') {
    sendError($message, 401);
}

/**
 * Send forbidden response
 */
function sendForbidden($message = 'Forbidden') {
    sendError($message, 403);
}

/**
 * Send not found response
 */
function sendNotFound($message = 'Resource not found') {
    sendError($message, 404);
}

/**
 * Send validation error response
 */
function sendValidationError($errors, $message = 'Validation failed') {
    sendError($message, 422, $errors);
}

