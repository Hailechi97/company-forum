import { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { toast } from "react-hot-toast";

function NotificationsPage() {
  const { user } = useAuthStore();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
      // Sample notifications for display
      setNotifications([
        {
          id: 1,
          title: "Chào mừng đến với hệ thống Forum",
          message: "Bạn đã đăng nhập thành công vào hệ thống",
          type: "info",
          read: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }, 1000);
  }, []);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
    toast.success("Đã đánh dấu là đã đọc");
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })));
    toast.success("Đã đánh dấu tất cả là đã đọc");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Thông báo</h1>
          <p className="text-gray-600 mt-1">
            Bạn có {unreadCount} thông báo chưa đọc
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Đánh dấu tất cả đã đọc
          </button>
        )}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`bg-white shadow rounded-lg p-4 border-l-4 ${
              notification.read
                ? "border-gray-300 opacity-75"
                : "border-blue-500"
            }`}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {!notification.read && (
                    <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                  )}
                  <h3 className="text-sm font-medium text-gray-900">
                    {notification.title}
                  </h3>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      notification.type === "info"
                        ? "bg-blue-100 text-blue-800"
                        : notification.type === "success"
                        ? "bg-green-100 text-green-800"
                        : notification.type === "warning"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {notification.type}
                  </span>
                </div>
                <p className="text-sm text-gray-700 mb-2">
                  {notification.message}
                </p>
                <p className="text-xs text-gray-500">
                  {new Date(notification.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>

              {!notification.read && (
                <button
                  onClick={() => markAsRead(notification.id)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium ml-4"
                >
                  Đánh dấu đã đọc
                </button>
              )}
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="bg-white shadow rounded-lg p-8 text-center">
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
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Không có thông báo
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Chức năng thông báo sẽ được phát triển thêm khi bạn yêu cầu chi
              tiết.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default NotificationsPage;
