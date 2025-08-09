// Domain Entity: Notification
class Notification {
  constructor({
    notificationId = null,
    empId,
    title,
    content,
    notificationDate = new Date(),
    isRead = false,
    type,
    detailsLink = null,
    priority = 'MEDIUM',
    pushSent = false,
    deepLink = null,
    imageURL = null
  }) {
    this.notificationId = notificationId;
    this.empId = empId;
    this.title = title;
    this.content = content;
    this.notificationDate = notificationDate;
    this.isRead = isRead;
    this.type = type;
    this.detailsLink = detailsLink;
    this.priority = priority;
    this.pushSent = pushSent;
    this.deepLink = deepLink;
    this.imageURL = imageURL;
  }

  // Domain methods
  markAsRead() {
    this.isRead = true;
  }

  markAsUnread() {
    this.isRead = false;
  }

  markPushSent() {
    this.pushSent = true;
  }

  isHighPriority() {
    return this.priority === 'HIGH' || this.priority === 'URGENT';
  }

  isLowPriority() {
    return this.priority === 'LOW';
  }

  // Static factory methods for different notification types
  static createPostComment(empId, postTitle, commenterName, postId) {
    return new Notification({
      empId,
      type: 'post_comment',
      title: 'Bình luận mới',
      content: `${commenterName} đã bình luận về bài viết "${postTitle}"`,
      priority: 'MEDIUM',
      deepLink: `/posts/${postId}`
    });
  }

  static createPostLike(empId, postTitle, likerName, postId) {
    return new Notification({
      empId,
      type: 'post_like',
      title: 'Lượt thích mới',
      content: `${likerName} đã thích bài viết "${postTitle}"`,
      priority: 'LOW',
      deepLink: `/posts/${postId}`
    });
  }

  static createRequestApproved(empId, requestType, approverName) {
    return new Notification({
      empId,
      type: 'request_approved',
      title: 'Đơn từ được duyệt',
      content: `Đơn ${requestType} của bạn đã được ${approverName} phê duyệt`,
      priority: 'HIGH',
      deepLink: '/requests'
    });
  }

  static createRequestRejected(empId, requestType, approverName) {
    return new Notification({
      empId,
      type: 'request_rejected',
      title: 'Đơn từ bị từ chối',
      content: `Đơn ${requestType} của bạn đã bị ${approverName} từ chối`,
      priority: 'HIGH',
      deepLink: '/requests'
    });
  }

  static createMeetingInvitation(empId, meetingTitle, organizerName, meetingTime) {
    return new Notification({
      empId,
      type: 'meeting_invitation',
      title: 'Lời mời họp',
      content: `${organizerName} đã mời bạn tham gia cuộc họp "${meetingTitle}" vào ${meetingTime}`,
      priority: 'HIGH',
      deepLink: '/meetings'
    });
  }

  static createMeetingReminder(empId, meetingTitle, meetingTime) {
    return new Notification({
      empId,
      type: 'meeting_reminder',
      title: 'Nhắc nhở cuộc họp',
      content: `Cuộc họp "${meetingTitle}" sẽ bắt đầu trong 15 phút`,
      priority: 'URGENT',
      deepLink: '/meetings'
    });
  }

  static createSystemAnnouncement(empId, title, content, priority = 'MEDIUM') {
    return new Notification({
      empId,
      type: 'system_announcement',
      title,
      content,
      priority
    });
  }

  static createScheduleUpdate(empId, scheduleTitle, department) {
    return new Notification({
      empId,
      type: 'schedule_update',
      title: 'Cập nhật lịch trình',
      content: `Lịch trình "${scheduleTitle}" cho phòng ${department} đã được cập nhật`,
      priority: 'MEDIUM',
      deepLink: '/schedule'
    });
  }

  // Validation
  validate() {
    const errors = [];
    
    if (!this.empId) {
      errors.push('Employee ID is required');
    }
    
    if (!this.type) {
      errors.push('Notification type is required');
    }
    
    if (!this.title || this.title.length < 1) {
      errors.push('Notification title is required');
    }
    
    if (!this.content || this.content.length < 1) {
      errors.push('Notification content is required');
    }
    
    const validTypes = [
      'post_comment', 'post_like', 'request_approved', 'request_rejected',
      'meeting_invitation', 'meeting_reminder', 'system_announcement', 
      'schedule_update', 'personal', 'security'
    ];
    if (!validTypes.includes(this.type)) {
      errors.push('Invalid notification type');
    }
    
    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    if (!validPriorities.includes(this.priority)) {
      errors.push('Invalid priority level');
    }
    
    return errors;
  }

  // Convert to plain object for serialization
  toJSON() {
    return { ...this };
  }
}

module.exports = Notification;
