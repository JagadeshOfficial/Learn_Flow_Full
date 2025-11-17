package com.lms.auth.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utility class to generate bcrypt password hashes for admin users
 * 
 * Usage:
 * 1. Run this main method with the password you want to hash
 * 2. Copy the hashed output
 * 3. Use it in your SQL INSERT statement
 * 
 * Example passwords and their hashes:
 * - password: "admin123" → hash: $2a$10$6bSzR8E8U5qLXsJdZYqb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK
 * - password: "user123" → run this program to generate
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Example passwords to hash
        String[] passwords = {
            "admin123",    // Default admin password
            "user123",     // Example user password
            "password123"  // Example generic password
        };
        
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║           BCRYPT PASSWORD HASH GENERATOR                       ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");
        
        for (String password : passwords) {
            String hash = encoder.encode(password);
            System.out.println("Password: " + password);
            System.out.println("Hash:     " + hash);
            System.out.println("SQL:      INSERT INTO admins (email, password_hash, first_name, last_name, role, status)");
            System.out.println("          VALUES ('user@example.com', '" + hash + "', 'First', 'Last', 'ADMIN', 'ACTIVE');");
            System.out.println();
        }
        
        // Generate custom hash if needed
        System.out.println("╔════════════════════════════════════════════════════════════════╗");
        System.out.println("║              CUSTOM PASSWORD HASHING                           ║");
        System.out.println("╚════════════════════════════════════════════════════════════════╝\n");
        
        // To generate a hash for your own password, uncomment and modify:
        // String customPassword = "your_password_here";
        // String customHash = encoder.encode(customPassword);
        // System.out.println("Custom Password: " + customPassword);
        // System.out.println("Custom Hash: " + customHash);
    }
}
