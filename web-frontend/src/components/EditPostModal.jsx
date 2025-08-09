import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { api } from "../services/api";
import toast from "react-hot-toast";

function EditPostModal({ isOpen, onClose, onSuccess, post }) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageURL: "",
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Initialize form data when post changes
  useEffect(() => {
    if (post) {
      setFormData({
        title: post.title || "",
        content: post.content || "",
        imageURL: post.imageURL || "",
      });
    }
  }, [post]);

  const updatePostMutation = useMutation({
    mutationFn: (data) => api.posts.update(post.id, data),
    onSuccess: () => {
      toast.success("Cập nhật bài viết thành công!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(
        error.response?.data?.message || "Cập nhật bài viết thất bại"
      );
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error("Vui lòng nhập đầy đủ tiêu đề và nội dung");
      return;
    }

    updatePostMutation.mutate({
      title: formData.title.trim(),
      content: formData.content.trim(),
      imageURL: formData.imageURL.trim() || null,
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ được chọn file hình ảnh");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File quá lớn. Tối đa 5MB");
      return;
    }

    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("http://localhost:3000/api/upload/image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setFormData((prev) => ({
          ...prev,
          imageURL: result.data.path,
        }));
        toast.success("Tải ảnh thành công!");
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Tải ảnh thất bại: " + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                    Chỉnh sửa bài viết
                  </h3>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label
                        htmlFor="title"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Tiêu đề *
                      </label>
                      <input
                        type="text"
                        name="title"
                        id="title"
                        required
                        value={formData.title}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nhập tiêu đề bài viết..."
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label
                        htmlFor="content"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Nội dung *
                      </label>
                      <textarea
                        name="content"
                        id="content"
                        rows={6}
                        required
                        value={formData.content}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Chia sẻ suy nghĩ của bạn..."
                      />
                    </div>

                    {/* Image URL or Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Hình ảnh (tùy chọn)
                      </label>

                      {/* Upload file option */}
                      <div className="mb-3">
                        <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                          <svg
                            className="w-5 h-5 mr-2"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          {uploadingImage ? "Đang tải..." : "Tải ảnh từ máy"}
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            disabled={uploadingImage}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Or manual URL input */}
                      <div className="text-center text-sm text-gray-500 mb-2">
                        hoặc
                      </div>
                      <input
                        type="text"
                        name="imageURL"
                        id="imageURL"
                        value={formData.imageURL}
                        onChange={handleChange}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Nhập URL hình ảnh..."
                      />
                    </div>

                    {/* Image preview */}
                    {formData.imageURL && (
                      <div>
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          Xem trước hình ảnh:
                        </p>
                        <img
                          src={
                            formData.imageURL.startsWith("/uploads/")
                              ? `http://localhost:3000${formData.imageURL}`
                              : formData.imageURL
                          }
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={updatePostMutation.isPending}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {updatePostMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditPostModal;
