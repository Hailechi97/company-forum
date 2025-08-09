import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import CommentForm from "./CommentForm";
import CommentList from "./CommentList";

function PostModal({ isOpen, onClose, post, currentUser }) {
  const [showCommentForm, setShowCommentForm] = useState(false);

  const {
    data: commentsData,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["comments", post?.id],
    queryFn: () => api.comments.getByPost(post.id),
    enabled: !!post?.id && isOpen,
  });

  const comments = commentsData?.data?.data?.comments || [];

  console.log("PostModal Debug:", {
    postId: post?.id,
    isOpen,
    commentsData,
    comments,
    isLoading,
    error,
  });

  const handleCommentAdded = () => {
    setShowCommentForm(false);
    refetch();
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal content */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="bg-white px-6 py-4 border-b border-gray-200 sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  {post.author?.photo ? (
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={`http://localhost:3000/uploads/${post.author.photo}`}
                      alt={post.author.fullName}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {post.author?.firstName?.charAt(0)}
                        {post.author?.lastName?.charAt(0)}
                      </span>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {post.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {post.author?.fullName} •{" "}
                    {new Date(post.postedDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors"
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

          {/* Post content */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="text-gray-700 whitespace-pre-wrap mb-4">
              {post.content}
            </div>
            {post.imageURL && (
              <div className="mb-4">
                <img
                  src={
                    post.imageURL.startsWith("/uploads/")
                      ? `http://localhost:3000${post.imageURL}`
                      : post.imageURL
                  }
                  alt="Post attachment"
                  className="w-full max-h-96 object-cover rounded-lg border"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            {/* Post stats */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center space-x-1">
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
                <span>{post.likes || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
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
                    d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L15 17V4m-3 4L9 7m12 6h2m-6 0h4"
                  />
                </svg>
                <span>{post.dislikes || 0}</span>
              </span>
              <span className="flex items-center space-x-1">
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
                <span>{post.commentCount || 0} bình luận</span>
              </span>
            </div>
          </div>

          {/* Comments section */}
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">
                Bình luận ({comments.length})
              </h4>
              {currentUser && (
                <button
                  onClick={() => setShowCommentForm(!showCommentForm)}
                  className="px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-500 border border-indigo-600 hover:border-indigo-500 rounded-md transition-colors"
                >
                  {showCommentForm ? "Hủy" : "Thêm bình luận"}
                </button>
              )}
            </div>

            {/* Comment form */}
            {showCommentForm && currentUser && (
              <div className="mb-6">
                <CommentForm
                  postId={post.id}
                  onCommentAdded={handleCommentAdded}
                  onCancel={() => setShowCommentForm(false)}
                  currentUser={currentUser}
                />
              </div>
            )}

            {/* Comments list */}
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8">
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
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Chưa có bình luận
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Hãy là người đầu tiên bình luận về bài viết này.
                </p>
              </div>
            ) : (
              <CommentList
                comments={comments}
                currentUser={currentUser}
                onCommentDeleted={refetch}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default PostModal;
