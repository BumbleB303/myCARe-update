const UserModel = require('../models/UserModel');

class AuthController {
  constructor(db) {
    this.userModel = new UserModel(db);
  }

  renderLogin(req, res) {
    res.render("dangnhap");
  }

  async login(req, res) {
    const { username, password } = req.body;
    try {
      const user = await this.userModel.findByUsername(username);
      if (!user || user.matkhau !== password) {
        req.session.message = "Tên đăng nhập hoặc mật khẩu sai";
        return res.redirect('/dangnhap');
      }
      req.session.user = { id: user.id, tentaikhoan: user.tentaikhoan, role: user.role };
      res.redirect("/");
    } catch (err) {
      res.status(500).send("Có lỗi khi đăng nhập");
    }
  }

  renderRegister(req, res) {
    res.render("dangky");
  }

  async register(req, res) {
    const { tentaikhoan, matkhau, confirm_password, sdt, email } = req.body;
    if (matkhau !== confirm_password) {
      req.session.message = "Mật khẩu không khớp";
      return res.redirect('/dangky');
    }
    try {
      await this.userModel.createAccount(tentaikhoan, matkhau, email || null, sdt);
      req.session.message = "Đăng ký thành công. Vui lòng đăng nhập.";
      res.redirect("/dangnhap");
    } catch (err) {
      req.session.message = err.code === "23505" ? "Tên tài khoản hoặc SĐT đã tồn tại" : "Lỗi đăng ký";
      res.redirect('/dangky');
    }
  }

  logout(req, res) {
    req.session.destroy();
    res.redirect("/");
  }
}

module.exports = AuthController;