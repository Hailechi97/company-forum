import { useState } from "react";
import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Header from "./Header";
import Sidebar from "./Sidebar";

function Layout() {
  const { isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header onToggleSidebar={toggleSidebar} />

      <div className="flex">
        {/* Sidebar chỉ hiển thị trên mobile khi toggle */}
        <div className="lg:hidden">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        </div>

        {/* Sidebar cố định cho desktop */}
        <div className="hidden lg:flex lg:flex-shrink-0">
          <Sidebar isOpen={true} onClose={() => {}} isDesktop={true} />
        </div>

        <main className="flex-1 overflow-auto min-h-screen pt-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-4xl lg:max-w-5xl xl:max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Layout;
