package com.lms.auth.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileStorageService {

    private static final Logger log = LoggerFactory.getLogger(FileStorageService.class);

    @Value("${file.upload-dir:./uploads}")
    private String uploadDir;

    /**
     * Store uploaded file and return the relative path
     */
    public String storeFile(MultipartFile file, Integer adminId) throws IOException {
        // Create uploads directory if it doesn't exist
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // Generate unique filename
        String originalFileName = file.getOriginalFilename();
        String fileExtension = getFileExtension(originalFileName);
        String uniqueFileName = "admin_" + adminId + "_" + UUID.randomUUID() + fileExtension;

        // Store file
        Path filePath = uploadPath.resolve(uniqueFileName);
        Files.copy(file.getInputStream(), filePath);

        log.info("File stored successfully at: {}", filePath.toString());
        return uniqueFileName;
    }

    /**
     * Load file as Resource
     */
    public Resource loadFileAsResource(String filename) throws Exception {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
        
        if (!Files.exists(filePath)) {
            throw new Exception("File not found: " + filename);
        }

        Resource resource = new UrlResource(filePath.toUri());
        if (!resource.exists()) {
            throw new Exception("File not found: " + filename);
        }

        return resource;
    }

    /**
     * Delete file
     */
    public void deleteFile(String filename) throws IOException {
        Path filePath = Paths.get(uploadDir).toAbsolutePath().normalize().resolve(filename);
        if (Files.exists(filePath)) {
            Files.delete(filePath);
            log.info("File deleted: {}", filename);
        }
    }

    /**
     * Get file extension
     */
    private String getFileExtension(String fileName) {
        if (fileName != null && fileName.contains(".")) {
            return fileName.substring(fileName.lastIndexOf("."));
        }
        return ".jpg";
    }
}
