const dbConnection = require("./src/infrastructure/database/connection");
const PasswordService = require("./src/domain/services/PasswordService");

async function resetPassword() {
  const passwordService = new PasswordService();

  try {
    // Connect to database
    await dbConnection.connect();

    // Hash the new password "1"
    const hashedPassword = await passwordService.hashPassword("1");

    // Update password for LanVy98@gmail.com
    const sql = "UPDATE Users SET PasswordHash = ? WHERE Email = ?";
    const result = await dbConnection.query(sql, [
      hashedPassword,
      "LanVy98@gmail.com",
    ]);

    if (result.affectedRows > 0) {
      console.log("✅ Password reset successfully for LanVy98@gmail.com");
      console.log("New password: 1");
    } else {
      console.log("❌ Account not found: LanVy98@gmail.com");
    }
  } catch (error) {
    console.error("❌ Error resetting password:", error.message);
  } finally {
    process.exit(0);
  }
}

resetPassword();
