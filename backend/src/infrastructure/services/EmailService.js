// Infrastructure Service: Email Service
const nodemailer = require("nodemailer");

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER || "hello12102004@gmail.com",
        pass: process.env.EMAIL_PASS || "nzuu mfey pgxa xqbg",
      },
    });
  }

  async sendPasswordReset({
    to,
    firstName,
    lastName,
    tempPassword,
    department,
    resetBy,
  }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || "hello12102004@gmail.com",
      to: to,
      subject: "Đặt lại mật khẩu - Hệ thống quản lý nhân viên",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Đặt lại mật khẩu</h2>
          <p>Xin chào <strong>${firstName} ${lastName}</strong>,</p>
          <p>Mật khẩu của bạn đã được cấp lại bởi ${
            resetBy ? `<strong>${resetBy}</strong>` : "hệ thống"
          }.</p>
          <p>Mật khẩu mới của bạn là: <strong style="background-color: #f0f0f0; padding: 5px; border-radius: 3px;">${tempPassword}</strong></p>
          <p><strong style="color: #e74c3c;">Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập để bảo mật tài khoản.</p>
          <p>Phòng ban: <strong>${department}</strong></p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return { success: true, message: "Email đã được gửi thành công" };
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      throw new Error("Không thể gửi email đặt lại mật khẩu");
    }
  }

  async sendWelcomeEmail({
    to,
    firstName,
    lastName,
    tempPassword,
    department,
  }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || "hello12102004@gmail.com",
      to: to,
      subject: "Chào mừng đến với hệ thống quản lý nhân viên",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Chào mừng bạn!</h2>
          <p>Xin chào <strong>${firstName} ${lastName}</strong>,</p>
          <p>Chào mừng bạn đến với hệ thống quản lý nhân viên của công ty!</p>
          <p>Thông tin đăng nhập của bạn:</p>
          <ul>
            <li>Email: <strong>${to}</strong></li>
            <li>Mật khẩu tạm thời: <strong style="background-color: #f0f0f0; padding: 5px; border-radius: 3px;">${tempPassword}</strong></li>
            <li>Phòng ban: <strong>${department}</strong></li>
          </ul>
          <p><strong style="color: #e74c3c;">Lưu ý:</strong> Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        message: "Email chào mừng đã được gửi thành công",
      };
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      throw new Error("Không thể gửi email chào mừng");
    }
  }

  async sendNotificationEmail({ to, subject, content, type = "info" }) {
    const mailOptions = {
      from: process.env.EMAIL_USER || "hello12102004@gmail.com",
      to: to,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">${subject}</h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid ${
            type === "success"
              ? "#28a745"
              : type === "warning"
              ? "#ffc107"
              : type === "error"
              ? "#dc3545"
              : "#007bff"
          };">
            ${content}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #666; font-size: 12px;">
            Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
          </p>
        </div>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      return {
        success: true,
        message: "Email thông báo đã được gửi thành công",
      };
    } catch (error) {
      console.error("Lỗi gửi email:", error);
      throw new Error("Không thể gửi email thông báo");
    }
  }
}

module.exports = EmailService;
