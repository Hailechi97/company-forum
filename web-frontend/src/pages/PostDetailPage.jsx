import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import CommentList from "../components/CommentList";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

function PostDetailPage() {
  const { id } = useParams();

  const {
    data: postData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["post", id],
    queryFn: () => api.posts.getById(id),
    enabled: !!id,
  });

  const post = postData?.data;

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <h3 className="text-sm font-medium text-red-800">Lỗi tải bài viết</h3>
        <p className="mt-2 text-sm text-red-700">
          Không thể tải bài viết. Vui lòng thử lại sau.
        </p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">
          Không tìm thấy bài viết
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Bài viết này có thể đã bị xóa hoặc không tồn tại.
        </p>
      </div>
    );
  }

  const timeAgo = formatDistanceToNow(new Date(post.postedDate), {
    addSuffix: true,
    locale: vi,
  });

  return (
    <div className="space-y-6">
      {/* Post Content */}
      <div className="bg-white rounded-lg shadow p-6">
        {/* Author Info */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="flex-shrink-0">
            {post.author.photo ? (
              <img
                className="h-12 w-12 rounded-full"
                src={`http://localhost:3000/uploads/${post.author.photo}`}
                alt={post.author.fullName}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-indigo-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {post.author.firstName?.charAt(0)}
                  {post.author.lastName?.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-lg font-medium text-gray-900">
              {post.author.fullName}
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span>{post.author.position}</span>
              <span>•</span>
              <span>{post.author.department}</span>
              <span>•</span>
              <span>{timeAgo}</span>
            </div>
          </div>
        </div>

        {/* Post Title and Content */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          <div className="prose max-w-none text-gray-700">
            {post.content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Post Image */}
        {post.imageURL && (
          <div className="mb-6">
            <img
              src={post.imageURL}
              alt="Post image"
              className="w-full max-w-2xl mx-auto rounded-lg"
            />
          </div>
        )}

        {/* Post Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t pt-4">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-1">
              <svg
                className="h-5 w-5 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V9a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"
                />
              </svg>
              <span>{post.likes} lượt thích</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg
                className="h-5 w-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.737 3h4.018a2 2 0 01.485.06L17 4m-7 10v2a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13v-3m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5"
                />
              </svg>
              <span>{post.dislikes} không thích</span>
            </div>

            <div className="flex items-center space-x-1">
              <svg
                className="h-5 w-5"
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
              <span>{post.views} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <CommentList postId={post.id} />
    </div>
  );
}

export default PostDetailPage;
