const BaseModel = require('./BaseModel');

class VehicleModel extends BaseModel {
  constructor(db) {
    super(db, 'phuong_tien');
  }

  async findByAccountId(accountId) {
    const result = await this.db.query(
      `SELECT * FROM phuong_tien WHERE id_account = $1 ORDER BY id ASC`,
      [accountId]
    );
    return result.rows;
  }

  async create(data) {
    const query = `INSERT INTO phuong_tien (id_account, bien_so, hang_xe, dong_xe, hinh_anh_xe) VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    const values = [data.id_account, data.bien_so, data.hang_xe, data.dong_xe, data.hinh_anh_xe];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(id, accountId, data) {
    const query = `UPDATE phuong_tien SET bien_so = $1, hang_xe = $2, dong_xe = $3, hinh_anh_xe = $4 WHERE id = $5 AND id_account = $6 RETURNING *`;
    const values = [data.bien_so, data.hang_xe, data.dong_xe, data.hinh_anh_xe, id, accountId];
    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async deleteSecure(id, accountId) {
    const result = await this.db.query(
      `DELETE FROM phuong_tien WHERE id = $1 AND id_account = $2 RETURNING *`,
      [id, accountId]
    );
    return result.rowCount > 0;
  }
}
module.exports = VehicleModel;