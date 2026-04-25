const CostModel = require('../models/CostModel');

class CostController {
  constructor(db) {
    this.costModel = new CostModel(db);
  }

  // GET /thongkechiphi
  renderIndex(req, res) {
    res.render('thongkechiphi', { id_xe: req.query.id_xe });
  }

  // API: GET /api/chi_phi/:vehicleId
  async list(req, res) {
    try {
      const costs = await this.costModel.findByVehicleId(req.params.vehicleId, req.session.user.id);
      res.json(costs);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // API: POST /api/chi_phi
  async create(req, res) {
    const { id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu } = req.body;
    try {
      const newCost = await this.costModel.createCost({
        id_account: req.session.user.id,
        id_xe, id_danh_muc, 
        so_tien, ngay_phat_sinh, 
        ghi_chu
      });
      res.status(201).json(newCost);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // API: GET /api/chi_phi/thongke/:vehicleId
  async getStats(req, res) {
    const { from_date, to_date } = req.query;
    try {
      const report = await this.costModel.getStatistics(
        req.params.vehicleId, 
        req.session.user.id, 
        from_date, to_date
      );
      res.json(report);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // API: POST /api/thongke/luu
  async saveReport(req, res) {
    const { id_xe, ten_thongke, tu_ngay, den_ngay, du_lieu } = req.body;
    try {
      const result = await this.costModel.saveReport({
        id_account: req.session.user.id,
        id_xe, ten_thongke, 
        tu_ngay, den_ngay, 
        tong_chi_phi: du_lieu.tong_chi_phi || 0, 
        chi_tiet: du_lieu
      });
      res.json({ success: true, data: result });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Lỗi server' });
    }
  }

  // API: GET /api/thongke/:vehicleId
  async listSavedReports(req, res) {
    try {
      const reports = await this.costModel.findByVehicleIdSaved(req.params.vehicleId, req.session.user.id);
      res.json({ success: true, data: reports });
    } catch (err) {
      res.status(500).json({ success: false, error: 'Lỗi server' });
    }
  }
}

module.exports = CostController;