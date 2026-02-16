<?php
/**
 * Migration: Create Questions and Reactions tables
 */

// Create questions table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS questions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        job_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        is_public BOOLEAN DEFAULT 1,
        answer TEXT,
        replied_at DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (job_id) REFERENCES jobs(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
");

// Create question_reactions table
$pdo->exec("
    CREATE TABLE IF NOT EXISTS question_reactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        question_id INTEGER NOT NULL,
        type TEXT CHECK(type IN ('like', 'dislike')),
        target TEXT CHECK(target IN ('question', 'answer')),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, question_id, target),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
    )
");

echo "✅ Questions and Reactions tables created successfully\n";
