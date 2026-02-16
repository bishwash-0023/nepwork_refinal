<?php
/**
 * Migration: Add feedback and allow_reapply to applications table
 */

function up($pdo)
{
    echo "  Adding 'feedback' column to applications...\n";
    $pdo->exec("ALTER TABLE applications ADD COLUMN feedback TEXT");

    echo "  Adding 'allow_reapply' column to applications...\n";
    $pdo->exec("ALTER TABLE applications ADD COLUMN allow_reapply BOOLEAN DEFAULT 0");
}
