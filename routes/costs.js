const express = require('express');
const router = express.Router();
const CostController = require('../controllers/CostController');
const { isAuthenticated } = require('../middleware/auth');

module.exports = (db) => {
  const costController = new CostController(db);

  router.get('/thongkechiphi', isAuthenticated, (req, res) => costController.renderIndex(req, res));

  // API Chi phí
  router.get('/api/chi_phi/:vehicleId', isAuthenticated, (req, res) => costController.list(req, res));
  router.post('/api/chi_phi', isAuthenticated, (req, res) => costController.create(req, res));

  // API Thống kê chi phí
  router.get('/api/chi_phi/thongke/:vehicleId', isAuthenticated, (req, res) => costController.getStats(req, res));
  router.post('/api/thongke/luu', isAuthenticated, (req, res) => costController.saveReport(req, res));
  router.get('/api/thongke/:vehicleId', isAuthenticated, (req, res) => costController.listSavedReports(req, res));

  return router;
};