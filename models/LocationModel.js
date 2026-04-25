const BaseModel = require('./BaseModel');

class LocationModel extends BaseModel {
  constructor(db) {
    super(db, 'tramsac');
    this.tableMap = {
      tramsac: 'tramsac',
      ttsc: 'ttsc',
      baidoxe: 'baidoxe',
      ttdk: 'ttdk'
    };
  }

  async getAllByType(type) {
    const table = this.tableMap[type];
    if (!table) throw new Error('Loại địa điểm không hợp lệ');
    
    const fields = this.getFields(type);
    try {
      const result = await this.db.query(`SELECT gid, ${fields} FROM ${table} ORDER BY gid ASC`);
      return result.rows;
    } catch (error) {
      throw new Error(`Lỗi khi lấy danh sách ${type}: ${error.message}`);
    }
  }

  getFields(type) {
    const fieldMap = {
      tramsac: 'tentram AS name, diachi, lienhe, giomocua, giodongcua, nhacungcap, hinhtram, lat, lon',
      ttsc: 'tentt AS name, diachitt AS diachi, lienhett AS lienhe, giomott AS giomocua, giodongtt AS giodongcua, hinhanhtt AS hinhtram, lat, lon',
      baidoxe: 'tenbai AS name, diachi, lienhe, giomocua, giodongcua, hinhanhbai AS hinhtram, lat, lon',
      ttdk: 'tenttdk AS name, diachi, lienhe, giomocua, giodongcua, hinhanh AS hinhtram, lat, lon'
    };
    return fieldMap[type] || '*';
  }

  async create(type, data) {
    const table = this.tableMap[type];
    // Mapping logic dựa trên index.js
    let query = '';
    let values = [];

    if (type === 'tramsac') {
      query = `INSERT INTO tramsac (tentram, diachi, lienhe, giomocua, giodongcua, nhacungcap, hinhtram, lat, lon) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.nhacungcap, data.hinhanh, data.lat, data.lon];
    } else if (type === 'ttsc') {
      query = `INSERT INTO ttsc (tentt, diachitt, lienhett, giomott, giodongtt, hinhanhtt, lat, lon) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.hinhanh, data.lat, data.lon];
    } else if (type === 'baidoxe') {
      query = `INSERT INTO baidoxe (tenbai, diachi, lienhe, giomocua, giodongcua, hinhanhbai, lat, lon) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.hinhanh, data.lat, data.lon];
    } else if (type === 'ttdk') {
      query = `INSERT INTO ttdk (tenttdk, diachi, lienhe, giomocua, giodongcua, hinhanh, lat, lon) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.hinhanh, data.lat, data.lon];
    }

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async update(type, id, data) {
    const table = this.tableMap[type];
    if (!table) throw new Error('Loại địa điểm không hợp lệ');

    let query = '';
    let values = [];
    
    if (type === 'tramsac') {
      query = `UPDATE tramsac SET tentram=$1, diachi=$2, lienhe=$3, giomocua=$4, giodongcua=$5, nhacungcap=$6, hinhtram=$7, lat=$8, lon=$9 WHERE gid=$10 RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.nhacungcap, data.hinhanh, data.lat, data.lon, id];
    } else if (type === 'ttsc') {
      query = `UPDATE ttsc SET tentt=$1, diachitt=$2, lienhett=$3, giomott=$4, giodongtt=$5, hinhanhtt=$6, lat=$7, lon=$8 WHERE gid=$9 RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.hinhanh, data.lat, data.lon, id];
    } else if (type === 'baidoxe') {
      query = `UPDATE baidoxe SET tenbai=$1, diachi=$2, lienhe=$3, giomocua=$4, giodongcua=$5, hinhanhbai=$6, lat=$7, lon=$8 WHERE gid=$9 RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.hinhanh, data.lat, data.lon, id];
    } else if (type === 'ttdk') {
      query = `UPDATE ttdk SET tenttdk=$1, diachi=$2, lienhe=$3, giomocua=$4, giodongcua=$5, hinhanh=$6, lat=$7, lon=$8 WHERE gid=$9 RETURNING *`;
      values = [data.name, data.diachi, data.lienhe, data.giomocua, data.giodongcua, data.hinhanh, data.lat, data.lon, id];
    }

    const result = await this.db.query(query, values);
    return result.rows[0];
  }

  async deleteByType(type, id) {
    const table = this.tableMap[type];
    if (!table) throw new Error('Loại địa điểm không hợp lệ');
    const result = await this.db.query(`DELETE FROM ${table} WHERE gid = $1 RETURNING *`, [id]);
    return result.rowCount > 0;
  }

  async getServices(type, gid) {
    const table = `dichvu_${this.tableMap[type]}`;
    const idField = `${this.tableMap[type]}_gid`;
    const result = await this.db.query(`SELECT * FROM ${table} WHERE ${idField} = $1`, [gid]);
    return result.rows;
  }

  async addService(type, gid, tendichvu, gia) {
    const table = `dichvu_${this.tableMap[type]}`;
    const idField = `${this.tableMap[type]}_gid`;
    const query = `INSERT INTO ${table} (${idField}, tendichvu, gia) VALUES ($1, $2, $3) RETURNING *`;
    const result = await this.db.query(query, [gid, tendichvu, gia]);
    return result.rows[0];
  }
}

module.exports = LocationModel;