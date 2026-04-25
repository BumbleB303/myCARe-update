const BaseModel = require('./BaseModel');

class NoteModel extends BaseModel {
  constructor(db) {
    super(db, 'luu_y_ca_nhan');
  }

  async findByAccountId(accountId) {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE id_account = $1 ORDER BY ngay_tao DESC`,
      [accountId]
    );
    return result.rows;
  }

  async createNote(accountId, tieu_de, noi_dung) {
    const result = await this.db.query(
      `INSERT INTO ${this.tableName} (id_account, tieu_de, noi_dung, ngay_tao) VALUES ($1, $2, $3, NOW()) RETURNING *`,
      [accountId, tieu_de, noi_dung]
    );
    return result.rows[0];
  }

  async updateNote(id, accountId, tieu_de, noi_dung) {
    const result = await this.db.query(
      `UPDATE ${this.tableName} SET tieu_de = $1, noi_dung = $2 WHERE id = $3 AND id_account = $4 RETURNING *`,
      [tieu_de, noi_dung, id, accountId]
    );
    return result.rows[0];
  }
}

module.exports = NoteModel;