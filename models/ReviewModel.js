const BaseModel = require('./BaseModel');

class ReviewModel extends BaseModel {
  constructor(db) {
    super(db, 'danhgia_tramsac'); // Default table
    this.tableMap = {
      tramsac: 'danhgia_tramsac',
      ttsc: 'danhgia_ttsc',
      baidoxe: 'danhgia_baidoxe',
      ttdk: 'danhgia_ttdk'
    };
  }

  async getByLocation(type, gid) {
    const table = this.tableMap[type];
    if (!table) throw new Error('Loại địa điểm không hợp lệ');
    
    const gidField = `${type}_gid`;
    const query = `SELECT r.*, a.tentaikhoan FROM ${table} r JOIN account a ON r.account_id = a.id WHERE r.${gidField} = $1 ORDER BY r.ngaytao DESC`;
    const result = await this.db.query(query, [gid]);
    return result.rows;
  }

  async create(type, data) {
    const table = this.tableMap[type];
    if (!table) throw new Error('Loại địa điểm không hợp lệ');

    const gidField = `${type}_gid`;
    const query = `
      INSERT INTO ${table} (${gidField}, account_id, rating, binhluan, ngaytao)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING *`;
    const result = await this.db.query(query, [data.gid, data.account_id, data.rating, data.comment]);
    return result.rows[0];
  }
}

module.exports = ReviewModel;