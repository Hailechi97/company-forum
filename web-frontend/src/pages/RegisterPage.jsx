import { Link } from "react-router-dom";

function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Đăng ký tài khoản
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Chức năng đăng ký hiện tại chưa khả dụng.{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Quay lại đăng nhập
            </Link>
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Liên hệ quản trị viên
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Để được cấp tài khoản truy cập vào Company Forum, vui lòng liên hệ
            với bộ phận IT hoặc quản trị viên hệ thống.
          </p>
          <div className="space-y-2 text-sm">
            <p>
              <strong>Email:</strong> admin@company.com
            </p>
            <p>
              <strong>Điện thoại:</strong> 0900-000-000
            </p>
            <p>
              <strong>Phòng:</strong> IT Department
            </p>
          </div>
        </div>

        <div className="text-center">
          <Link
            to="/login"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
