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

// Log request arrival to console
file_put_contents('php://stderr', "[" . date('Y-m-d H:i:s') . "] --> $method $requestUri" . PHP_EOL);

// Normalize path
$path = $requestUri;
// If script name is something like /backend/index.php, strip /backend/
$scriptDir = str_replace('\\', '/', dirname($_SERVER['SCRIPT_NAME']));
if ($scriptDir !== '/' && $scriptDir !== '.') {
    if (strpos($path, $scriptDir) === 0) {
        $path = substr($path, strlen($scriptDir));
    }
}

// Remove /api prefix if present but DON'T trim too aggressively
if (strpos($path, '/api/') === 0) {
    $path = substr($path, 4);
}
if (strpos($path, 'api/') === 0) {
    $path = substr($path, 4);
}

$path = trim($path, '/');

// Log resolved path
file_put_contents('php://stderr', "[" . date('Y-m-d H:i:s') . "] Resolved Path: $path" . PHP_EOL);

// Route handling
try {
    // 1. Static file serving for uploads (Prioritized)
    if (strpos($path, 'storage/uploads/') === 0 && $method === 'GET') {
        $filePath = __DIR__ . '/' . $path;

        if (file_exists($filePath) && is_file($filePath)) {
            $mimeType = mime_content_type($filePath);
            header('Content-Type: ' . $mimeType);
            header('Content-Length: ' . filesize($filePath));
            header('Cache-Control: public, max-age=3600');
            readfile($filePath);
            exit();
        }
        else {
            file_put_contents('php://stderr', "[" . date('Y-m-d H:i:s') . "] Static File NOT FOUND: $filePath" . PHP_EOL);
        }
    }

    // 2. Auth routes
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

    elseif ($path === 'jobs/my' && $method === 'GET') {
        require_once __DIR__ . '/routes/jobs.php';
        handleGetMyJobs();
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

    // Applications routes
    elseif ($path === 'applications' && $method === 'POST') {
        require_once __DIR__ . '/routes/applications.php';
        handleCreateApplication();
    }

    elseif (preg_match('/^applications\/job\/(\d+)$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/applications.php';
        handleGetJobApplications($matches[1]);
    }

    elseif (preg_match('/^applications\/(\d+)$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/applications.php';
        handleGetApplicationDetails($matches[1]);
    }

    elseif (preg_match('/^applications\/(\d+)\/status$/', $path, $matches) && $method === 'PUT') {
        require_once __DIR__ . '/routes/applications.php';
        handleUpdateApplicationStatus($matches[1]);
    }

    // Question routes
    elseif ($path === 'questions' && $method === 'POST') {
        require_once __DIR__ . '/routes/questions.php';
        handleCreateQuestion();
    }
    elseif (preg_match('/^questions\/job\/(\d+)$/', $path, $matches) && $method === 'GET') {
        require_once __DIR__ . '/routes/questions.php';
        handleGetJobQuestions($matches[1]);
    }
    elseif (preg_match('/^questions\/(\d+)\/answer$/', $path, $matches) && $method === 'PUT') {
        require_once __DIR__ . '/routes/questions.php';
        handleAnswerQuestion($matches[1]);
    }
    elseif (preg_match('/^questions\/(\d+)\/react$/', $path, $matches) && $method === 'POST') {
        require_once __DIR__ . '/routes/questions.php';
        handleReactToQuestion($matches[1]);
    }
    elseif (preg_match('/^questions\/(\d+)$/', $path, $matches) && $method === 'DELETE') {
        require_once __DIR__ . '/routes/questions.php';
        handleDeleteQuestion($matches[1]);
    }
    elseif ($path === 'questions/my' && $method === 'GET') {
        require_once __DIR__ . '/routes/questions.php';
        handleGetMyJobQuestions();
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

    // 404 - Route not found
    else {
        sendNotFound('API endpoint not found');
    }


}
catch (Exception $e) {
    file_put_contents('php://stderr', "[" . date('Y-m-d H:i:s') . "] !!! UNCAUGHT EXCEPTION: " . $e->getMessage() . PHP_EOL . $e->getTraceAsString() . PHP_EOL);
    sendError('Internal server error: ' . $e->getMessage(), 500, $e->getTraceAsString());
}
