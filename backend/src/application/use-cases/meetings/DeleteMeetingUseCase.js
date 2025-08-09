// Use Case: Delete meeting (Organizer or Manager only)
class DeleteMeetingUseCase {
  constructor(meetingRepository, notificationService) {
    this.meetingRepository = meetingRepository;
    this.notificationService = notificationService;
  }

  async execute(user, meetingId) {
    try {
      console.log(
        "DeleteMeetingUseCase - user:",
        user.empId,
        "meetingId:",
        meetingId
      );

      // Lấy thông tin cuộc họp
      const meeting = await this.meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new Error("Không tìm thấy cuộc họp");
      }

      // Kiểm tra quyền xóa
      if (!meeting.canBeDeletedBy(user.empId, user.role)) {
        throw new Error("Bạn không có quyền xóa cuộc họp này");
      }

      // Lấy danh sách người tham dự để gửi thông báo
      const participants = await this.meetingRepository.getParticipants(
        meetingId
      );

      // Xóa cuộc họp
      const success = await this.meetingRepository.delete(meetingId);
      if (!success) {
        throw new Error("Không thể xóa cuộc họp");
      }

      // Gửi thông báo hủy cuộc họp
      await this.sendCancellationNotifications(meeting, participants, user);

      console.log("DeleteMeetingUseCase - meeting deleted successfully");

      return {
        success: true,
        message: "Xóa cuộc họp thành công",
      };
    } catch (error) {
      console.error("DeleteMeetingUseCase error:", error);
      throw new Error(`Không thể xóa cuộc họp: ${error.message}`);
    }
  }

  async sendCancellationNotifications(meeting, participants, user) {
    try {
      const notificationContent = `Cuộc họp "${meeting.title}" đã bị hủy bởi ${
        user.firstName
      } ${user.lastName}. Thời gian dự kiến: ${new Date(
        meeting.startTime
      ).toLocaleString("vi-VN")} tại ${meeting.location}`;

      // Gửi thông báo cho tất cả người tham dự (trừ người thực hiện hủy)
      for (const participant of participants) {
        if (participant.empId !== user.empId && this.notificationService) {
          await this.notificationService.sendMeetingNotification({
            recipientId: participant.empId,
            title: "Hủy lịch họp",
            message: notificationContent,
            meetingId: null, // Không còn meeting ID vì đã bị xóa
            type: "MEETING_CANCELLED",
          });
        }
      }
    } catch (error) {
      console.error("Error sending cancellation notifications:", error);
      // Không throw error để không làm fail việc xóa
    }
  }
}

module.exports = DeleteMeetingUseCase;
