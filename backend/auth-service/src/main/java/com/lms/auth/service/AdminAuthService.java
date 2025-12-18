package com.lms.auth.service;

import com.lms.auth.dto.AdminLoginRequest;
import com.lms.auth.dto.AdminLoginResponse;
import com.lms.auth.entity.Admin;
import com.lms.auth.repository.AdminRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
public class AdminAuthService {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthService.class);

    private final AdminRepository adminRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AdminAuthService(AdminRepository adminRepository, JwtTokenProvider jwtTokenProvider,
            PasswordEncoder passwordEncoder) {
        this.adminRepository = adminRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Authenticate admin with email and password
     */
    public AdminLoginResponse authenticateAdmin(AdminLoginRequest request) {
        log.info("Attempting admin login for email: {}", request.getEmail());

        String email = request.getEmail() == null ? "" : request.getEmail().trim();
        Optional<Admin> adminOpt = adminRepository.findByEmailIgnoreCase(email);

        if (adminOpt.isEmpty()) {
            log.warn("Admin not found with email: {}", request.getEmail());
            AdminLoginResponse response = new AdminLoginResponse();
            response.setSuccess(false);
            response.setMessage("Invalid email or password");
            return response;
        }

        Admin admin = adminOpt.get();

        // Check if admin is active
        if (!"ACTIVE".equals(admin.getStatus())) {
            log.warn("Admin account is not active: {}", admin.getEmail());
            AdminLoginResponse response = new AdminLoginResponse();
            response.setSuccess(false);
            response.setMessage("Admin account is not active");
            return response;
        }

        // Verify password
        String providedPassword = request.getPassword() == null ? "" : request.getPassword();
        boolean passwordMatches = false;
        String storedHash = admin.getPasswordHash() == null ? "" : admin.getPasswordHash();

        // If stored password looks like bcrypt, use encoder; otherwise allow legacy
        // plaintext match and re-hash
        if (storedHash.startsWith("$2a$") || storedHash.startsWith("$2b$") || storedHash.startsWith("$2y$")) {
            passwordMatches = passwordEncoder.matches(providedPassword, storedHash);
        } else {
            // Legacy/plaintext stored password
            if (providedPassword.equals(storedHash)) {
                passwordMatches = true;
                // Re-hash the plaintext password and persist for future logins
                admin.setPasswordHash(passwordEncoder.encode(providedPassword));
                adminRepository.save(admin);
            }
        }

        if (!passwordMatches) {
            log.warn("Invalid password for admin: {}", email);
            AdminLoginResponse response = new AdminLoginResponse();
            response.setSuccess(false);
            response.setMessage("Invalid email or password");
            return response;
        }

        // Update last login
        admin.setLastLogin(LocalDateTime.now());
        adminRepository.save(admin);

        // Generate JWT token
        String token = jwtTokenProvider.generateAdminToken(admin.getId(), admin.getEmail(), admin.getRole());
        long expiresIn = jwtTokenProvider.getTokenExpirationTime();

        log.info("Admin successfully logged in: {}", admin.getEmail());

        AdminLoginResponse response = new AdminLoginResponse();
        response.setId(admin.getId());
        response.setEmail(admin.getEmail());
        response.setFirstName(admin.getFirstName());
        response.setLastName(admin.getLastName());
        response.setRole(admin.getRole());
        response.setToken(token);
        response.setExpiresIn(expiresIn);
        response.setSuccess(true);
        response.setMessage("Login successful");
        return response;
    }

    /**
     * Get admin details by ID
     */
    public Optional<Admin> getAdminById(Integer id) {
        return adminRepository.findByIdAndStatus(id, "ACTIVE");
    }

    /**
     * Update admin profile (first_name, last_name)
     */
    public Optional<Admin> updateAdminProfile(Integer adminId, java.util.Map<String, String> updates) {
        return adminRepository.findById(adminId).map(admin -> {
            if (updates.containsKey("firstName")) {
                admin.setFirstName(updates.get("firstName"));
            }
            if (updates.containsKey("lastName")) {
                admin.setLastName(updates.get("lastName"));
            }
            if (updates.containsKey("photoUrl")) {
                admin.setPhotoUrl(updates.get("photoUrl"));
            }
            admin.setUpdatedAt(java.time.LocalDateTime.now());
            return adminRepository.save(admin);
        });
    }

    /**
     * Get all admins from database
     */
    public java.util.List<Admin> getAllAdmins() {
        return adminRepository.findAll();
    }

    /**
     * Create a new admin
     */
    public Admin createAdmin(com.lms.auth.dto.AdminCreateRequest request) {
        log.info("Creating new admin: {}", request.getEmail());

        // Check if email already exists
        if (adminRepository.findByEmailIgnoreCase(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already exists: " + request.getEmail());
        }

        Admin admin = new Admin();
        admin.setEmail(request.getEmail());
        admin.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setMobileNumber(request.getMobileNumber());
        admin.setPhotoUrl(request.getPhotoUrl());
        admin.setRole(request.getRole());
        admin.setStatus("ACTIVE");
        admin.setCreatedAt(java.time.LocalDateTime.now());
        admin.setUpdatedAt(java.time.LocalDateTime.now());

        Admin savedAdmin = adminRepository.save(admin);
        log.info("Admin created successfully: {}", savedAdmin.getEmail());

        return savedAdmin;
    }

    /**
     * Update admin details (email, firstName, lastName, role)
     */
    public Admin updateAdmin(Integer adminId, com.lms.auth.dto.AdminUpdateRequest request) {
        log.info("Updating admin: {}", adminId);

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + adminId));

        // Check if email is being changed and if new email already exists
        if (request.getEmail() != null && !request.getEmail().isEmpty()) {
            String newEmail = request.getEmail().trim();
            if (!admin.getEmail().equalsIgnoreCase(newEmail)) {
                // Email is being changed, check if it already exists
                if (adminRepository.findByEmailIgnoreCase(newEmail).isPresent()) {
                    throw new IllegalArgumentException("Email already exists: " + newEmail);
                }
                admin.setEmail(newEmail);
            }
        }

        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        if (request.getMobileNumber() != null && !request.getMobileNumber().isEmpty()) {
            admin.setMobileNumber(request.getMobileNumber());
        }
        if (request.getPhotoUrl() != null && !request.getPhotoUrl().isEmpty()) {
            admin.setPhotoUrl(request.getPhotoUrl());
        }
        admin.setRole(request.getRole());
        admin.setUpdatedAt(java.time.LocalDateTime.now());

        Admin updatedAdmin = adminRepository.save(admin);
        log.info("Admin updated successfully: {}", updatedAdmin.getEmail());

        return updatedAdmin;
    }

    /**
     * Delete an admin
     */
    public void deleteAdmin(Integer adminId) {
        log.info("Deleting admin: {}", adminId);

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + adminId));

        adminRepository.delete(admin);
        log.info("Admin deleted successfully: {}", admin.getEmail());
    }

    /**
     * Update admin photo URL
     */
    public Admin updateAdminPhotoUrl(Integer adminId, String photoUrl) {
        log.info("Updating admin photo URL: {}", adminId);

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found with id: " + adminId));

        admin.setPhotoUrl(photoUrl);
        admin.setUpdatedAt(java.time.LocalDateTime.now());

        Admin updatedAdmin = adminRepository.save(admin);
        log.info("Admin photo URL updated successfully: {}", updatedAdmin.getEmail());

        return updatedAdmin;
    }

    /**
     * Change admin password
     */
    public void changePassword(Integer adminId, String currentPassword, String newPassword) {
        log.info("Changing password for admin: {}", adminId);

        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new IllegalArgumentException("Admin not found"));

        if (!passwordEncoder.matches(currentPassword, admin.getPasswordHash())) {
            throw new IllegalArgumentException("Incorrect current password");
        }

        admin.setPasswordHash(passwordEncoder.encode(newPassword));
        admin.setUpdatedAt(java.time.LocalDateTime.now());
        adminRepository.save(admin);

        log.info("Password changed successfully for admin: {}", admin.getEmail());
    }
}
