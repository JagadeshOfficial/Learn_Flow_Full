package com.lms.auth.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.util.Date;

@Service
public class JwtTokenProvider {
    
    private static final Logger log = LoggerFactory.getLogger(JwtTokenProvider.class);
    
    @Value("${jwt.secret:mySecretKeyForAdminAuthenticationWithMinimum256Bits}")
    private String jwtSecret;
    
    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;
    
    /**
     * Generate JWT token for admin
     */
    public String generateAdminToken(Integer adminId, String email, String role) {
        return Jwts.builder()
            .setSubject(email)
            .claim("adminId", adminId)
            .claim("role", role)
            .claim("type", "ADMIN")
            .setIssuedAt(new Date())
            .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
            .signWith(SignatureAlgorithm.HS512, jwtSecret)
            .compact();
    }
    
    /**
     * Get token expiration time in milliseconds
     */
    public long getTokenExpirationTime() {
        return jwtExpiration;
    }
    
    /**
     * Validate JWT token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            log.error("JWT validation failed: {}", e.getMessage());
            return false;
        }
    }
    
    /**
     * Get email from token
     */
    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
            return claims.getSubject();
        } catch (Exception e) {
            log.error("Error extracting email from token: {}", e.getMessage());
            return null;
        }
    }
    
    /**
     * Get admin ID from token
     */
    public Integer getAdminIdFromToken(String token) {
        try {
            Claims claims = Jwts.parser()
                .setSigningKey(jwtSecret)
                .parseClaimsJws(token)
                .getBody();
            return claims.get("adminId", Integer.class);
        } catch (Exception e) {
            log.error("Error extracting admin ID from token: {}", e.getMessage());
            return null;
        }
    }
}
