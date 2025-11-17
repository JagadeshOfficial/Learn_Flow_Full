package com.lms.auth.controller;

import com.lms.auth.dto.AdminLoginRequest;
import com.lms.auth.dto.AdminLoginResponse;
import com.lms.auth.dto.AdminCreateRequest;
import com.lms.auth.dto.AdminUpdateRequest;
import com.lms.auth.entity.Admin;
import com.lms.auth.service.AdminAuthService;
import com.lms.auth.service.JwtTokenProvider;
import com.lms.auth.service.FileStorageService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/v1/auth/admin")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"})
public class AdminAuthController {
    
    private static final Logger log = LoggerFactory.getLogger(AdminAuthController.class);
    private final AdminAuthService adminAuthService;
    private final JwtTokenProvider jwtTokenProvider;
    private final FileStorageService fileStorageService;

    public AdminAuthController(AdminAuthService adminAuthService, JwtTokenProvider jwtTokenProvider, FileStorageService fileStorageService) {
        this.adminAuthService = adminAuthService;
        this.jwtTokenProvider = jwtTokenProvider;
        this.fileStorageService = fileStorageService;
    }
    
    /**
     * Admin login endpoint
     * POST /api/v1/auth/admin/login
     */
    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@Valid @RequestBody AdminLoginRequest request) {
        log.info("Admin login request received for email: {}", request.getEmail());
        AdminLoginResponse response = adminAuthService.authenticateAdmin(request);
        
        if (Boolean.TRUE.equals(response.getSuccess())) {
            return ResponseEntity.ok(response);
        } else {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
        }
    }
    
    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Admin Auth Service is running");
    }

    /**
     * Convert LocalDateTime to number array format [year, month, day, hour, minute]
     */
    private Object convertDateTimeToArray(java.time.LocalDateTime dateTime) {
        if (dateTime == null) return null;
        return new int[]{
            dateTime.getYear(),
            dateTime.getMonthValue(),
            dateTime.getDayOfMonth(),
            dateTime.getHour(),
            dateTime.getMinute()
        };
    }

    /**
     * Get all admins
     * GET /api/v1/auth/admin/list
     */
    @GetMapping("/list")
    public ResponseEntity<?> getAllAdmins() {
        var admins = adminAuthService.getAllAdmins();
        var adminList = admins.stream().map(admin -> {
            var map = new java.util.HashMap<String, Object>();
            map.put("id", admin.getId());
            map.put("email", admin.getEmail());
            map.put("firstName", admin.getFirstName());
            map.put("lastName", admin.getLastName());
            map.put("mobileNumber", admin.getMobileNumber());
            map.put("photoUrl", admin.getPhotoUrl());
            map.put("role", admin.getRole());
            map.put("status", admin.getStatus());
            map.put("createdAt", convertDateTimeToArray(admin.getCreatedAt()));
            map.put("updatedAt", convertDateTimeToArray(admin.getUpdatedAt()));
            map.put("lastLogin", convertDateTimeToArray(admin.getLastLogin()));
            return map;
        }).toList();
        
        var result = new java.util.HashMap<String, Object>();
        result.put("total", adminList.size());
        result.put("admins", adminList);
        return ResponseEntity.ok(result);
    }

    /**
     * Get profile of the currently authenticated admin.
     * Expects Authorization: Bearer <token>
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile(@RequestHeader(value = "Authorization", required = false) String authorization) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String token = authorization.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }

        Integer adminId = jwtTokenProvider.getAdminIdFromToken(token);
        if (adminId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token payload");
        }

        var opt = adminAuthService.getAdminById(adminId);
        if (opt.isPresent()) {
            var admin = opt.get();
            var body = new java.util.HashMap<String, Object>();
            body.put("id", admin.getId());
            body.put("email", admin.getEmail());
            body.put("firstName", admin.getFirstName());
            body.put("lastName", admin.getLastName());
            body.put("mobileNumber", admin.getMobileNumber());
            body.put("photoUrl", admin.getPhotoUrl());
            body.put("role", admin.getRole());
            body.put("status", admin.getStatus());
            body.put("createdAt", convertDateTimeToArray(admin.getCreatedAt()));
            body.put("updatedAt", convertDateTimeToArray(admin.getUpdatedAt()));
            body.put("lastLogin", convertDateTimeToArray(admin.getLastLogin()));
            return ResponseEntity.ok(body);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        }
    }

    /**
     * Update admin profile (first_name / last_name).
     * Expects Authorization: Bearer <token>
     * PUT /api/v1/auth/admin/me
     */
    @PutMapping("/me")
    public ResponseEntity<?> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestBody java.util.Map<String, String> updates) {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing or invalid Authorization header");
        }

        String token = authorization.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or expired token");
        }

        Integer adminId = jwtTokenProvider.getAdminIdFromToken(token);
        if (adminId == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid token payload");
        }

        var result = adminAuthService.updateAdminProfile(adminId, updates);
        if (result.isPresent()) {
            Admin admin = result.get();
            var body = new java.util.HashMap<String, Object>();
            body.put("id", admin.getId());
            body.put("email", admin.getEmail());
            body.put("firstName", admin.getFirstName());
            body.put("lastName", admin.getLastName());
            body.put("role", admin.getRole());
            body.put("success", true);
            body.put("message", "Profile updated successfully");
            return ResponseEntity.ok(body);
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Admin not found");
        }
    }

    /**
     * Create a new admin
     * POST /api/v1/auth/admin/create
     */
    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(@Valid @RequestBody AdminCreateRequest request) {
        log.info("Create admin request received for email: {}", request.getEmail());
        
        try {
            Admin admin = adminAuthService.createAdmin(request);
            
            // Return admin details (without password hash)
            var body = new java.util.HashMap<String, Object>();
            body.put("id", admin.getId());
            body.put("email", admin.getEmail());
            body.put("firstName", admin.getFirstName());
            body.put("lastName", admin.getLastName());
            body.put("role", admin.getRole());
            body.put("status", admin.getStatus());
            body.put("createdAt", admin.getCreatedAt());
            body.put("message", "Admin created successfully");
            body.put("success", true);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(body);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation error creating admin: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            log.error("Error creating admin: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", "Failed to create admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Update admin details
     * PUT /api/v1/auth/admin/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAdmin(
            @PathVariable Integer id,
            @Valid @RequestBody AdminUpdateRequest request) {
        log.info("Update admin request received for id: {}", id);
        
        try {
            Admin admin = adminAuthService.updateAdmin(id, request);
            
            var body = new java.util.HashMap<String, Object>();
            body.put("id", admin.getId());
            body.put("email", admin.getEmail());
            body.put("firstName", admin.getFirstName());
            body.put("lastName", admin.getLastName());
            body.put("role", admin.getRole());
            body.put("status", admin.getStatus());
            body.put("updatedAt", admin.getUpdatedAt());
            body.put("message", "Admin updated successfully");
            body.put("success", true);
            
            return ResponseEntity.ok(body);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation error updating admin: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            log.error("Error updating admin: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", "Failed to update admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Delete an admin
     * DELETE /api/v1/auth/admin/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAdmin(@PathVariable Integer id) {
        log.info("Delete admin request received for id: {}", id);
        
        try {
            adminAuthService.deleteAdmin(id);
            
            var body = new java.util.HashMap<String, Object>();
            body.put("message", "Admin deleted successfully");
            body.put("success", true);
            
            return ResponseEntity.ok(body);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation error deleting admin: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            log.error("Error deleting admin: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", "Failed to delete admin: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Upload profile image for an admin
     * POST /api/v1/auth/admin/{id}/avatar
     */
    @PostMapping(value = "/{id}/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAdminAvatar(
            @PathVariable Integer id,
            @RequestParam("file") MultipartFile file) {
        log.info("Upload avatar request received for admin id: {}", id);
        
        try {
            if (file.isEmpty()) {
                var error = new java.util.HashMap<String, Object>();
                error.put("success", false);
                error.put("message", "File is empty");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }

            // Store file and get path
            String filePath = fileStorageService.storeFile(file, id);
            
            // Update admin photoUrl in database
            Admin admin = adminAuthService.updateAdminPhotoUrl(id, filePath);
            
            var body = new java.util.HashMap<String, Object>();
            body.put("id", admin.getId());
            body.put("photoUrl", admin.getPhotoUrl());
            body.put("message", "Avatar uploaded successfully");
            body.put("success", true);
            
            return ResponseEntity.ok(body);
            
        } catch (IllegalArgumentException e) {
            log.warn("Validation error uploading avatar: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            
        } catch (Exception e) {
            log.error("Error uploading avatar: {}", e.getMessage());
            var error = new java.util.HashMap<String, Object>();
            error.put("success", false);
            error.put("message", "Failed to upload avatar: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * Get admin profile image
     * GET /api/v1/auth/admin/image/{filename}
     */
    @GetMapping("/image/{filename}")
    public ResponseEntity<Resource> getAdminImage(@PathVariable String filename) {
        log.info("Get image request for filename: {}", filename);
        
        try {
            Resource resource = fileStorageService.loadFileAsResource(filename);
            return ResponseEntity.ok()
                    .contentType(MediaType.IMAGE_JPEG)
                    .body(resource);
        } catch (Exception e) {
            log.error("Error retrieving image: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }

    /**
     * Get admin profile image (alternate path for backward compatibility)
     * GET /api/v1/auth/admin/avatar/{filename}
     */
    @GetMapping(path = "/avatar/{filename}", produces = {MediaType.IMAGE_JPEG_VALUE, MediaType.IMAGE_PNG_VALUE, MediaType.IMAGE_GIF_VALUE})
    public ResponseEntity<Resource> getAdminAvatar(@PathVariable String filename) {
        log.info("Get avatar request for filename: {}", filename);
        
        try {
            Resource resource = fileStorageService.loadFileAsResource(filename);
            // Try to determine content type from file extension
            String contentType = MediaType.IMAGE_JPEG_VALUE;
            if (filename.endsWith(".png")) {
                contentType = MediaType.IMAGE_PNG_VALUE;
            } else if (filename.endsWith(".gif")) {
                contentType = MediaType.IMAGE_GIF_VALUE;
            }
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .body(resource);
        } catch (Exception e) {
            log.error("Error retrieving avatar: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
    }
}
