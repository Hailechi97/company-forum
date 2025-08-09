// Use Case: Get meetings for a user
class GetMeetingsUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(user, options = {}) {
    try {
      console.log(
        "GetMeetingsUseCase - user:",
        user.empId,
        "options:",
        options
      );

      // Real database code
      let meetings = [];

      if (user.role === "Manager" || user.role === "Admin") {
        // Manager/Admin có thể xem tất cả cuộc họp
        if (options.viewAll) {
          meetings = await this.meetingRepository.findAll(options);
        } else {
          // Hoặc chỉ xem cuộc họp có liên quan đến mình
          meetings = await this.meetingRepository.findByEmployeeId(
            user.empId,
            options
          );
        }
      } else {
        // Employee chỉ xem cuộc họp có liên quan đến mình
        meetings = await this.meetingRepository.findByEmployeeId(
          user.empId,
          options
        );
      }

      // Thêm thông tin trạng thái cho mỗi cuộc họp
      const meetingsWithStatus = meetings.map((meeting) => ({
        ...meeting,
        status: this.getMeetingStatus(meeting),
        canEdit: meeting.canBeEditedBy
          ? meeting.canBeEditedBy(user.empId, user.role)
          : false,
        canDelete: meeting.canBeDeletedBy
          ? meeting.canBeDeletedBy(user.empId, user.role)
          : false,
      }));

      console.log(
        "GetMeetingsUseCase - found meetings:",
        meetingsWithStatus.length
      );

      return {
        meetings: meetingsWithStatus,
        total: meetingsWithStatus.length,
        page: options.page || 1,
        limit: options.limit || 20,
        totalPages: Math.ceil(
          meetingsWithStatus.length / (options.limit || 20)
        ),
      };
    } catch (error) {
      console.error("GetMeetingsUseCase error:", error);
      throw new Error(`Không thể lấy danh sách cuộc họp: ${error.message}`);
    }
  }

  getMeetingStatus(meeting) {
    const now = new Date();
    const startTime = new Date(meeting.startTime);
    const endTime = new Date(meeting.endTime);

    if (endTime < now) {
      return "completed"; // Đã kết thúc
    } else if (startTime <= now && endTime >= now) {
      return "ongoing"; // Đang diễn ra
    } else if (startTime > now) {
      return "upcoming"; // Sắp diễn ra
    }

    return "unknown";
  }
}

module.exports = GetMeetingsUseCase;
