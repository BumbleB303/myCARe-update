const UserModel = require('../models/UserModel');
const VehicleModel = require('../models/VehicleModel');
const LocationModel = require('../models/LocationModel');

class AdminController {
  constructor(db) {
    this.userModel = new UserModel(db);
    this.vehicleModel = new VehicleModel(db);
    this.locationModel = new LocationModel(db);
  }

  /**
   * Hiển thị trang Dashboard Admin với các thông số thống kê tổng quan
   */
  async index(req, res) {
    try {
      const [users, vehicles, tramsac, baidoxe, ttsc, ttdk] = await Promise.all([
        this.userModel.findAll(),
        this.vehicleModel.findAll(),
        this.locationModel.getAllByType('tramsac'),
        this.locationModel.getAllByType('baidoxe'),
        this.locationModel.getAllByType('ttsc'),
        this.locationModel.getAllByType('ttdk')
      ]);

      res.render("quanly", {
        user: req.session.user,
        stats: {
          totalUsers: users.length,
          totalVehicles: vehicles.length,
          totalLocations: tramsac.length + baidoxe.length + ttsc.length + ttdk.length
        }
      });
    } catch (err) {
      console.error("Lỗi Admin Dashboard:", err);
      res.status(500).send("Lỗi khi tải trang quản trị: " + err.message);
    }
  }
}

module.exports = AdminController;