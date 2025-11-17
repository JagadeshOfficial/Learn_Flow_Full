@echo off
REM Auth Database Setup Script
REM Run this from MySQL command line manually or use with mysql.exe

cd /d "C:\Users\jagad\OneDrive\Desktop\Jagadesh\Workspace\lms-project\database\mysql"

REM Execute the SQL file with interactive password prompt
"C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe" -u root -p < auth_db.sql

echo.
echo Database setup completed. Press any key to continue...
pause
