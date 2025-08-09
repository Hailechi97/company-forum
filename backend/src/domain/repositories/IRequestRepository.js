// Repository Interface: IRequestRepository
class IRequestRepository {
  async findById(requestId) {
    throw new Error('Method must be implemented');
  }

  async findByEmployee(empId) {
    throw new Error('Method must be implemented');
  }

  async findByType(requestType) {
    throw new Error('Method must be implemented');
  }

  async findByStatus(status) {
    throw new Error('Method must be implemented');
  }

  async findPendingRequests() {
    throw new Error('Method must be implemented');
  }

  async findByApprover(approverId) {
    throw new Error('Method must be implemented');
  }

  async findByDateRange(startDate, endDate) {
    throw new Error('Method must be implemented');
  }

  async create(request) {
    throw new Error('Method must be implemented');
  }

  async update(requestId, requestData) {
    throw new Error('Method must be implemented');
  }

  async updateStatus(requestId, status, approverId, note = null) {
    throw new Error('Method must be implemented');
  }

  async delete(requestId) {
    throw new Error('Method must be implemented');
  }

  async findAll(options = {}) {
    throw new Error('Method must be implemented');
  }

  async count() {
    throw new Error('Method must be implemented');
  }

  async countByStatus(status) {
    throw new Error('Method must be implemented');
  }

  async countByEmployee(empId) {
    throw new Error('Method must be implemented');
  }

  async findRecent(limit = 10) {
    throw new Error('Method must be implemented');
  }

  async findExpiring(days = 7) {
    throw new Error('Method must be implemented');
  }

  async search(query, options = {}) {
    throw new Error('Method must be implemented');
  }

  async getRequestStatistics(empId = null) {
    throw new Error('Method must be implemented');
  }
}

module.exports = IRequestRepository;
