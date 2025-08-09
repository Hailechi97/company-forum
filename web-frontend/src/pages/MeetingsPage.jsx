import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { meetingApi, api } from "../services/api";
import { toast } from "react-hot-toast";

// Helper functions moved outside component to be accessible by all components
const getStatusColor = (status) => {
  switch (status) {
    case "scheduled":
      return "bg-blue-100 text-blue-800";
    case "in_progress":
      return "bg-green-100 text-green-800";
    case "completed":
      return "bg-gray-100 text-gray-800";
    case "cancelled":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const getStatusText = (status) => {
  switch (status) {
    case "scheduled":
      return "Đã lên lịch";
    case "in_progress":
      return "Đang diễn ra";
    case "completed":
      return "Đã hoàn thành";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

const formatDateTime = (dateTime) => {
  const date = new Date(dateTime);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDuration = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}h${mins > 0 ? ` ${mins}m` : ""}`;
  }
  return `${mins}m`;
};

function MeetingsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [view, setView] = useState("list"); // list, calendar
  const [currentDate, setCurrentDate] = useState(new Date());

  // Check if user is manager
  const isManager =
    user?.role === "Manager" || user?.position?.includes("Trưởng phòng");

  // Fetch meetings
  const { data: meetings = [], isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => meetingApi.getMeetings(),
  });

  // Create meeting mutation
  const createMeetingMutation = useMutation({
    mutationFn: meetingApi.createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setShowCreateModal(false);
      toast.success("Tạo lịch họp thành công!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo lịch họp"
      );
    },
  });

  // Update meeting mutation
  const updateMeetingMutation = useMutation({
    mutationFn: ({ id, data }) => meetingApi.updateMeeting(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Cập nhật lịch họp thành công!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật lịch họp"
      );
    },
  });

  // Delete meeting mutation
  const deleteMeetingMutation = useMutation({
    mutationFn: meetingApi.deleteMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      setShowDetailModal(false);
      setSelectedMeeting(null);
      toast.success("Xóa lịch họp thành công!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa lịch họp"
      );
    },
  });

  // Update participant notes mutation
  const updateNotesMutation = useMutation({
    mutationFn: ({ meetingId, notes }) =>
      meetingApi.updateParticipantNotes(meetingId, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["meetings"] });
      toast.success("Cập nhật ghi chú thành công!");
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật ghi chú"
      );
    },
  });

  const handleCreateMeeting = () => {
    setShowCreateModal(true);
  };

  const handleViewMeeting = (meeting) => {
    setSelectedMeeting(meeting);
    setShowDetailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lịch họp</h1>
          <p className="text-gray-600 mt-1">
            {isManager
              ? "Quản lý và tạo lịch họp cho phòng ban"
              : "Xem lịch họp và cuộc họp được mời tham gia"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "list"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Danh sách
            </button>
            <button
              onClick={() => setView("calendar")}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                view === "calendar"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Lịch
            </button>
          </div>

          {isManager && (
            <button
              onClick={handleCreateMeeting}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tạo lịch họp
            </button>
          )}
        </div>
      </div>

      {view === "list" ? (
        <div className="bg-white shadow rounded-lg">
          {meetings.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Chưa có lịch họp
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {isManager
                  ? "Hãy tạo lịch họp đầu tiên cho phòng ban"
                  : "Chưa có lịch họp nào được tạo"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {meetings.map((meeting) => (
                <div
                  key={meeting.id}
                  className="p-6 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewMeeting(meeting)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {meeting.title}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            meeting.status
                          )}`}
                        >
                          {getStatusText(meeting.status)}
                        </span>
                      </div>

                      <div className="flex items-center gap-6 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatDateTime(meeting.meeting_date)}
                        </div>

                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {meeting.location}
                        </div>

                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          {formatDuration(meeting.duration)}
                        </div>

                        <div className="flex items-center gap-1">
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                            />
                          </svg>
                          {meeting.participant_count || 0} người tham gia
                        </div>
                      </div>

                      {meeting.description && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                          {meeting.description}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      {meeting.organizer_name && (
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            Tổ chức bởi
                          </p>
                          <p className="text-sm text-gray-600">
                            {meeting.organizer_name}
                          </p>
                        </div>
                      )}

                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <CalendarView meetings={meetings} onMeetingClick={handleViewMeeting} />
      )}

      {/* Create Meeting Modal */}
      {showCreateModal && (
        <CreateMeetingModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createMeetingMutation.mutate(data)}
          isLoading={createMeetingMutation.isPending}
        />
      )}

      {/* Meeting Detail Modal */}
      {showDetailModal && selectedMeeting && (
        <MeetingDetailModal
          isOpen={showDetailModal}
          meeting={selectedMeeting}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedMeeting(null);
          }}
          onUpdate={(data) =>
            updateMeetingMutation.mutate({ id: selectedMeeting.id, data })
          }
          onDelete={() => deleteMeetingMutation.mutate(selectedMeeting.id)}
          onUpdateNotes={(notes) =>
            updateNotesMutation.mutate({ meetingId: selectedMeeting.id, notes })
          }
          isManager={isManager}
          currentUser={user}
          isLoading={
            updateMeetingMutation.isPending || deleteMeetingMutation.isPending
          }
        />
      )}
    </div>
  );
}

// Calendar View Component
function CalendarView({ meetings, onMeetingClick }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getMeetingsForDay = (date) => {
    if (!date) return [];
    return meetings.filter((meeting) => {
      const meetingDate = new Date(meeting.meeting_date);
      return meetingDate.toDateString() === date.toDateString();
    });
  };

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const days = getDaysInMonth(currentDate);
  const monthYear = currentDate.toLocaleDateString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 capitalize">
          {monthYear}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => setCurrentDate(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200"
          >
            Hôm nay
          </button>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-md"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-gray-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div
            key={day}
            className="bg-gray-50 p-3 text-center text-sm font-medium text-gray-900"
          >
            {day}
          </div>
        ))}

        {/* Calendar days */}
        {days.map((day, index) => {
          const dayMeetings = getMeetingsForDay(day);
          const isToday =
            day && day.toDateString() === new Date().toDateString();

          return (
            <div
              key={index}
              className={`bg-white p-2 min-h-[100px] ${
                day ? "hover:bg-gray-50" : ""
              }`}
            >
              {day && (
                <>
                  <div
                    className={`text-sm font-medium mb-1 ${
                      isToday ? "text-blue-600" : "text-gray-900"
                    }`}
                  >
                    {day.getDate()}
                  </div>
                  <div className="space-y-1">
                    {dayMeetings.map((meeting) => (
                      <div
                        key={meeting.id}
                        onClick={() => onMeetingClick(meeting)}
                        className="text-xs p-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 truncate"
                        title={meeting.title}
                      >
                        {new Date(meeting.meeting_date).toLocaleTimeString(
                          "vi-VN",
                          { hour: "2-digit", minute: "2-digit" }
                        )}{" "}
                        {meeting.title}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Create Meeting Modal Component
function CreateMeetingModal({ isOpen, onClose, onSubmit, isLoading }) {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    meeting_date: "",
    location: "",
    duration: 60,
    participant_ids: [],
  });
  const [availableUsers, setAvailableUsers] = useState([]);

  // Fetch available users for selection (same department)
  useEffect(() => {
    if (isOpen && user?.department) {
      // Fetch users from the same department
      api.users
        .getByDepartment(user.department)
        .then((response) => {
          console.log("Department users response:", response);
          // Handle nested response structure
          let users = response.data;
          if (users && users.data) {
            users = users.data; // Extract from nested structure
          }

          // Ensure users is an array
          if (!Array.isArray(users)) {
            console.warn("Users response is not an array:", users);
            setAvailableUsers([]);
            return;
          }

          // Filter out the current user (organizer)
          const filteredUsers = users.filter((u) => u.empId !== user.empId);
          setAvailableUsers(filteredUsers);
        })
        .catch((error) => {
          console.error("Error fetching department users:", error);
          // Fallback to mock data
          setAvailableUsers([
            {
              id: 1,
              empId: "E101",
              name: "Nguyễn Văn A",
              email: "a@company.com",
              department: user.department,
            },
            {
              id: 2,
              empId: "E102",
              name: "Trần Thị B",
              email: "b@company.com",
              department: user.department,
            },
            {
              id: 3,
              empId: "E103",
              name: "Lê Văn C",
              email: "c@company.com",
              department: user.department,
            },
          ]);
        });
    }
  }, [isOpen, user]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Transform formData to match backend expected format
    const meetingDate = new Date(formData.meeting_date);
    const endTime = new Date(
      meetingDate.getTime() + formData.duration * 60 * 1000
    );

    const transformedData = {
      title: formData.title,
      content: formData.description,
      startTime: meetingDate.toISOString(),
      endTime: endTime.toISOString(),
      location: formData.location,
      attendees: formData.participant_ids,
      participants: formData.participant_ids.join(","),
    };

    onSubmit(transformedData);
  };

  const handleParticipantToggle = (empId) => {
    setFormData((prev) => ({
      ...prev,
      participant_ids: prev.participant_ids.includes(empId)
        ? prev.participant_ids.filter((id) => id !== empId)
        : [...prev.participant_ids, empId],
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              Tạo lịch họp mới
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiêu đề cuộc họp *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tiêu đề cuộc họp"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mô tả chi tiết về cuộc họp"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời gian *
              </label>
              <input
                type="datetime-local"
                required
                value={formData.meeting_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    meeting_date: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thời lượng (phút) *
              </label>
              <input
                type="number"
                required
                min="15"
                max="480"
                value={formData.duration}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    duration: parseInt(e.target.value),
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm *
            </label>
            <input
              type="text"
              required
              value={formData.location}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, location: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Phòng họp, địa chỉ hoặc link online"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Người tham gia (cùng phòng ban)
            </label>
            <div className="border border-gray-300 rounded-md max-h-48 overflow-y-auto">
              {availableUsers.length === 0 ? (
                <div className="p-3 text-gray-500 text-center">
                  Không có nhân viên nào khác trong phòng ban
                </div>
              ) : (
                availableUsers.map((user) => (
                  <label
                    key={user.empId || user.id}
                    className="flex items-center p-3 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.participant_ids.includes(
                        user.empId || user.id
                      )}
                      onChange={() =>
                        handleParticipantToggle(user.empId || user.id)
                      }
                      className="mr-3"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name || `${user.firstName} ${user.lastName}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {user.email} • {user.empId || user.id}
                      </div>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isLoading ? "Đang tạo..." : "Tạo lịch họp"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Meeting Detail Modal Component
function MeetingDetailModal({
  isOpen,
  meeting,
  onClose,
  onUpdate,
  onDelete,
  onUpdateNotes,
  isManager,
  currentUser,
  isLoading,
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [personalNotes, setPersonalNotes] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (meeting) {
      setEditData({
        title: meeting.title,
        description: meeting.description,
        meeting_date: new Date(meeting.meeting_date).toISOString().slice(0, 16),
        location: meeting.location,
        duration: meeting.duration,
      });
      setPersonalNotes(meeting.personal_notes || "");
    }
  }, [meeting]);

  const handleUpdate = () => {
    onUpdate(editData);
    setIsEditing(false);
  };

  const handleNotesUpdate = () => {
    onUpdateNotes(personalNotes);
  };

  const canEdit = isManager || meeting.organizer_id === currentUser.id;

  if (!isOpen || !meeting) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {isEditing ? "Chỉnh sửa lịch họp" : "Chi tiết lịch họp"}
              </h2>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                  meeting.status
                )}`}
              >
                {getStatusText(meeting.status)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-2 text-gray-400 hover:text-gray-600"
                  title="Chỉnh sửa"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </button>
              )}
              {canEdit && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 text-red-400 hover:text-red-600"
                  title="Xóa"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {isEditing ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiêu đề
                </label>
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) =>
                    setEditData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <textarea
                  value={editData.description}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời gian
                  </label>
                  <input
                    type="datetime-local"
                    value={editData.meeting_date}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        meeting_date: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Thời lượng (phút)
                  </label>
                  <input
                    type="number"
                    min="15"
                    max="480"
                    value={editData.duration}
                    onChange={(e) =>
                      setEditData((prev) => ({
                        ...prev,
                        duration: parseInt(e.target.value),
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa điểm
                </label>
                <input
                  type="text"
                  value={editData.location}
                  onChange={(e) =>
                    setEditData((prev) => ({
                      ...prev,
                      location: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {meeting.title}
                </h3>
                {meeting.description && (
                  <p className="text-gray-600">{meeting.description}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Thời gian</h4>
                    <p className="text-gray-600">
                      {formatDateTime(meeting.meeting_date)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Thời lượng</h4>
                    <p className="text-gray-600">
                      {formatDuration(meeting.duration)}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">Địa điểm</h4>
                    <p className="text-gray-600">{meeting.location}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900">Tổ chức bởi</h4>
                    <p className="text-gray-600">{meeting.organizer_name}</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900">
                      Người tham gia
                    </h4>
                    <p className="text-gray-600">
                      {meeting.participant_count || 0} người
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Notes Section */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Ghi chú cá nhân</h4>
                  <button
                    onClick={handleNotesUpdate}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Lưu ghi chú
                  </button>
                </div>
                <textarea
                  value={personalNotes}
                  onChange={(e) => setPersonalNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Thêm ghi chú cá nhân về cuộc họp này..."
                />
              </div>
            </>
          )}
        </div>

        <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdate}
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Đang cập nhật..." : "Cập nhật"}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Đóng
            </button>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60">
          <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Xác nhận xóa
            </h3>
            <p className="text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa lịch họp "{meeting.title}"? Hành động
              này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowDeleteConfirm(false);
                }}
                disabled={isLoading}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isLoading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MeetingsPage;
