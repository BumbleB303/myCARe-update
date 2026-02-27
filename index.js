const express = require("express");
const { Client } = require("pg");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const multer = require("multer");
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session({
  secret: "mycare_secret",
  resave: false,
  saveUninitialized: false,
}));

app.use((req, res, next) => {
  // Make current user and any one-time message available to views
  res.locals.user = req.session.user;
  res.locals.message = req.session.message || null;
  // clear message after exposing it to locals so it won't persist
  delete req.session.message;
  next();
});

// Database connection
const client = new Client({
  user: "postgres",
  host: "localhost",
  database: "dtbmyCARe",
  password: "123456",
});

client.connect()
  .then(() => console.log("Connected to PostgreSQL"))
  .catch((err) => {
    console.error("Connection error", err.stack);
    process.exit(1);
  });

// Middleware kiểm tra quyền admin
function isAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "quantrivien") {
    // Chuyển hướng về trang đăng nhập nếu chưa đăng nhập
    if (!req.session.user) {
      return res.redirect('/dangnhap');
    }
    // Hiện thông báo lỗi nếu không có quyền
    return res.status(403).render('loi', {
      message: 'Bạn không có quyền truy cập trang này',
      error: {
        status: 403,
        stack: 'Trang này chỉ dành cho quản trị viên'
      }
    });
  }
  next();
}

// Configure multer for file uploads
const upload = multer({
  storage: multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.join(__dirname, "public/images"));
    },
    filename: function (req, file, cb) {
      cb(null, Date.now() + "-" + file.originalname);
    },
  }),
  fileFilter: function (req, file, cb) {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// Trang chủ
app.get("/", async (req, res) => {
  try {
    const tramsac = await client.query(`
      SELECT gid, tentram AS name, diachi, lienhe, giomocua, giodongcua, nhacungcap, hinhtram, lat, lon
      FROM tramsac
    `);
    const baidoxe = await client.query(`
      SELECT gid, tenbai AS name, diachi, lienhe, giomocua, giodongcua, hinhanhbai AS hinhtram, lat, lon
      FROM baidoxe
    `);
    const ttsc = await client.query(`
      SELECT gid, tentt AS name, diachitt AS diachi, lienhett AS lienhe, giomott AS giomocua, giodongtt AS giodongcua, hinhanhtt AS hinhtram, lat, lon
      FROM ttsc
    `);
    const ttdk = await client.query(`
      SELECT gid, tenttdk AS name, diachi, lienhe, giomocua, giodongcua, hinhanh, lat, lon
      FROM ttdk
    `);
    res.render("trangchu", {
      tramsac: tramsac.rows,
      baidoxe: baidoxe.rows,
      ttsc: ttsc.rows,
      ttdk: ttdk.rows,
      user: req.session.user,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi khi lấy dữ liệu từ DB");
  }
});

// Đăng nhập 
app.get("/dangnhap", (req, res) => {
  res.render("dangnhap");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await client.query(
      `SELECT * FROM account WHERE tentaikhoan=$1 AND matkhau=$2`,
      [username, password]
    );
    if (result.rows.length === 0) {
      // thông báo lỗi đăng nhập
      req.session.message = "Tên đăng nhập hoặc mật khẩu sai";
      return res.redirect('/dangnhap');
    }
    req.session.user = {
      id: result.rows[0].id,
      tentaikhoan: result.rows[0].tentaikhoan,
      role: result.rows[0].role,
    };
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi khi đăng nhập");
  }
});

// Đăng ký
app.get("/dangky", (req, res) => {
  res.render("dangky");
});

app.post("/dangky", async (req, res) => {
  const {
    tentaikhoan: tb_tentaikhoan,
    matkhau: tb_matkhau,
    username,
    password,
    confirm_password,
    sdt,
    email,
  } = req.body;

  // Sử dụng tên tài khoản và mật khẩu từ form nếu có, nếu không thì dùng từ trường ẩn
  const tentaikhoan = username || tb_tentaikhoan;
  const matkhau = password || tb_matkhau;
  const userEmail = email || null;

  if (matkhau !== confirm_password) {
    req.session.message = "Mật khẩu không khớp";
    return res.redirect('/dangky');
  }

  try {
    // Chèn tài khoản mới với vai trò 'nguoidung'
    await client.query(
      `INSERT INTO account(tentaikhoan, matkhau, email, sdt, role) VALUES($1, $2, $3, $4, 'nguoidung')`,
      [tentaikhoan, matkhau, userEmail, sdt]
    );
    req.session.message = "Đăng ký thành công. Vui lòng đăng nhập.";
    res.redirect("/dangnhap");
  } catch (err) {
    if (err.code === "23505") {
      req.session.message = "Số điện thoại hoặc tên tài khoản đã được đăng ký";
      return res.redirect('/dangky');
    } else {
      console.error(err);
      req.session.message = "Có lỗi khi đăng ký tài khoản";
      return res.redirect('/dangky');
    }
  }
});

// Đăng xuất
app.get("/dangxuat", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// Quản lý
app.get("/quanly", isAdmin, (req, res) => {
  res.render("quanly");
});

// Quản lý địa điểm
app.get("/quanly/diadiem", isAdmin, (req, res) => {
  res.render("quanlydiadiem", { user: req.session.user });
});

// API lấy danh sách địa điểm
app.get("/api/diadiem/:type", async (req, res) => {
  const { type } = req.params;
  let table = "";
  if (type === "tramsac") table = "tramsac";
  else if (type === "ttsc") table = "ttsc";
  else if (type === "baidoxe") table = "baidoxe";
  else if (type === "ttdk") table = "ttdk";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    const result = await client.query(`SELECT * FROM ${table} ORDER BY gid ASC`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi truy vấn CSDL" });
  }
});

// API cập nhật địa điểm
app.put(
  "/api/diadiem/:type/:id",
  upload.fields([{ name: "hinhtram" }, { name: "hinhanhtt" }, { name: "hinhanhbai" }, { name: "hinhanh" }]),
  isAdmin,
  async (req, res) => {
    const { type, id } = req.params;
    const body = req.body;

    // Lấy dữ liệu hiện tại từ database
    const currentData = await client.query(`SELECT * FROM ${type} WHERE gid = $1`, [id]);
    if (currentData.rows.length === 0) {
      return res.status(404).json({ error: "Địa điểm không tồn tại" });
    }
    const currentRow = currentData.rows[0];

    let hinhanh = currentRow.hinhtram || currentRow.hinhanhtt || currentRow.hinhanhbai || currentRow.hinhanh || null;
    if (req.files) {
      if (req.files["hinhtram"]) hinhanh = `/images/${req.files["hinhtram"][0].filename}`;
      else if (req.files["hinhanhtt"]) hinhanh = `/images/${req.files["hinhanhtt"][0].filename}`;
      else if (req.files["hinhanhbai"]) hinhanh = `/images/${req.files["hinhanhbai"][0].filename}`;
      else if (req.files["hinhanh"]) hinhanh = `/images/${req.files["hinhanh"][0].filename}`;
    }

    const finalLat = body.lat ? parseFloat(body.lat) : currentRow.lat;
    const finalLon = body.lon ? parseFloat(body.lon) : currentRow.lon;
    if (isNaN(finalLat) || isNaN(finalLon)) {
      return res.status(400).json({ error: "Vĩ độ và kinh độ phải là số hợp lệ" });
    }

    let table = "";
    let updateQuery = "";
    let values = [];

    if (type === "tramsac") {
      table = "tramsac";
      updateQuery = `
        UPDATE ${table}
        SET tentram = $1, diachi = $2, lienhe = $3, giomocua = $4, giodongcua = $5, nhacungcap = $6, hinhtram = $7, lat = $8, lon = $9
        WHERE gid = $10
        RETURNING *;
      `;
      values = [
        body.tentram || currentRow.tentram,
        body.diachi || currentRow.diachi,
        body.lienhe || currentRow.lienhe,
        body.giomocua || currentRow.giomocua,
        body.giodongcua || currentRow.giodongcua,
        body.nhacungcap || currentRow.nhacungcap,
        hinhanh,
        finalLat,
        finalLon,
        id,
      ];
    } else if (type === "ttsc") {
      table = "ttsc";
      updateQuery = `
        UPDATE ${table}
        SET tentt = $1, diachitt = $2, lienhett = $3, giomott = $4, giodongtt = $5, hinhanhtt = $6, lat = $7, lon = $8
        WHERE gid = $9
        RETURNING *;
      `;
      values = [
        body.tentram || currentRow.tentt,
        body.diachi || currentRow.diachitt,
        body.lienhe || currentRow.lienhett,
        body.giomocua || currentRow.giomott,
        body.giodongcua || currentRow.giodongtt,
        hinhanh,
        finalLat,
        finalLon,
        id,
      ];
    } else if (type === "baidoxe") {
      table = "baidoxe";
      updateQuery = `
        UPDATE ${table}
        SET tenbai = $1, diachi = $2, lienhe = $3, giomocua = $4, giodongcua = $5, hinhanhbai = $6, lat = $7, lon = $8
        WHERE gid = $9
        RETURNING *;
      `;
      values = [
        body.tentram || currentRow.tenbai,
        body.diachi || currentRow.diachi,
        body.lienhe || currentRow.lienhe,
        body.giomocua || currentRow.giomocua,
        body.giodongcua || currentRow.giodongcua,
        hinhanh,
        finalLat,
        finalLon,
        id,
      ];
    } else if (type === "ttdk") {
      table = "ttdk";
      updateQuery = `
        UPDATE ${table}
        SET tenttdk = $1, diachi = $2, lienhe = $3, giomocua = $4, giodongcua = $5, hinhanh = $6, lat = $7, lon = $8
        WHERE gid = $9
        RETURNING *;
      `;
      values = [
        body.tenttdk || currentRow.tenttdk,
        body.diachi || currentRow.diachi,
        body.lienhe || currentRow.lienhe,
        body.giomocua || currentRow.giomocua,
        body.giodongcua || currentRow.giodongcua,
        hinhanh,
        finalLat,
        finalLon,
        id,
      ];
    } else {
      return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });
    }

    try {
      const result = await client.query(updateQuery, values);
      res.json(result.rows[0]);
    } catch (err) {
      console.error("Lỗi khi cập nhật địa điểm:", err);
      res.status(500).json({ error: "Lỗi khi cập nhật địa điểm: " + err.message });
    }
  }
);

// API xóa địa điểm
app.delete("/api/diadiem/:type/:id", isAdmin, async (req, res) => {
  const { type, id } = req.params;
  let table = "";
  if (type === "tramsac") table = "tramsac";
  else if (type === "ttsc") table = "ttsc";
  else if (type === "baidoxe") table = "baidoxe";
  else if (type === "ttdk") table = "ttdk";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    const result = await client.query(`DELETE FROM ${table} WHERE gid = $1 RETURNING *`, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Địa điểm không tồn tại" });
    }
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa địa điểm" });
  }
});

// Thêm địa điểm - Trang chọn loại
app.get("/themdiadiem", isAdmin, (req, res) => {
  res.render("themdiadiem", { user: req.session.user });
});

// Thêm địa điểm - Trang form
app.get("/themdiadiem/:loai", isAdmin, (req, res) => {
  const loai = req.params.loai;
  res.render("formthem", { loai });
});

// Xử lý form thêm địa điểm
app.post("/themdiadiem/:loai", upload.single("hinhanh"), isAdmin, async (req, res) => {
  const loai = req.params.loai;
  const { name, diachi, lienhe, giomocua, giodongcua, nhacungcap, lat, lon } = req.body;
  const hinhanh = req.file ? `/images/${req.file.filename}` : null;
  let table = "";
  let query = "";
  let values = [];

  if (loai === "tramsac") {
    table = "tramsac";
    query = `
      INSERT INTO ${table} (tentram, diachi, lienhe, giomocua, giodongcua, nhacungcap, hinhtram, lat, lon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *;
    `;
    values = [name, diachi, lienhe, giomocua, giodongcua, nhacungcap || null, hinhanh, lat, lon];
  } else if (loai === "trungtamsuachua") {
    table = "ttsc";
    query = `
      INSERT INTO ${table} (tentt, diachitt, lienhett, giomott, giodongtt, hinhanhtt, lat, lon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    values = [name, diachi, lienhe, giomocua, giodongcua, hinhanh, lat, lon];
  } else if (loai === "baidoxe") {
    table = "baidoxe";
    query = `
      INSERT INTO ${table} (tenbai, diachi, lienhe, giomocua, giodongcua, hinhanhbai, lat, lon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    values = [name, diachi, lienhe, giomocua, giodongcua, hinhanh, lat, lon];
  } else if (loai === "trungtamdangkiem") {
    table = "ttdk";
    query = `
      INSERT INTO ${table} (tenttdk, diachi, lienhe, giomocua, giodongcua, hinhanh, lat, lon)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *;
    `;
    values = [name, diachi, lienhe, giomocua, giodongcua, hinhanh, lat, lon];
  } else {
    return res.status(400).send("Loại địa điểm không hợp lệ");
  }

  try {
    const result = await client.query(query, values);
    res.redirect("/quanly/diadiem");
  } catch (err) {
    console.error(err);
    res.status(500).send("Lỗi khi thêm địa điểm: " + err.message);
  }
});

// Đánh giá địa điểm
const danhgiaTableMap = {
  tramsac: "danhgia_tramsac",
  ttsc: "danhgia_ttsc",
  baidoxe: "danhgia_baidoxe",
  ttdk: "danhgia_ttdk",
};

app.get("/danhgia/:type/:gid", async (req, res) => {
  try {
    const { type, gid } = req.params;
    const table = danhgiaTableMap[type];
    if (!table) return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

    const q = `SELECT * FROM ${table} WHERE ${type}_gid = $1 ORDER BY ngaytao DESC`;
    const result = await client.query(q, [gid]);

    res.json(result.rows);
  } catch (err) {
    console.error("GET /danhgia error:", err);
    res.status(500).json({ error: "Lỗi khi lấy đánh giá: " + err.message });
  }
});

app.post("/danhgia", async (req, res) => {
  try {
    const { placeId, rating, comment } = req.body;
    const user = req.session.user;
    if (!user) {
      return res.status(401).json({ error: "Bạn cần đăng nhập để đánh giá" });
    }

    let table = "";
    let gidField = "";
    if (placeId.startsWith("tramsac_")) {
      table = "danhgia_tramsac";
      gidField = "tramsac_gid";
    } else if (placeId.startsWith("ttsc_")) {
      table = "danhgia_ttsc";
      gidField = "ttsc_gid";
    } else if (placeId.startsWith("baidoxe_")) {
      table = "danhgia_baidoxe";
      gidField = "baidoxe_gid";
    } else if (placeId.startsWith("ttdk_")) {
      table = "danhgia_ttdk";
      gidField = "ttdk_gid";
    } else {
      return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });
    }

    const gid = parseInt(placeId.split("_")[1]);
    if (isNaN(gid)) {
      return res.status(400).json({ error: "GID không hợp lệ" });
    }

    const q = `
      INSERT INTO ${table} (${gidField}, account_id, rating, binhluan, ngaytao, tentaikhoan)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
      RETURNING *;
    `;
    const result = await client.query(q, [gid, user.id, rating, comment, user.tentaikhoan]);

    console.log("POST /danhgia result:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("POST /danhgia error:", err);
    res.status(500).json({ error: "Lỗi khi gửi đánh giá: " + err.message });
  }
});

// API quản lý dịch vụ
app.get("/api/dichvu/:type/:gid", async (req, res) => {
  const { type, gid } = req.params;
  let table = "";
  if (type === "tramsac") table = "dichvu_tramsac";
  else if (type === "ttsc") table = "dichvu_ttsc";
  else if (type === "baidoxe") table = "dichvu_baidoxe";
  else if (type === "ttdk") table = "dichvu_ttdk";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    const result = await client.query(`SELECT * FROM ${table} WHERE ${type}_gid = $1`, [gid]);
    res.json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy dịch vụ:", err);
    res.status(500).json({ error: "Lỗi truy vấn CSDL" });
  }
});

app.post("/api/dichvu/:type/:gid", isAdmin, async (req, res) => {
  const { type, gid } = req.params;
  const { tendichvu, gia } = req.body;
  let table = "";
  let query = "";
  let values = [];

  if (type === "tramsac") {
    table = "dichvu_tramsac";
    query = `
      INSERT INTO ${table} (tramsac_gid, tendichvu, gia)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    values = [gid, tendichvu, gia];
  } else if (type === "ttsc") {
    table = "dichvu_ttsc";
    query = `
      INSERT INTO ${table} (ttsc_gid, tendichvu, gia)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    values = [gid, tendichvu, gia];
  } else if (type === "baidoxe") {
    table = "dichvu_baidoxe";
    query = `
      INSERT INTO ${table} (baidoxe_gid, tendichvu, gia)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    values = [gid, tendichvu, gia];
  } else if (type === "ttdk") {
    table = "dichvu_ttdk";
    query = `
      INSERT INTO ${table} (ttdk_gid, tendichvu, gia)
      VALUES ($1, $2, $3)
      RETURNING *;
    `;
    values = [gid, tendichvu, gia];
  } else {
    return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });
  }

  try {
    const result = await client.query(query, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi thêm dịch vụ" });
  }
});

app.put("/api/dichvu/:type/:gid/:id", isAdmin, async (req, res) => {
  const { type, gid, id } = req.params;
  const { tendichvu, gia } = req.body;
  let table = "";
  let query = "";
  let values = [];

  if (type === "tramsac") {
    table = "dichvu_tramsac";
    query = `
      UPDATE ${table}
      SET tendichvu = $1, gia = $2
      WHERE id = $3 AND tramsac_gid = $4
      RETURNING *;
    `;
    values = [tendichvu, gia, id, gid];
  } else if (type === "ttsc") {
    table = "dichvu_ttsc";
    query = `
      UPDATE ${table}
      SET tendichvu = $1, gia = $2
      WHERE id = $3 AND ttsc_gid = $4
      RETURNING *;
    `;
    values = [tendichvu, gia, id, gid];
  } else if (type === "baidoxe") {
    table = "dichvu_baidoxe";
    query = `
      UPDATE ${table}
      SET tendichvu = $1, gia = $2
      WHERE id = $3 AND baidoxe_gid = $4
      RETURNING *;
    `;
    values = [tendichvu, gia, id, gid];
  } else if (type === "ttdk") {
    table = "dichvu_ttdk";
    query = `
      UPDATE ${table}
      SET tendichvu = $1, gia = $2
      WHERE id = $3 AND ttdk_gid = $4
      RETURNING *;
    `;
    values = [tendichvu, gia, id, gid];
  } else {
    return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });
  }

  try {
    const result = await client.query(query, values);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Dịch vụ không tồn tại" });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi cập nhật dịch vụ" });
  }
});

app.delete("/api/dichvu/:type/:gid/:id", isAdmin, async (req, res) => {
  const { type, gid, id } = req.params;
  let table = "";
  if (type === "tramsac") table = "dichvu_tramsac";
  else if (type === "ttsc") table = "dichvu_ttsc";
  else if (type === "baidoxe") table = "dichvu_baidoxe";
  else if (type === "ttdk") table = "dichvu_ttdk";
  else return res.status(400).json({ error: "Loại địa điểm không hợp lệ" });

  try {
    const result = await client.query(
      `DELETE FROM ${table} WHERE id = $1 AND ${type}_gid = $2 RETURNING *`,
      [id, gid]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: "Dịch vụ không tồn tại" });
    }
    res.json({ message: "Xóa thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Lỗi khi xóa dịch vụ" });
  }
});

// Quản lý người dùng
app.get("/quanly/nguoidung", isAdmin, async (req, res) => {
  try {
    const result = await client.query(
      `SELECT id, tentaikhoan, email, sdt, role FROM account ORDER BY role DESC, id ASC`
    );
    res.render("quanlynguoidung", { 
      users: result.rows,
      currentUser: req.session.user // Truyền thông tin user hiện tại để kiểm tra
    });
  } catch (err) {
    console.error("Lỗi khi lấy danh sách người dùng:", err);
    res.status(500).send("Lỗi khi tải danh sách người dùng");
  }
});

app.post("/quanly/nguoidung/xoa/:id", isAdmin, async (req, res) => {
  const userId = req.params.id;
  try {
    await client.query("DELETE FROM danhgia_tramsac WHERE account_id = $1", [userId]);
    await client.query("DELETE FROM danhgia_ttsc WHERE account_id = $1", [userId]);
    await client.query("DELETE FROM danhgia_baidoxe WHERE account_id = $1", [userId]);
    const result = await client.query(
      `DELETE FROM account WHERE id = $1 AND role = 'nguoidung' RETURNING id`,
      [userId]
    );
    if (result.rowCount === 0) {
      return res.status(404).send("Không tìm thấy người dùng để xóa");
    }
    res.redirect("/quanly/nguoidung");
  } catch (err) {
    console.error("Lỗi khi xóa người dùng:", err);
    res.status(500).send("Không thể xóa người dùng");
  }
});

// Route cấp quyền quản trị viên
app.post("/quanly/nguoidung/capquyen/:id", isAdmin, async (req, res) => {
  const userId = req.params.id;
  const { password } = req.body;

  try {
    // Kiểm tra mật khẩu của admin đang đăng nhập
    const adminCheck = await client.query(
      `SELECT id FROM account WHERE id = $1 AND matkhau = $2 AND role = 'quantrivien'`,
      [req.session.user.id, password]
    );

    if (adminCheck.rows.length === 0) {
      return res.json({ success: false, message: "Mật khẩu không đúng" });
    }

    // Cập nhật quyền cho user được chọn
    const result = await client.query(
      `UPDATE account SET role = 'quantrivien' WHERE id = $1 AND role = 'nguoidung' RETURNING id, tentaikhoan`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy người dùng hoặc người dùng đã là quản trị viên" });
    }

    res.json({ 
      success: true, 
      message: "Đã cấp quyền quản trị viên thành công",
      user: result.rows[0]
    });

  } catch (err) {
    console.error("Lỗi khi cấp quyền:", err);
    res.status(500).json({ success: false, message: "Lỗi server khi cấp quyền" });
  }
});

// xem danh sach phuong tien
app.get('/quanly/nguoidung/:id/phuongtien', isAdmin, async (req, res) => {
  const uid = req.params.id;
  try {
    const userRes = await client.query('SELECT id, tentaikhoan FROM account WHERE id = $1', [uid]);
    if (userRes.rows.length === 0) return res.status(404).send('Không tìm thấy người dùng');
    const vehiclesResult = await client.query(
      'SELECT id, bien_so, hang_xe, dong_xe, hinh_anh_xe FROM phuong_tien WHERE id_account = $1 ORDER BY id ASC',
      [uid]
    );
    res.render('phuongtien_nguoidung', { owner: userRes.rows[0], vehicles: vehiclesResult.rows, currentUser: req.session.user });
  } catch (err) {
    console.error('Lỗi khi lấy phương tiện của user:', err);
    res.status(500).send('Lỗi server');
  }
});

// xoa phuong tien
app.post('/quanly/nguoidung/:uid/phuongtien/xoa/:vid', isAdmin, async (req, res) => {
  const { uid, vid } = req.params;
  try {
    const result = await client.query('DELETE FROM phuong_tien WHERE id = $1 AND id_account = $2 RETURNING id', [vid, uid]);
    if (result.rowCount === 0) return res.status(404).send('Không tìm thấy phương tiện');
    res.redirect('/quanly/nguoidung/' + uid + '/phuongtien');
  } catch (err) {
    console.error('Lỗi khi xóa phương tiện (admin):', err);
    res.status(500).send('Lỗi khi xóa phương tiện');
  }
});

// sua phuong tien 
app.post('/quanly/nguoidung/:uid/phuongtien/sua/:vid', upload.single('hinh_anh_xe'), isAdmin, async (req, res) => {
  const { uid, vid } = req.params;
  const { bien_so, hang_xe, dong_xe } = req.body;
  try {
    const cur = await client.query('SELECT hinh_anh_xe FROM phuong_tien WHERE id = $1 AND id_account = $2', [vid, uid]);
    if (cur.rows.length === 0) return res.status(404).send('Không tìm thấy phương tiện');
    const existing = cur.rows[0];
    const hinh = req.file ? `/images/${req.file.filename}` : existing.hinh_anh_xe;
    await client.query(
      'UPDATE phuong_tien SET bien_so = $1, hang_xe = $2, dong_xe = $3, hinh_anh_xe = $4 WHERE id = $5 AND id_account = $6',
      [bien_so, hang_xe, dong_xe, hinh, vid, uid]
    );
    res.redirect('/quanly/nguoidung/' + uid + '/phuongtien');
  } catch (err) {
    console.error('Lỗi khi cập nhật phương tiện (admin):', err);
    res.status(500).send('Lỗi khi cập nhật phương tiện');
  }
});

// Them router thongtinnguoidung
app.get("/thongtinnguoidung", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/dangnhap");
  }
  try {
    const result = await client.query(
      `SELECT id, tentaikhoan, email, sdt FROM account WHERE id = $1`, 
      [req.session.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send("Không tìm thấy thông tin người dùng");
    }
    const userData = result.rows[0];
    console.log("Dữ liệu người dùng từ DB:", userData); 
    if (!userData.sdt) {
      console.log("Cảnh báo: sdt không tồn tại hoặc null cho user ID:", req.session.user.id);
    }
    res.render("thongtinnguoidung", { user: userData });
  } catch (err) {
    console.error("Lỗi khi lấy thông tin người dùng:", err);
    res.status(500).send("Có lỗi khi tải thông tin người dùng");
  }
});

// Trang quản lý phương tiện từ trang quản lý người dùng (admin)
app.get("/quanlyphuongtien", isAdmin, async (req, res) => {
  const uid = req.query.uid;
  if (!uid) {
    return res.status(400).send('Thiếu ID người dùng');
  }
  try {
    const userRes = await client.query('SELECT id, tentaikhoan FROM account WHERE id = $1', [uid]);
    if (userRes.rows.length === 0) return res.status(404).send('Không tìm thấy người dùng');
    const vehiclesResult = await client.query(
      'SELECT id, bien_so, hang_xe, dong_xe, hinh_anh_xe FROM phuong_tien WHERE id_account = $1 ORDER BY id ASC',
      [uid]
    );
    res.render('quanlyphuongtien', { owner: userRes.rows[0], vehicles: vehiclesResult.rows, currentUser: req.session.user });
  } catch (err) {
    console.error('Lỗi khi lấy phương tiện của user:', err);
    res.status(500).send('Lỗi server');
  }
});

// Trang quản lý phương tiện
app.get("/phuongtien", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/dangnhap");
  }
  try {
    const vehiclesResult = await client.query(
      `SELECT id, bien_so, hang_xe, dong_xe, hinh_anh_xe FROM phuong_tien WHERE id_account = $1 ORDER BY id ASC`,
      [req.session.user.id]
    );
    res.render("phuongtien", { user: req.session.user, vehicles: vehiclesResult.rows });
  } catch (err) {
    console.error("Lỗi khi mở trang phương tiện:", err);
    res.status(500).send("Có lỗi khi mở trang phương tiện");
  }
});

// them phuong tien
app.post('/phuongtien', upload.single('hinh_anh_xe'), async (req, res) => {
  if (!req.session.user) return res.redirect('/dangnhap');
  try {
    const { bien_so, hang_xe, dong_xe } = req.body;
    const hinh = req.file ? `/images/${req.file.filename}` : null;
    await client.query(
      `INSERT INTO phuong_tien (id_account, bien_so, hang_xe, dong_xe, hinh_anh_xe) VALUES ($1,$2,$3,$4,$5)`,
      [req.session.user.id, bien_so, hang_xe, dong_xe, hinh]
    );
    res.redirect('/phuongtien');
  } catch (err) {
    console.error('Lỗi khi thêm phương tiện:', err);
    res.status(500).send('Lỗi khi thêm phương tiện');
  }
});

// xoa phuong tien
app.post('/phuongtien/xoa/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/dangnhap');
  const vid = req.params.id;
  try {
    const result = await client.query(`DELETE FROM phuong_tien WHERE id = $1 AND id_account = $2 RETURNING id`, [vid, req.session.user.id]);
    if (result.rowCount === 0) {
      return res.status(404).send('Không tìm thấy phương tiện hoặc không có quyền xóa');
    }
    res.redirect('/phuongtien');
  } catch (err) {
    console.error('Lỗi khi xóa phương tiện:', err);
    res.status(500).send('Lỗi khi xóa phương tiện');
  }
});

// cap nhat phuong tien
app.post('/phuongtien/sua/:id', upload.single('hinh_anh_xe'), async (req, res) => {
  if (!req.session.user) return res.redirect('/dangnhap');
  const vid = req.params.id;
  const { bien_so, hang_xe, dong_xe } = req.body;
  try {
    const cur = await client.query('SELECT hinh_anh_xe, id_account FROM phuong_tien WHERE id = $1', [vid]);
    if (cur.rows.length === 0 || cur.rows[0].id_account !== req.session.user.id) {
      return res.status(404).send('Không tìm thấy phương tiện');
    }
    const existing = cur.rows[0];
    const hinh = req.file ? `/images/${req.file.filename}` : existing.hinh_anh_xe;

    await client.query(
      `UPDATE phuong_tien SET bien_so = $1, hang_xe = $2, dong_xe = $3, hinh_anh_xe = $4 WHERE id = $5 AND id_account = $6`,
      [bien_so, hang_xe, dong_xe, hinh, vid, req.session.user.id]
    );
    res.redirect('/phuongtien');
  } catch (err) {
    console.error('Lỗi khi cập nhật phương tiện:', err);
    res.status(500).send('Lỗi khi cập nhật phương tiện');
  }
});

// Trang chi tiết phương tiện
app.get('/thongtinphuongtien/:id', async (req, res) => {
  if (!req.session.user) return res.redirect('/dangnhap');
  const vid = req.params.id;
  try {
    const result = await client.query(
      `SELECT id, id_account, bien_so, hang_xe, dong_xe, hinh_anh_xe FROM phuong_tien WHERE id = $1`,
      [vid]
    );
    if (result.rows.length === 0) return res.status(404).send('Không tìm thấy phương tiện');
    const vehicle = result.rows[0];
    res.render('thongtinphuongtien', { vehicle });
  } catch (err) {
    console.error('Lỗi khi lấy thông tin phương tiện:', err);
    res.status(500).send('Có lỗi khi lấy thông tin phương tiện');
  }
});

// Xử lý đổi mật khẩu
app.post("/thongtinnguoidung/doimatkhau", async (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ success: false, error: "Bạn cần đăng nhập" });
  }
  const { currentPassword, newPassword, phoneNumber } = req.body;
  try {
    const result = await client.query(
      `SELECT id, matkhau, sdt FROM account WHERE id = $1 AND matkhau = $2 AND sdt = $3`,
      [req.session.user.id, currentPassword, phoneNumber]
    );
    if (result.rows.length === 0) {
      return res.json({ success: false, error: "Thông tin không khớp" });
    }
    await client.query(
      `UPDATE account SET matkhau = $1 WHERE id = $2`,
      [newPassword, req.session.user.id]
    );
    res.json({ success: true, message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error("Lỗi khi đổi mật khẩu:", err);
    res.status(500).json({ success: false, error: "Lỗi server" });
  }
});

// API bao duong dang kiem
app.get('/api/bao_duong/:vehicleId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  const vid = parseInt(req.params.vehicleId);
  if (isNaN(vid)) return res.status(400).json({ error: 'vehicleId không hợp lệ' });
  try {
    const q = `SELECT id, id_account, id_xe, loai, ngay_thuc_hien, chu_ky_thang, ngay_het_han, trang_thai, ghi_chu
               FROM bao_duong_dang_kiem
               WHERE id_xe = $1 AND id_account = $2
               ORDER BY ngay_het_han DESC`;
    const result = await client.query(q, [vid, req.session.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy gói bảo dưỡng:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API bao duong dang kiem
app.post('/api/bao_duong', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  try {
    const { id_xe, loai, ngay_thuc_hien, chu_ky_thang, ghi_chu } = req.body;
    const vid = parseInt(id_xe);
    const cycle = parseInt(chu_ky_thang);
    if (!vid || !loai || !ngay_thuc_hien || !cycle) {
      return res.status(400).json({ error: 'Thiếu dữ liệu bắt buộc' });
    }

    // Tinh ngay_het_han
    const start = new Date(ngay_thuc_hien);
    if (isNaN(start.getTime())) return res.status(400).json({ error: 'ngay_thuc_hien không hợp lệ' });
    const end = new Date(start);
    end.setMonth(end.getMonth() + cycle);
    const pad = (n) => (n < 10 ? '0' + n : n);
    const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
    const ngay_het_han = fmt(end);

    // Set trang thai dua tren ngay hien tai
    const today = new Date();
    const diffMs = Date.parse(ngay_het_han) - Date.parse(today.toISOString().slice(0,10));
    const diffDays = Math.floor(diffMs / (1000*60*60*24));
    let trang_thai = 'con_han';
    if (diffDays < 0) trang_thai = 'het_han';
    else if (diffDays <= 30) trang_thai = 'sap_het_han';

    const insertQ = `INSERT INTO bao_duong_dang_kiem (id_account, id_xe, loai, ngay_thuc_hien, chu_ky_thang, ngay_het_han, trang_thai, ghi_chu)
                     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
    const values = [req.session.user.id, vid, loai, ngay_thuc_hien, cycle, ngay_het_han, trang_thai, ghi_chu || null];
    const result = await client.query(insertQ, values);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi tạo gói bảo dưỡng:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API cap nhat bao duong dang kiem
app.put('/api/bao_duong/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id không hợp lệ' });

    // Kiem tra quyen
    const cur = await client.query('SELECT * FROM bao_duong_dang_kiem WHERE id = $1', [id]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy gói' });
    const row = cur.rows[0];
    if (row.id_account !== req.session.user.id) return res.status(403).json({ error: 'Không có quyền' });

    const { loai, ngay_thuc_hien, chu_ky_thang, ghi_chu } = req.body;
    // thay doi thi tinh lai ngay het han
    let ngayHet = row.ngay_het_han;
    let trang_thai = row.trang_thai;
    let startDate = ngay_thuc_hien || row.ngay_thuc_hien;
    let cycle = chu_ky_thang !== undefined ? parseInt(chu_ky_thang) : row.chu_ky_thang;
    if (startDate && cycle) {
      const s = new Date(startDate);
      if (isNaN(s.getTime())) return res.status(400).json({ error: 'ngay_thuc_hien không hợp lệ' });
      const e = new Date(s);
      e.setMonth(e.getMonth() + cycle);
      const pad = (n) => (n < 10 ? '0' + n : n);
      ngayHet = `${e.getFullYear()}-${pad(e.getMonth()+1)}-${pad(e.getDate())}`;

      const today = new Date();
      const diffMs = Date.parse(ngayHet) - Date.parse(today.toISOString().slice(0,10));
      const diffDays = Math.floor(diffMs / (1000*60*60*24));
      if (diffDays < 0) trang_thai = 'het_han';
      else if (diffDays <= 30) trang_thai = 'sap_het_han';
      else trang_thai = 'con_han';
    }

    const q = `UPDATE bao_duong_dang_kiem SET loai = $1, ngay_thuc_hien = $2, chu_ky_thang = $3, ngay_het_han = $4, trang_thai = $5, ghi_chu = $6 WHERE id = $7 RETURNING *`;
    const values = [loai || row.loai, startDate, cycle, ngayHet, trang_thai, ghi_chu || row.ghi_chu, id];
    const result = await client.query(q, values);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi cập nhật gói bảo dưỡng:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API xoa bao duong dang kiem
app.delete('/api/bao_duong/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) return res.status(400).json({ error: 'id không hợp lệ' });
    const cur = await client.query('SELECT id_account FROM bao_duong_dang_kiem WHERE id = $1', [id]);
    if (cur.rows.length === 0) return res.status(404).json({ error: 'Không tìm thấy gói' });
    if (cur.rows[0].id_account !== req.session.user.id) return res.status(403).json({ error: 'Không có quyền' });
    await client.query('DELETE FROM bao_duong_dang_kiem WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi khi xóa gói bảo dưỡng:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// Route trang thống kê chi phí
app.get('/thongkechiphi', async (req, res) => {
  if (!req.session.user) return res.redirect('/dangnhap');
  const id_xe = req.query.id_xe;
  if (!id_xe) return res.status(400).send('Thiếu id_xe');
  res.render('thongkechiphi', { id_xe });
});

// API lấy danh sách chi phí
app.get('/api/chi_phi/:vehicleId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  const vehicleId = parseInt(req.params.vehicleId);
  if (isNaN(vehicleId)) return res.status(400).json({ error: 'vehicleId không hợp lệ' });
  
  try {
    const q = `SELECT id, id_account, id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu
               FROM chi_phi_dich_vu
               WHERE id_xe = $1 AND id_account = $2
               ORDER BY ngay_phat_sinh DESC`;
    const result = await client.query(q, [vehicleId, req.session.user.id]);
    res.json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy chi phí:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API thêm chi phí mới
app.post('/api/chi_phi', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  
  const { id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu } = req.body;
  
  console.log('Dữ liệu nhận được:', { id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu });

  if (!id_xe || !id_danh_muc || so_tien === undefined || !ngay_phat_sinh) {
    console.error('Thiếu thông tin bắt buộc');
    return res.status(400).json({ error: 'Thiếu thông tin bắt buộc: id_xe, id_danh_muc, so_tien, ngay_phat_sinh' });
  }

  try {
    const q = `INSERT INTO chi_phi_dich_vu(id_account, id_xe, id_danh_muc, so_tien, ngay_phat_sinh, ghi_chu)
               VALUES($1, $2, $3, $4, $5, $6)
               RETURNING *`;
    const result = await client.query(q, [
      req.session.user.id,
      parseInt(id_xe),
      parseInt(id_danh_muc),
      parseFloat(so_tien),
      ngay_phat_sinh,
      ghi_chu || null
    ]);
    console.log('Thêm chi phí thành công:', result.rows[0]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi chi tiết khi thêm chi phí:', err.message, err.code);
    res.status(500).json({ error: 'Lỗi server: ' + err.message });
  }
});

// API xóa chi phí
app.delete('/api/chi_phi/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'id không hợp lệ' });

  try {
    // Kiểm tra quyền sở hữu
    const check = await client.query(
      'SELECT id_account FROM chi_phi_dich_vu WHERE id = $1',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chi phí' });
    }
    if (check.rows[0].id_account !== req.session.user.id) {
      return res.status(403).json({ error: 'Không có quyền xóa' });
    }

    await client.query('DELETE FROM chi_phi_dich_vu WHERE id = $1', [id]);
    res.json({ success: true });
  } catch (err) {
    console.error('Lỗi khi xóa chi phí:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Sửa chi phí
app.put('/api/chi_phi/:id', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: 'id không hợp lệ' });

  const { so_tien, id_danh_muc, ngay_phat_sinh } = req.body;

  try {
    // Kiểm tra quyền sở hữu
    const check = await client.query(
      'SELECT id_account FROM chi_phi_dich_vu WHERE id = $1',
      [id]
    );
    if (check.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy chi phí' });
    }
    if (check.rows[0].id_account !== req.session.user.id && req.session.user.role !== 'quantrivien') {
      return res.status(403).json({ error: 'Không có quyền sửa' });
    }

    // Cập nhật chi phí
    const updateQuery = `
      UPDATE chi_phi_dich_vu
      SET so_tien = $1, id_danh_muc = $2, ngay_phat_sinh = $3
      WHERE id = $4
      RETURNING id, so_tien, id_danh_muc, ngay_phat_sinh
    `;
    
    const result = await client.query(updateQuery, [so_tien, id_danh_muc, ngay_phat_sinh, id]);
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error('Lỗi khi sửa chi phí:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API thống kê chi phí
app.get('/api/chi_phi/thongke/:vehicleId', async (req, res) => {
  if (!req.session.user) return res.status(401).json({ error: 'Bạn cần đăng nhập' });
  
  const vehicleId = parseInt(req.params.vehicleId);
  const fromDate = req.query.from_date;
  const toDate = req.query.to_date;

  if (isNaN(vehicleId) || !fromDate || !toDate) {
    return res.status(400).json({ error: 'Thiếu thông tin' });
  }

  try {
    // Truy vấn tổng chi phí theo nhóm
    const q = `SELECT id_danh_muc, SUM(so_tien) as so_tien
               FROM chi_phi_dich_vu
               WHERE id_account = $1 AND id_xe = $2
                 AND ngay_phat_sinh BETWEEN $3 AND $4
               GROUP BY id_danh_muc
               ORDER BY so_tien DESC`;
    
    const result = await client.query(q, [req.session.user.id, vehicleId, fromDate, toDate]);
    
    // Tính tổng chi phí
    const totalQuery = `SELECT SUM(so_tien) as total
                        FROM chi_phi_dich_vu
                        WHERE id_account = $1 AND id_xe = $2
                          AND ngay_phat_sinh BETWEEN $3 AND $4`;
    
    const totalResult = await client.query(totalQuery, [req.session.user.id, vehicleId, fromDate, toDate]);
    const tong_chi_phi = parseInt(totalResult.rows[0].total) || 0;

    // Định dạng dữ liệu trả về
    const chi_tiet = result.rows.map(row => ({
      id_danh_muc: row.id_danh_muc,
      so_tien: parseInt(row.so_tien)
    }));

    res.json({
      tong_chi_phi,
      chi_tiet
    });
  } catch (err) {
    console.error('Lỗi khi thống kê chi phí:', err);
    res.status(500).json({ error: 'Lỗi server' });
  }
});

// API: Lưu thống kê vào database
app.post('/api/thongke/luu', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, error: 'Bạn cần đăng nhập' });
    }

    const { id_xe, ten_thongke, tu_ngay, den_ngay, du_lieu } = req.body;

    if (!id_xe || !ten_thongke || !tu_ngay || !den_ngay || !du_lieu) {
      return res.status(400).json({ success: false, error: 'Thiếu dữ liệu' });
    }

    const query = `
      INSERT INTO thongke_chi_phi (id_account, id_xe, ten_thongke, tu_ngay, den_ngay, tong_chi_phi, chi_tiet)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id, ngay_tao
    `;

    const result = await client.query(query, [
      req.session.user.id,
      id_xe,
      ten_thongke,
      tu_ngay,
      den_ngay,
      du_lieu.tong_chi_phi || 0,
      JSON.stringify(du_lieu)
    ]);

    res.json({
      success: true,
      message: 'Lưu thống kê thành công',
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi lưu thống kê:', err);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// API: Lấy danh sách thống kê của xe
app.get('/api/thongke/:vehicleId', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, error: 'Bạn cần đăng nhập' });
    }

    const vehicleId = parseInt(req.params.vehicleId);

    const query = `
      SELECT id, ten_thongke, tu_ngay, den_ngay, tong_chi_phi, chi_tiet, ngay_tao
      FROM thongke_chi_phi
      WHERE id_account = $1 AND id_xe = $2 AND is_deleted = FALSE
      ORDER BY ngay_tao DESC
    `;

    const result = await client.query(query, [req.session.user.id, vehicleId]);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (err) {
    console.error('Lỗi lấy thống kê:', err);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// API: Xóa thống kê
app.delete('/api/thongke/:statsId', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, error: 'Bạn cần đăng nhập' });
    }

    const statsId = parseInt(req.params.statsId);

    // Kiểm tra xem thống kê có tồn tại và thuộc về user không
    const checkQuery = `SELECT id_account FROM thongke_chi_phi WHERE id = $1`;
    const checkResult = await client.query(checkQuery, [statsId]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Thống kê không tồn tại' });
    }

    if (checkResult.rows[0].id_account !== req.session.user.id) {
      return res.status(403).json({ success: false, error: 'Không có quyền xóa' });
    }

    // Xóa mềm (soft delete)
    const deleteQuery = `
      UPDATE thongke_chi_phi
      SET is_deleted = TRUE
      WHERE id = $1
    `;

    await client.query(deleteQuery, [statsId]);

    res.json({ success: true, message: 'Xóa thống kê thành công' });
  } catch (err) {
    console.error('Lỗi xóa thống kê:', err);
    res.status(500).json({ success: false, error: 'Lỗi server' });
  }
});

// Trang thống kê chi phí của phương tiện (từ admin quản lý người dùng)
app.get('/quanlythongke', isAdmin, async (req, res) => {
  const id_nguoidung = req.query.id_nguoidung;
  const id_xe = req.query.id_xe;

  if (!id_nguoidung || !id_xe) {
    return res.status(400).send('Thiếu ID người dùng hoặc phương tiện');
  }

  try {
    // Lấy danh sách chi phí của người dùng và phương tiện
    const chiPhiQuery = `
      SELECT cp.id, a.tentaikhoan, pt.bien_so, dv.ten_dich_vu, cp.so_tien, cp.ngay_phat_sinh
      FROM chi_phi_dich_vu cp
      JOIN account a ON cp.id_account = a.id
      JOIN phuong_tien pt ON cp.id_xe = pt.id
      JOIN danh_muc_dich_vu dv ON cp.id_danh_muc = dv.id
      WHERE cp.id_account = $1 AND cp.id_xe = $2
      ORDER BY cp.ngay_phat_sinh DESC
    `;
    
    const result = await client.query(chiPhiQuery, [id_nguoidung, id_xe]);
    const chiPhiList = result.rows;

    res.render('quanlythongke', { chiPhiList, currentUser: req.session.user });
  } catch (err) {
    console.error('Lỗi khi lấy thống kê chi phí:', err);
    res.status(500).send('Lỗi server');
  }
});

// Ghi chú cá nhân
app.get("/ghichucanhan", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/dangnhap');
    }
    res.render('ghichucanhan', { user: req.session.user });
  } catch (err) {
    console.error(err);
    res.status(500).send("Có lỗi");
  }
});

// API: Lấy danh sách ghi chú cá nhân
app.get("/api/ghichucanhan", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    const result = await client.query(
      `SELECT id, id_account, tieu_de, noi_dung, ngay_tao 
       FROM luu_y_ca_nhan 
       WHERE id_account = $1 
       ORDER BY ngay_tao DESC`,
      [req.session.user.id]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API: Thêm ghi chú cá nhân
app.post("/api/ghichucanhan", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    const { tieu_de, noi_dung } = req.body;
    
    if (!tieu_de || !noi_dung) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }
    
    const result = await client.query(
      `INSERT INTO luu_y_ca_nhan (id_account, tieu_de, noi_dung, ngay_tao)
       VALUES ($1, $2, $3, NOW())
       RETURNING id, id_account, tieu_de, noi_dung, ngay_tao`,
      [req.session.user.id, tieu_de, noi_dung]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API: Cập nhật ghi chú cá nhân
app.put("/api/ghichucanhan/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    const { id } = req.params;
    const { tieu_de, noi_dung } = req.body;
    
    if (!tieu_de || !noi_dung) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }
    
    // Kiểm tra quyền sở hữu ghi chú
    const checkResult = await client.query(
      `SELECT id_account FROM luu_y_ca_nhan WHERE id = $1`,
      [id]
    );
    
    if (checkResult.rows.length === 0 || checkResult.rows[0].id_account !== req.session.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    }
    
    const result = await client.query(
      `UPDATE luu_y_ca_nhan 
       SET tieu_de = $1, noi_dung = $2
       WHERE id = $3 AND id_account = $4
       RETURNING id, id_account, tieu_de, noi_dung, ngay_tao`,
      [tieu_de, noi_dung, id, req.session.user.id]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API: Xóa ghi chú cá nhân
app.delete("/api/ghichucanhan/:id", async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ success: false, message: 'Chưa đăng nhập' });
    }
    
    const { id } = req.params;
    
    // Kiểm tra quyền sở hữu ghi chú
    const checkResult = await client.query(
      `SELECT id_account FROM luu_y_ca_nhan WHERE id = $1`,
      [id]
    );
    
    if (checkResult.rows.length === 0 || checkResult.rows[0].id_account !== req.session.user.id) {
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    }
    
    await client.query(
      `DELETE FROM luu_y_ca_nhan WHERE id = $1 AND id_account = $2`,
      [id, req.session.user.id]
    );
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// Admin: Quản lý ghi chú người dùng
app.get("/quanly/ghichu/:id", isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get account info
    const accountResult = await client.query(
      `SELECT id, tentaikhoan FROM account WHERE id = $1`,
      [id]
    );
    
    if (accountResult.rows.length === 0) {
      return res.status(404).render('loi', {
        message: 'Tài khoản không tồn tại',
        error: { status: 404 }
      });
    }
    
    res.render('quanlyghichu', {
      accountId: id,
      accountName: accountResult.rows[0].tentaikhoan
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Có lỗi');
  }
});

// API: Admin lấy danh sách ghi chú của người dùng
app.get("/api/quanly/ghichu/:accountId", isAdmin, async (req, res) => {
  try {
    const { accountId } = req.params;
    
    const result = await client.query(
      `SELECT id, id_account, tieu_de, noi_dung, ngay_tao 
       FROM luu_y_ca_nhan 
       WHERE id_account = $1 
       ORDER BY ngay_tao DESC`,
      [accountId]
    );
    
    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API: Admin cập nhật ghi chú của người dùng
app.put("/api/quanly/ghichu/:accountId/:noteId", isAdmin, async (req, res) => {
  try {
    const { accountId, noteId } = req.params;
    const { tieu_de, noi_dung } = req.body;
    
    if (!tieu_de || !noi_dung) {
      return res.status(400).json({ success: false, message: 'Thiếu dữ liệu' });
    }
    
    // Verify note belongs to the account
    const checkResult = await client.query(
      `SELECT id_account FROM luu_y_ca_nhan WHERE id = $1`,
      [noteId]
    );
    
    if (checkResult.rows.length === 0 || checkResult.rows[0].id_account !== parseInt(accountId)) {
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    }
    
    const result = await client.query(
      `UPDATE luu_y_ca_nhan 
       SET tieu_de = $1, noi_dung = $2
       WHERE id = $3
       RETURNING id, id_account, tieu_de, noi_dung, ngay_tao`,
      [tieu_de, noi_dung, noteId]
    );
    
    res.json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

// API: Admin xóa ghi chú của người dùng
app.delete("/api/quanly/ghichu/:accountId/:noteId", isAdmin, async (req, res) => {
  try {
    const { accountId, noteId } = req.params;
    
    // Verify note belongs to the account
    const checkResult = await client.query(
      `SELECT id_account FROM luu_y_ca_nhan WHERE id = $1`,
      [noteId]
    );
    
    if (checkResult.rows.length === 0 || checkResult.rows[0].id_account !== parseInt(accountId)) {
      return res.status(403).json({ success: false, message: 'Không có quyền' });
    }
    
    await client.query(
      `DELETE FROM luu_y_ca_nhan WHERE id = $1`,
      [noteId]
    );
    
    res.json({ success: true, message: 'Xóa thành công' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Lỗi server' });
  }
});

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));