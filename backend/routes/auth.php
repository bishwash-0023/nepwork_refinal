<?php
/**
 * Authentication Routes
 * Handles user registration, login, and profile
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../core/response.php';
require_once __DIR__ . '/../core/auth_middleware.php';
require_once __DIR__ . '/../core/validator.php';
require_once __DIR__ . '/../core/helpers.php';

/**
 * Register new user
 */
function handleRegister() {
    $data = getJsonBody();
    
    if (!$data) {
        sendError('Invalid JSON data');
    }
    
    $errors = validateRegistration($data);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $pdo = getDbConnection();
    
    try {
        // Check if email already exists
        $stmt = $pdo->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        
        if ($stmt->fetch()) {
            sendError('Email already registered', 409);
        }
        
        // Hash password
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        // Insert user
        $stmt = $pdo->prepare("
            INSERT INTO users (name, email, password, role, created_at) 
            VALUES (?, ?, ?, ?, ?)
        ");
        
        $stmt->execute([
            trim($data['name']),
            trim($data['email']),
            $hashedPassword,
            $data['role'],
            getCurrentTimestamp()
        ]);
        
        $userId = $pdo->lastInsertId();
        
        // Generate JWT token
        $token = generateJWT($userId, $data['email'], $data['role']);
        
        // Get user data
        $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$userId]);
        $user = $stmt->fetch();
        
        sendSuccess([
            'user' => $user,
            'token' => $token
        ], 'Registration successful', 201);
        
    } catch (PDOException $e) {
        error_log("Registration error: " . $e->getMessage());
        sendError('Registration failed', 500);
    }
}

/**
 * Login user
 */
function handleLogin() {
    $data = getJsonBody();
    
    if (!$data) {
        sendError('Invalid JSON data');
    }
    
    $errors = validateLogin($data);
    if (!empty($errors)) {
        sendValidationError($errors);
    }
    
    $pdo = getDbConnection();
    
    try {
        $stmt = $pdo->prepare("SELECT id, name, email, password, role, created_at FROM users WHERE email = ?");
        $stmt->execute([trim($data['email'])]);
        $user = $stmt->fetch();
        
        if (!$user || !password_verify($data['password'], $user['password'])) {
            sendError('Invalid email or password', 401);
        }
        
        // Generate JWT token
        $token = generateJWT($user['id'], $user['email'], $user['role']);
        
        // Remove password from response
        unset($user['password']);
        
        sendSuccess([
            'user' => $user,
            'token' => $token
        ], 'Login successful');
        
    } catch (PDOException $e) {
        error_log("Login error: " . $e->getMessage());
        sendError('Login failed', 500);
    }
}

/**
 * Get current user profile
 */
function handleGetMe() {
    $user = requireAuth();
    
    $pdo = getDbConnection();
    
    try {
        $stmt = $pdo->prepare("SELECT id, name, email, role, created_at FROM users WHERE id = ?");
        $stmt->execute([$user['user_id']]);
        $userData = $stmt->fetch();
        
        if (!$userData) {
            sendNotFound('User not found');
        }
        
        sendSuccess($userData);
        
    } catch (PDOException $e) {
        error_log("Get user error: " . $e->getMessage());
        sendError('Failed to fetch user', 500);
    }
}

