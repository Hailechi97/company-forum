// Use Case: Login Employee
require("dotenv").config({ path: "c:/testfile/company-forum/backend/.env" });
const jwt = require("jsonwebtoken");

class LoginEmployeeUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(email, password) {
    try {
      // Input validation
      if (!email || !password) {
        return {
          success: false,
          error: "Email và mật khẩu không được để trống",
        };
      }

      // Find user by email
      const user = await this.userRepository.findByEmail(email);

      if (!user) {
        return {
          success: false,
          error: "Email hoặc mật khẩu không đúng",
        };
      }

      // Verify password
      const isPasswordValid = await this.userRepository.verifyPassword(
        password,
        user.password
      );

      if (!isPasswordValid) {
        return {
          success: false,
          error: "Email hoặc mật khẩu không đúng",
        };
      }

      // Update last login
      await this.userRepository.updateLastLogin(user.id);

      // Generate JWT token
      console.log("JWT_SECRET:", process.env.JWT_SECRET ? "EXISTS" : "MISSING");
      console.log("JWT_EXPIRES_IN:", process.env.JWT_EXPIRES_IN);

      const token = jwt.sign(
        {
          userId: user.id,
          empId: user.empId,
          role: user.role,
          email: user.email,
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
      );

      // Remove password from user object
      delete user.password;

      return {
        success: true,
        data: {
          user,
          token,
        },
        message: "Đăng nhập thành công",
      };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: "Lỗi hệ thống, vui lòng thử lại",
      };
    }
  }
}

module.exports = LoginEmployeeUseCase;
