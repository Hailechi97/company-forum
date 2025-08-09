import { useState } from "react";
import PostActions from "./PostActions";
import CommentPreview from "./CommentPreview";
import PostModal from "./PostModal";
import CommentForm from "./CommentForm";

function PostCard({ post, currentUser, onEdit }) {
  const [showPostModal, setShowPostModal] = useState(false);
  const [showInlineCommentForm, setShowInlineCommentForm] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewAllComments = () => {
    setShowPostModal(true);
  };

  const handleToggleInlineComment = () => {
    setShowInlineCommentForm(!showInlineCommentForm);
  };

  const handleCommentAdded = () => {
    setShowInlineCommentForm(false);
    // Optionally refresh the post data here
  };

  return (
    <article className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
      <div className="p-4 sm:p-6">
        {/* Header - Author info */}
        <div className="flex items-start space-x-3 mb-4">
          <div className="flex-shrink-0">
            {post.author?.photo ? (
              <img
                className="h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover"
                src={`http://localhost:3000/uploads/${post.author.photo}`}
                alt={post.author.fullName}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {post.author?.firstName?.charAt(0)}
                  {post.author?.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <p className="text-sm sm:text-base font-medium text-gray-900 truncate">
                  {post.author?.fullName}
                </p>
                <p className="text-xs sm:text-sm text-gray-500">
                  {post.author?.department} • {post.author?.position}
                </p>
              </div>
              <div className="mt-1 sm:mt-0 flex-shrink-0">
                <time className="text-xs sm:text-sm text-gray-500">
                  {formatDate(post.postedDate)}
                </time>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mb-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3 leading-tight">
            {post.title}
          </h2>
          <div className="text-gray-700 whitespace-pre-wrap text-sm sm:text-base leading-relaxed">
            {post.content.length > 300 ? (
              <>
                {post.content.substring(0, 300)}...
                <button className="text-blue-600 hover:text-blue-500 font-medium ml-1 text-sm">
                  Xem thêm
                </button>
              </>
            ) : (
              post.content
            )}
          </div>
        </div>

        {/* Image */}
        {post.imageURL && (
          <div className="mb-4">
            <img
              src={
                post.imageURL.startsWith("/uploads/")
                  ? `http://localhost:3000${post.imageURL}`
                  : post.imageURL
              }
              alt="Post attachment"
              className="w-full h-48 sm:h-64 md:h-72 object-cover rounded-lg border border-gray-200"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          </div>
        )}

        {/* Actions */}
        <PostActions
          post={post}
          currentUser={currentUser}
          onEdit={() => onEdit(post)}
          onShowComments={handleViewAllComments}
          onToggleInlineComment={handleToggleInlineComment}
        />

        {/* Inline Comment Form */}
        {showInlineCommentForm && currentUser && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Thêm bình luận nhanh
            </h4>
            <CommentForm
              postId={post.id}
              onCommentAdded={handleCommentAdded}
              onCancel={() => setShowInlineCommentForm(false)}
              isInline={true}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Comment Preview */}
        <CommentPreview
          postId={post.id}
          commentCount={post.commentCount || 0}
          onViewAll={handleViewAllComments}
        />
      </div>

      {/* Post Modal for viewing all comments */}
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        post={post}
        currentUser={currentUser}
      />
    </article>
  );
}

export default PostCard;
