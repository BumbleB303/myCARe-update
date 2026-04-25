const VehicleModel = require('../models/VehicleModel');
const MaintenanceModel = require('../models/MaintenanceModel');
const UserModel = require('../models/UserModel');

class VehicleController {
  constructor(db) {
    this.vehicleModel = new VehicleModel(db);
    this.maintenanceModel = new MaintenanceModel(db);
    this.userModel = new UserModel(db);
  }

  // GET /phuongtien
  async list(req, res) {
    try {
      const vehicles = await this.vehicleModel.findByAccountId(req.session.user.id);
      res.render("phuongtien", { user: req.session.user, vehicles });
    } catch (err) {
      res.status(500).send("Lỗi tải danh sách phương tiện");
    }
  }

  // POST /phuongtien
  async create(req, res) {
    const { bien_so, hang_xe, dong_xe } = req.body;
    const hinh = req.file ? `/images/${req.file.filename}` : null;
    try {
      await this.vehicleModel.create({
        id_account: req.session.user.id,
        bien_so, 
        hang_xe, 
        dong_xe, 
        hinh_anh_xe: hinh
      });
      res.redirect('/phuongtien');
    } catch (err) {
      res.status(500).send('Lỗi thêm phương tiện');
    }
  }

  // POST /phuongtien/sua/:id
  async update(req, res) {
    const vid = req.params.id;
    const { bien_so, hang_xe, dong_xe } = req.body;
    try {
      const current = await this.vehicleModel.findById(vid);
      if (!current || current.id_account !== req.session.user.id) {
        return res.status(404).send('Không tìm thấy phương tiện');
      }
      
      const hinh = req.file ? `/images/${req.file.filename}` : current.hinh_anh_xe;
      await this.vehicleModel.update(vid, req.session.user.id, {
        bien_so, hang_xe, dong_xe, hinh_anh_xe: hinh
      });
      res.redirect(req.headers.referer.includes('quanly') ? req.headers.referer : '/phuongtien');
    } catch (err) {
      res.status(500).send('Lỗi cập nhật phương tiện');
    }
  }

  // POST /phuongtien/xoa/:id
  async delete(req, res) {
    const vid = req.params.id;
    const uid = req.params.uid || req.session.user.id; // Support admin delete via uid param
    try {
      await this.vehicleModel.deleteSecure(vid, uid);
      res.redirect(req.headers.referer);
    } catch (err) {
      res.status(500).send('Lỗi xóa phương tiện');
    }
  }

  // GET /thongtinphuongtien/:id
  async detail(req, res) {
    try {
      const vehicle = await this.vehicleModel.findById(req.params.id);
      if (!vehicle) return res.status(404).send('Không tìm thấy phương tiện');
      res.render('thongtinphuongtien', { vehicle });
    } catch (err) {
      res.status(500).send('Lỗi server');
    }
  }

  // --- API Bảo dưỡng & Đăng kiểm ---
  
  async getMaintenance(req, res) {
    try {
      const data = await this.maintenanceModel.findByVehicleId(req.params.vehicleId, req.session.user.id);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  async createMaintenance(req, res) {
    const { id_xe, loai, ngay_thuc_hien, chu_ky_thang, ghi_chu } = req.body;
    try {
      const start = new Date(ngay_thuc_hien);
      const end = new Date(start.setMonth(start.getMonth() + parseInt(chu_ky_thang)));
      const ngay_het_han = end.toISOString().split('T')[0];

      const today = new Date().toISOString().split('T')[0];
      const diffDays = Math.floor((Date.parse(ngay_het_han) - Date.parse(today)) / (1000*60*60*24));
      let trang_thai = diffDays < 0 ? 'het_han' : (diffDays <= 30 ? 'sap_het_han' : 'con_han');

      const newItem = await this.maintenanceModel.create({
        id_account: req.session.user.id,
        id_xe, loai, ngay_thuc_hien, chu_ky_thang, ngay_het_han, trang_thai, ghi_chu
      });
      res.status(201).json(newItem);
    } catch (err) {
      res.status(500).json({ error: 'Lỗi server' });
    }
  }

  // GET /quanlyphuongtien (Admin view)
  async adminList(req, res) {
    const uid = req.query.uid;
    if (!uid) return res.status(400).send('Thiếu ID người dùng');
    try {
      const owner = await this.userModel.findById(uid);
      const vehicles = await this.vehicleModel.findByAccountId(uid);
      res.render('quanlyphuongtien', { owner, vehicles, currentUser: req.session.user });
    } catch (err) {
      console.error(err);
      res.status(500).send('Lỗi server');
    }
  }
}

module.exports = VehicleController;