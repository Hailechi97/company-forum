// Use Case: Update meeting (Organizer or Manager only)
class UpdateMeetingUseCase {
  constructor(meetingRepository, notificationService) {
    this.meetingRepository = meetingRepository;
    this.notificationService = notificationService;
  }

  async execute(user, meetingId, updates) {
    try {
      console.log(
        "UpdateMeetingUseCase - user:",
        user.empId,
        "meetingId:",
        meetingId,
        "updates:",
        updates
      );

      // Lấy thông tin cuộc họp hiện tại
      const meeting = await this.meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new Error("Không tìm thấy cuộc họp");
      }

      // Kiểm tra quyền chỉnh sửa
      if (!meeting.canBeEditedBy(user.empId, user.role)) {
        throw new Error("Bạn không có quyền chỉnh sửa cuộc họp này");
      }

      // Validate updates
      this.validateUpdates(updates);

      // Cập nhật cuộc họp
      const success = await this.meetingRepository.update(meetingId, updates);
      if (!success) {
        throw new Error("Không thể cập nhật cuộc họp");
      }

      // Nếu có thay đổi danh sách người tham dự
      if (updates.attendees !== undefined) {
        await this.updateAttendees(meetingId, updates.attendees);
      }

      // Gửi thông báo về thay đổi (nếu có thay đổi quan trọng)
      if (this.hasImportantChanges(updates)) {
        await this.sendUpdateNotifications(meetingId, meeting, updates, user);
      }

      console.log("UpdateMeetingUseCase - meeting updated successfully");

      return {
        success: true,
        message: "Cập nhật cuộc họp thành công",
      };
    } catch (error) {
      console.error("UpdateMeetingUseCase error:", error);
      throw new Error(`Không thể cập nhật cuộc họp: ${error.message}`);
    }
  }

  validateUpdates(updates) {
    if (
      updates.title !== undefined &&
      (!updates.title || updates.title.trim().length === 0)
    ) {
      throw new Error("Tiêu đề cuộc họp không được để trống");
    }

    if (
      updates.content !== undefined &&
      (!updates.content || updates.content.trim().length === 0)
    ) {
      throw new Error("Nội dung cuộc họp không được để trống");
    }

    if (
      updates.location !== undefined &&
      (!updates.location || updates.location.trim().length === 0)
    ) {
      throw new Error("Địa điểm không được để trống");
    }

    if (updates.startTime && updates.endTime) {
      const startTime = new Date(updates.startTime);
      const endTime = new Date(updates.endTime);

      if (startTime >= endTime) {
        throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
      }
    }
  }

  async updateAttendees(meetingId, newAttendees) {
    // Lấy danh sách người tham dự hiện tại
    const currentParticipants = await this.meetingRepository.getParticipants(
      meetingId
    );
    const currentAttendees = currentParticipants
      .filter((p) => p.role === "Người tham dự")
      .map((p) => p.empId);

    // Tìm người cần thêm và người cần xóa
    const toAdd = newAttendees.filter(
      (empId) => !currentAttendees.includes(empId)
    );
    const toRemove = currentAttendees.filter(
      (empId) => !newAttendees.includes(empId)
    );

    // Thêm người tham dự mới
    for (const empId of toAdd) {
      await this.meetingRepository.addParticipant(
        meetingId,
        empId,
        "Người tham dự",
        ""
      );
    }

    // Xóa người tham dự cũ
    for (const empId of toRemove) {
      await this.meetingRepository.removeParticipant(meetingId, empId);
    }
  }

  hasImportantChanges(updates) {
    // Những thay đổi quan trọng cần thông báo
    return !!(
      updates.startTime ||
      updates.endTime ||
      updates.location ||
      updates.title
    );
  }

  async sendUpdateNotifications(meetingId, originalMeeting, updates, user) {
    try {
      // Lấy danh sách người tham dự
      const participants = await this.meetingRepository.getParticipants(
        meetingId
      );

      // Tạo nội dung thông báo
      let changeDetails = [];
      if (updates.title) changeDetails.push(`Tiêu đề: ${updates.title}`);
      if (updates.startTime)
        changeDetails.push(
          `Thời gian: ${new Date(updates.startTime).toLocaleString("vi-VN")}`
        );
      if (updates.location) changeDetails.push(`Địa điểm: ${updates.location}`);

      const notificationContent = `Cuộc họp "${
        originalMeeting.title
      }" đã được cập nhật bởi ${user.firstName} ${
        user.lastName
      }. Thay đổi: ${changeDetails.join(", ")}`;

      // Gửi thông báo cho tất cả người tham dự (trừ người thực hiện thay đổi)
      for (const participant of participants) {
        if (participant.empId !== user.empId && this.notificationService) {
          await this.notificationService.sendMeetingNotification({
            recipientId: participant.empId,
            title: "Cập nhật lịch họp",
            message: notificationContent,
            meetingId: meetingId,
            type: "MEETING_UPDATED",
          });
        }
      }
    } catch (error) {
      console.error("Error sending update notifications:", error);
      // Không throw error để không làm fail việc update
    }
  }
}

module.exports = UpdateMeetingUseCase;
