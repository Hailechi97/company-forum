// Use Case: Create new meeting (Manager only)
const Meeting = require("../../../domain/entities/Meeting");

class CreateMeetingUseCase {
  constructor(meetingRepository, notificationService) {
    this.meetingRepository = meetingRepository;
    this.notificationService = notificationService;
  }

  async execute(user, meetingData) {
    try {
      console.log(
        "CreateMeetingUseCase - user:",
        user.empId,
        "data:",
        meetingData
      );

      // Kiểm tra quyền tạo cuộc họp
      if (!this.canCreateMeeting(user)) {
        throw new Error("Chỉ có Manager hoặc Admin mới có thể tạo cuộc họp");
      }

      // Validate input
      this.validateMeetingData(meetingData);

      // Tạo Meeting entity
      const meeting = new Meeting({
        title: meetingData.title,
        content: meetingData.content,
        startTime: meetingData.startTime,
        endTime: meetingData.endTime,
        organizer: user.empId,
        participants: meetingData.participants || "",
        location: meetingData.location,
      });

      // Lưu cuộc họp vào database
      const meetingId = await this.meetingRepository.create(meeting);

      // Thêm người tổ chức vào MeetingDetails
      await this.meetingRepository.addParticipant(
        meetingId,
        user.empId,
        "Người tổ chức",
        ""
      );

      // Thêm các người tham dự
      if (meetingData.attendees && meetingData.attendees.length > 0) {
        for (const empId of meetingData.attendees) {
          await this.meetingRepository.addParticipant(
            meetingId,
            empId,
            "Người tham dự",
            ""
          );
        }
      }

      // Gửi thông báo cho tất cả người tham dự
      await this.sendMeetingNotifications(meetingId, meetingData, user);

      console.log("CreateMeetingUseCase - meeting created with ID:", meetingId);

      return {
        success: true,
        meetingId,
        message: "Tạo cuộc họp thành công",
      };
    } catch (error) {
      console.error("CreateMeetingUseCase error:", error);
      throw new Error(`Không thể tạo cuộc họp: ${error.message}`);
    }
  }

  canCreateMeeting(user) {
    return user.role === "Manager" || user.role === "Admin";
  }

  validateMeetingData(data) {
    if (!data.title || data.title.trim().length === 0) {
      throw new Error("Tiêu đề cuộc họp không được để trống");
    }

    if (!data.content || data.content.trim().length === 0) {
      throw new Error("Nội dung cuộc họp không được để trống");
    }

    if (!data.startTime) {
      throw new Error("Thời gian bắt đầu không được để trống");
    }

    if (!data.endTime) {
      throw new Error("Thời gian kết thúc không được để trống");
    }

    if (!data.location || data.location.trim().length === 0) {
      throw new Error("Địa điểm không được để trống");
    }

    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);

    if (startTime >= endTime) {
      throw new Error("Thời gian kết thúc phải sau thời gian bắt đầu");
    }

    // Allow meetings to start in the future (more lenient validation)
    const now = new Date();
    console.log("Current time:", now.toISOString());
    console.log("Meeting start time:", startTime.toISOString());

    // Only check if the meeting is not in the past (with 5 minute tolerance)
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    if (startTime < fiveMinutesAgo) {
      throw new Error("Thời gian bắt đầu không thể trong quá khứ");
    }
  }

  async sendMeetingNotifications(meetingId, meetingData, organizer) {
    try {
      // Tạo nội dung thông báo
      const notificationContent = `Cuộc họp mới: "${
        meetingData.title
      }" được tổ chức bởi ${organizer.firstName} ${
        organizer.lastName
      }. Thời gian: ${new Date(meetingData.startTime).toLocaleString(
        "vi-VN"
      )} tại ${meetingData.location}`;

      // Gửi thông báo cho tất cả người tham dự
      if (meetingData.attendees && meetingData.attendees.length > 0) {
        for (const empId of meetingData.attendees) {
          if (this.notificationService) {
            await this.notificationService.sendMeetingNotification({
              recipientId: empId,
              title: "Lịch họp mới",
              message: notificationContent,
              meetingId: meetingId,
              type: "MEETING_CREATED",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error sending meeting notifications:", error);
      // Không throw error ở đây để không làm fail việc tạo meeting
    }
  }
}

module.exports = CreateMeetingUseCase;
