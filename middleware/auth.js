/**
 * Middleware kiểm tra người dùng đã đăng nhập chưa
 */
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    return next();
  }
  res.redirect('/dangnhap');
};

/**
 * Middleware kiểm tra quyền quản trị viên
 */
const isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "quantrivien") {
    if (!req.session.user) {
      return res.redirect('/dangnhap');
    }
    return res.status(403).render('loi', {
      message: 'Bạn không có quyền truy cập trang này',
      error: {
        status: 403,
        stack: 'Trang này chỉ dành cho quản trị viên'
      }
    });
  }
  next();
};

module.exports = {
  isAuthenticated,
  isAdmin
};
