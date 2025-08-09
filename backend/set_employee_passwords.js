const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function setEmployeePassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected successfully");

    const newPassword = "123456";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Set password for manager E100
    await connection.query(
      "UPDATE Employees SET Password = ? WHERE EmpID = ?",
      [hashedPassword, "E100"]
    );
    console.log("✅ Password set for E100 (minh.le@company.com): 123456");

    // Set password for employee E001
    await connection.query(
      "UPDATE Employees SET Password = ? WHERE EmpID = ?",
      [hashedPassword, "E001"]
    );
    console.log("✅ Password set for E001 (an.nguyen@example.com): 123456");

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

setEmployeePassword();
