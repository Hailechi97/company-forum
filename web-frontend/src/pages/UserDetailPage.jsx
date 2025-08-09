import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { api } from "../services/api";
import { toast } from "react-hot-toast";
import UserEditModal from "../components/UserEditModal";

function UserDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuthStore();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState(false);

  // Check if current user is manager
  const isManager =
    currentUser?.role === "Manager" ||
    currentUser?.position?.includes("Trưởng phòng");

  // Check if current user can edit this user
  const canEdit =
    currentUser?.empId === id ||
    (isManager && currentUser?.department === user?.department);

  useEffect(() => {
    fetchUserDetail();
  }, [id]);

  const fetchUserDetail = async () => {
    try {
      setLoading(true);
      let response;

      if (currentUser?.empId === id) {
        // Getting own profile
        response = await api.users.getProfile();
      } else if (isManager) {
        // Manager getting employee in same department
        response = await api.users.getById(id);
      } else {
        // No permission
        toast.error("Bạn không có quyền xem thông tin này");
        navigate("/users");
        return;
      }

      const userData = response.data?.data || response.data;
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user detail:", error);

      if (error.response?.status === 404) {
        toast.error("Không tìm thấy người dùng");
      } else if (error.response?.status === 403) {
        toast.error("Bạn không có quyền xem thông tin này");
      } else {
        toast.error("Không thể tải thông tin người dùng");
      }

      navigate("/users");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setShowEditModal(true);
  };

  const handleDelete = async () => {
    if (!isManager) {
      toast.error("Bạn không có quyền xóa người dùng");
      return;
    }

    if (currentUser?.empId === id) {
      toast.error("Bạn không thể xóa tài khoản của chính mình");
      return;
    }

    if (
      window.confirm(`Bạn có chắc chắn muốn xóa người dùng ${user.fullName}?`)
    ) {
      try {
        await api.users.delete(id);
        toast.success("Xóa người dùng thành công");
        navigate("/users");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast.error("Không thể xóa người dùng");
      }
    }
  };

  const handleSaveUser = async (userData) => {
    try {
      console.log("UserDetailPage.handleSaveUser called with:", userData); // Debug log
      await api.users.updateProfile(id, userData);
      toast.success("Cập nhật thông tin thành công");
      setShowEditModal(false);
      await fetchUserDetail(); // Refresh user data
    } catch (error) {
      console.error("Error updating user:", error);
      toast.error("Không thể cập nhật thông tin");
    }
  };

  const handleAvatarUpload = async (file) => {
    try {
      console.log(
        "UserDetailPage.handleAvatarUpload called with file:",
        file.name
      ); // Debug log

      // Validate file
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Vui lòng chọn file ảnh");
        return;
      }

      // Upload image first
      const formData = new FormData();
      formData.append("image", file);

      console.log("About to upload image..."); // Debug log
      const uploadResponse = await api.upload.image(formData);
      console.log("Upload response:", uploadResponse.data); // Debug log

      if (uploadResponse.data && uploadResponse.data.filename) {
        // Update user with new photo filename
        console.log(
          "About to update user with photo:",
          uploadResponse.data.filename
        ); // Debug log
        await api.users.updateProfile(id, {
          photo: uploadResponse.data.filename,
        });
        toast.success("Cập nhật ảnh đại diện thành công");
        await fetchUserDetail(); // Refresh to get new avatar
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Không thể cập nhật ảnh đại diện");
      }
    }
  };

  const handleResetPassword = async () => {
    if (!isManager) {
      toast.error("Chỉ trưởng phòng mới có quyền cấp lại mật khẩu");
      return;
    }

    if (currentUser?.empId === id) {
      toast.error(
        "Không thể cấp lại mật khẩu cho chính mình. Vui lòng sử dụng chức năng đổi mật khẩu."
      );
      return;
    }

    if (
      !window.confirm(
        `Bạn có chắc chắn muốn cấp lại mật khẩu cho nhân viên "${user?.fullName}"?\n\n` +
          "⚠️ Nhân viên sẽ nhận được mật khẩu mới qua email và phải đổi mật khẩu khi đăng nhập."
      )
    ) {
      return;
    }

    try {
      setResetPasswordLoading(true);
      const response = await api.auth.resetEmployeePassword(id);
      const result = response.data.data;

      toast.success(
        `✅ Đã cấp mật khẩu mới cho ${result.fullName}. Email đã được gửi đến ${result.email}`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("Error resetting password:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cấp lại mật khẩu cho nhân viên này."
      );
    } finally {
      setResetPasswordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Không tìm thấy người dùng
        </h3>
        <button
          onClick={() => navigate("/users")}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/users")}
            className="text-gray-600 hover:text-gray-800"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            Thông tin nhân viên
          </h1>
        </div>

        {canEdit && (
          <div className="flex gap-3">
            <button
              onClick={handleEdit}
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
              Chỉnh sửa
            </button>

            {isManager && currentUser?.empId !== id && (
              <button
                onClick={handleResetPassword}
                disabled={resetPasswordLoading}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors flex items-center gap-2"
              >
                {resetPasswordLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
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
                      d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z"
                    />
                  </svg>
                )}
                {resetPasswordLoading ? "Đang cấp..." : "Cấp lại mật khẩu"}
              </button>
            )}

            {isManager && currentUser?.empId !== id && (
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
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
                Xóa
              </button>
            )}
          </div>
        )}
      </div>

      {/* User Info Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-8">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="relative">
              <img
                className="h-32 w-32 rounded-full object-cover border-4 border-gray-200"
                src={
                  user.photo
                    ? `http://localhost:3000/uploads/${user.photo}`
                    : "/default-avatar.png"
                }
                alt={user.fullName}
                onError={(e) => {
                  console.log("Image load error for:", e.target.src); // Debug log
                  e.target.src = "/default-avatar.png";
                }}
              />
              {canEdit && (
                <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
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
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleAvatarUpload(file);
                      }
                    }}
                  />
                </label>
              )}
            </div>

            {/* Basic Info */}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {user.fullName}
              </h2>
              <p className="text-lg text-gray-600 mb-4">{user.position}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Mã nhân viên
                  </label>
                  <p className="text-gray-900 font-medium">{user.empId}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Phòng ban
                  </label>
                  <p className="text-gray-900 font-medium">{user.department}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Vai trò
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === "Manager"
                        ? "bg-purple-100 text-purple-800"
                        : user.role === "Admin"
                        ? "bg-red-100 text-red-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {user.role === "Manager"
                      ? "Quản lý"
                      : user.role === "Admin"
                      ? "Quản trị viên"
                      : "Nhân viên"}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Trạng thái
                  </label>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === "Hoạt động"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Ngày sinh
                  </label>
                  <p className="text-gray-900 font-medium">
                    {user.birthdate
                      ? new Date(user.birthdate).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    Ngày tham gia
                  </label>
                  <p className="text-gray-900 font-medium">
                    {user.joinDate
                      ? new Date(user.joinDate).toLocaleDateString("vi-VN")
                      : "Chưa cập nhật"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="border-t border-gray-200 px-6 py-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Thông tin liên hệ
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Email
              </label>
              <div className="flex items-center gap-2">
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
                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <a
                  href={`mailto:${user.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {user.email}
                </a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Số điện thoại
              </label>
              <div className="flex items-center gap-2">
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
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {user.telephone ? (
                  <a
                    href={`tel:${user.telephone}`}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {user.telephone}
                  </a>
                ) : (
                  <span className="text-gray-500">Chưa cập nhật</span>
                )}
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-500 mb-1">
                Địa chỉ
              </label>
              <div className="flex items-center gap-2">
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-gray-900">
                  {user.address || "Chưa cập nhật"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <UserEditModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        user={user}
        onSave={handleSaveUser}
      />
    </div>
  );
}

export default UserDetailPage;
