const mysql = require("mysql2/promise");
require("dotenv").config();

async function testDirectSQL() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    console.log("✅ Database connected");

    // Test simpler SQL first
    console.log("Testing simple SQL...");
    const simpleSQL =
      "SELECT EmpID, FirstName, LastName FROM Employees WHERE EmpID != ? LIMIT ?";
    const simpleParams = ["E100", 10];
    console.log("Simple params:", simpleParams);

    const [simpleRows] = await connection.query(simpleSQL, simpleParams);
    console.log("✅ Simple SQL successful");
    console.log("📊 Simple results:", simpleRows.length, "rows");

    // Test with LIKE
    console.log("\nTesting LIKE SQL...");
    const likeSQL =
      "SELECT EmpID, FirstName, LastName FROM Employees WHERE FirstName LIKE ? LIMIT ?";
    const likeParams = ["%an%", 10];
    console.log("Like params:", likeParams);

    const [likeRows] = await connection.execute(likeSQL, likeParams);
    console.log("✅ LIKE SQL successful");
    console.log("📊 LIKE results:", likeRows);

    await connection.end();
  } catch (error) {
    console.error("❌ Database error:", error.message);
  }
}

testDirectSQL();
