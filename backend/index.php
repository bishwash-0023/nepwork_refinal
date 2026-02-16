<?php
/**
 * Main API Router
 * Handles all API requests and routes them to appropriate handlers
 */

// Enable error reporting for development
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Load configuration
require_once __DIR__ . '/config/config.php';
require_once __DIR__ . '/config/cors.php';
require_once __DIR__ . '/config/database.php';

// Handle CORS
handleCors();

// Load core files
require_once __DIR__ . '/core/response.php';
require_once __DIR__ . '/core/helpers.php';

// Get request method and path
$method = $_SERVER['REQUEST_METHOD'];
$requestUri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
// Normalize path by removing script name if running through XAMPP or similar
$scriptName = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
$path = $requestUri;
if ($scriptName !== '/' && $scriptName !== '.') {
    if (strpos($path, $scriptName) === 0) {
        $path = substr($path, strlen($scriptName));
    }
}
$path = str_replace('/api', '', $path);
$path = trim($path, '/');

// Route handling
try {
    // Auth routes
    if ($path === 'auth/register' && $method === 'POST') {
        require_once __DIR__ . '/routes/auth.php';
        handleRegister();
    }

    elseif ($path === 'auth/login' && $method === 'POST') {
        require_once __DIR__ . '/routes/auth.php';
        handleLogin();
    }

    elseif ($path === 'auth/me' && $method === 'GET') {
        require_once __DIR__ . '/routes/auth.php';
        handleGetMe();
    }

    // Jobs routes
    elseif ($path === 'jobs' && $method === 'GET') {
        require_once __DIR__ . '/routes/jobs.php';
        handleGetJobs();
    }

    elseif ($path === 'jobs' && $method === 'POST') {
        require_once __DIR__ . '/routes/jobs.php';
        handleCreateJob();
    }

    elseif (preg_match('/^jobs\/(\d+)$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/jobs.php';
        handleGetJob($matches[1]);
    }

    elseif (preg_match('/^jobs\/(\d+)\/status$/', $path, $matches) && $method === 'PUT') {
        require_once __DIR__ . '/routes/jobs.php';
        handleUpdateJobStatus($matches[1]);
    }

    // Proposals routes
    elseif ($path === 'proposals' && $method === 'POST') {
        require_once __DIR__ . '/routes/proposals.php';
        handleCreateProposal();
    }

    elseif ($path === 'proposals/my' && $method === 'GET') {
        require_once __DIR__ . '/routes/proposals.php';
        handleGetMyProposals();
    }

    elseif (preg_match('/^jobs\/(\d+)\/proposals$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/proposals.php';
        handleGetJobProposals($matches[1]);
    }

    elseif (preg_match('/^proposals\/(\d+)\/status$/', $path, $matches) && $method === 'PUT') {
        require_once __DIR__ . '/routes/proposals.php';
        handleUpdateProposalStatus($matches[1]);
    }

    // Messages routes
    elseif ($path === 'messages' && $method === 'POST') {
        require_once __DIR__ . '/routes/messages.php';
        handleCreateMessage();
    }

    elseif (preg_match('/^jobs\/(\d+)\/messages$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/messages.php';
        handleGetJobMessages($matches[1]);
    }

    // Reviews routes
    elseif ($path === 'reviews' && $method === 'POST') {
        require_once __DIR__ . '/routes/reviews.php';
        handleCreateReview();
    }

    elseif (preg_match('/^users\/(\d+)\/reviews$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/reviews.php';
        handleGetUserReviews($matches[1]);
    }

    // Admin routes
    elseif ($path === 'admin/users' && $method === 'GET') {
        require_once __DIR__ . '/routes/admin.php';
        handleGetUsers();
    }

    elseif (preg_match('/^admin\/users\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
        require_once __DIR__ . '/routes/admin.php';
        handleDeleteUser($matches[1]);
    }

    elseif ($path === 'admin/jobs' && $method === 'GET') {
        require_once __DIR__ . '/routes/admin.php';
        handleGetAllJobs();
    }

    elseif (preg_match('/^admin\/jobs\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
        require_once __DIR__ . '/routes/admin.php';
        handleDeleteJob($matches[1]);
    }

    // Upload routes
    elseif ($path === 'upload/image' && $method === 'POST') {
        require_once __DIR__ . '/routes/upload.php';
        handleUploadImage();
    }

    elseif ($path === 'upload/image' && $method === 'DELETE') {
        require_once __DIR__ . '/routes/upload.php';
        handleDeleteImage();
    }

    // Static file serving for uploads
    elseif (preg_match('/^storage\/uploads\/(.+)$/', $path, $matches) && $method === 'GET') {
        $relativePath = $matches[1];
        $filePath = __DIR__ . '/storage/uploads/' . $relativePath;

        if (file_exists($filePath) && is_file($filePath)) {
            $mimeType = mime_content_type($filePath);
            header('Content-Type: ' . $mimeType);
            header('Content-Length: ' . filesize($filePath));
            readfile($filePath);
            exit();
        }
        else {
            sendNotFound('File not found: ' . $path);
        }
    }

    // 404 - Route not found
    else {
        sendNotFound('API endpoint not found');
    }


}
catch (Exception $e) {
    error_log("API Error: " . $e->getMessage());
    sendError('Internal server error', 500);
}
