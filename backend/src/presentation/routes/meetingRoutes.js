const express = require("express");
const router = express.Router();

let meetingController;

const initializeMeetingRoutes = (controller) => {
  meetingController = controller;
};

// GET /api/meetings - Lấy danh sách cuộc họp
router.get("/", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.getMeetings(req, res);
});

// GET /api/meetings/calendar/:year/:month - Lấy lịch họp theo tháng
router.get("/calendar/:year/:month", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.getCalendarMeetings(req, res);
});

// GET /api/meetings/:id - Lấy chi tiết cuộc họp
router.get("/:id", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.getMeetingDetails(req, res);
});

// POST /api/meetings - Tạo cuộc họp mới (Manager only)
router.post("/", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.createMeeting(req, res);
});

// PUT /api/meetings/:id - Cập nhật cuộc họp (Organizer/Manager only)
router.put("/:id", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.updateMeeting(req, res);
});

// DELETE /api/meetings/:id - Xóa cuộc họp (Organizer/Manager only)
router.delete("/:id", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.deleteMeeting(req, res);
});

// PUT /api/meetings/:id/notes - Cập nhật ghi chú cá nhân
router.put("/:id/notes", (req, res) => {
  if (!meetingController) {
    return res.status(500).json({
      success: false,
      message: "Meeting controller not initialized",
    });
  }
  meetingController.updateNotes(req, res);
});

module.exports = { router, initializeMeetingRoutes };
