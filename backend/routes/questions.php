<?php
/**
 * Questions Route Handlers
 */

require_once __DIR__ . '/../core/auth.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/helpers.php';

function handleCreateQuestion()
{
    $user = requireAuth();
    $data = getJsonBody();

    if (!isset($data['job_id']) || !isset($data['content'])) {
        sendError('Job ID and content are required');
    }

    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("
            INSERT INTO questions (job_id, user_id, content, is_public) 
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['job_id'],
            $user['user_id'],
            $data['content'],
            isset($data['is_public']) ? (int)$data['is_public'] : 1
        ]);

        sendSuccess(['id' => $pdo->lastInsertId()], 'Question posted successfully', 201);
    }
    catch (PDOException $e) {
        sendError('Failed to post question: ' . $e->getMessage(), 500);
    }
}

function handleGetJobQuestions($jobId)
{
    $user = getAuthenticatedUser();
    $pdo = getDbConnection();

    try {
        // Fetch questions with reaction counts
        // Visibility logic: Public questions for everyone. Private only for asker or job owner.
        $stmt = $pdo->prepare("
            SELECT q.*, u.name as asker_name,
                   (SELECT COUNT(*) FROM question_reactions WHERE question_id = q.id AND target = 'question' AND type = 'like') as question_likes,
                   (SELECT COUNT(*) FROM question_reactions WHERE question_id = q.id AND target = 'question' AND type = 'dislike') as question_dislikes,
                   (SELECT COUNT(*) FROM question_reactions WHERE question_id = q.id AND target = 'answer' AND type = 'like') as answer_likes,
                   (SELECT COUNT(*) FROM question_reactions WHERE question_id = q.id AND target = 'answer' AND type = 'dislike') as answer_dislikes,
                   j.client_id
            FROM questions q
            JOIN users u ON q.user_id = u.id
            JOIN jobs j ON q.job_id = j.id
            WHERE q.job_id = ?
            AND (q.is_public = 1 OR q.user_id = ? OR j.client_id = ?)
            ORDER BY q.created_at DESC
        ");

        $userId = $user ? $user['user_id'] : -1;
        $stmt->execute([$jobId, $userId, $userId]);
        $questions = $stmt->fetchAll();

        sendSuccess($questions);
    }
    catch (PDOException $e) {
        sendError('Failed to fetch questions: ' . $e->getMessage(), 500);
    }
}

function handleAnswerQuestion($questionId)
{
    $user = requireRole(['client', 'admin']);
    $data = getJsonBody();

    if (!isset($data['answer'])) {
        sendError('Answer is required');
    }

    $pdo = getDbConnection();

    try {
        // Verify ownership
        $stmt = $pdo->prepare("
            SELECT q.id, j.client_id 
            FROM questions q
            JOIN jobs j ON q.job_id = j.id
            WHERE q.id = ?
        ");
        $stmt->execute([$questionId]);
        $q = $stmt->fetch();

        if (!$q)
            sendNotFound('Question not found');
        if ($q['client_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            sendForbidden('You can only answer questions for your own jobs');
        }

        $stmt = $pdo->prepare("
            UPDATE questions 
            SET answer = ?, replied_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ");
        $stmt->execute([$data['answer'], $questionId]);

        sendSuccess(null, 'Answer posted successfully');
    }
    catch (PDOException $e) {
        sendError('Failed to post answer: ' . $e->getMessage(), 500);
    }
}

function handleReactToQuestion($questionId)
{
    $user = requireAuth();
    $data = getJsonBody();

    if (!isset($data['type']) || !isset($data['target'])) {
        sendError('Type (like/dislike) and target (question/answer) are required');
    }

    $pdo = getDbConnection();

    try {
        $pdo->beginTransaction();

        // Check if reaction exists
        $stmt = $pdo->prepare("
            SELECT id, type FROM question_reactions 
            WHERE user_id = ? AND question_id = ? AND target = ?
        ");
        $stmt->execute([$user['user_id'], $questionId, $data['target']]);
        $existing = $stmt->fetch();

        if ($existing) {
            if ($existing['type'] === $data['type']) {
                // Toggle off
                $pdo->prepare("DELETE FROM question_reactions WHERE id = ?")->execute([$existing['id']]);
                $message = "Reaction removed";
            }
            else {
                // Change type
                $pdo->prepare("UPDATE question_reactions SET type = ? WHERE id = ?")->execute([$data['type'], $existing['id']]);
                $message = "Reaction updated";
            }
        }
        else {
            // New reaction
            $pdo->prepare("
                INSERT INTO question_reactions (user_id, question_id, type, target) 
                VALUES (?, ?, ?, ?)
            ")->execute([$user['user_id'], $questionId, $data['type'], $data['target']]);
            $message = "Reaction added";
        }

        $pdo->commit();
        sendSuccess(null, $message);
    }
    catch (PDOException $e) {
        if ($pdo->inTransaction())
            $pdo->rollBack();
        sendError('Failed to react: ' . $e->getMessage(), 500);
    }
}

function handleDeleteQuestion($questionId)
{
    $user = requireAuth();
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("SELECT user_id FROM questions WHERE id = ?");
        $stmt->execute([$questionId]);
        $q = $stmt->fetch();

        if (!$q)
            sendNotFound('Question not found');
        if ($q['user_id'] != $user['user_id'] && $user['role'] !== 'admin') {
            sendForbidden('You can only delete your own questions');
        }

        $pdo->prepare("DELETE FROM questions WHERE id = ?")->execute([$questionId]);
        sendSuccess(null, 'Question deleted successfully');
    }
    catch (PDOException $e) {
        sendError('Failed to delete question: ' . $e->getMessage(), 500);
    }
}

function handleGetMyJobQuestions()
{
    $user = requireRole(['client', 'admin']);
    $pdo = getDbConnection();

    try {
        $stmt = $pdo->prepare("
            SELECT q.*, u.name as asker_name, j.title as job_title
            FROM questions q
            JOIN users u ON q.user_id = u.id
            JOIN jobs j ON q.job_id = j.id
            WHERE j.client_id = ?
            ORDER BY q.created_at DESC
        ");
        $stmt->execute([$user['user_id']]);
        $questions = $stmt->fetchAll();

        sendSuccess($questions);
    }
    catch (PDOException $e) {
        sendError('Failed to fetch questions: ' . $e->getMessage(), 500);
    }
}
