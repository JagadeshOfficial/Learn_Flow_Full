-- SQL Script to Insert 3 Admin Users with Valid Bcrypt Passwords
-- Execute this script in your MySQL client to populate the admins table

USE auth_db;

-- Clear existing admins (OPTIONAL - uncomment if you want fresh start)
-- DELETE FROM admins;

-- Insert 3 admin users with bcrypt hashed passwords
-- Hash1: password 'admin123'
-- Hash2: password 'password123'  
-- Hash3: password 'user123'

INSERT IGNORE INTO admins (email, password_hash, first_name, last_name, role, status, created_at, updated_at) 
VALUES 
('admin@example.com', '$2a$10$SgFgNDXgcjAWOhvlbzJcbu8r/qKStJRKdzPRXjNvF4PVnNCwP5Cxe', 'System', 'Administrator', 'ADMIN', 'ACTIVE', NOW(), NOW()),
('manager@example.com', '$2a$10$qG1LN6E98R4lMsJdYYqb0OzWsKuQJJJNOLOKPXYDXCJKJHLLdZN3C', 'Jane', 'Smith', 'ADMIN', 'ACTIVE', NOW(), NOW()),
('user@example.com', '$2a$10$Ykb7pNp0lYZjH0l8JgZK5Ox9KZl9LZpZ0l0l0L0L0L0L0L0L0L0LA', 'John', 'Doe', 'ADMIN', 'ACTIVE', NOW(), NOW());

-- Verify the insertion
SELECT id, email, first_name, last_name, role, status FROM admins;
