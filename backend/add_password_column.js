const mysql = require("mysql2/promise");
require("dotenv").config();

async function addPasswordColumn() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected");

    // Add Password column
    await connection.query(
      "ALTER TABLE Employees ADD COLUMN Password VARCHAR(255) NULL"
    );
    console.log("✅ Password column added successfully");

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

addPasswordColumn();
