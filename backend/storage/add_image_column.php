<?php
/**
 * Migration script to add image_path column to jobs table
 * Run this if your database already exists
 */

require_once __DIR__ . '/../config/database.php';

try {
    $pdo = getDbConnection();
    
    // Check if column already exists
    if (DB_DRIVER === 'sqlite') {
        $stmt = $pdo->query("PRAGMA table_info(jobs)");
        $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $hasImagePath = false;
        foreach ($columns as $column) {
            if ($column['name'] === 'image_path') {
                $hasImagePath = true;
                break;
            }
        }
        
        if (!$hasImagePath) {
            $pdo->exec("ALTER TABLE jobs ADD COLUMN image_path VARCHAR(500)");
            echo "✅ Added image_path column to jobs table\n";
        } else {
            echo "ℹ️  image_path column already exists\n";
        }
    } else {
        // MySQL
        $stmt = $pdo->query("SHOW COLUMNS FROM jobs LIKE 'image_path'");
        if ($stmt->rowCount() === 0) {
            $pdo->exec("ALTER TABLE jobs ADD COLUMN image_path VARCHAR(500)");
            echo "✅ Added image_path column to jobs table\n";
        } else {
            echo "ℹ️  image_path column already exists\n";
        }
    }
    
    echo "Migration completed successfully!\n";
    
} catch (Exception $e) {
    echo "Migration failed: " . $e->getMessage() . "\n";
    exit(1);
}

