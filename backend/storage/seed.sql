-- Sample seed data for development
-- Passwords are hashed with password_hash() - default: 'password123'

-- Admin user
INSERT INTO users (name, email, password, role, created_at) VALUES
('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', datetime('now'));

-- Client users
INSERT INTO users (name, email, password, role, created_at) VALUES
('John Client', 'client@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', datetime('now')),
('Jane Client', 'jane@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'client', datetime('now'));

-- Freelancer users
INSERT INTO users (name, email, password, role, created_at) VALUES
('Bob Freelancer', 'freelancer@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'freelancer', datetime('now')),
('Alice Freelancer', 'alice@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'freelancer', datetime('now'));

-- Sample jobs (assuming client_id = 2 for John Client)
INSERT INTO jobs (client_id, title, description, budget, status, created_at) VALUES
(2, 'Website Development', 'Need a modern responsive website for my business. Should include contact form and about page.', 500.00, 'open', datetime('now')),
(2, 'Logo Design', 'Looking for a professional logo design for my startup company. Modern and minimalist style preferred.', 200.00, 'open', datetime('now')),
(3, 'Mobile App Development', 'Need an iOS app for my restaurant. Features include menu, ordering, and payment integration.', 1500.00, 'open', datetime('now'));

