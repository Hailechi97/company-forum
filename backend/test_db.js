const mysql = require("mysql2/promise");
require("dotenv").config();

async function testDB() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected");

    // Check employees
    const [employees] = await connection.query(
      "SELECT EmpID, Email, ChucVu FROM Employees LIMIT 5"
    );
    console.log("👥 Employees:", employees);

    await connection.end();
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

testDB();
