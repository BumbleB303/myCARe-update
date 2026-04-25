const UserModel = require('../models/UserModel');

class UserController {
  constructor(db) {
    this.userModel = new UserModel(db);
  }

  // GET /quanly/nguoidung
  async list(req, res) {
    try {
      const users = await this.userModel.listAllForAdmin();
      res.render("quanlynguoidung", { 
        users: users,
        currentUser: req.session.user 
      });
    } catch (err) {
      res.status(500).send("Lỗi khi tải danh sách người dùng");
    }
  }

  // GET /thongtinnguoidung
  async profile(req, res) {
    try {
      const user = await this.userModel.findById(req.session.user.id);
      if (!user) return res.status(404).send("Không tìm thấy người dùng");
      res.render("thongtinnguoidung", { user });
    } catch (err) {
      res.status(500).send("Lỗi tải thông tin cá nhân");
    }
  }

  // POST /thongtinnguoidung/doimatkhau
  async changePassword(req, res) {
    const { currentPassword, newPassword, phoneNumber } = req.body;
    try {
      const success = await this.userModel.updatePassword(
        req.session.user.id, 
        newPassword, 
        currentPassword, 
        phoneNumber
      );
      if (!success) return res.json({ success: false, error: "Thông tin không khớp" });
      res.json({ success: true, message: "Đổi mật khẩu thành công" });
    } catch (err) {
      res.status(500).json({ success: false, error: "Lỗi server" });
    }
  }

  // POST /quanly/nguoidung/xoa/:id
  async delete(req, res) {
    const userId = req.params.id;
    try {
      await this.userModel.deleteWithDependencies(userId);
      res.redirect("/quanly/nguoidung");
    } catch (err) {
      res.status(500).send("Không thể xóa người dùng");
    }
  }

  // POST /quanly/nguoidung/capquyen/:id
  async grantAdmin(req, res) {
    const userId = req.params.id;
    const { password } = req.body;
    try {
      const result = await this.userModel.grantAdmin(
        userId, 
        req.session.user.id, 
        password
      );
      if (!result.success) return res.json(result);
      
      res.json({ success: true, message: "Cấp quyền thành công" });
    } catch (err) {
      res.status(500).json({ success: false, message: "Lỗi server" });
    }
  }

  // GET /quanlythongke (Admin)
  async adminManageStats(req, res) {
    const { id_nguoidung, id_xe } = req.query;
    try {
      const stats = await this.userModel.getAdminStats(id_nguoidung, id_xe);
      res.render('quanlythongke', { chiPhiList: stats, currentUser: req.session.user });
    } catch (err) {
      res.status(500).send('Lỗi server');
    }
  }
}

module.exports = UserController;
