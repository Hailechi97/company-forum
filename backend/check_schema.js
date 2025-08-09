const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkSchema() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected");

    // Check table structure
    const [columns] = await connection.query("DESCRIBE Employees");
    console.log("📋 Employees table structure:");
    columns.forEach((col) => {
      console.log(
        `  ${col.Field} - ${col.Type} (${
          col.Null === "YES" ? "nullable" : "not null"
        })`
      );
    });

    await connection.end();
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

checkSchema();
