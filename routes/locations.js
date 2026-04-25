const express = require('express');
const router = express.Router();
const LocationController = require('../controllers/LocationController');
const { isAdmin } = require('../middleware/auth');

module.exports = (db, upload) => { // Thêm 'upload' vào tham số
  const locationController = new LocationController(db);

  // API Lấy danh sách cho Map
  router.get('/api/diadiem/:type', (req, res) => locationController.getAllApi(req, res));
  
  // Quản lý địa điểm (Admin)
  router.get('/quanly/diadiem', isAdmin, (req, res) => res.render('quanlydiadiem'));
  router.get('/themdiadiem', isAdmin, (req, res) => res.render('themdiadiem'));
  router.get('/themdiadiem/:loai', isAdmin, (req, res) => res.render('formthem', { loai: req.params.loai }));
  router.post('/themdiadiem/:loai', isAdmin, upload.single('hinhanh'), (req, res) => locationController.create(req, res));
  router.put('/api/diadiem/:type/:id', isAdmin, upload.any(), (req, res) => locationController.update(req, res));
  router.delete('/api/diadiem/:type/:id', isAdmin, (req, res) => locationController.delete(req, res));

  // Dịch vụ
  router.get('/api/dichvu/:type/:gid', (req, res) => locationController.getServices(req, res));
  router.post('/api/dichvu/:type/:gid', isAdmin, (req, res) => locationController.addService(req, res));

  return router;
};