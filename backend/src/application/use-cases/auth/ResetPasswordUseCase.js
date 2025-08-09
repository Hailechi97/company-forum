// Use Case: Reset Password
const bcrypt = require('bcrypt');
const crypto = require('crypto');

class ResetPasswordUseCase {
  constructor(employeeRepository, mailService) {
    this.employeeRepository = employeeRepository;
    this.mailService = mailService;
  }

  async execute(email) {
    // Input validation
    if (!email) {
      throw new Error('Email không được để trống');
    }

    // Find employee by email
    const employee = await this.employeeRepository.findByEmail(email);
    if (!employee) {
      throw new Error('Email không tồn tại trong hệ thống');
    }

    // Generate new temporary password
    const tempPassword = this.generateRandomPassword();
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Update password in database
    await this.employeeRepository.updatePassword(employee.empId, hashedPassword);

    // Send email with new password
    await this.mailService.sendPasswordReset({
      to: employee.email,
      firstName: employee.firstName,
      lastName: employee.lastName,
      tempPassword: tempPassword,
      department: employee.department
    });

    return {
      message: 'Mật khẩu mới đã được gửi đến email của bạn',
      empId: employee.empId
    };
  }

  generateRandomPassword() {
    return Math.random().toString(36).slice(-8);
  }
}

module.exports = ResetPasswordUseCase;
