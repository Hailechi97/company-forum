const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");
require("dotenv").config();

async function resetAdminPassword() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected successfully");

    const newPassword = "admin123";
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await connection.query(
      "UPDATE Employees SET Password = ? WHERE Email = ?",
      [hashedPassword, "admin@company.com"]
    );

    console.log("✅ Password reset successfully for admin@company.com");
    console.log("New password:", newPassword);

    await connection.end();
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

resetAdminPassword();
