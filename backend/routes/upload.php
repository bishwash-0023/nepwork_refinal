<?php
/**
 * File Upload Routes
 * Handles image uploads
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/file_upload.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Upload image
 */
function handleUploadImage() {
    $user = requireAuth();
    
    // Check if file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        sendError('No image file uploaded', 400);
    }
    
    // Determine subfolder based on context (optional)
    $context = $_POST['context'] ?? 'general';
    $subfolder = $context . '/';
    
    // Upload image
    $result = uploadImage($_FILES['image'], $subfolder);
    
    if (!$result['success']) {
        sendValidationError($result['errors'], 'Image upload failed');
    }
    
    sendSuccess([
        'filename' => $result['filename'],
        'path' => $result['path'],
        'url' => $result['url']
    ], 'Image uploaded successfully', 201);
}

/**
 * Delete image
 */
function handleDeleteImage() {
    $user = requireAuth();
    
    $data = getJsonBody();
    
    if (empty($data['path'])) {
        sendError('Image path is required', 400);
    }
    
    // Only allow users to delete their own images or admins
    // You can add more validation here based on your needs
    
    if (deleteImage($data['path'])) {
        sendSuccess(null, 'Image deleted successfully');
    } else {
        sendError('Failed to delete image', 500);
    }
}

