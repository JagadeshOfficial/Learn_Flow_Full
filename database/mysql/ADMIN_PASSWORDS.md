# Common Bcrypt Password Hashes for Admin Users

## Reference Hashes (for password: "admin123")
- **Email**: admin@example.com
- **Password**: admin123
- **Hash**: `$2a$10$6bSzR8E8U5qLXsJdZYqb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK`

## Additional User Examples with Different Passwords

### User 1: user@example.com
- **Password**: user123
- **Hash**: `$2a$10$RbLDHkEQRN1ylkEaFXb7Xuo5/4cpLMJCmlB5Vr/Iqw2dWEp7I7p2a`

**SQL Insert:**
```sql
INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
VALUES ('user@example.com', '$2a$10$RbLDHkEQRN1ylkEaFXb7Xuo5/4cpLMJCmlB5Vr/Iqw2dWEp7I7p2a', 'John', 'Doe', 'ADMIN', 'ACTIVE');
```

---

### User 2: manager@example.com
- **Password**: password123
- **Hash**: `$2a$10$w0DRnIg4sS/0pI8wI2dZvOYYuEIIz7mSm21mIz6RCXIxXDhIDhSQu`

**SQL Insert:**
```sql
INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
VALUES ('manager@example.com', '$2a$10$w0DRnIg4sS/0pI8wI2dZvOYYuEIIz7mSm21mIz6RCXIxXDhIDhSQu', 'Jane', 'Smith', 'ADMIN', 'ACTIVE');
```

---

### User 3: superadmin@example.com
- **Password**: super123
- **Hash**: `$2a$10$8EyECYj1fQqf5jPSsQfYwOsZRf4Z.cqG9pKfR2C3V5eE.8V2TjWge`

**SQL Insert:**
```sql
INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
VALUES ('superadmin@example.com', '$2a$10$8EyECYj1fQqf5jPSsQfYwOsZRf4Z.cqG9pKfR2C3V5eE.8V2TjWge', 'Admin', 'Super', 'ADMIN', 'ACTIVE');
```

---

## How to Generate Your Own Bcrypt Hash

If you need to create hashes for different passwords, use online tools or run this command in your terminal:

### Using Java:
The PasswordHashGenerator utility was created in the backend. When you compile and run it, it generates hashes for you.

### Using Node.js:
```bash
npm install bcrypt
node -e "const bcrypt = require('bcrypt'); console.log(bcrypt.hashSync('your_password', 10))"
```

### Using Python:
```bash
pip install bcrypt
python -c "import bcrypt; print(bcrypt.hashpw(b'your_password', bcrypt.gensalt()).decode())"
```

### Using Linux/Mac:
```bash
echo -n "your_password" | htpasswd -bnBC 10 dummy | tr -d 'dummy:'
```

---

## How to Add Multiple Admins to MySQL

1. **Connect to MySQL:**
   ```bash
   mysql -u root -p auth_db
   ```

2. **Insert admins:**
   ```sql
   INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
   VALUES ('user@example.com', '$2a$10$RbLDHkEQRN1ylkEaFXb7Xuo5/4cpLMJCmlB5Vr/Iqw2dWEp7I7p2a', 'John', 'Doe', 'ADMIN', 'ACTIVE');
   
   INSERT INTO admins (email, password_hash, first_name, last_name, role, status)
   VALUES ('manager@example.com', '$2a$10$w0DRnIg4sS/0pI8wI2dZvOYYuEIIz7mSm21mIz6RCXIxXDhIDhSQu', 'Jane', 'Smith', 'ADMIN', 'ACTIVE');
   ```

3. **Verify:**
   ```sql
   SELECT * FROM admins;
   ```

---

## Summary

| Email | Password | First Name | Last Name | Hash |
|-------|----------|-----------|-----------|------|
| admin@example.com | admin123 | System | Administrator | `$2a$10$6bSzR8E8U5qLXsJdZYqb0.eXhI3BkLvJU6pXJJ6VqM7wHDq4PQeCK` |
| user@example.com | user123 | John | Doe | `$2a$10$RbLDHkEQRN1ylkEaFXb7Xuo5/4cpLMJCmlB5Vr/Iqw2dWEp7I7p2a` |
| manager@example.com | password123 | Jane | Smith | `$2a$10$w0DRnIg4sS/0pI8wI2dZvOYYuEIIz7mSm21mIz6RCXIxXDhIDhSQu` |
| superadmin@example.com | super123 | Admin | Super | `$2a$10$8EyECYj1fQqf5jPSsQfYwOsZRf4Z.cqG9pKfR2C3V5eE.8V2TjWge` |

