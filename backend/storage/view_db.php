<?php
/**
 * Database Viewer Utility
 * Displays a list of tables and the number of rows in each.
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/helpers.php';

function viewDatabase()
{
    $pdo = getDbConnection();

    echo "🔍 Database Explorer\n";
    echo "===================\n";

    try {
        // Get all tables
        $tablesStmt = $pdo->query("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'");
        $tables = $tablesStmt->fetchAll(PDO::FETCH_COLUMN);

        if (empty($tables)) {
            echo "ℹ️ Database is empty (no tables found).\n";
            return;
        }

        foreach ($tables as $table) {
            $countStmt = $pdo->query("SELECT COUNT(*) FROM \"$table\"");
            $count = $countStmt->fetchColumn();
            echo "• $table ($count rows)\n";
        }

        echo "===================\n";
        echo "✅ Scan complete.\n";

    }
    catch (PDOException $e) {
        echo "❌ Error viewing database: " . $e->getMessage() . "\n";
    }
}

viewDatabase();
