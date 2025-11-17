-- SQL Update Script for Admin Passwords
-- Generated: 2025-11-16
-- Use these bcrypt hashes to update your admin passwords in the database

-- Update admin passwords with valid bcrypt hashes
USE auth_db;

UPDATE admins SET password_hash = '$2a$10$ye5wGYebAM.tOTShZCfZIOI3PoCD9eEPdwBqEHIw5OhTE4eJn2V96' WHERE email = 'admin@example.com';
-- Password: admin123

UPDATE admins SET password_hash = '$2a$10$rwbbf84KG5A2zCi44IyOf.4e7QP9ax6.k8cgPzRTL7nzTKoLE7GNG' WHERE email = 'manager@example.com';
-- Password: password123

UPDATE admins SET password_hash = '$2a$10$mbcfpV/u03dyJCA0cpxUE.Z27uI52qSxFFlkvHF/SMSMRp9pfsdFG' WHERE email = 'user@example.com';
-- Password: user123

-- Verify the update
SELECT email, password_hash FROM admins;
