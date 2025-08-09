// Use Case: Change Password
const bcrypt = require('bcrypt');

class ChangePasswordUseCase {
  constructor(employeeRepository) {
    this.employeeRepository = employeeRepository;
  }

  async execute(empId, currentPassword, newPassword) {
    // Input validation
    if (!currentPassword || !newPassword) {
      throw new Error('Mật khẩu hiện tại và mật khẩu mới không được để trống');
    }

    if (newPassword.length < 6) {
      throw new Error('Mật khẩu mới phải có ít nhất 6 ký tự');
    }

    // Find employee
    const employee = await this.employeeRepository.findById(empId);
    if (!employee) {
      throw new Error('Không tìm thấy nhân viên');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, employee.passwordHash);
    if (!isCurrentPasswordValid) {
      throw new Error('Mật khẩu hiện tại không đúng');
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await this.employeeRepository.updatePassword(empId, hashedNewPassword);

    return {
      message: 'Đổi mật khẩu thành công',
      empId: empId
    };
  }
}

module.exports = ChangePasswordUseCase;
