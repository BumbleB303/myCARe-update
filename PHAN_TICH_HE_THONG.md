# Phân Tích Chi Tiết Hệ Thống Dự Án myCARe

## 1. Tổng Quan Hệ Thống

### Sơ Đồ Hệ Thống (Mô tả)
- Hệ thống myCARe là một ứng dụng quản lý phương tiện, chi phí, địa điểm, ghi chú, đánh giá và người dùng.
- Kiến trúc theo mô hình MVC (Model-View-Controller).
- Giao tiếp giữa client (trình duyệt) và server thông qua HTTP (RESTful API).
- Dữ liệu được lưu trữ trong cơ sở dữ liệu (cấu hình tại `config/database.js`).

### Sơ Đồ Luồng Tổng Quan
- Người dùng truy cập qua trình duyệt → Gửi request đến server Node.js/Express → Xử lý qua Controller → Truy xuất Model → Render View (EJS) hoặc trả về JSON.

## 2. Cấu Trúc Dự Án
- `controllers/`: Xử lý logic nghiệp vụ cho từng nhóm chức năng.
- `models/`: Định nghĩa các model tương tác với database.
- `routes/`: Định nghĩa các endpoint API và route cho từng nhóm chức năng.
- `middleware/`: Chứa các middleware như xác thực, phân quyền.
- `config/`: Cấu hình hệ thống (database, upload file, ...).
- `views/`: Giao diện người dùng (EJS template).
- `public/`: Tài nguyên tĩnh (ảnh, JS, CSS).
- `index.js`: Điểm khởi động ứng dụng.

## 3. Phân Tích Theo Từng Trang Hiển Thị (views)
### 3.1. Trang Đăng Ký (`dangky.ejs`)
- Chức năng: Đăng ký tài khoản người dùng mới.
- Luồng hoạt động: Người dùng nhập thông tin → Gửi form → Controller xử lý → Model lưu DB → Chuyển hướng đăng nhập.
- Công nghệ: EJS, Express, bcrypt (mã hóa mật khẩu).

### 3.2. Trang Đăng Nhập (`dangnhap.ejs`)
- Chức năng: Đăng nhập hệ thống.
- Luồng: Nhập thông tin → Gửi form → Controller xác thực → Middleware kiểm tra → Đăng nhập thành công/chuyển hướng.
- Công nghệ: EJS, Express, JWT/cookie-session.

### 3.3. Trang Quản Lý Người Dùng (`quanlynguoidung.ejs`)
- Chức năng: Xem, sửa, xóa người dùng.
- Luồng: Lấy danh sách từ Model → Render View → Thao tác CRUD qua Controller.
- Công nghệ: EJS, Express, Model User.

### 3.4. Trang Quản Lý Phương Tiện (`quanlyphuongtien.ejs`)
- Chức năng: Quản lý phương tiện (thêm, sửa, xóa, xem).
- Luồng: CRUD phương tiện qua Controller/Model → Render View.
- Công nghệ: EJS, Express, Model Vehicle.

### 3.5. Trang Quản Lý Chi Phí (`danhsachichiphi.ejs`, `thongkechiphi.ejs`)
- Chức năng: Quản lý, thống kê chi phí.
- Luồng: Lấy dữ liệu chi phí → Hiển thị danh sách/thống kê → Thao tác CRUD.
- Công nghệ: EJS, Express, Model Cost.

### 3.6. Trang Quản Lý Địa Điểm (`quanlydiadiem.ejs`, `themdiadiem.ejs`)
- Chức năng: Quản lý địa điểm liên quan phương tiện.
- Luồng: CRUD địa điểm qua Controller/Model → Render View.
- Công nghệ: EJS, Express, Model Location.

### 3.7. Trang Quản Lý Ghi Chú (`quanlyghichu.ejs`, `ghichucanhan.ejs`)
- Chức năng: Quản lý ghi chú cá nhân.
- Luồng: CRUD ghi chú qua Controller/Model → Render View.
- Công nghệ: EJS, Express, Model Note.

### 3.8. Trang Quản Lý Đánh Giá (`quanly.ejs`, `reviews.ejs` nếu có)
- Chức năng: Quản lý đánh giá phương tiện/người dùng.
- Luồng: CRUD đánh giá qua Controller/Model → Render View.
- Công nghệ: EJS, Express, Model Review.

### 3.9. Trang Thống Kê, Dashboard (`quanlythongke.ejs`, `trangchu.ejs`)
- Chức năng: Thống kê tổng quan, dashboard hệ thống.
- Luồng: Lấy dữ liệu tổng hợp từ nhiều Model → Render View.
- Công nghệ: EJS, Express, tổng hợp nhiều Model.

## 4. Phân Tích Theo Nhóm Chức Năng
- **Quản lý người dùng:** Đăng ký, đăng nhập, phân quyền, cập nhật thông tin, xóa tài khoản.
- **Quản lý phương tiện:** Thêm, sửa, xóa, xem thông tin phương tiện.
- **Quản lý chi phí:** Thêm, sửa, xóa, thống kê chi phí.
- **Quản lý địa điểm:** Thêm, sửa, xóa, xem địa điểm liên quan.
- **Quản lý ghi chú:** Thêm, sửa, xóa, xem ghi chú cá nhân.
- **Quản lý đánh giá:** Thêm, sửa, xóa, xem đánh giá.

## 5. Luồng Hoạt Động Các Chức Năng
- Người dùng thao tác trên giao diện (views) → Gửi request đến route tương ứng → Middleware kiểm tra/xác thực → Controller xử lý logic → Model truy xuất dữ liệu → Trả kết quả về View hoặc JSON.

## 6. Công Nghệ & Công Cụ Sử Dụng
- **Node.js, Express:** Xây dựng backend, API.
- **EJS:** Render giao diện động phía server.
- **MySQL/MongoDB (tùy cấu hình):** Lưu trữ dữ liệu.
- **bcrypt:** Mã hóa mật khẩu.
- **multer:** Upload file (ảnh phương tiện).
- **JWT/cookie-session:** Xác thực người dùng.
- **Các thư viện khác:** body-parser, dotenv, ...

## 7. Các Bước Xây Dựng Chức Năng Hiện Tại
1. Thiết kế database, tạo model tương ứng.
2. Xây dựng controller xử lý logic nghiệp vụ.
3. Định nghĩa route cho từng chức năng.
4. Tạo view (EJS) cho từng trang giao diện.
5. Kết nối các thành phần (route → controller → model → view).
6. Thêm middleware xác thực, phân quyền nếu cần.
7. Kiểm thử chức năng, hoàn thiện giao diện.

## 8. Phân Tích Chi Tiết Công Dụng Từng File

### 8.1. File Root Folder
| File | Công Dụng |
|------|-----------|
| `index.js` | Điểm khởi động ứng dụng, cấu hình Express server, định nghĩa các middleware toàn cục, kết nối routes. |
| `auth.js` | Cấu hình chiến lược xác thực (nếu có), hoặc hàm helper xác thực. |
| `constants.js` | Định nghĩa các hằng số, cấu hình tĩnh của ứng dụng. |
| `package.json` | Quản lý phụ thuộc, metadata dự án, các script npm. |

### 8.2. Folder: config/
| File | Công Dụng |
|------|-----------|
| `database.js` | Cấu hình kết nối database (MySQL, MongoDB, ...), tạo pool kết nối hoặc ORM instance. |
| `multer.js` | Cấu hình middleware upload file, định nghĩa thư mục lưu trữ, giới hạn kích thước file, loại file cho phép. |

### 8.3. Folder: controllers/
| File | Công Dụng |
|------|-----------|
| `AuthController.js` | Xử lý logic đăng ký, đăng nhập, đăng xuất, xác thực người dùng, refresh token. |
| `UserController.js` | CRUD người dùng, cập nhật thông tin cá nhân, quản lý quyền hạn, xóa tài khoản. |
| `VehicleController.js` | CRUD phương tiện, xem danh sách phương tiện, lấy thông tin chi tiết phương tiện. |
| `CostController.js` | CRUD chi phí, thống kê chi phí, lọc chi phí theo tiêu chí, tính toán chi phí. |
| `LocationController.js` | CRUD địa điểm, xem danh sách địa điểm, lấy thông tin địa điểm. |
| `NoteController.js` | CRUD ghi chú cá nhân, tìm kiếm ghi chú, phân loại ghi chú. |
| `ReviewController.js` | CRUD đánh giá, lấy danh sách đánh giá, tính điểm trung bình. |
| `DashboardController.js` | Lấy dữ liệu tổng hợp, thống kê tổng quan, tính toán KPI cho dashboard. |

### 8.4. Folder: models/
| File | Công Dụng |
|------|-----------|
| `BaseModel.js` | Class cơ sở, chứa các method CRUD chung (create, read, update, delete, find), kế thừa từ đây cho các model khác. |
| `UserModel.js` | Định nghĩa schema/table User, các method liên quan người dùng (findByEmail, validatePassword, ...). |
| `VehicleModel.js` | Định nghĩa schema/table Vehicle, các method liên quan phương tiện (findByUser, getDetails, ...). |
| `CostModel.js` | Định nghĩa schema/table Cost, các method liên quan chi phí (findByVehicle, sumByMonth, ...). |
| `LocationModel.js` | Định nghĩa schema/table Location, các method liên quan địa điểm (findByVehicle, ...). |
| `NoteModel.js` | Định nghĩa schema/table Note, các method liên quan ghi chú (findByUser, search, ...). |
| `ReviewModel.js` | Định nghĩa schema/table Review, các method liên quan đánh giá (findByUser, getAverage, ...). |
| `MaintenanceModel.js` | Định nghĩa schema/table Maintenance (nếu có), các method liên quan bảo trì phương tiện. |

### 8.5. Folder: routes/
| File | Công Dụng |
|------|-----------|
| `auth.js` | Định nghĩa endpoint: POST /register, POST /login, POST /logout, xác thực đầu vào. |
| `users.js` | Định nghĩa endpoint: GET /users, GET /users/:id, PUT /users/:id, DELETE /users/:id, quản lý người dùng. |
| `vehicles.js` | Định nghĩa endpoint: GET /vehicles, POST /vehicles, PUT /vehicles/:id, DELETE /vehicles/:id, quản lý phương tiện. |
| `costs.js` | Định nghĩa endpoint: GET /costs, POST /costs, PUT /costs/:id, DELETE /costs/:id, thống kê chi phí. |
| `locations.js` | Định nghĩa endpoint: GET /locations, POST /locations, PUT /locations/:id, DELETE /locations/:id, quản lý địa điểm. |
| `notes.js` | Định nghĩa endpoint: GET /notes, POST /notes, PUT /notes/:id, DELETE /notes/:id, quản lý ghi chú. |
| `reviews.js` | Định nghĩa endpoint: GET /reviews, POST /reviews, PUT /reviews/:id, DELETE /reviews/:id, quản lý đánh giá. |

### 8.6. Folder: middleware/
| File | Công Dụng |
|------|-----------|
| `auth.js` | Middleware kiểm tra token/session, xác thực người dùng, phân quyền truy cập, xử lý lỗi xác thực. |

### 8.7. Folder: views/
| File | Công Dụng |
|------|-----------|
| `trangchu.ejs` | Trang chủ, dashboard tổng quan, hiển thị thông tin tóm tắt. |
| `dangky.ejs` | Form đăng ký tài khoản mới. |
| `dangnhap.ejs` | Form đăng nhập hệ thống. |
| `quanlynguoidung.ejs` | Danh sách người dùng, CRUD người dùng. |
| `thongtinnguoidung.ejs` | Xem/sửa thông tin chi tiết người dùng. |
| `quanlyphuongtien.ejs` | Danh sách phương tiện, CRUD phương tiện. |
| `thongtinphuongtien.ejs` | Xem/sửa thông tin chi tiết phương tiện. |
| `danhsachichiphi.ejs` | Danh sách chi phí, CRUD chi phí. |
| `thongkechiphi.ejs` | Thống kê, biểu đồ chi phí. |
| `quanlydiadiem.ejs` | Danh sách địa điểm, CRUD địa điểm. |
| `themdiadiem.ejs` | Form thêm địa điểm mới. |
| `quanlyghichu.ejs` | Danh sách ghi chú, CRUD ghi chú. |
| `ghichucanhan.ejs` | Ghi chú cá nhân, xem/sửa chi tiết. |
| `quanlythongke.ejs` | Trang thống kê tổng hợp, báo cáo. |
| `formthem.ejs` | Form thêm mục mới (có thể dùng chung cho nhiều trang). |
| `loi.ejs` | Trang lỗi, hiển thị thông báo lỗi. |

### 8.8. Folder: public/
| File/Folder | Công Dụng |
|------|-----------|
| `test_api.html` | File HTML để kiểm thử API (có thể dùng để test endpoint trong quá trình phát triển). |
| `images/` | Thư mục lưu trữ ảnh tĩnh (logo, icon, ...), và ảnh upload từ người dùng. |

---

## 9. Sơ Đồ Mối Quan Hệ Giữa Các Thành Phần

```
┌─────────────────────────────────────────────────────────┐
│           Client (Trình duyệt Web)                      │
│  (views: .ejs files, images, static resources)          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP Request
                      ▼
┌─────────────────────────────────────────────────────────┐
│         Server (Node.js / Express)                       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ index.js (Khởi động, cấu hình middleware)        │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Middleware (auth.js): xác thực, phân quyền       │  │
│  └──────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes (auth.js, users.js, vehicles.js, ...)     │  │
│  │   ↓                                               │  │
│  │ Controllers (AuthController, UserController, ...) │  │
│  │   ↓                                               │  │
│  │ Models (BaseModel, UserModel, VehicleModel, ...)│  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────┬───────────────────────────────────┘
                      │ Query/Execute
                      ▼
┌─────────────────────────────────────────────────────────┐
│  Database (MySQL / MongoDB)                              │
│  (Bảng: users, vehicles, costs, locations, notes,       │
│   reviews, maintenance, ...)                             │
└─────────────────────────────────────────────────────────┘
```

---

*File này tổng hợp phân tích chi tiết hệ thống dự án myCARe, giúp định hướng phát triển và bảo trì hệ thống.*
