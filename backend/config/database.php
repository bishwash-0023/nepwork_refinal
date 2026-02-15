<?php
/**
 * Database Configuration
 * PDO connection with SQLite and MySQL support
 */

require_once __DIR__ . '/config.php';

$pdo = null;

function getDbConnection() {
    global $pdo;
    
    if ($pdo !== null) {
        return $pdo;
    }
    
    try {
        $driver = DB_DRIVER;
        
        if ($driver === 'sqlite') {
            $databasePath = DB_DATABASE;
            $directory = dirname($databasePath);
            
            // Create directory if it doesn't exist
            if (!is_dir($directory)) {
                mkdir($directory, 0755, true);
            }
            
            $dsn = "sqlite:" . $databasePath;
            $pdo = new PDO($dsn);
            $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
            
        } elseif ($driver === 'mysql') {
            $dsn = sprintf(
                "mysql:host=%s;dbname=%s;charset=utf8mb4",
                DB_HOST,
                DB_NAME
            );
            
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } else {
            throw new Exception("Unsupported database driver: {$driver}");
        }
        
        return $pdo;
        
    } catch (PDOException $e) {
        error_log("Database connection error: " . $e->getMessage());
        throw new Exception("Database connection failed");
    }
}

// Initialize connection
getDbConnection();

