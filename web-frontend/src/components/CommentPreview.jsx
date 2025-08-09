import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";

function CommentPreview({ postId, commentCount, onViewAll }) {
  const { data: commentsData, isLoading } = useQuery({
    queryKey: ["comments", postId, "preview"],
    queryFn: () => api.comments.getByPost(postId, { limit: 2, offset: 0 }),
    enabled: !!postId && commentCount > 0,
  });

  const comments = commentsData?.data?.data?.comments || [];

  if (commentCount === 0) {
    return (
      <div className="text-gray-500 text-sm italic p-3 border-t">
        Chưa có bình luận nào
      </div>
    );
  }

  return (
    <div className="border-t pt-3">
      {isLoading ? (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
        </div>
      ) : (
        <>
          {comments.map((comment) => (
            <div key={comment.id} className="flex space-x-3 mb-3 last:mb-0">
              <div className="flex-shrink-0">
                {comment.author?.photo ? (
                  <img
                    className="h-8 w-8 rounded-full object-cover"
                    src={`http://localhost:3000/uploads/${comment.author.photo}`}
                    alt={comment.author.fullName}
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "flex";
                    }}
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-xs font-medium text-gray-700">
                      {comment.author?.firstName?.charAt(0)}
                      {comment.author?.lastName?.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <p className="text-sm font-medium text-gray-900">
                    {comment.author?.fullName}
                  </p>
                  <span className="text-xs text-gray-500">
                    {new Date(comment.createdAt).toLocaleDateString("vi-VN", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mt-1">
                  {comment.content.length > 100
                    ? `${comment.content.substring(0, 100)}...`
                    : comment.content}
                </p>
              </div>
            </div>
          ))}

          {commentCount > 2 && (
            <button
              onClick={onViewAll}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium mt-2"
            >
              Xem tất cả {commentCount} bình luận
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default CommentPreview;
