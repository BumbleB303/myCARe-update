const express = require("express");
const { Client } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const app = express();
const PORT = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));




app.use(session({
  secret: 'mycare_secret',
  resave: false,
  saveUninitialized: false
}));




app.use((req,res,next)=>{
  res.locals.user = req.session.user;
  next();
});

const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "dtbmyCARe",
  password: "123456",
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => console.error("Connection error", err.stack));
  




// trangchu
app.get("/", async (req, res) => {
  try {
    const tramsac = await client.query(`
      SELECT id, tentram AS name, diachi, lienhe, giomocua, giodongcua, hinhtram,
             ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng
      FROM tramsac
    `);

    const baidoxe = await client.query(`
      SELECT id, tenbai AS name, diachi, lienhe, hinhanhbai AS hinhtram,
             ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng
      FROM baidoxe
    `);

    const ttsc = await client.query(`
      SELECT id, tentt AS name, diachitt AS diachi, lienhett AS lienhe,
             giomott AS giomocua, giodongtt AS giodongcua, hinhanhtt AS hinhtram,
             ST_Y(geom::geometry) AS lat, ST_X(geom::geometry) AS lng
      FROM ttsc
    `);

    res.render("trangchu", {
      tramsac: tramsac.rows,
      baidoxe: baidoxe.rows,
      ttsc: ttsc.rows
    });
  } catch (err) {
    console.error(err);
    res.send("Có lỗi khi lấy dữ liệu từ DB");
  }
});




// dangnhap
app.get("/dangnhap", (req, res) => {
  res.render("dangnhap");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query(`
      SELECT * FROM account WHERE tentaikhoan=$1 AND matkhau=$2
    `, [username, password]);

    if(result.rows.length === 0){
      return res.send("Tên đăng nhập hoặc mật khẩu sai");
    }

    req.session.user = {
      id: result.rows[0].id,
      username: result.rows[0].tentaikhoan,
      role: result.rows[0].role
    };
    res.redirect("/");
  } catch(err){
    console.error(err);
    res.send("Có lỗi khi đăng nhập");
  }
});





// dangky
app.get("/dangky", (req, res) => {
  res.render("dangky");
});

app.post("/dangky", async (req, res) => {
  const { username, password, confirm_password, sdt } = req.body;

  if(password !== confirm_password){
    return res.send("Mật khẩu không khớp");
  }

  try {
    await client.query(`
      INSERT INTO account(tentaikhoan, matkhau, sdt, role)
      VALUES($1,$2,$3,'nguoidung')
    `,[username, password, sdt]);

    res.redirect("/dangnhap");
  } catch(err){
    if(err.code==='23505'){
      res.send("Số điện thoại này đã được đăng ký");
    } else {
      console.error(err);
      res.send("Có lỗi khi đăng ký tài khoản");
    }
  }
});






// dangxuat
app.get("/dangxuat",(req,res)=>{
  req.session.destroy();
  res.redirect("/");
});




// trangquanly
app.get("/quanly",(req,res)=>{
  if(!req.session.user || req.session.user.role!=='quantrivien'){
    return res.send("Bạn không có quyền truy cập trang này");
  }
  res.render("quanly");
});

app.listen(PORT, ()=>console.log(`Server chạy tại http://localhost:${PORT}`));




// quanlydiadiem
app.get('/quanly/diadiem', (req, res) => {
  if (!req.session.user || req.session.user.role !== 'quantrivien') {
    return res.redirect('/dangnhap');
  }
  res.render('quanlydiadiem', { user: req.session.user });
});



app.get('/api/diadiem/:type', async (req, res) => {
  const { type } = req.params;
  let table = "";

  if (type === "tramsac") table = "tramsac";
  else if (type === "trungtamsuachua") table = "ttsc";
  else if (type === "baidoxe") table = "baidoxe";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    const result = await client.query(`SELECT * FROM ${table} ORDER BY id ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi truy vấn CSDL" });
  }
});


// suadiadiem
app.put('/api/diadiem/:type/:id', async (req, res) => {
  const { type, id } = req.params;
  const data = req.body;

  if (!data || Object.keys(data).length === 0) {
    return res.status(400).json({ error: "Dữ liệu cập nhật không hợp lệ" });
  }

  let table = "";
  if (type === "tramsac") table = "tramsac";
  else if (type === "trungtamsuachua") table = "ttsc";
  else if (type === "baidoxe") table = "baidoxe";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    const keys = Object.keys(data).filter(k => k !== "id");
    const values = keys.map(k => data[k]);
    const setClause = keys.map((k, i) => `${k}=$${i + 1}`).join(", ");

    await client.query(
      `UPDATE ${table} SET ${setClause} WHERE id=$${keys.length + 1}`,
      [...values, id]
    );

    //travedanhsach
    const result = await client.query(`SELECT * FROM ${table} ORDER BY id ASC`);
    res.json({ message: "Cập nhật thành công", data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi cập nhật" });
  }
});


// xoadiadiem
app.delete('/api/diadiem/:type/:id', async (req, res) => {
  const { type, id } = req.params;

  let table = "";
  if (type === "tramsac") table = "tramsac";
  else if (type === "trungtamsuachua") table = "ttsc";
  else if (type === "baidoxe") table = "baidoxe";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    await client.query(`DELETE FROM ${table} WHERE id=$1`, [id]);

    const result = await client.query(`SELECT * FROM ${table} ORDER BY id ASC`);
    res.json({ message: "Xóa thành công", data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa" });
  }
});





// kiemtraquantrivien
function isAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === "quantrivien") {
    return next();
  }
  return res.redirect("/dangnhap");
}


const tableMap = {
  tramsac: "tramsac",
  trungtamsuachua: "ttsc", 
  baidoxe: "baidoxe"
};



// Chondiadiem
app.get("/themdiadiem", isAdmin, (req, res) => {
  res.render("themdiadiem");
});



// formthemdiadiem
app.get("/themdiadiem/:loai", isAdmin, async (req, res) => {
  try {
    const loai = req.params.loai;
    const table = tableMap[loai];
    if (!table) return res.status(400).send("Loại địa điểm không hợp lệ");

    const q = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `;
    const result = await client.query(q, [table]);

    
    const fields = result.rows.filter(
      r => !["geom", "gid"].includes(r.column_name)
    );

    res.render("formthem", { loai, tableName: table, fields });
  } catch (err) {
    console.error("GET /themdiadiem/:loai error", err);
    res.status(500).send("Lỗi khi tạo form");
  }
});


// Xulythemdiadiem
app.post("/themdiadiem/:loai", isAdmin, async (req, res) => {
  try {
    const loai = req.params.loai;
    const table = tableMap[loai];
    if (!table) return res.status(400).send("Loại địa điểm không hợp lệ");

    const lat = parseFloat(req.body.lat);
    const lon = parseFloat(req.body.lon);
    if (isNaN(lat) || isNaN(lon)) {
      return res.status(400).send("Tọa độ không hợp lệ");
    }

    
    const q = `
      SELECT column_name, data_type
      FROM information_schema.columns
      WHERE table_schema = 'public' AND table_name = $1
      ORDER BY ordinal_position
    `;
    const colsRes = await client.query(q, [table]);
    const allowedCols = colsRes.rows.filter(
      r => !["id", "geom", "gid"].includes(r.column_name)
    );

    const cols = [];
    const params = [];
    for (const c of allowedCols) {
      const colName = c.column_name;
      if (req.body[colName] !== undefined) {
        let val = req.body[colName];
        if (typeof val === "string") val = val.trim();
        if (c.data_type.includes("double")) {
          val = val === "" ? null : Number(val);
        }
        params.push(val === "" ? null : val);
        cols.push(colName);
      }
    }

    let sql, finalParams;
    if (cols.length > 0) {
      const placeholders = cols.map((_, i) => `$${i + 1}`).join(", ");
      finalParams = [...params, lon, lat];
      const lonP = `$${cols.length + 1}`;
      const latP = `$${cols.length + 2}`;
      sql = `INSERT INTO ${table} (${cols.join(", ")}, geom)
             VALUES (${placeholders}, ST_SetSRID(ST_MakePoint(${lonP}, ${latP}), 4326))`;
    } else {
      sql = `INSERT INTO ${table} (geom) VALUES (ST_SetSRID(ST_MakePoint($1,$2),4326))`;
      finalParams = [lon, lat];
    }

    await client.query(sql, finalParams);
    res.redirect("/quanly/diadiem");
  } catch (err) {
    console.error("POST /themdiadiem/:loai error", err);
    res.status(500).send("Lỗi khi lưu địa điểm: " + err.message);
  }
});
