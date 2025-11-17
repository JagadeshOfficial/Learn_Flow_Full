-- Add mobile_number column to admins table
ALTER TABLE admins ADD COLUMN mobile_number VARCHAR(20) UNIQUE;

-- Add photo_url column to admins table
ALTER TABLE admins ADD COLUMN photo_url LONGTEXT;
