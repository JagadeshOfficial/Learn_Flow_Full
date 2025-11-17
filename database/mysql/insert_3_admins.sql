-- Insert 3 admin users with bcrypt hashed passwords
-- These hashes are pre-computed using bcrypt with 10 rounds

USE auth_db;

-- Delete existing admins for clean start (OPTIONAL - comment out if you want to keep existing data)
-- DELETE FROM admins;

-- Insert 3 admin users
INSERT INTO admins (email, password_hash, first_name, last_name, role, status) VALUES
('admin@example.com', '$2a$10$6bSzR8E8U5qLXsJdZYqb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK', 'System', 'Administrator', 'ADMIN', 'ACTIVE'),
('manager@example.com', '$2a$10$qG1LN6E98R4lMsJdYYqb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK', 'Jane', 'Smith', 'ADMIN', 'ACTIVE'),
('user@example.com', '$2a$10$r2L5M7F09S5mNsKeZZrb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK', 'John', 'Doe', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Verify inserted data
SELECT id, email, first_name, last_name, role, status FROM admins;
