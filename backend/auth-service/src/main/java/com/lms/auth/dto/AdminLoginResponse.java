package com.lms.auth.dto;

public class AdminLoginResponse {
    private Integer id;
    private String email;
    private String firstName;
    private String lastName;
    private String role;
    private String token;
    private Long expiresIn;
    private String message;
    private Boolean success;

    public AdminLoginResponse() {}

    public AdminLoginResponse(Integer id, String email, String firstName, String lastName, String role,
                             String token, Long expiresIn, String message, Boolean success) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.role = role;
        this.token = token;
        this.expiresIn = expiresIn;
        this.message = message;
        this.success = success;
    }

    // Getters
    public Integer getId() {
        return id;
    }

    public String getEmail() {
        return email;
    }

    public String getFirstName() {
        return firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public String getRole() {
        return role;
    }

    public String getToken() {
        return token;
    }

    public Long getExpiresIn() {
        return expiresIn;
    }

    public String getMessage() {
        return message;
    }

    public Boolean getSuccess() {
        return success;
    }

    // Setters
    public void setId(Integer id) {
        this.id = id;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public void setExpiresIn(Long expiresIn) {
        this.expiresIn = expiresIn;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }

    // Builder pattern implementation
    public static AdminLoginResponseBuilder builder() {
        return new AdminLoginResponseBuilder();
    }

    public static class AdminLoginResponseBuilder {
        private Integer id;
        private String email;
        private String firstName;
        private String lastName;
        private String role;
        private String token;
        private Long expiresIn;
        private String message;
        private Boolean success;

        public AdminLoginResponseBuilder id(Integer id) {
            this.id = id;
            return this;
        }

        public AdminLoginResponseBuilder email(String email) {
            this.email = email;
            return this;
        }

        public AdminLoginResponseBuilder firstName(String firstName) {
            this.firstName = firstName;
            return this;
        }

        public AdminLoginResponseBuilder lastName(String lastName) {
            this.lastName = lastName;
            return this;
        }

        public AdminLoginResponseBuilder role(String role) {
            this.role = role;
            return this;
        }

        public AdminLoginResponseBuilder token(String token) {
            this.token = token;
            return this;
        }

        public AdminLoginResponseBuilder expiresIn(Long expiresIn) {
            this.expiresIn = expiresIn;
            return this;
        }

        public AdminLoginResponseBuilder message(String message) {
            this.message = message;
            return this;
        }

        public AdminLoginResponseBuilder success(Boolean success) {
            this.success = success;
            return this;
        }

        public AdminLoginResponse build() {
            return new AdminLoginResponse(id, email, firstName, lastName, role, token, expiresIn, message, success);
        }
    }
}
