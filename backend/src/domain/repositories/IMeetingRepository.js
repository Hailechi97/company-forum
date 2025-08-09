// Repository Interface: IMeetingRepository
class IMeetingRepository {
  async findById(meetingId) {
    throw new Error('Method must be implemented');
  }

  async findByOrganizer(organizerId) {
    throw new Error('Method must be implemented');
  }

  async findByParticipant(empId) {
    throw new Error('Method must be implemented');
  }

  async findByDateRange(startDate, endDate) {
    throw new Error('Method must be implemented');
  }

  async findUpcoming(empId = null) {
    throw new Error('Method must be implemented');
  }

  async findToday(empId = null) {
    throw new Error('Method must be implemented');
  }

  async findByStatus(status) {
    throw new Error('Method must be implemented');
  }

  async create(meeting) {
    throw new Error('Method must be implemented');
  }

  async update(meetingId, meetingData) {
    throw new Error('Method must be implemented');
  }

  async updateStatus(meetingId, status) {
    throw new Error('Method must be implemented');
  }

  async addParticipant(meetingId, empId) {
    throw new Error('Method must be implemented');
  }

  async removeParticipant(meetingId, empId) {
    throw new Error('Method must be implemented');
  }

  async getParticipants(meetingId) {
    throw new Error('Method must be implemented');
  }

  async delete(meetingId) {
    throw new Error('Method must be implemented');
  }

  async findAll(options = {}) {
    throw new Error('Method must be implemented');
  }

  async count() {
    throw new Error('Method must be implemented');
  }

  async findConflicting(startTime, endTime, participants) {
    throw new Error('Method must be implemented');
  }

  async findRecent(limit = 10) {
    throw new Error('Method must be implemented');
  }

  async search(query, options = {}) {
    throw new Error('Method must be implemented');
  }

  async getMeetingStatistics(empId = null) {
    throw new Error('Method must be implemented');
  }
}

module.exports = IMeetingRepository;
