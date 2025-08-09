// Interface for Notification Repository
class INotificationRepository {
  async create(notification) {
    throw new Error('Method not implemented');
  }

  async findById(notificationId) {
    throw new Error('Method not implemented');
  }

  async findByEmployee(empId, options = {}) {
    throw new Error('Method not implemented');
  }

  async findUnreadByEmployee(empId) {
    throw new Error('Method not implemented');
  }

  async findByType(type, options = {}) {
    throw new Error('Method not implemented');
  }

  async findByPriority(priority, options = {}) {
    throw new Error('Method not implemented');
  }

  async markAsRead(notificationId) {
    throw new Error('Method not implemented');
  }

  async markAsUnread(notificationId) {
    throw new Error('Method not implemented');
  }

  async markAllAsRead(empId) {
    throw new Error('Method not implemented');
  }

  async markPushSent(notificationId) {
    throw new Error('Method not implemented');
  }

  async delete(notificationId) {
    throw new Error('Method not implemented');
  }

  async deleteExpired() {
    throw new Error('Method not implemented');
  }

  async getUnreadCount(empId) {
    throw new Error('Method not implemented');
  }

  async createBulk(notifications) {
    throw new Error('Method not implemented');
  }

  async findForPushNotification() {
    throw new Error('Method not implemented');
  }

  async findAll(options = {}) {
    throw new Error('Method not implemented');
  }

  async count() {
    throw new Error('Method not implemented');
  }

  async countByEmployee(empId) {
    throw new Error('Method not implemented');
  }

  async countUnreadByEmployee(empId) {
    throw new Error('Method not implemented');
  }

  async findRecent(empId, limit = 10) {
    throw new Error('Method not implemented');
  }

  async search(query, options = {}) {
    throw new Error('Method not implemented');
  }

  async deleteOldNotifications(userId, keepCount = 100) {
    throw new Error('Method not implemented');
  }
}

module.exports = INotificationRepository;
