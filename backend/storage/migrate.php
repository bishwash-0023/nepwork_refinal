<?php
/**
 * Unified Database Migration Script
 * Handles initial schema setup and incremental versioned migrations.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/helpers.php';

function runMigration()
{
    // 1. Ensure database directory and file exist
    if (DB_DRIVER === 'sqlite') {
        $dbPath = DB_DATABASE;
        $dbDir = dirname($dbPath);
        if (!is_dir($dbDir)) {
            mkdir($dbDir, 0755, true);
        }
        if (!file_exists($dbPath)) {
            touch($dbPath);
            echo "📁 Created new SQLite database file: $dbPath\n";
        }
    }

    $pdo = getDbConnection();

    try {
        // Enable foreign keys for SQLite
        if (DB_DRIVER === 'sqlite') {
            $pdo->exec("PRAGMA foreign_keys = ON");
        }

        // 2. Initial Schema Setup (idempotent)
        echo "📜 Running initial schema from schema.sql...\n";
        executeSqlFile($pdo, __DIR__ . '/schema.sql');

        // 3. Versioned Migrations
        $migrationsDir = __DIR__ . '/migrations';
        if (!is_dir($migrationsDir)) {
            mkdir($migrationsDir, 0755, true);
        }

        $migrationFiles = glob($migrationsDir . '/migration_*.php');
        sort($migrationFiles); // Ensure they run in order

        if (empty($migrationFiles)) {
            echo "ℹ️ No incremental migration files found in migrations/.\n";
        }
        else {
            foreach ($migrationFiles as $file) {
                $migrationName = basename($file);

                // Check if already executed
                $stmt = $pdo->prepare("SELECT id FROM migrations WHERE migration_name = ?");
                $stmt->execute([$migrationName]);

                if ($stmt->fetch()) {
                    echo "  ⊙ $migrationName already executed, skipping.\n";
                    continue;
                }

                echo "🚀 Executing migration: $migrationName...\n";

                // Wrap in transaction for safety
                $pdo->beginTransaction();
                try {
                    // Include and run migration
                    // Expectations: the file should define a function run() or just execute code.
                    // To be safe, we'll just require it. The migration files should handle their own logic.
                    require $file;

                    // Specific check: if the migration file defines a 'up' function, call it
                    if (function_exists('up')) {
                        up($pdo);
                    // Rename the function so it doesn't collide with next migration
                    // (PHP doesn't allow this, so migrations should ideally not define global functions with common names)
                    }

                    // Record migration
                    $stmt = $pdo->prepare("INSERT INTO migrations (migration_name) VALUES (?)");
                    $stmt->execute([$migrationName]);

                    $pdo->commit();
                    echo "  ✓ $migrationName completed successfully.\n";
                }
                catch (Exception $e) {
                    $pdo->rollBack();
                    echo "  ✗ $migrationName failed: " . $e->getMessage() . "\n";
                    throw $e;
                }
            }
        }

        echo "🎉 Database is up to date!\n";

        // 4. Seeding Check
        echo "Do you want to seed sample data? (y/n): ";
        $handle = fopen("php://stdin", "r");
        $line = fgets($handle);
        fclose($handle);

        if (trim(strtolower($line)) === 'y') {
            seedDatabase($pdo);
        }

    }
    catch (Exception $e) {
        echo "❌ Migration failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}

function executeSqlFile($pdo, $filePath)
{
    if (!file_exists($filePath)) {
        throw new Exception("SQL file not found: $filePath");
    }

    $sql = file_get_contents($filePath);

    // Simple parser: split by semicolon, ignoring those inside quotes if possible 
    // (for schema.sql we assume it's well-formatted)
    $statements = array_filter(
        array_map('trim', explode(';', $sql)),
        function ($stmt) {
        return !empty($stmt);
    }
    );

    foreach ($statements as $stmt) {
        $pdo->exec($stmt);
    }
}

function seedDatabase($pdo)
{
    try {
        // Check for existing users to avoid double seeding
        $stmt = $pdo->query("SELECT COUNT(*) as count FROM users");
        if ($stmt->fetch()['count'] > 0) {
            echo "⚠️ Database already has data. Skipping seed.\n";
            return;
        }

        $seedFile = __DIR__ . '/seed.sql';
        if (!file_exists($seedFile))
            return;

        $seedSql = file_get_contents($seedFile);
        $password = password_hash('password123', PASSWORD_DEFAULT);
        $seedSql = str_replace('$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', $password, $seedSql);

        $statements = array_filter(
            array_map('trim', explode(';', $seedSql)),
            function ($stmt) {
            return !empty($stmt);
        }
        );

        $pdo->beginTransaction();
        foreach ($statements as $stmt) {
            $pdo->exec($stmt);
        }
        $pdo->commit();
        echo "✅ Database seeded successfully!\n";
    }
    catch (Exception $e) {
        if ($pdo->inTransaction())
            $pdo->rollBack();
        echo "❌ Seeding failed: " . $e->getMessage() . "\n";
    }
}

runMigration();
