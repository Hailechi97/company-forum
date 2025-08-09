// Use Case: Update participant notes
class UpdateParticipantNotesUseCase {
  constructor(meetingRepository) {
    this.meetingRepository = meetingRepository;
  }

  async execute(user, meetingId, notes) {
    try {
      console.log(
        "UpdateParticipantNotesUseCase - user:",
        user.empId,
        "meetingId:",
        meetingId
      );

      // Kiểm tra cuộc họp có tồn tại không
      const meeting = await this.meetingRepository.findById(meetingId);
      if (!meeting) {
        throw new Error("Không tìm thấy cuộc họp");
      }

      // Lấy danh sách người tham dự để kiểm tra quyền
      const participants = await this.meetingRepository.getParticipants(
        meetingId
      );
      const userParticipant = participants.find((p) => p.empId === user.empId);
      const isOrganizer = meeting.organizer === user.empId;
      const isManager = user.role === "Manager" || user.role === "Admin";

      // Kiểm tra quyền thêm ghi chú
      if (!isOrganizer && !userParticipant && !isManager) {
        throw new Error("Bạn không có quyền thêm ghi chú cho cuộc họp này");
      }

      // Cập nhật ghi chú
      const success = await this.meetingRepository.updateParticipantNotes(
        meetingId,
        user.empId,
        notes
      );
      if (!success) {
        // Nếu user chưa có trong MeetingDetails, thêm họ vào
        await this.meetingRepository.addParticipant(
          meetingId,
          user.empId,
          "Người tham dự",
          notes
        );
      }

      console.log("UpdateParticipantNotesUseCase - notes updated successfully");

      return {
        success: true,
        message: "Cập nhật ghi chú thành công",
      };
    } catch (error) {
      console.error("UpdateParticipantNotesUseCase error:", error);
      throw new Error(`Không thể cập nhật ghi chú: ${error.message}`);
    }
  }
}

module.exports = UpdateParticipantNotesUseCase;
