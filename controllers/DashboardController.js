const LocationModel = require('../models/LocationModel');

class DashboardController {
    constructor(db) {
        this.locationModel = new LocationModel(db);
    }

    /**
     * Xử lý hiển thị trang chủ (Dashboard người dùng)
     */
    async renderHome(req, res) {
        try {
            // Lấy dữ liệu tổng hợp từ các loại địa điểm để hiển thị trên bản đồ/danh sách
            const [tramsac, baidoxe, ttsc, ttdk] = await Promise.all([
                this.locationModel.getAllByType('tramsac'),
                this.locationModel.getAllByType('baidoxe'),
                this.locationModel.getAllByType('ttsc'),
                this.locationModel.getAllByType('ttdk')
            ]);

            res.render("trangchu", { 
                tramsac, baidoxe, ttsc, ttdk, 
                user: req.session.user 
            });
        } catch (err) {
            res.status(500).send("Có lỗi khi lấy dữ liệu tổng quan: " + err.message);
        }
    }
}

module.exports = DashboardController;