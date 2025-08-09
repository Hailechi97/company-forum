import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";
import { api } from "../services/api";

const CommentForm = ({
  postId,
  onCommentAdded,
  onCancel,
  isInline = false,
  currentUser: propCurrentUser,
}) => {
  const [content, setContent] = useState("");
  const { user: storeUser, currentUser: storeCurrentUser } = useAuthStore();
  const queryClient = useQueryClient();

  // Use prop currentUser if provided, otherwise fall back to store currentUser or user
  const currentUser = propCurrentUser || storeCurrentUser || storeUser;

  const createCommentMutation = useMutation({
    mutationFn: (commentData) => api.comments.create(postId, commentData),
    onSuccess: (response) => {
      toast.success("Đã thêm bình luận thành công");
      setContent("");
      // Invalidate and refetch comments
      queryClient.invalidateQueries(["comments", postId]);
      if (onCommentAdded) onCommentAdded(response.data);
      // Close inline form if it's inline mode
      if (isInline && onCancel) onCancel();
    },
    onError: (error) => {
      const errorMessage =
        error.response?.data?.message || "Thêm bình luận thất bại";
      toast.error(errorMessage);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để bình luận");
      return;
    }

    if (!content.trim()) {
      toast.error("Vui lòng nhập nội dung bình luận");
      return;
    }

    createCommentMutation.mutate({
      content: content.trim(),
    });
  };

  if (!currentUser) {
    return (
      <div className="border rounded-lg p-4 bg-gray-50">
        <p className="text-gray-600 text-center">
          Vui lòng đăng nhập để bình luận
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-lg p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex items-start space-x-3">
          {/* User avatar */}
          <div className="flex-shrink-0">
            <img
              className="h-8 w-8 rounded-full object-cover"
              src={
                currentUser?.photo
                  ? `http://localhost:3000/uploads/${currentUser.photo}`
                  : "/default-avatar.png"
              }
              alt={currentUser?.fullName || "User"}
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
          </div>

          {/* Comment input */}
          <div className="flex-1">
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Viết bình luận..."
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
              rows={3}
              disabled={createCommentMutation.isPending}
            />

            <div className="mt-2 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                {content.length}/1000 ký tự
              </div>

              <div className="flex space-x-2">
                {isInline && onCancel && (
                  <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Hủy
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createCommentMutation.isPending || !content.trim()}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createCommentMutation.isPending
                    ? "Đang gửi..."
                    : "Gửi bình luận"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CommentForm;
