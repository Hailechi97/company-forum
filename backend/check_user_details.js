const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkUserDetails() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected");

    // Check detailed info of users
    const [employees] = await connection.query(`
      SELECT EmpID, FirstName, LastName, Email, CONCAT(FirstName, ' ', LastName) as fullName 
      FROM Employees 
      WHERE EmpID IN ('E001', 'E002', 'E100')
    `);
    console.log("👥 Employee details:", employees);

    await connection.end();
  } catch (error) {
    console.error("❌ Database error:", error);
  }
}

checkUserDetails();
