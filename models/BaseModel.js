class BaseModel {
  constructor(db, tableName) {
    this.db = db;
    this.tableName = tableName;
  }

  async findAll(orderBy = 'id ASC') {
    try {
      const result = await this.db.query(`SELECT * FROM ${this.tableName} ORDER BY ${orderBy}`);
      return result.rows;
    } catch (error) {
      throw new Error(`Lỗi khi lấy dữ liệu từ ${this.tableName}: ${error.message}`);
    }
  }

  async findById(id, idColumn = 'id') {
    try {
      const result = await this.db.query(
        `SELECT * FROM ${this.tableName} WHERE ${idColumn} = $1`,
        [id]
      );
      return result.rows[0] || null;
    } catch (error) {
      throw new Error(`Lỗi khi tìm ${this.tableName} với ID ${id}: ${error.message}`);
    }
  }

  async delete(id, idColumn = 'id') {
    try {
      const result = await this.db.query(
        `DELETE FROM ${this.tableName} WHERE ${idColumn} = $1 RETURNING *`,
        [id]
      );
      return result.rows[0];
    } catch (error) {
      throw new Error(`Lỗi khi xóa từ ${this.tableName}: ${error.message}`);
    }
  }

  async exists(id, idColumn = 'id') {
    try {
      const result = await this.db.query(
        `SELECT 1 FROM ${this.tableName} WHERE ${idColumn} = $1`,
        [id]
      );
      return result.rows.length > 0;
    } catch (error) {
      return false;
    }
  }
}

module.exports = BaseModel;