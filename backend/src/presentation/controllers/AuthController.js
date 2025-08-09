class AuthController {
  constructor(
    loginUseCase,
    resetAllPasswordsUseCase,
    resetEmployeePasswordUseCase
  ) {
    this.loginUseCase = loginUseCase;
    this.resetAllPasswordsUseCase = resetAllPasswordsUseCase;
    this.resetEmployeePasswordUseCase = resetEmployeePasswordUseCase;
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      const result = await this.loginUseCase.execute(email, password);

      if (result.success) {
        res.json({
          success: true,
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(401).json({
          success: false,
          message: result.error,
        });
      }
    } catch (error) {
      console.error("Login controller error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống, vui lòng thử lại",
      });
    }
  }

  async logout(req, res) {
    try {
      // In a real app, you might want to blacklist the token
      res.json({
        success: true,
        message: "Đăng xuất thành công",
      });
    } catch (error) {
      console.error("Logout controller error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  }

  async getMe(req, res) {
    try {
      // req.user is set by auth middleware
      res.json({
        success: true,
        data: req.user,
      });
    } catch (error) {
      console.error("Get me controller error:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi hệ thống",
      });
    }
  }

  async resetAllPasswords(req, res) {
    try {
      // req.user is set by auth middleware
      const result = await this.resetAllPasswordsUseCase.execute(req.user);

      res.json({
        success: true,
        message: result.message,
        data: {
          successCount: result.successCount,
          errorCount: result.errorCount,
          totalEmployees: result.totalEmployees,
          results: result.results,
          errors: result.errors,
        },
      });
    } catch (error) {
      console.error("Reset all passwords controller error:", error);
      res.status(403).json({
        success: false,
        message: error.message || "Không có quyền thực hiện thao tác này",
      });
    }
  }

  async resetEmployeePassword(req, res) {
    try {
      console.log(
        "AuthController - req.user:",
        JSON.stringify(req.user, null, 2)
      );

      const { empId } = req.params;

      if (!empId) {
        return res.status(400).json({
          success: false,
          message: "Mã nhân viên không được để trống",
        });
      }

      const result = await this.resetEmployeePasswordUseCase.execute(
        req.user,
        empId
      );

      res.json({
        success: true,
        message: result.message,
        data: {
          empId: result.empId,
          fullName: result.fullName,
          email: result.email,
        },
      });
    } catch (error) {
      console.error("Reset employee password controller error:", error);
      res.status(403).json({
        success: false,
        message: error.message || "Không thể cấp lại mật khẩu cho nhân viên",
      });
    }
  }
}

module.exports = AuthController;
