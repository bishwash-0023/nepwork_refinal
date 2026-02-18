<?php
/**
 * Verification script for route files
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/helpers.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';

echo "🔍 Verifying Questions Route...\n";

try {
    require_once __DIR__ . '/../routes/questions.php';
    echo "✅ Questions route included successfully.\n";
}
catch (Throwable $e) {
    echo "❌ Failed to include Questions route: " . $e->getMessage() . "\n";
    echo "Trace: " . $e->getTraceAsString() . "\n";
}
