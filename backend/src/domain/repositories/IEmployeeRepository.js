// Repository Interface: IEmployeeRepository
class IEmployeeRepository {
  async findById(empId) {
    throw new Error('Method must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }

  async findByUsername(username) {
    throw new Error('Method must be implemented');
  }

  async findByPhoneNumber(phoneNumber) {
    throw new Error('Method must be implemented');
  }

  async findByDepartment(department) {
    throw new Error('Method must be implemented');
  }

  async findByRole(role) {
    throw new Error('Method must be implemented');
  }

  async findActive() {
    throw new Error('Method must be implemented');
  }

  async create(employee) {
    throw new Error('Method must be implemented');
  }

  async update(empId, employeeData) {
    throw new Error('Method must be implemented');
  }

  async updatePassword(empId, hashedPassword) {
    throw new Error('Method must be implemented');
  }

  async updateAvatar(empId, avatarURL) {
    throw new Error('Method must be implemented');
  }

  async updateDeviceToken(empId, deviceToken) {
    throw new Error('Method must be implemented');
  }

  async updateStatus(empId, status) {
    throw new Error('Method must be implemented');
  }

  async delete(empId) {
    throw new Error('Method must be implemented');
  }

  async findAll(options = {}) {
    throw new Error('Method must be implemented');
  }

  async count() {
    throw new Error('Method must be implemented');
  }

  async search(query, options = {}) {
    throw new Error('Method must be implemented');
  }

  async verifyCredentials(username, password) {
    throw new Error('Method must be implemented');
  }

  async findSupervisors() {
    throw new Error('Method must be implemented');
  }

  async findByManager(managerId) {
    throw new Error('Method must be implemented');
  }

  async updateLastLogin(empId) {
    throw new Error('Method must be implemented');
  }
}

module.exports = IEmployeeRepository;
