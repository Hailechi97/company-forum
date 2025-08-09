// Domain Entity: Employee/User
class Employee {
  constructor({
    empId = null,
    username,
    email,
    passwordHash,
    salt,
    firstName,
    lastName,
    gender,
    birthdate,
    telephone,
    addressLoc,
    department,
    chucVu,
    capBac,
    photo = null,
    chuKiLuong,
    luongCoBan,
    ngayThamGia = new Date(),
    status = 'Hoạt động',
    role = 'Employee',
    lastLogin = null
  }) {
    this.empId = empId;
    this.username = username;
    this.email = email;
    this.passwordHash = passwordHash;
    this.salt = salt;
    this.firstName = firstName;
    this.lastName = lastName;
    this.gender = gender;
    this.birthdate = birthdate;
    this.telephone = telephone;
    this.addressLoc = addressLoc;
    this.department = department;
    this.chucVu = chucVu;
    this.capBac = capBac;
    this.photo = photo;
    this.chuKiLuong = chuKiLuong;
    this.luongCoBan = luongCoBan;
    this.ngayThamGia = ngayThamGia;
    this.status = status;
    this.role = role;
    this.lastLogin = lastLogin;
  }

  // Domain methods
  getFullName() {
    return `${this.firstName} ${this.lastName}`;
  }

  isAdmin() {
    return this.role === 'Admin';
  }

  isManager() {
    return this.role === 'Manager' || this.role === 'Admin';
  }

  isEmployee() {
    return this.role === 'Employee';
  }

  isActive() {
    return this.status === 'Hoạt động';
  }

  canCreatePost() {
    return this.isActive();
  }

  canModeratePost() {
    return this.isManager() && this.isActive();
  }

  canApproveRequest() {
    return this.isManager();
  }

  canCreateMeeting() {
    return this.isManager() || this.chucVu === 'Trưởng phòng';
  }

  updateProfile({ firstName, lastName, telephone, addressLoc, photo }) {
    if (firstName) this.firstName = firstName;
    if (lastName) this.lastName = lastName;
    if (telephone) this.telephone = telephone;
    if (addressLoc) this.addressLoc = addressLoc;
    if (photo !== undefined) this.photo = photo;
  }

  deactivate() {
    this.status = 'Nghỉ việc';
  }

  activate() {
    this.status = 'Hoạt động';
  }

  temporaryLeave() {
    this.status = 'Tạm nghỉ';
  }

  // Validation
  validate() {
    const errors = [];
    
    if (!this.empId) {
      errors.push('Employee ID is required');
    }
    
    if (!this.email || !this.isValidEmail(this.email)) {
      errors.push('Valid email is required');
    }
    
    if (!this.firstName || this.firstName.length < 1) {
      errors.push('First name is required');
    }
    
    if (!this.lastName || this.lastName.length < 1) {
      errors.push('Last name is required');
    }

    if (!this.telephone || !this.isValidPhone(this.telephone)) {
      errors.push('Valid telephone number is required');
    }

    if (!this.department || this.department.length < 1) {
      errors.push('Department is required');
    }

    if (!this.chucVu || this.chucVu.length < 1) {
      errors.push('Position is required');
    }

    const validGenders = ['Nam', 'Nữ', 'Khác'];
    if (!validGenders.includes(this.gender)) {
      errors.push('Invalid gender');
    }

    const validStatuses = ['Hoạt động', 'Nghỉ việc', 'Tạm nghỉ'];
    if (!validStatuses.includes(this.status)) {
      errors.push('Invalid status');
    }

    const validRoles = ['Admin', 'Manager', 'Employee'];
    if (!validRoles.includes(this.role)) {
      errors.push('Invalid role');
    }

    const validChuKiLuong = ['Hàng tháng', 'Hàng quý', 'Hàng năm'];
    if (!validChuKiLuong.includes(this.chuKiLuong)) {
      errors.push('Invalid salary period');
    }
    
    return errors;
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  isValidPhone(phone) {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  }

  // Convert to plain object for serialization (excluding sensitive data)
  toJSON() {
    const { passwordHash, salt, ...employeeWithoutPassword } = this;
    return employeeWithoutPassword;
  }

  // Include password for authentication purposes
  toAuthJSON() {
    return { ...this };
  }
}

module.exports = Employee;
