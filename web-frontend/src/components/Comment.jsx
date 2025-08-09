import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { api } from "../services/api";

const Comment = ({ comment, onDelete }) => {
  const { currentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Check if user can delete comment
  const canDeleteComment = () => {
    if (!currentUser) return false;

    // Trưởng phòng có thể xóa all bình luận
    if (
      currentUser.role === "Manager" ||
      currentUser.employee?.chucVu === "Trưởng phòng"
    )
      return true;

    // Admin có thể xóa all bình luận
    if (currentUser.role === "Admin") return true;

    // Nhân viên chỉ được xóa bình luận của chính mình
    if (comment.author.id === currentUser.empID) return true;

    return false;
  };

  const deleteMutation = useMutation({
    mutationFn: () => api.comments.delete(comment.id),
    onSuccess: () => {
      toast.success("Đã xóa bình luận thành công");
      if (onDelete) onDelete(comment.id);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa bình luận thất bại");
    },
  });

  const handleDelete = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
      deleteMutation.mutate();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="border-b border-gray-200 py-4 last:border-b-0">
      <div className="flex items-start space-x-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <img
            className="h-8 w-8 rounded-full object-cover"
            src={
              comment.author.photo
                ? `http://localhost:3000/uploads/${comment.author.photo}`
                : "/default-avatar.png"
            }
            alt={comment.author.fullName}
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
        </div>

        {/* Comment content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">
              {comment.author.fullName}
            </h4>
            <span className="text-xs text-gray-500">
              {comment.author.department} - {comment.author.position}
            </span>
            <span className="text-xs text-gray-400">
              {formatDate(comment.commentDate)}
            </span>
          </div>

          <div className="mt-1 text-sm text-gray-700">{comment.content}</div>

          {comment.imageURL && (
            <div className="mt-2">
              <img
                src={`http://localhost:3000/uploads/${comment.imageURL}`}
                alt="Comment attachment"
                className="max-w-xs rounded-lg"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
          )}

          {/* Comment actions */}
          <div className="mt-2 flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <button className="hover:text-blue-600">
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
                    d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L9 7v13m-3-4l-3-1m12-6h-2m-6 0h-4"
                  />
                </svg>
              </button>
              <span>{comment.likes || 0}</span>
            </div>

            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <button className="hover:text-red-600">
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
                    d="M7 13l3 3 7-7"
                  />
                </svg>
              </button>
              <span>{comment.dislikes || 0}</span>
            </div>

            {canDeleteComment() && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="text-xs text-red-600 hover:text-red-800 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Comment;
