const LocationModel = require('../models/LocationModel');

class LocationController {
  constructor(db) {
    this.locationModel = new LocationModel(db);
  }

  // API: GET /api/diadiem/:type
  async getAllApi(req, res) {
    try {
      const locations = await this.locationModel.getAllByType(req.params.type);
      res.json(locations);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  // POST /themdiadiem/:loai
  async create(req, res) {
    const { loai } = req.params;
    const { name, diachi, lienhe, giomocua, giodongcua, nhacungcap, lat, lon } = req.body;
    const hinhanh = req.file ? `/images/${req.file.filename}` : null;
    
    try {
      // Mapping 'trungtamsuachua' -> 'ttsc' etc if needed
      const typeMap = { 'trungtamsuachua': 'ttsc', 'trungtamdangkiem': 'ttdk', 'tramsac': 'tramsac', 'baidoxe': 'baidoxe' };
      const targetType = typeMap[loai] || loai;

      await this.locationModel.create(targetType, { name, diachi, lienhe, giomocua, giodongcua, nhacungcap, hinhanh, lat, lon });
      res.redirect('/quanly/diadiem');
    } catch (err) {
      res.status(500).send("Lỗi khi thêm địa điểm: " + err.message);
    }
  }

  // PUT /api/diadiem/:type/:id
  async update(req, res) {
    const { type, id } = req.params;
    const data = req.body;
    
    if (req.files && req.files.length > 0) {
      data.hinhanh = `/images/${req.files[0].filename}`;
    }

    try {
      const updated = await this.locationModel.update(type, id, data);
      res.json(updated);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // DELETE /api/diadiem/:type/:id
  async delete(req, res) {
    try {
      const success = await this.locationModel.deleteByType(req.params.type, req.params.id);
      if (!success) return res.status(404).json({ error: "Không tìm thấy địa điểm" });
      res.json({ message: "Xóa thành công" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  // API: GET /api/dichvu/:type/:gid
  async getServices(req, res) {
    try {
      const services = await this.locationModel.getServices(req.params.type, req.params.gid);
      res.json(services);
    } catch (err) {
      res.status(500).json({ error: "Lỗi truy vấn CSDL" });
    }
  }

  // API: POST /api/dichvu/:type/:gid
  async addService(req, res) {
    const { tendichvu, gia } = req.body;
    try {
      const newService = await this.locationModel.addService(req.params.type, req.params.gid, tendichvu, gia);
      res.status(201).json(newService);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi thêm dịch vụ" });
    }
  }
}

module.exports = LocationController;