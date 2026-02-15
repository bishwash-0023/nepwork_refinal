<?php
/**
 * Database Migration Script
 * Creates tables and seeds initial data
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/helpers.php';

function runMigration() {
    // Ensure database directory exists for SQLite
    if (DB_DRIVER === 'sqlite') {
        $dbPath = DB_DATABASE;
        $dbDir = dirname($dbPath);
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
        // Remove existing database if it's corrupted (optional - comment out if you want to keep data)
        // if (file_exists($dbPath) && filesize($dbPath) === 0) {
        //     unlink($dbPath);
        // }
    }
    
    $pdo = getDbConnection();
    
    try {
        // Enable foreign keys for SQLite
        if (DB_DRIVER === 'sqlite') {
            $pdo->exec("PRAGMA foreign_keys = ON");
        }
        
        // Read schema file
        $schema = file_get_contents(__DIR__ . '/schema.sql');
        
        // Remove comments and split by semicolon
        $lines = explode("\n", $schema);
        $cleanedLines = [];
        foreach ($lines as $line) {
            $line = trim($line);
            // Skip empty lines and comments
            if (empty($line) || strpos($line, '--') === 0) {
                continue;
            }
            $cleanedLines[] = $line;
        }
        
        $fullSchema = implode(' ', $cleanedLines);
        
        // Split by semicolon but keep multi-line statements together
        $statements = array_filter(
            array_map('trim', explode(';', $fullSchema)),
            function($stmt) {
                return !empty($stmt);
            }
        );
        
        $pdo->beginTransaction();
        
        $statementCount = 0;
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $statementCount++;
                try {
                    $pdo->exec($statement);
                    echo "  ✓ Executed statement $statementCount\n";
                } catch (PDOException $e) {
                    // Ignore "table already exists" and "index already exists" errors
                    $errorMsg = $e->getMessage();
                    if (strpos($errorMsg, 'already exists') !== false || 
                        strpos($errorMsg, 'duplicate') !== false ||
                        strpos($errorMsg, 'UNIQUE constraint failed') !== false) {
                        echo "  ⊙ Statement $statementCount already exists, skipping\n";
                        continue;
                    }
                    // For other errors, show which statement failed
                    echo "  ✗ Error in statement $statementCount:\n";
                    echo "    " . substr($statement, 0, 100) . "...\n";
                    echo "    Error: " . $errorMsg . "\n";
                    throw $e;
                }
            }
        }
        
        $pdo->commit();
        echo "  ✓ All $statementCount statements executed successfully\n";
        
        echo "Database migration completed successfully!\n";
        
        // Ask if user wants to seed data
        echo "Do you want to seed sample data? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);
        
        if (trim(strtolower($line)) === 'y') {
            seedDatabase();
        }
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo "Migration failed: " . $e->getMessage() . "\n";
        echo "Stack trace: " . $e->getTraceAsString() . "\n";
        exit(1);
    }
}

function seedDatabase() {
    $pdo = getDbConnection();
    
    try {
        // Check if users table exists and has data
        try {
            $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
            $result = $stmt->fetch();
            
            if ($result && $result['count'] > 0) {
                echo "Database already has data. Skipping seed.\n";
                return;
            }
        } catch (PDOException $e) {
            // Table doesn't exist, that's fine - we'll create the data
            echo "Note: Users table check failed, proceeding with seed...\n";
        }
        
        // Read seed file
        $seed = file_get_contents(__DIR__ . '/seed.sql');
        
        // Hash passwords properly
        $password = password_hash('password123', PASSWORD_DEFAULT);
        
        // Replace password placeholder with actual hash
        $seed = str_replace('$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', $password, $seed);
        
        // Remove comments and clean up
        $lines = explode("\n", $seed);
        $cleanedLines = [];
        foreach ($lines as $line) {
            $line = trim($line);
            if (empty($line) || strpos($line, '--') === 0) {
                continue;
            }
            $cleanedLines[] = $line;
        }
        
        $fullSeed = implode(' ', $cleanedLines);
        
        // Split and execute
        $statements = array_filter(
            array_map('trim', explode(';', $fullSeed)),
            function($stmt) {
                return !empty($stmt);
            }
        );
        
        $pdo->beginTransaction();
        
        foreach ($statements as $statement) {
            $statement = trim($statement);
            if (!empty($statement)) {
                $pdo->exec($statement);
            }
        }
        
        $pdo->commit();
        
        echo "Database seeded successfully!\n";
        echo "Default password for all users: password123\n";
        
    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        echo "Seeding failed: " . $e->getMessage() . "\n";
    }
}

// Run migration
runMigration();

