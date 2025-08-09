import { useState } from "react";
import { Link, useLocation } from "react-router-dom";

function Sidebar() {
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: "Home",
      href: "/",
      icon: "home",
    },
    {
      name: "Popular",
      href: "/popular",
      icon: "chart",
    },
    {
      name: "Featured",
      href: "/featured",
      icon: "star",
    },
    {
      name: "Categories",
      href: "/categories",
      icon: "tag",
    },
    {
      name: "Users",
      href: "/users",
      icon: "users",
    },
  ];

  const categories = [
    { id: 1, name: "General Discussion", color: "#3B82F6", postCount: 45 },
    { id: 2, name: "Announcements", color: "#EF4444", postCount: 12 },
    { id: 3, name: "Q&A", color: "#10B981", postCount: 28 },
    { id: 4, name: "Feature Requests", color: "#F59E0B", postCount: 19 },
    { id: 5, name: "Bug Reports", color: "#8B5CF6", postCount: 8 },
  ];

  const getIcon = (iconName, isActive = false) => {
    const className = `mr-3 h-5 w-5 ${
      isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"
    }`;

    switch (iconName) {
      case "home":
        return (
          <svg
            className={className}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isActive ? 0 : 2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
            />
          </svg>
        );
      case "chart":
        return (
          <svg
            className={className}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isActive ? 0 : 2}
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        );
      case "star":
        return (
          <svg
            className={className}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isActive ? 0 : 2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          </svg>
        );
      case "tag":
        return (
          <svg
            className={className}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isActive ? 0 : 2}
              d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
            />
          </svg>
        );
      case "users":
        return (
          <svg
            className={className}
            fill={isActive ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={isActive ? 0 : 2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
            />
          </svg>
        );
      case "plus":
        return (
          <svg
            className={className}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        isCollapsed ? "w-16" : "w-64"
      } bg-white shadow-lg border-r border-gray-200`}
    >
      <div className="flex flex-col h-full">
        {/* Navigation */}
        <nav className="flex-1 pt-6 pb-4 space-y-1 px-3">
          {/* Create Post Button */}
          <Link
            to="/create-post"
            className="group flex items-center w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            {getIcon("plus")}
            {!isCollapsed && "Create Post"}
          </Link>

          {/* Main Navigation */}
          <div className="mt-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {getIcon(item.icon, isActive)}
                  {!isCollapsed && item.name}
                </Link>
              );
            })}
          </div>

          {/* Categories Section */}
          {!isCollapsed && (
            <div className="mt-8">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Categories
              </h3>
              <div className="mt-3 space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/category/${category.id}`}
                    className="group flex items-center justify-between px-3 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  >
                    <div className="flex items-center">
                      <div
                        className="w-3 h-3 rounded-full mr-3"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="truncate">{category.name}</span>
                    </div>
                    <span className="ml-2 text-xs text-gray-400">
                      {category.postCount}
                    </span>
                  </Link>
                ))}

                <Link
                  to="/categories"
                  className="block px-3 py-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View all categories →
                </Link>
              </div>
            </div>
          )}
        </nav>

        {/* Collapse Toggle */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="flex items-center justify-center w-full px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                isCollapsed ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            {!isCollapsed && <span className="ml-2">Collapse</span>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
