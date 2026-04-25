const BaseModel = require('./BaseModel');

class MaintenanceModel extends BaseModel {
  constructor(db) {
    super(db, 'bao_duong_dang_kiem');
  }

  async findByVehicleId(vehicleId, accountId) {
    const query = `
      SELECT id, id_account, id_xe, loai, ngay_thuc_hien, chu_ky_thang, ngay_het_han, trang_thai, ghi_chu
      FROM ${this.tableName}
      WHERE id_xe = $1 AND id_account = $2
      ORDER BY ngay_het_han DESC`;
    const result = await this.db.query(query, [vehicleId, accountId]);
    return result.rows;
  }

  async create(data) {
    const query = `
      INSERT INTO ${this.tableName} 
      (id_account, id_xe, loai, ngay_thuc_hien, chu_ky_thang, ngay_het_han, trang_thai, ghi_chu)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
      RETURNING *`;
    const values = [
      data.id_account, data.id_xe, data.loai, data.ngay_thuc_hien, 
      data.chu_ky_thang, data.ngay_het_han, data.trang_thai, data.ghi_chu
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async updateSecure(id, accountId, data) {
    const query = `
      UPDATE ${this.tableName} 
      SET loai = $1, ngay_thuc_hien = $2, chu_ky_thang = $3, ngay_het_han = $4, trang_thai = $5, ghi_chu = $6 
      WHERE id = $7 AND id_account = $8 
      RETURNING *`;
    const values = [
      data.loai, data.ngay_thuc_hien, data.chu_ky_thang, 
      data.ngay_het_han, data.trang_thai, data.ghi_chu, id, accountId
    ];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }
}

module.exports = MaintenanceModel;