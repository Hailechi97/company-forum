// Use Case: Get meeting details with participants
class GetMeetingDetailsUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(user, meetingId) {
    try {
      console.log(
        "GetMeetingDetailsUseCase - user:",
        user.empId,
        "meetingId:",
        meetingId
      );

      // Lấy thông tin cuộc họp
      const meeting = await this.meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new Error("Không tìm thấy cuộc họp");
      }

      // Lấy danh sách người tham dự
      const participants = await this.meetingRepository.getParticipants(
        meetingId
      );

      // Kiểm tra quyền xem cuộc họp
      const userParticipant = participants.find((p) => p.empId === user.empId);
      const isOrganizer = meeting.organizer === user.empId;
      const isManager = user.role === "Manager" || user.role === "Admin";

      if (!isOrganizer && !userParticipant && !isManager) {
        throw new Error("Bạn không có quyền xem cuộc họp này");
      }

      // Thêm thông tin quyền hạn
      const meetingDetails = {
        ...meeting,
        participants,
        userRole:
          userParticipant?.role || (isOrganizer ? "Người tổ chức" : "Observer"),
        userNotes: userParticipant?.notes || "",
        canEdit: meeting.canBeEditedBy(user.empId, user.role),
        canDelete: meeting.canBeDeletedBy(user.empId, user.role),
        canAddNotes: !!(isOrganizer || userParticipant || isManager),
        status: this.getMeetingStatus(meeting),
      };

      console.log("GetMeetingDetailsUseCase - meeting found:", meeting.title);

      return {
        success: true,
        meeting: meetingDetails,
      };
    } catch (error) {
      console.error("GetMeetingDetailsUseCase error:", error);
      throw new Error(`Không thể lấy chi tiết cuộc họp: ${error.message}`);
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

module.exports = GetMeetingDetailsUseCase;
