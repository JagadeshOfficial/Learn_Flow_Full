-- Admin Authentication Database Schema

CREATE DATABASE IF NOT EXISTS auth_db;
USE auth_db;

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'ADMIN',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Admin audit log table
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    action VARCHAR(255),
    details JSON,
    ip_address VARCHAR(45),
    user_agent VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- JWT tokens table for token management
CREATE TABLE IF NOT EXISTS admin_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    token_type VARCHAR(50) DEFAULT 'ACCESS',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE CASCADE,
    INDEX idx_admin_id (admin_id),
    INDEX idx_expires_at (expires_at),
    INDEX idx_revoked (revoked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default admin user (password: admin123 - bcrypt hashed)
-- NOTE: In production, use proper password hashing with bcrypt
INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
VALUES ('admin@example.com', '$2a$10$6bSzR8E8U5qLXsJdZYqb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK', 'System', 'Administrator', 'ADMIN', 'ACTIVE')
ON DUPLICATE KEY UPDATE updated_at = NOW();
