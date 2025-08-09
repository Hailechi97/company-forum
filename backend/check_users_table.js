const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkTables() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected");

    // Check if Users table exists
    const [tables] = await connection.query("SHOW TABLES LIKE 'Users'");
    console.log("📋 Users table exists:", tables.length > 0);

    if (tables.length > 0) {
      const [userColumns] = await connection.query("DESCRIBE Users");
      console.log("📋 Users table structure:");
      userColumns.forEach((col) => {
        console.log(`  ${col.Field} - ${col.Type}`);
      });

      // Check data in Users table
      const [users] = await connection.query("SELECT * FROM Users LIMIT 5");
      console.log("👥 Users in Users table:", users);
    }

    await connection.end();
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

checkTables();
