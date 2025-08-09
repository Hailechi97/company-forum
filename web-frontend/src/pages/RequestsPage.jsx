import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { useAuthStore } from "../store/authStore";

const RequestsPage = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [viewType, setViewType] = useState("my_requests"); // "my_requests" or "for_approval"
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Determine if user can approve requests
  const canApprove = user?.role === "Manager" || user?.role === "Admin";

  // Fetch requests
  const {
    data: requestsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["requests", viewType, statusFilter, typeFilter],
    queryFn: () =>
      api.requests.getAll({
        viewType,
        status: statusFilter,
        requestType: typeFilter,
      }),
    select: (response) => response.data.data || response.data || [],
  });

  // Fetch statistics
  const { data: statsData } = useQuery({
    queryKey: ["request-statistics", viewType],
    queryFn: () => api.requests.getStatistics({ viewType }),
    select: (response) => response.data.data || response.data || [],
  });

  // Create request mutation
  const createRequestMutation = useMutation({
    mutationFn: (requestData) => api.requests.create(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["request-statistics"]);
      setShowCreateModal(false);
    },
  });

  // Approve request mutation
  const approveRequestMutation = useMutation({
    mutationFn: (requestId) => api.requests.approve(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["request-statistics"]);
    },
  });

  // Reject request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: ({ requestId, rejectionReason }) =>
      api.requests.reject(requestId, rejectionReason),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["request-statistics"]);
    },
  });

  // Delete request mutation
  const deleteRequestMutation = useMutation({
    mutationFn: (requestId) => api.requests.delete(requestId),
    onSuccess: () => {
      queryClient.invalidateQueries(["requests"]);
      queryClient.invalidateQueries(["request-statistics"]);
    },
  });

  const handleViewRequest = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleApproveRequest = async (requestId) => {
    if (window.confirm("Bạn có chắc chắn muốn duyệt đơn này?")) {
      approveRequestMutation.mutate(requestId);
    }
  };

  const handleRejectRequest = async (requestId) => {
    const rejectionReason = prompt("Nhập lý do từ chối:");
    if (rejectionReason) {
      rejectRequestMutation.mutate({ requestId, rejectionReason });
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn này?")) {
      deleteRequestMutation.mutate(requestId);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      "Chờ duyệt": "bg-yellow-100 text-yellow-800",
      "Đã duyệt": "bg-green-100 text-green-800",
      "Từ chối": "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          statusClasses[status] || "bg-gray-100 text-gray-800"
        }`}
      >
        {status}
      </span>
    );
  };

  const getRequestTypeIcon = (type) => {
    const icons = {
      "Nghỉ phép": "🏖️",
      "Công tác": "🧳",
      "Hỗ trợ": "🤝",
      "Tăng lương": "💰",
      Khác: "📋",
    };
    return icons[type] || "📋";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Lỗi: {error.message}</p>
        <button
          onClick={() => refetch()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Thử lại
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý đơn từ</h1>
        <p className="mt-2 text-gray-600">
          {viewType === "my_requests"
            ? "Quản lý các đơn từ của bạn"
            : "Duyệt đơn từ nhân viên"}
        </p>
      </div>

      {/* Stats Cards */}
      {statsData && statsData.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {statsData.map((stat) => (
            <div key={stat.Status} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.Status}
                  </p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {stat.count}
                  </p>
                </div>
                <div className="text-2xl">
                  {stat.Status === "Chờ duyệt" && "⏳"}
                  {stat.Status === "Đã duyệt" && "✅"}
                  {stat.Status === "Từ chối" && "❌"}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex flex-wrap gap-4">
          {/* View Type Toggle */}
          {canApprove && (
            <div className="flex rounded-md shadow-sm">
              <button
                onClick={() => setViewType("my_requests")}
                className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
                  viewType === "my_requests"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Đơn của tôi
              </button>
              <button
                onClick={() => setViewType("for_approval")}
                className={`px-4 py-2 text-sm font-medium rounded-r-md border-t border-b border-r ${
                  viewType === "for_approval"
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Cần duyệt
              </button>
            </div>
          )}

          {/* Filters */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="Chờ duyệt">Chờ duyệt</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Từ chối">Từ chối</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tất cả loại đơn</option>
            <option value="Nghỉ phép">Nghỉ phép</option>
            <option value="Công tác">Công tác</option>
            <option value="Hỗ trợ">Hỗ trợ</option>
            <option value="Tăng lương">Tăng lương</option>
            <option value="Khác">Khác</option>
          </select>
        </div>

        {/* Create Button */}
        {viewType === "my_requests" && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <svg
              className="w-4 h-4 mr-2"
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
            Tạo đơn mới
          </button>
        )}
      </div>

      {/* Requests List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {requestsData && requestsData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Loại đơn
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tiêu đề
                  </th>
                  {viewType === "for_approval" && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Người gửi
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ngày gửi
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Trạng thái
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {requestsData.map((request) => (
                  <tr key={request.requestId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-lg mr-2">
                          {getRequestTypeIcon(request.requestType)}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {request.requestType}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                        {request.title}
                      </div>
                    </td>
                    {viewType === "for_approval" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {request.employeeName}
                        </div>
                        <div className="text-sm text-gray-500">
                          {request.employeeDepartment}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(request.requestDate).toLocaleDateString(
                        "vi-VN"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleViewRequest(request)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Xem
                        </button>

                        {viewType === "for_approval" && request.isPending && (
                          <>
                            <button
                              onClick={() =>
                                handleApproveRequest(request.requestId)
                              }
                              className="text-green-600 hover:text-green-900"
                            >
                              Duyệt
                            </button>
                            <button
                              onClick={() =>
                                handleRejectRequest(request.requestId)
                              }
                              className="text-red-600 hover:text-red-900"
                            >
                              Từ chối
                            </button>
                          </>
                        )}

                        {viewType === "my_requests" && request.canDelete && (
                          <button
                            onClick={() =>
                              handleDeleteRequest(request.requestId)
                            }
                            className="text-red-600 hover:text-red-900"
                          >
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {viewType === "my_requests"
                ? "Chưa có đơn từ nào"
                : "Không có đơn cần duyệt"}
            </h3>
            <p className="text-gray-500">
              {viewType === "my_requests"
                ? "Hãy tạo đơn từ đầu tiên của bạn"
                : "Tất cả đơn từ đã được xử lý"}
            </p>
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreateModal && (
        <CreateRequestModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={(data) => createRequestMutation.mutate(data)}
          isLoading={createRequestMutation.isPending}
        />
      )}

      {/* Request Detail Modal */}
      {showDetailModal && selectedRequest && (
        <RequestDetailModal
          request={selectedRequest}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedRequest(null);
          }}
          onApprove={
            viewType === "for_approval" && selectedRequest.isPending
              ? () => handleApproveRequest(selectedRequest.requestId)
              : null
          }
          onReject={
            viewType === "for_approval" && selectedRequest.isPending
              ? () => handleRejectRequest(selectedRequest.requestId)
              : null
          }
        />
      )}
    </div>
  );
};

// Create Request Modal Component
const CreateRequestModal = ({ onClose, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    requestType: "",
    title: "",
    content: "",
    attachedFile: null,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tạo đơn từ mới
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Loại đơn *
              </label>
              <select
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Chọn loại đơn</option>
                <option value="Nghỉ phép">Nghỉ phép</option>
                <option value="Công tác">Công tác</option>
                <option value="Hỗ trợ">Hỗ trợ</option>
                <option value="Tăng lương">Tăng lương</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tiêu đề *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                maxLength={200}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập tiêu đề đơn từ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nội dung *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                maxLength={2000}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nhập nội dung chi tiết của đơn từ"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                File đính kèm (tùy chọn)
              </label>
              <input
                type="file"
                name="attachedFile"
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? "Đang gửi..." : "Tạo đơn"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Request Detail Modal Component
const RequestDetailModal = ({ request, onClose, onApprove, onReject }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-2/3 max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Chi tiết đơn từ
            </h3>
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

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Loại đơn
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {request.requestType}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Trạng thái
                </label>
                <div className="mt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      request.status === "Chờ duyệt"
                        ? "bg-yellow-100 text-yellow-800"
                        : request.status === "Đã duyệt"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {request.status}
                  </span>
                </div>
              </div>
            </div>

            {request.employeeName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Người gửi
                </label>
                <p className="mt-1 text-sm text-gray-900">
                  {request.employeeName} - {request.employeeDepartment}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tiêu đề
              </label>
              <p className="mt-1 text-sm text-gray-900">{request.title}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nội dung
              </label>
              <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                {request.content}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Ngày gửi
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {new Date(request.requestDate).toLocaleString("vi-VN")}
              </p>
            </div>

            {request.attachedFile && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  File đính kèm
                </label>
                <p className="mt-1 text-sm text-blue-600 hover:text-blue-800">
                  <a
                    href={request.attachedFile}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Xem file đính kèm
                  </a>
                </p>
              </div>
            )}

            {request.status !== "Chờ duyệt" && (
              <>
                {request.approverName && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Người duyệt
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {request.approverName}
                    </p>
                  </div>
                )}

                {request.approvedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Ngày duyệt
                    </label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(request.approvedDate).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}

                {request.rejectionReason && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Lý do từ chối
                    </label>
                    <p className="mt-1 text-sm text-red-600">
                      {request.rejectionReason}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex justify-end space-x-3 pt-6">
            {onApprove && (
              <button
                onClick={onApprove}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Duyệt đơn
              </button>
            )}
            {onReject && (
              <button
                onClick={onReject}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Từ chối
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestsPage;
