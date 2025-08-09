require("dotenv").config();
const mysql = require("mysql2/promise");

async function testUpdate() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "123456",
    database: process.env.DB_NAME || "EmployeeManagement",
  });

  try {
    // Kiểm tra dữ liệu hiện tại
    console.log("=== BEFORE UPDATE ===");
    const [beforeRows] = await connection.execute(
      "SELECT EmpID, FirstName, LastName, Photo FROM Employees WHERE EmpID = ?",
      ["EMP1748058961530"]
    );
    console.log(beforeRows[0]);

    // Test cập nhật Photo field
    console.log("\n=== UPDATING PHOTO ===");
    const newPhoto = "test_photo_12345.jpg";
    const [updateResult] = await connection.execute(
      "UPDATE Employees SET Photo = ? WHERE EmpID = ?",
      [newPhoto, "EMP1748058961530"]
    );
    console.log("Update result:", updateResult);

    // Kiểm tra sau khi update
    console.log("\n=== AFTER UPDATE ===");
    const [afterRows] = await connection.execute(
      "SELECT EmpID, FirstName, LastName, Photo FROM Employees WHERE EmpID = ?",
      ["EMP1748058961530"]
    );
    console.log(afterRows[0]);

    // Rollback về giá trị cũ
    console.log("\n=== ROLLBACK ===");
    await connection.execute("UPDATE Employees SET Photo = ? WHERE EmpID = ?", [
      "avatar_1748058986790_th (7).jpg",
      "EMP1748058961530",
    ]);
    console.log("Rolled back to original value");
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await connection.end();
  }
}

testUpdate();
