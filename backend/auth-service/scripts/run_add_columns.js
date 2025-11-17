// Run this script to add mobile_number and photo_url columns to admins table
// Usage: node run_add_columns.js

const mysql = require('mysql2/promise');

async function run() {
  const config = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'Sivani@123',
    database: 'auth_db',
  };

  let conn;
  try {
    conn = await mysql.createConnection(config);
    console.log('Connected to MySQL');

    // Check for mobile_number column
    const [mobileRows] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'mobile_number'`,
      [config.database]
    );

    if (mobileRows[0].cnt === 0) {
      console.log('Adding mobile_number column...');
      await conn.query(`ALTER TABLE admins ADD COLUMN mobile_number VARCHAR(20);`);
      console.log('mobile_number column added.');

      // Create unique index on mobile_number if none exists
      const [idxRows] = await conn.query(
        `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'mobile_number'`,
        [config.database]
      );
      if (idxRows[0].cnt === 0) {
        try {
          console.log('Creating unique index on mobile_number...');
          await conn.query(`CREATE UNIQUE INDEX idx_admins_mobile_number ON admins (mobile_number);`);
          console.log('Unique index created.');
        } catch (err) {
          console.warn('Warning: could not create unique index on mobile_number. Check existing data for duplicates.', err.message || err);
        }
      }
    } else {
      console.log('mobile_number column already exists.');
    }

    // Check for photo_url column
    const [photoRows] = await conn.query(
      `SELECT COUNT(*) AS cnt FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'admins' AND COLUMN_NAME = 'photo_url'`,
      [config.database]
    );

    if (photoRows[0].cnt === 0) {
      console.log('Adding photo_url column...');
      await conn.query(`ALTER TABLE admins ADD COLUMN photo_url LONGTEXT;`);
      console.log('photo_url column added.');
    } else {
      console.log('photo_url column already exists.');
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Error running migration:', err.message || err);
    process.exitCode = 1;
  } finally {
    if (conn) await conn.end();
  }
}

run();
