# Admin Authentication Integration Guide

This guide explains the admin login integration with MySQL database and Spring Boot microservices.

## Architecture Overview

```
Frontend (Next.js)
    ↓
Admin Login Form
    ↓
HTTP POST to /api/v1/auth/admin/login
    ↓
Auth Service (Spring Boot)
    ↓
MySQL Database (auth_db)
    ↓
JWT Token Response
    ↓
Store in localStorage + Redirect to Dashboard
```

## Database Setup

### 1. Create Admin Database

Run the SQL script to create the admin authentication database:

```bash
mysql -u root -p < database/mysql/auth_db.sql
```

This will create:
- `admins` table - stores admin user credentials and info
- `admin_audit_logs` table - tracks admin actions
- `admin_tokens` table - manages JWT tokens

### 2. Default Admin Credentials

After running the script, you'll have a default admin user:
- **Email**: `admin@example.com`
- **Password**: `admin123`

**Note**: The password is stored as bcrypt hash. For production, use strong passwords and proper password hashing.

## Backend Setup (Spring Boot)

### 1. Prerequisites
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Spring Boot 3.0+

### 2. Configuration

Update `backend/auth-service/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/auth_db
    username: root
    password: root
  jpa:
    hibernate:
      ddl-auto: update

server:
  port: 8081
```

### 3. Build and Run

```bash
cd backend/auth-service
mvn clean install
mvn spring-boot:run
```

The auth service will start on `http://localhost:8081`

## Frontend Setup (Next.js)

### 1. Environment Configuration

Create `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:8081
```

### 2. Install Dependencies

```bash
npm install
```

The frontend already includes `lucide-react` for icons (AlertCircle, Loader2). If needed:

```bash
npm install lucide-react
```

### 3. Run Development Server

```bash
npm run dev
```

Access admin login at: `http://localhost:3000/login/admin`

## API Endpoints

### Admin Login

**Endpoint**: `POST /api/v1/auth/admin/login`

**Base URL**: `http://localhost:8081`

**Request Body**:
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Success Response (200)**:
```json
{
  "id": 1,
  "email": "admin@example.com",
  "firstName": "System",
  "lastName": "Administrator",
  "role": "ADMIN",
  "token": "eyJhbGciOiJIUzUxMiJ9...",
  "expiresIn": 86400000,
  "success": true,
  "message": "Login successful"
}
```

**Error Response (401)**:
```json
{
  "success": false,
  "message": "Invalid email or password"
}
```

### Health Check

**Endpoint**: `GET /api/v1/auth/admin/health`

**Response**:
```
Admin Auth Service is running
```

## Frontend Implementation Details

### Login Form Components

The admin login form (`src/app/(auth)/login/admin/page.tsx`) includes:

1. **State Management**:
   - `email`: user input email
   - `password`: user input password
   - `loading`: loading state during API call
   - `error`: error message display

2. **Form Submission**:
   - Validates form data
   - Calls auth service API
   - Handles success/error responses
   - Stores JWT token and admin info in localStorage

3. **Error Handling**:
   - Network errors
   - Invalid credentials
   - Backend errors
   - User-friendly error messages

### Token Storage

Upon successful login, the following data is stored in localStorage:
```javascript
localStorage.setItem('adminToken', data.token);
localStorage.setItem('adminId', data.id);
localStorage.setItem('adminEmail', data.email);
localStorage.setItem('adminRole', data.role);
```

### Protected Routes

To protect admin routes, create a middleware to check the token:

```typescript
// lib/auth.ts
export function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('adminToken');
}

export function isAdminLoggedIn(): boolean {
  return getAdminToken() !== null;
}
```

## Spring Boot Service Classes

### 1. Admin Entity (`entity/Admin.java`)
- Represents admin user in database
- Includes JPA annotations and Lombok

### 2. AdminRepository (`repository/AdminRepository.java`)
- JPA repository for database operations
- Methods: `findByEmail()`, `findByIdAndStatus()`

### 3. AdminAuthService (`service/AdminAuthService.java`)
- Core authentication logic
- Password verification with BCrypt
- JWT token generation
- Last login tracking

### 4. JwtTokenProvider (`service/JwtTokenProvider.java`)
- JWT token generation
- Token validation
- Token claims extraction
- 24-hour token expiration

### 5. AdminAuthController (`controller/AdminAuthController.java`)
- REST API endpoints
- CORS configuration for frontend
- Error handling

## Security Features

1. **Password Hashing**: BCrypt algorithm with strength 10
2. **JWT Tokens**: HS512 algorithm with 24-hour expiration
3. **CORS**: Configured for localhost development
4. **Status Tracking**: Only active admins can login
5. **Audit Logging**: Audit trail of admin actions

## Testing the Integration

### 1. Start MySQL
```bash
mysql -u root -p
```

### 2. Run Auth Service
```bash
cd backend/auth-service
mvn spring-boot:run
```

### 3. Start Frontend
```bash
npm run dev
```

### 4. Test Login
1. Navigate to `http://localhost:3000/login/admin`
2. Enter credentials:
   - Email: `admin@example.com`
   - Password: `admin123`
3. Should redirect to `/admin/dashboard`
4. Check localStorage for stored tokens

### 5. Verify Backend Logs
```
Admin successfully logged in: admin@example.com
```

## Troubleshooting

### 1. "Network error" on login
- Check if auth service is running on port 8081
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check CORS settings in controller

### 2. "Invalid email or password"
- Verify default admin was created: `SELECT * FROM admins;`
- Check password hash matches bcrypt format
- Ensure database connection is working

### 3. JWT validation fails
- Verify JWT secret is configured correctly
- Check token expiration time
- Ensure token is included in request header

### 4. Database connection error
- Confirm MySQL is running on port 3306
- Verify credentials in `application.yml`
- Check database `auth_db` exists

## Next Steps

1. **Implement Protected Routes**:
   - Create middleware to verify JWT tokens
   - Add route guards for admin pages

2. **Extend Authentication**:
   - Implement logout endpoint
   - Add token refresh mechanism
   - Add password reset functionality

3. **Database Features**:
   - Implement audit logging
   - Add admin role management
   - Add session tracking

4. **Security Enhancements**:
   - Implement rate limiting
   - Add login attempt tracking
   - Add 2FA support

## File Structure

```
backend/auth-service/
├── src/main/java/com/lms/auth/
│   ├── controller/
│   │   └── AdminAuthController.java
│   ├── service/
│   │   ├── AdminAuthService.java
│   │   └── JwtTokenProvider.java
│   ├── entity/
│   │   └── Admin.java
│   ├── repository/
│   │   └── AdminRepository.java
│   ├── dto/
│   │   ├── AdminLoginRequest.java
│   │   └── AdminLoginResponse.java
│   ├── config/
│   │   └── SecurityConfig.java
│   └── AuthServiceApplication.java
├── src/main/resources/
│   └── application.yml
└── pom.xml

frontend/
├── src/app/(auth)/login/admin/
│   └── page.tsx
├── .env.local
└── package.json

database/mysql/
└── auth_db.sql
```

## Support

For issues or questions, refer to:
- Spring Boot Documentation: https://spring.io/projects/spring-boot
- Next.js Documentation: https://nextjs.org/docs
- JWT Documentation: https://jwt.io/introduction
