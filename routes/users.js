const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

module.exports = (db) => {
  const userController = new UserController(db);

  // Profile người dùng
  router.get('/thongtinnguoidung', isAuthenticated, (req, res) => userController.profile(req, res));
  router.post('/thongtinnguoidung/doimatkhau', isAuthenticated, (req, res) => userController.changePassword(req, res));

  // Quản lý người dùng (Admin)
  router.get('/quanly/nguoidung', isAdmin, (req, res) => userController.list(req, res));
  router.post('/quanly/nguoidung/xoa/:id', isAdmin, (req, res) => userController.delete(req, res));
  router.post('/quanly/nguoidung/capquyen/:id', isAdmin, (req, res) => userController.grantAdmin(req, res));
  router.get('/quanlythongke', isAdmin, (req, res) => userController.adminManageStats(req, res));

  return router;
};