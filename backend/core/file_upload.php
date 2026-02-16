<?php
/**
 * File Upload Handler
 * Handles secure image uploads
 */

require_once __DIR__ . '/response.php';
require_once __DIR__ . '/helpers.php';

// Upload configuration
define('UPLOAD_DIR', __DIR__ . '/../storage/uploads/');
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_EXTENSIONS', ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx']);
define('ALLOWED_MIME_TYPES', [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
]);

/**
 * Validate uploaded file
 */
function validateUploadedFile($file)
{
    $errors = [];

    // Check if file was uploaded
    if (!isset($file) || $file['error'] !== UPLOAD_ERR_OK) {
        $errors[] = 'File upload failed';
        return $errors;
    }

    // Check file size
    if ($file['size'] > MAX_FILE_SIZE) {
        $errors[] = 'File size exceeds maximum allowed size (' . (MAX_FILE_SIZE / (1024 * 1024)) . 'MB)';
    }

    // Check file extension
    $extension = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    if (!in_array($extension, ALLOWED_EXTENSIONS)) {
        $errors[] = 'Invalid file type. Allowed: ' . implode(', ', ALLOWED_EXTENSIONS);
    }

    // Check MIME type
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $file['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, ALLOWED_MIME_TYPES)) {
        $errors[] = 'Invalid file MIME type: ' . $mimeType;
    }

    // Additional security: check if file is actually an image (only if image type)
    if (strpos($mimeType, 'image/') === 0) {
        $imageInfo = @getimagesize($file['tmp_name']);
        if ($imageInfo === false) {
            $errors[] = 'File is not a valid image';
        }
    }

    return $errors;
}

/**
 * Generate unique filename
 */
function generateUniqueFilename($originalName)
{
    $extension = strtolower(pathinfo($originalName, PATHINFO_EXTENSION));
    $filename = generateRandomString(32) . '.' . $extension;
    return $filename;
}

/**
 * Upload image file
 */
function uploadImage($file, $subfolder = '')
{
    // Validate file
    $errors = validateUploadedFile($file);
    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }

    // Create upload directory if it doesn't exist
    $uploadPath = UPLOAD_DIR . $subfolder;
    if (!is_dir($uploadPath)) {
        mkdir($uploadPath, 0755, true);
    }

    // Generate unique filename
    $filename = generateUniqueFilename($file['name']);
    $filepath = $uploadPath . $filename;

    // Move uploaded file
    if (!move_uploaded_file($file['tmp_name'], $filepath)) {
        return ['success' => false, 'errors' => ['Failed to save file']];
    }

    // Return relative path for database storage
    $relativePath = 'storage/uploads/' . $subfolder . $filename;

    return [
        'success' => true,
        'filename' => $filename,
        'path' => $relativePath,
        'url' => API_URL . '/' . $relativePath
    ];
}

/**
 * Delete image file
 */
function deleteImage($filepath)
{
    $fullPath = __DIR__ . '/../' . $filepath;
    if (file_exists($fullPath)) {
        return unlink($fullPath);
    }
    return false;
}

/**
 * Get image URL
 */
function getImageUrl($filepath)
{
    if (empty($filepath)) {
        return null;
    }

    // If already a full URL, return as is
    if (filter_var($filepath, FILTER_VALIDATE_URL)) {
        return $filepath;
    }

    // Return relative URL
    return API_URL . '/' . ltrim($filepath, '/');
}
