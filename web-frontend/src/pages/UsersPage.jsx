import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { toast } from "react-hot-toast";
import UserEditModal from "../components/UserEditModal";

function UsersPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [resetPasswordsLoading, setResetPasswordsLoading] = useState(false);

  // Check if user is manager (CapBac A1)
  const isManager =
    user?.role === "Manager" || user?.position?.includes("Trưởng phòng");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      let response;

      if (isManager) {
        // Manager can see all users in their department
        response = await api.users.getByDepartment(user.department);
      } else {
        // Regular employee can only see their own profile
        response = await api.users.getProfile();
      }

      // Handle response format
      const userData = response.data?.data || response.data;
      setUsers(Array.isArray(userData) ? userData : [userData]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      await api.users.create(userData);
      toast.success("Tạo người dùng thành công");
      setShowCreateModal(false);
      fetchUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error("Không thể tạo người dùng");
    }
  };

  const handleSaveUser = async (userData) => {
    await handleCreateUser(userData);
  };

  const handleResetAllPasswords = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn cấp lại mật khẩu cho toàn bộ nhân viên?\n\n" +
          "⚠️ Tất cả nhân viên sẽ nhận được mật khẩu mới qua email và phải đổi mật khẩu khi đăng nhập."
      )
    ) {
      return;
    }

    try {
      setResetPasswordsLoading(true);
      const response = await api.auth.resetAllPasswords();
      const result = response.data.data;

      toast.success(
        `✅ ${result.successCount}/${result.totalEmployees} nhân viên đã được cấp mật khẩu mới thành công!`,
        { duration: 5000 }
      );

      if (result.errorCount > 0) {
        toast.error(
          `⚠️ ${result.errorCount} nhân viên gặp lỗi khi cấp mật khẩu`,
          { duration: 5000 }
        );
        console.error("Reset password errors:", result.errors);
      }

      // Hiển thị chi tiết trong console cho admin
      console.log("Reset passwords result:", result);
    } catch (error) {
      console.error("Error resetting all passwords:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cấp lại mật khẩu. Vui lòng thử lại."
      );
    } finally {
      setResetPasswordsLoading(false);
    }
  };

  const handleResetEmployeePassword = async (empId, employeeName) => {
    if (
      !window.confirm(
        `Bạn có chắc chắn muốn cấp lại mật khẩu cho nhân viên "${employeeName}"?\n\n` +
          "⚠️ Nhân viên sẽ nhận được mật khẩu mới qua email."
      )
    ) {
      return;
    }

    try {
      const response = await api.auth.resetEmployeePassword(empId);
      const result = response.data.data;

      toast.success(
        `✅ Đã cấp mật khẩu mới cho ${result.fullName}. Email đã được gửi đến ${result.email}`,
        { duration: 5000 }
      );
    } catch (error) {
      console.error("Error resetting employee password:", error);
      toast.error(
        error.response?.data?.message ||
          "Không thể cấp lại mật khẩu cho nhân viên này."
      );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isManager ? "Quản lý người dùng" : "Thông tin cá nhân"}
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            {isManager
              ? `Quản lý nhân viên phòng ${user?.department}`
              : "Xem và chỉnh sửa thông tin cá nhân của bạn"}
          </p>
        </div>

        {isManager && (
          <div className="flex gap-3">
            <button
              onClick={handleResetAllPasswords}
              disabled={resetPasswordsLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-orange-400 transition-colors flex items-center gap-2"
            >
              {resetPasswordsLoading ? (
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
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              )}
              {resetPasswordsLoading
                ? "Đang cấp lại..."
                : "Cấp lại mật khẩu toàn bộ"}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
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
              Thêm nhân viên
            </button>
          </div>
        )}
      </div>

      {/* Users Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nhân viên
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chức vụ
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Phòng ban
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Trạng thái
              </th>
              {isManager && (
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao tác
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr
                key={user.empId || user.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/users/${user.empId || user.id}`)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={
                        user.photo
                          ? `http://localhost:3000/uploads/${user.photo}`
                          : "/default-avatar.png"
                      }
                      alt={user.fullName}
                      onError={(e) => {
                        e.target.src = "/default-avatar.png";
                      }}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {user.fullName}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.position}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.department}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      user.status === "Hoạt động"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                {isManager && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Ngăn trigger onClick của row
                        handleResetEmployeePassword(
                          user.empId || user.id,
                          user.fullName
                        );
                      }}
                      className="text-orange-600 hover:text-orange-900 hover:bg-orange-50 px-2 py-1 rounded transition-colors"
                      title="Cấp lại mật khẩu"
                    >
                      🔐 Cấp lại MK
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            Không có dữ liệu người dùng
          </div>
        )}
      </div>

      {/* User Edit/Create Modal */}
      <UserEditModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
        }}
        onSave={handleSaveUser}
        user={null}
        title="Thêm nhân viên mới"
      />
    </div>
  );
}

export default UsersPage;
