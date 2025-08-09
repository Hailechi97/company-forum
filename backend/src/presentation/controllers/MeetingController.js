// Presentation Layer: Meeting Controller
class MeetingController {
  constructor(
    getMeetingsUseCase,
    getMeetingDetailsUseCase,
    createMeetingUseCase,
    updateMeetingUseCase,
    deleteMeetingUseCase,
    updateParticipantNotesUseCase
  ) {
    this.getMeetingsUseCase = getMeetingsUseCase;
    this.getMeetingDetailsUseCase = getMeetingDetailsUseCase;
    this.createMeetingUseCase = createMeetingUseCase;
    this.updateMeetingUseCase = updateMeetingUseCase;
    this.deleteMeetingUseCase = deleteMeetingUseCase;
    this.updateParticipantNotesUseCase = updateParticipantNotesUseCase;
  }

  // GET /api/meetings - Lấy danh sách cuộc họp
  async getMeetings(req, res) {
    try {
      console.log("MeetingController.getMeetings - user:", req.user?.empId);

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
        search: req.query.search,
        startDate: req.query.startDate,
        endDate: req.query.endDate,
        viewAll: req.query.viewAll === "true", // Chỉ dành cho Manager/Admin
      };

      const result = await this.getMeetingsUseCase.execute(req.user, options);

      res.json({
        success: true,
        data: result.meetings,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: Math.ceil(result.total / result.limit),
        },
      });
    } catch (error) {
      console.error("Get meetings controller error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/meetings/:id - Lấy chi tiết cuộc họp
  async getMeetingDetails(req, res) {
    try {
      console.log(
        "MeetingController.getMeetingDetails - user:",
        req.user?.empId,
        "meetingId:",
        req.params.id
      );

      const meetingId = parseInt(req.params.id);
      if (!meetingId) {
        return res.status(400).json({
          success: false,
          message: "ID cuộc họp không hợp lệ",
        });
      }

      const result = await this.getMeetingDetailsUseCase.execute(
        req.user,
        meetingId
      );

      res.json({
        success: true,
        data: result.meeting,
      });
    } catch (error) {
      console.error("Get meeting details controller error:", error);
      const statusCode = error.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // POST /api/meetings - Tạo cuộc họp mới
  async createMeeting(req, res) {
    try {
      console.log(
        "MeetingController.createMeeting - user:",
        req.user?.empId,
        "data:",
        req.body
      );

      const meetingData = {
        title: req.body.title,
        content: req.body.content,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        location: req.body.location,
        participants: req.body.participants || "",
        attendees: req.body.attendees || [], // Array of empIds
      };

      const result = await this.createMeetingUseCase.execute(
        req.user,
        meetingData
      );

      res.status(201).json({
        success: true,
        data: {
          meetingId: result.meetingId,
        },
        message: result.message,
      });
    } catch (error) {
      console.error("Create meeting controller error:", error);
      const statusCode = error.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/meetings/:id - Cập nhật cuộc họp
  async updateMeeting(req, res) {
    try {
      console.log(
        "MeetingController.updateMeeting - user:",
        req.user?.empId,
        "meetingId:",
        req.params.id
      );

      const meetingId = parseInt(req.params.id);
      if (!meetingId) {
        return res.status(400).json({
          success: false,
          message: "ID cuộc họp không hợp lệ",
        });
      }

      const updates = {};
      if (req.body.title !== undefined) updates.title = req.body.title;
      if (req.body.content !== undefined) updates.content = req.body.content;
      if (req.body.startTime !== undefined)
        updates.startTime = req.body.startTime;
      if (req.body.endTime !== undefined) updates.endTime = req.body.endTime;
      if (req.body.location !== undefined) updates.location = req.body.location;
      if (req.body.participants !== undefined)
        updates.participants = req.body.participants;
      if (req.body.attendees !== undefined)
        updates.attendees = req.body.attendees;

      const result = await this.updateMeetingUseCase.execute(
        req.user,
        meetingId,
        updates
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Update meeting controller error:", error);
      const statusCode = error.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // DELETE /api/meetings/:id - Xóa cuộc họp
  async deleteMeeting(req, res) {
    try {
      console.log(
        "MeetingController.deleteMeeting - user:",
        req.user?.empId,
        "meetingId:",
        req.params.id
      );

      const meetingId = parseInt(req.params.id);
      if (!meetingId) {
        return res.status(400).json({
          success: false,
          message: "ID cuộc họp không hợp lệ",
        });
      }

      const result = await this.deleteMeetingUseCase.execute(
        req.user,
        meetingId
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Delete meeting controller error:", error);
      const statusCode = error.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // PUT /api/meetings/:id/notes - Cập nhật ghi chú cá nhân
  async updateNotes(req, res) {
    try {
      console.log(
        "MeetingController.updateNotes - user:",
        req.user?.empId,
        "meetingId:",
        req.params.id
      );

      const meetingId = parseInt(req.params.id);
      if (!meetingId) {
        return res.status(400).json({
          success: false,
          message: "ID cuộc họp không hợp lệ",
        });
      }

      const { notes } = req.body;
      const result = await this.updateParticipantNotesUseCase.execute(
        req.user,
        meetingId,
        notes || ""
      );

      res.json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      console.error("Update notes controller error:", error);
      const statusCode = error.message.includes("không có quyền") ? 403 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message,
      });
    }
  }

  // GET /api/meetings/calendar/:year/:month - Lấy lịch họp theo tháng
  async getCalendarMeetings(req, res) {
    try {
      console.log(
        "MeetingController.getCalendarMeetings - user:",
        req.user?.empId
      );

      const year = parseInt(req.params.year);
      const month = parseInt(req.params.month);

      if (!year || !month || month < 1 || month > 12) {
        return res.status(400).json({
          success: false,
          message: "Năm hoặc tháng không hợp lệ",
        });
      }

      // Tạo start date và end date cho tháng
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);

      const options = {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1000, // Lấy tất cả cuộc họp trong tháng
      };

      const result = await this.getMeetingsUseCase.execute(req.user, options);

      res.json({
        success: true,
        data: result.meetings,
        month: month,
        year: year,
      });
    } catch (error) {
      console.error("Get calendar meetings controller error:", error);
      res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
}

module.exports = MeetingController;
