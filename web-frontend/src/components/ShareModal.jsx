import { useState } from "react";
import toast from "react-hot-toast";

function ShareModal({ isOpen, onClose, post }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !post) return null;

  const postUrl = `${window.location.origin}/posts/${post.id}`;
  const shareText = `${post.title} - ${post.content.substring(0, 100)}${
    post.content.length > 100 ? "..." : ""
  }`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(postUrl);
      setCopied(true);
      toast.success("Đã sao chép đường dẫn!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Không thể sao chép đường dẫn");
    }
  };

  const shareOptions = [
    {
      name: "Facebook",
      icon: "📘",
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        postUrl
      )}`,
      color: "bg-blue-600 hover:bg-blue-700",
    },
    {
      name: "Zalo",
      icon: "💬",
      url: `https://zalo.me/share?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(shareText)}`,
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      name: "Messenger",
      icon: "💌",
      url: `https://www.facebook.com/dialog/send?link=${encodeURIComponent(
        postUrl
      )}&app_id=YOUR_APP_ID`,
      color: "bg-blue-700 hover:bg-blue-800",
    },
    {
      name: "Gmail",
      icon: "📧",
      url: `https://mail.google.com/mail/?view=cm&fs=1&to=&subject=${encodeURIComponent(
        post.title
      )}&body=${encodeURIComponent(shareText + "\\n\\n" + postUrl)}`,
      color: "bg-red-600 hover:bg-red-700",
    },
    {
      name: "WhatsApp",
      icon: "📱",
      url: `https://wa.me/?text=${encodeURIComponent(
        shareText + " " + postUrl
      )}`,
      color: "bg-green-600 hover:bg-green-700",
    },
    {
      name: "Telegram",
      icon: "✈️",
      url: `https://t.me/share/url?url=${encodeURIComponent(
        postUrl
      )}&text=${encodeURIComponent(shareText)}`,
      color: "bg-blue-400 hover:bg-blue-500",
    },
  ];

  const handleShare = (shareUrl) => {
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Chia sẻ bài viết
                </h3>

                {/* Post preview */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-sm text-gray-900 truncate">
                    {post.title}
                  </h4>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {post.content.substring(0, 80)}...
                  </p>
                </div>

                {/* Copy URL */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Đường dẫn bài viết
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      value={postUrl}
                      readOnly
                      className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-l-md shadow-sm text-sm bg-gray-50"
                    />
                    <button
                      onClick={copyToClipboard}
                      className={`px-4 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm font-medium ${
                        copied
                          ? "bg-green-100 text-green-700 border-green-300"
                          : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {copied ? "✓ Đã sao chép" : "Sao chép"}
                    </button>
                  </div>
                </div>

                {/* Share options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Chia sẻ đến
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {shareOptions.map((option) => (
                      <button
                        key={option.name}
                        onClick={() => handleShare(option.url)}
                        className={`flex items-center justify-center px-3 py-2 rounded-md text-white text-sm font-medium transition-colors ${option.color}`}
                      >
                        <span className="mr-2">{option.icon}</span>
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:w-auto sm:text-sm"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShareModal;
