<?php
/**
 * Main Configuration File
 * Handles environment variables and app settings
 */

// Load environment variables from .env file
function loadEnv($path)
{
    if (!file_exists($path)) {
        return;
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        if (strpos(trim($line), '#') === 0) {
            continue;
        }

        list($name, $value) = explode('=', $line, 2);
        $name = trim($name);
        $value = trim($value);

        if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
            putenv(sprintf('%s=%s', $name, $value));
            $_ENV[$name] = $value;
            $_SERVER[$name] = $value;
        }
    }
}

// Load .env file
loadEnv(__DIR__ . '/../.env');

// App Configuration
define('APP_NAME', getenv('APP_NAME') ?: 'Freelance Platform');
define('APP_URL', getenv('APP_URL') ?: 'http://localhost:3000');
define('API_URL', getenv('API_URL') ?: 'http://localhost:5135');

// JWT Configuration
define('JWT_SECRET', getenv('JWT_SECRET') ?: 'your-secret-key-change-in-production');
define('JWT_ALGORITHM', 'HS256');
define('JWT_EXPIRY', 86400); // 24 hours

// Database Configuration
define('DB_DRIVER', getenv('DB_DRIVER') ?: 'sqlite');
define('DB_HOST', getenv('DB_HOST') ?: 'localhost');
define('DB_NAME', getenv('DB_NAME') ?: 'freelance');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

$dbDatabase = getenv('DB_DATABASE');
if (!$dbDatabase) {
    $dbDatabase = __DIR__ . '/../storage/database.sqlite';
}
elseif ($dbDatabase !== ':memory:' && substr($dbDatabase, 0, 1) !== '/' && substr($dbDatabase, 1, 1) !== ':') {
    // If it's a relative path and not SQLite memory, resolve it relative to backend root
    $dbDatabase = __DIR__ . '/../' . $dbDatabase;
}
define('DB_DATABASE', $dbDatabase);

// CORS Configuration
define('CORS_ALLOWED_ORIGINS', getenv('CORS_ALLOWED_ORIGINS') ?: 'http://localhost:3000');

// Timezone
date_default_timezone_set(getenv('TIMEZONE') ?: 'UTC');
