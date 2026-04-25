const BaseModel = require('./BaseModel');

class UserModel extends BaseModel {
  constructor(db) {
    super(db, 'account');
  }

  async listAllForAdmin() {
    const query = `SELECT id, tentaikhoan, email, sdt, role FROM ${this.tableName} ORDER BY role DESC, id ASC`;
    const result = await this.db.query(query);
    return result.rows;
  }

  async findByUsername(username) {
    const result = await this.db.query(
      `SELECT * FROM ${this.tableName} WHERE tentaikhoan = $1`,
      [username]
    );
    return result.rows[0];
  }

  async createAccount(username, password, email, sdt) {
    const query = `
      INSERT INTO ${this.tableName}(tentaikhoan, matkhau, email, sdt, role)
      VALUES($1, $2, $3, $4, 'nguoidung') RETURNING id`;
    const result = await this.db.query(query, [username, password, email, sdt]);
    return result.rows[0];
  }

  async updatePassword(id, newPassword, currentPassword, phoneNumber) {
    const query = `
      UPDATE ${this.tableName} 
      SET matkhau = $1 
      WHERE id = $2 AND matkhau = $3 AND sdt = $4 
      RETURNING id`;
    const result = await this.db.query(query, [newPassword, id, currentPassword, phoneNumber]);
    return result.rows.length > 0;
  }

  async grantAdmin(userId, adminId, adminPassword) {
    // Kiểm tra mật khẩu admin xác nhận
    const adminCheck = await this.db.query(
      `SELECT id FROM ${this.tableName} WHERE id = $1 AND matkhau = $2 AND role = 'quantrivien'`,
      [adminId, adminPassword]
    );
    if (adminCheck.rows.length === 0) return { success: false, message: "Mật khẩu xác nhận không đúng" };

    const result = await this.db.query(
      `UPDATE ${this.tableName} SET role = 'quantrivien' WHERE id = $1 AND role = 'nguoidung' RETURNING id`,
      [userId]
    );
    return result.rows.length > 0 
      ? { success: true } 
      : { success: false, message: "Không tìm thấy người dùng hoặc đã là admin" };
  }

  async deleteWithDependencies(userId) {
    // Sử dụng Transaction để đảm bảo tính toàn vẹn dữ liệu khi xóa nhiều bảng
    try {
      await this.db.query('BEGIN');
      await this.db.query("DELETE FROM danhgia_tramsac WHERE account_id = $1", [userId]);
      await this.db.query("DELETE FROM danhgia_ttsc WHERE account_id = $1", [userId]);
      await this.db.query("DELETE FROM danhgia_baidoxe WHERE account_id = $1", [userId]);
      const result = await this.db.query(
        `DELETE FROM ${this.tableName} WHERE id = $1 AND role = 'nguoidung' RETURNING id`,
        [userId]
      );
      await this.db.query('COMMIT');
      return result.rowCount > 0;
    } catch (error) {
      await this.db.query('ROLLBACK');
      throw error;
    }
  }

  async getAdminStats(userId, vehicleId) {
    const query = `
      SELECT cp.id, a.tentaikhoan, pt.bien_so, dv.ten_dich_vu, cp.so_tien, cp.ngay_phat_sinh
      FROM chi_phi_dich_vu cp
      JOIN account a ON cp.id_account = a.id
      JOIN phuong_tien pt ON cp.id_xe = pt.id
      JOIN danh_muc_dich_vu dv ON cp.id_danh_muc = dv.id
      WHERE cp.id_account = $1 AND cp.id_xe = $2
      ORDER BY cp.ngay_phat_sinh DESC`;
    const result = await this.db.query(query, [userId, vehicleId]);
    return result.rows;
  }
}

module.exports = UserModel;