import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import toast from "react-hot-toast";
import ShareModal from "./ShareModal";

function PostActions({
  post,
  currentUser,
  onEdit,
  onShowComments,
  onToggleInlineComment,
}) {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [liked, setLiked] = useState(false); // TODO: Get from API
  const [disliked, setDisliked] = useState(false); // TODO: Get from API
  const queryClient = useQueryClient();

  // Check if user can delete post
  const canDelete = () => {
    if (!currentUser) return false;

    // Admin can delete any post
    if (currentUser.role === "Admin") return true;

    // Manager can delete any post
    if (currentUser.role === "Manager") return true;

    // Employee with CapBac A1 can delete any post
    if (currentUser.employee && currentUser.employee.capBac === "A1")
      return true;

    // Post owner can delete their own post
    if (post.author.id === currentUser.empId) return true;

    return false;
  };

  // Check if user can edit post (only own posts)
  const canEdit = () => {
    if (!currentUser) return false;
    return post.author.id === currentUser.empId;
  };

  const deleteMutation = useMutation({
    mutationFn: () => api.posts.delete(post.id),
    onSuccess: () => {
      toast.success("Xóa bài viết thành công!");
      queryClient.invalidateQueries(["posts"]);
      setShowDeleteConfirm(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Xóa bài viết thất bại");
      setShowDeleteConfirm(false);
    },
  });

  const likeMutation = useMutation({
    mutationFn: (isLike) => {
      return api.posts.like(post.id, { isLike });
    },
    onSuccess: (response, isLike) => {
      const data = response.data;

      // Show success message
      toast.success(data.message || "Thao tác thành công");

      // Update UI state based on action and mutation parameter
      if (data.action === "removed") {
        setLiked(false);
        setDisliked(false);
      } else if (data.action === "added" || data.action === "updated") {
        if (isLike) {
          setLiked(true);
          setDisliked(false);
        } else {
          setLiked(false);
          setDisliked(true);
        }
      }

      // Refresh posts data to get updated counts
      queryClient.invalidateQueries(["posts"]);
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Thao tác thất bại");
    },
  });

  const handleLike = () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }
    likeMutation.mutate(true);
  };

  const handleDislike = () => {
    if (!currentUser) {
      toast.error("Vui lòng đăng nhập để thực hiện hành động này");
      return;
    }
    likeMutation.mutate(false);
  };

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <>
      <div className="flex items-center justify-between border-t pt-3">
        {/* Left side - Like, Dislike, Comment, View counts */}
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLike}
            disabled={!currentUser || likeMutation.isPending}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              liked
                ? "bg-blue-100 text-blue-600"
                : "text-gray-600 hover:bg-gray-100"
            } ${!currentUser ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <svg
              className="w-4 h-4"
              fill={liked ? "currentColor" : "none"}
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
            <span>{post.likes || 0}</span>
          </button>

          <button
            onClick={handleDislike}
            disabled={!currentUser || likeMutation.isPending}
            className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors ${
              disliked
                ? "bg-red-100 text-red-600"
                : "text-gray-600 hover:bg-gray-100"
            } ${!currentUser ? "cursor-not-allowed opacity-50" : ""}`}
          >
            <svg
              className="w-4 h-4"
              fill={disliked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4L9 7m12 6h2m-6 0h4"
              />
            </svg>
            <span>{post.dislikes || 0}</span>
          </button>

          <button
            onClick={onShowComments}
            className="flex items-center space-x-1 text-gray-600 text-sm hover:text-indigo-600 transition-colors"
          >
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
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <span>{post.commentCount || 0}</span>
          </button>

          {/* Quick Comment Button */}
          {currentUser && onToggleInlineComment && (
            <button
              onClick={onToggleInlineComment}
              className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm text-gray-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
              title="Viết bình luận nhanh"
            >
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
                  d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                />
              </svg>
              <span>Viết</span>
            </button>
          )}

          <div className="flex items-center space-x-1 text-gray-600 text-sm">
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
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
            <span>{post.views || 0}</span>
          </div>
        </div>

        {/* Right side - Action buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowShareModal(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            title="Chia sẻ"
          >
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
                d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
              />
            </svg>
          </button>

          {canEdit() && (
            <button
              onClick={onEdit}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              title="Chỉnh sửa"
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
          )}

          {canDelete() && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors"
              title="Xóa"
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        post={post}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
              onClick={() => setShowDeleteConfirm(false)}
            ></div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Xóa bài viết
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Bạn có chắc chắn muốn xóa bài viết "{post.title}"? Hành
                        động này không thể hoàn tác.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleteMutation.isPending}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "Đang xóa..." : "Xóa"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default PostActions;
