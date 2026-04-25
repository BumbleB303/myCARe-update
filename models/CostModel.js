const BaseModel = require('./BaseModel');

class CostModel extends BaseModel {
  constructor(db) {
    super(db, 'chi_phi_dich_vu');
  }

  async findByVehicleId(vehicleId, accountId) {
    const query = `
      SELECT id, id_account, id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu
      FROM ${this.tableName}
      WHERE id_xe = $1 AND id_account = $2
      ORDER BY ngay_phat_sinh DESC`;
    const result = await this.db.query(query, [vehicleId, accountId]);
    return result.rows;
  }

  async createCost(data) {
    const query = `
      INSERT INTO ${this.tableName}(id_account, id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu)
      VALUES($1, $2, $3, $4, $5, $6)
      RETURNING *`;
    const values = [
      data.id_account, data.id_xe, data.id_danh_muc, 
      data.so_tien, data.ngay_phat_sinh, data.ghi_chu
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async getStatistics(vehicleId, accountId, fromDate, toDate) {
    const statsQuery = `
      SELECT id_danh_muc, SUM(so_tien) as so_tien
      FROM ${this.tableName}
      WHERE id_account = $1 AND id_xe = $2 AND ngay_phat_sinh BETWEEN $3 AND $4
      GROUP BY id_danh_muc
      ORDER BY so_tien DESC`;
    
    const totalQuery = `
      SELECT SUM(so_tien) as total
      FROM ${this.tableName}
      WHERE id_account = $1 AND id_xe = $2 AND ngay_phat_sinh BETWEEN $3 AND $4`;

    const [statsRes, totalRes] = await Promise.all([
      this.db.query(statsQuery, [accountId, vehicleId, fromDate, toDate]),
      this.db.query(totalQuery, [accountId, vehicleId, fromDate, toDate])
    ]);

    return {
      tong_chi_phi: parseInt(totalRes.rows[0].total) || 0,
      chi_tiet: statsRes.rows.map(r => ({ 
        id_danh_muc: r.id_danh_muc, 
        so_tien: parseInt(r.so_tien) 
      }))
    };
  }

  async saveReport(data) {
    const query = `
      INSERT INTO thongke_chi_phi (id_account, id_xe, ten_thongke, tu_ngay, den_ngay, tong_chi_phi, chi_tiet)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, ngay_tao`;
    const result = await this.db.query(query, [
      data.id_account, data.id_xe, data.ten_thongke, data.tu_ngay, data.den_ngay, data.tong_chi_phi, JSON.stringify(data.chi_tiet)
    ]);
    return result.rows[0];
  }

  async findByVehicleIdSaved(vehicleId, accountId) {
    const query = `
      SELECT * FROM thongke_chi_phi 
      WHERE id_account = $1 AND id_xe = $2 AND is_deleted = FALSE 
      ORDER BY ngay_tao DESC`;
    const result = await this.db.query(query, [accountId, vehicleId]);
    return result.rows;
  }
}

module.exports = CostModel;