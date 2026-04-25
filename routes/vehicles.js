const express = require('express');
const router = express.Router();
const VehicleController = require('../controllers/VehicleController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

module.exports = (db, upload) => {
  const vehicleController = new VehicleController(db);

  // Quản lý phương tiện cá nhân
  router.get('/phuongtien', isAuthenticated, (req, res) => vehicleController.list(req, res));
  router.post('/phuongtien', isAuthenticated, upload.single('hinh_anh_xe'), (req, res) => vehicleController.create(req, res));
  router.post('/phuongtien/sua/:id', isAuthenticated, upload.single('hinh_anh_xe'), (req, res) => vehicleController.update(req, res));
  router.post('/phuongtien/xoa/:id', isAuthenticated, (req, res) => vehicleController.delete(req, res));
  router.get('/thongtinphuongtien/:id', isAuthenticated, (req, res) => vehicleController.detail(req, res));

  // API Bảo dưỡng & Đăng kiểm
  router.get('/api/bao_duong/:vehicleId', isAuthenticated, (req, res) => vehicleController.getMaintenance(req, res));
  router.post('/api/bao_duong', isAuthenticated, (req, res) => vehicleController.createMaintenance(req, res));

  // Admin: Xem phương tiện của người dùng khác
  router.get('/quanlyphuongtien', isAdmin, (req, res) => vehicleController.adminList(req, res));

  return router;
};