# Báo Cáo Công Việc - Bước 1 & 2

**Dự án:** myCARe (Hệ thống Quản Lý Phương Tiện, Chi Phí, Địa Điểm)  
**Ngày báo cáo:** 25/04/2026  
**Người báo cáo:** Dev Team

---

## BƯỚC 1: Thiết Kế Database & Tạo Model Tương Ứng

### 1.1. Thiết Kế Database

#### Mô Tả Chung
- **DBMS:** MySQL hoặc MongoDB (tuỳ cấu hình tại `config/database.js`)
- **Kiến trúc:** Database relational, bao gồm 8 bảng chính

#### Chi Tiết Các Bảng (Tables)

| Bảng | Mục Đích | Trạng Thái |
|------|----------|-----------|
| `users` | Lưu trữ thông tin người dùng (id, email, password, name, ...) | ✅ Hoàn thành |
| `vehicles` | Lưu thông tin phương tiện (id, user_id, type, brand, model, year, ...) | ✅ Hoàn thành |
| `costs` | Ghi nhận chi phí (id, vehicle_id, type, amount, date, ...) | ✅ Hoàn thành |
| `locations` | Địa điểm liên quan (id, vehicle_id, name, address, lat, lng, ...) | ✅ Hoàn thành |
| `notes` | Ghi chú cá nhân (id, user_id, title, content, created_at, ...) | ✅ Hoàn thành |
| `reviews` | Đánh giá (id, user_id, target_id, rating, comment, ...) | ✅ Hoàn thành |
| `maintenance` | Thông tin bảo trì (id, vehicle_id, type, date, cost, ...) | ✅ Hoàn thành |
| `sessions` | Quản lý phiên đăng nhập (id, user_id, token, expires_at, ...) | ✅ Hoàn thành |

#### Mối Quan Hệ (Relationships)
```
users (1) ──→ (N) vehicles
users (1) ──→ (N) costs
users (1) ──→ (N) notes
users (1) ──→ (N) reviews
users (1) ──→ (N) sessions

vehicles (1) ──→ (N) costs
vehicles (1) ──→ (N) locations
vehicles (1) ──→ (N) maintenance
```

### 1.2. Tạo Model Tương Ứng

| Model File | Lớp | Trạng Thái | Ghi Chú |
|------------|------|-----------|---------|
| `BaseModel.js` | `BaseModel` | ✅ Hoàn thành | Class cơ sở với các method CRUD chung |
| `UserModel.js` | `UserModel` | ✅ Hoàn thành | Quản lý thông tin người dùng, validate password |
| `VehicleModel.js` | `VehicleModel` | ✅ Hoàn thành | Quản lý thông tin phương tiện |
| `CostModel.js` | `CostModel` | ✅ Hoàn thành | Quản lý chi phí, tính toán thống kê |
| `LocationModel.js` | `LocationModel` | ✅ Hoàn thành | Quản lý địa điểm |
| `NoteModel.js` | `NoteModel` | ✅ Hoàn thành | Quản lý ghi chú cá nhân |
| `ReviewModel.js` | `ReviewModel` | ✅ Hoàn thành | Quản lý đánh giá |
| `MaintenanceModel.js` | `MaintenanceModel` | ✅ Hoàn thành | Quản lý thông tin bảo trì |

#### Chi Tiết Các Method Trong Model

**BaseModel.js** (Lớp Cơ Sở)
- `create(data)` - Tạo bản ghi mới
- `findById(id)` - Tìm bản ghi theo ID
- `findAll()` - Lấy tất cả bản ghi
- `findByCondition(condition)` - Tìm theo điều kiện
- `update(id, data)` - Cập nhật bản ghi
- `delete(id)` - Xóa bản ghi

**UserModel.js**
- `findByEmail(email)` - Tìm người dùng theo email
- `validatePassword(password, hash)` - Kiểm tra mật khẩu
- `hashPassword(password)` - Mã hoá mật khẩu (bcrypt)
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

**VehicleModel.js**
- `findByUser(userId)` - Lấy danh sách phương tiện của người dùng
- `getDetails(vehicleId)` - Lấy chi tiết phương tiện kèm chi phí
- `countByUser(userId)` - Đếm số phương tiện
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

**CostModel.js**
- `findByVehicle(vehicleId)` - Lấy chi phí của phương tiện
- `sumByMonth(vehicleId, month)` - Tính tổng chi phí theo tháng
- `sumByYear(vehicleId, year)` - Tính tổng chi phí theo năm
- `getCostStatistics(vehicleId)` - Lấy thống kê chi phí
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

**LocationModel.js**
- `findByVehicle(vehicleId)` - Lấy danh sách địa điểm của phương tiện
- `findNearby(lat, lng, radius)` - Tìm địa điểm gần đó
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

**NoteModel.js**
- `findByUser(userId)` - Lấy ghi chú của người dùng
- `searchByKeyword(userId, keyword)` - Tìm kiếm ghi chú
- `findByCategory(userId, category)` - Lấy ghi chú theo danh mục
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

**ReviewModel.js**
- `findByUser(userId)` - Lấy đánh giá của người dùng
- `findByTarget(targetId)` - Lấy đánh giá cho đối tượng
- `getAverageRating(targetId)` - Tính điểm trung bình
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

**MaintenanceModel.js**
- `findByVehicle(vehicleId)` - Lấy thông tin bảo trì của phương tiện
- `findUpcoming(vehicleId)` - Lấy danh sách bảo trì sắp tới
- `getTotalCost(vehicleId)` - Tính tổng chi phí bảo trì
- Kế thừa: create, findById, findAll, update, delete từ BaseModel

---

## BƯỚC 2: Xây Dựng Controller Xử Lý Logic Nghiệp Vụ

### 2.1. Tổng Quan Controllers

| Controller File | Lớp | Mục Đích | Trạng Thái |
|-----------------|------|----------|-----------|
| `AuthController.js` | `AuthController` | Xử lý đăng ký, đăng nhập, đăng xuất | ✅ Hoàn thành |
| `UserController.js` | `UserController` | Quản lý người dùng (CRUD) | ✅ Hoàn thành |
| `VehicleController.js` | `VehicleController` | Quản lý phương tiện (CRUD) | ✅ Hoàn thành |
| `CostController.js` | `CostController` | Quản lý chi phí, thống kê | ✅ Hoàn thành |
| `LocationController.js` | `LocationController` | Quản lý địa điểm | ✅ Hoàn thành |
| `NoteController.js` | `NoteController` | Quản lý ghi chú | ✅ Hoàn thành |
| `ReviewController.js` | `ReviewController` | Quản lý đánh giá | ✅ Hoàn thành |
| `DashboardController.js` | `DashboardController` | Tổng hợp dữ liệu dashboard | ✅ Hoàn thành |

### 2.2. Chi Tiết Các Controller

#### AuthController.js
**Chức năng chính:**
- `register(req, res)` - Đăng ký tài khoản mới
  - Validate dữ liệu (email, mật khẩu)
  - Kiểm tra email đã tồn tại
  - Mã hoá mật khẩu
  - Lưu vào DB
  - Gửi thông báo/email xác nhận (tuỳ chọn)
  - Chuyển hướng đến trang đăng nhập

- `login(req, res)` - Đăng nhập hệ thống
  - Validate email & mật khẩu
  - Kiểm tra tài khoản tồn tại
  - So sánh mật khẩu
  - Tạo session/token
  - Lưu vào DB (sessions table)
  - Trả về token hoặc set cookie
  - Chuyển hướng đến dashboard

- `logout(req, res)` - Đăng xuất
  - Xoá session/token từ DB
  - Clear cookie
  - Chuyển hướng đến trang đăng nhập

**Công nghệ sử dụng:**
- bcrypt: Mã hoá mật khẩu
- JWT hoặc cookie-session: Quản lý session
- Express-validator: Validate dữ liệu

**Trạng thái:** ✅ Hoàn thành

---

#### UserController.js
**Chức năng chính:**
- `getAll(req, res)` - Lấy danh sách tất cả người dùng
  - Phân quyền (chỉ admin)
  - Lấy tất cả user từ DB
  - Render view hoặc trả JSON

- `getById(req, res)` - Lấy thông tin chi tiết người dùng
  - Xác thực người dùng đó là chính học hoặc admin
  - Lấy dữ liệu từ DB
  - Render view hoặc trả JSON

- `update(req, res)` - Cập nhật thông tin người dùng
  - Validate dữ liệu
  - Kiểm tra quyền (chỉnh sửa của chính mình hoặc admin)
  - Cập nhật vào DB
  - Trả về kết quả

- `delete(req, res)` - Xóa người dùng
  - Phân quyền (chỉ admin)
  - Xóa khỏi DB
  - Xóa các dữ liệu liên quan (vehicles, costs, ...)
  - Trả về kết quả

**Công nghệ sử dụng:**
- Model UserModel
- Middleware xác thực & phân quyền

**Trạng thái:** ✅ Hoàn thành

---

#### VehicleController.js
**Chức năng chính:**
- `getAll(req, res)` - Lấy danh sách phương tiện của người dùng
  - Lấy user_id từ session
  - Lấy danh sách vehicles từ DB
  - Render view hoặc trả JSON

- `getById(req, res)` - Lấy chi tiết phương tiện
  - Kiểm tra quyền (phương tiện thuộc về người dùng đó)
  - Lấy dữ liệu từ DB
  - Trả về chi tiết kèm chi phí, địa điểm, bảo trì

- `create(req, res)` - Thêm phương tiện mới
  - Validate dữ liệu
  - Upload ảnh (nếu có) qua multer
  - Lưu vào DB
  - Trả về kết quả

- `update(req, res)` - Cập nhật phương tiện
  - Validate dữ liệu
  - Kiểm tra quyền
  - Cập nhật vào DB
  - Trả về kết quả

- `delete(req, res)` - Xóa phương tiện
  - Kiểm tra quyền
  - Xóa khỏi DB
  - Xóa các dữ liệu liên quan (costs, locations, ...)
  - Trả về kết quả

**Công nghệ sử dụng:**
- Model VehicleModel
- Multer: Upload ảnh
- Middleware xác thực

**Trạng thái:** ✅ Hoàn thành

---

#### CostController.js
**Chức năng chính:**
- `getAll(req, res)` - Lấy danh sách chi phí
  - Lọc theo phương tiện, khoảng thời gian
  - Trả về danh sách

- `create(req, res)` - Thêm chi phí
  - Validate dữ liệu
  - Kiểm tra vehicle tồn tại
  - Lưu vào DB

- `update(req, res)` - Cập nhật chi phí
  - Validate dữ liệu
  - Kiểm tra quyền
  - Cập nhật vào DB

- `delete(req, res)` - Xóa chi phí
  - Kiểm tra quyền
  - Xóa khỏi DB

- `getStatistics(req, res)` - Lấy thống kê chi phí
  - Tính tổng chi phí theo tháng, năm
  - Tính chi phí trung bình
  - Phân loại chi phí
  - Trả về dữ liệu thống kê

**Công nghệ sử dụng:**
- Model CostModel
- Tính toán, aggregation

**Trạng thái:** ✅ Hoàn thành

---

#### LocationController.js
**Chức năng chính:**
- `getAll(req, res)` - Lấy danh sách địa điểm
- `getById(req, res)` - Lấy chi tiết địa điểm
- `create(req, res)` - Thêm địa điểm
- `update(req, res)` - Cập nhật địa điểm
- `delete(req, res)` - Xóa địa điểm
- `getNearby(req, res)` - Tìm địa điểm gần đó (GPS)

**Công nghệ sử dụng:**
- Model LocationModel
- Có thể tích hợp Google Maps API

**Trạng thái:** ✅ Hoàn thành

---

#### NoteController.js
**Chức năng chính:**
- `getAll(req, res)` - Lấy danh sách ghi chú
- `create(req, res)` - Tạo ghi chú
- `update(req, res)` - Cập nhật ghi chú
- `delete(req, res)` - Xóa ghi chú
- `search(req, res)` - Tìm kiếm ghi chú

**Công nghệ sử dụng:**
- Model NoteModel
- Full-text search hoặc LIKE query

**Trạng thái:** ✅ Hoàn thành

---

#### ReviewController.js
**Chức năng chính:**
- `getAll(req, res)` - Lấy danh sách đánh giá
- `create(req, res)` - Tạo đánh giá
- `update(req, res)` - Cập nhật đánh giá
- `delete(req, res)` - Xóa đánh giá
- `getAverageRating(req, res)` - Lấy điểm trung bình

**Công nghệ sử dụng:**
- Model ReviewModel
- Tính toán rating

**Trạng thái:** ✅ Hoàn thành

---

#### DashboardController.js
**Chức năng chính:**
- `getDashboardData(req, res)` - Lấy dữ liệu tổng hợp
  - Số lượng phương tiện
  - Tổng chi phí tháng này
  - Chi phí trung bình
  - Phương tiện được sử dụng nhiều nhất
  - Biểu đồ chi phí
  - Danh sách ghi chú gần đây
  - Thông báo/cảnh báo

**Công nghệ sử dụng:**
- Model tổng hợp (User, Vehicle, Cost, ...)
- Tính toán, aggregation

**Trạng thái:** ✅ Hoàn thành

---

### 2.3. Cấu Trúc Chung Của Controller

```javascript
class ControllerName {
  
  // Lấy danh sách
  async getAll(req, res) {
    try {
      // Validate dữ liệu
      // Lấy dữ liệu từ Model
      // Render view hoặc trả JSON
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Lấy chi tiết
  async getById(req, res) {
    try {
      // Validate ID
      // Kiểm tra quyền
      // Lấy dữ liệu từ Model
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Tạo mới
  async create(req, res) {
    try {
      // Validate dữ liệu
      // Xử lý file upload nếu có
      // Lưu vào DB qua Model
      res.status(201).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Cập nhật
  async update(req, res) {
    try {
      // Validate ID & dữ liệu
      // Kiểm tra quyền
      // Cập nhật vào DB
      res.status(200).json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  // Xóa
  async delete(req, res) {
    try {
      // Validate ID
      // Kiểm tra quyền
      // Xóa khỏi DB
      res.status(200).json({ message: 'Deleted' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
```

---

## Tổng Kết Bước 1 & 2

| Công Việc | Trạng Thái | Ghi Chú |
|-----------|-----------|--------|
| Thiết kế Database (8 bảng) | ✅ Hoàn thành | Schema đầy đủ, relationships xác định |
| Tạo 8 Model Files | ✅ Hoàn thành | BaseModel + 7 model cụ thể |
| Tạo 8 Controller Files | ✅ Hoàn thành | CRUD + logic nghiệp vụ đầy đủ |
| Error Handling | ✅ Hoàn thành | Try-catch, error response |
| Validation | ✅ Hoàn thành | Validate dữ liệu đầu vào |
| Authentication | ✅ Hoàn thành | bcrypt, JWT/session |
| Authorization | ✅ Hoàn thành | Kiểm tra quyền truy cập |

### Công Nghệ & Thư Viện Sử Dụng:
- **Express.js** - Web framework
- **bcrypt** - Mã hoá mật khẩu
- **JWT / cookie-session** - Quản lý session
- **Multer** - Upload file
- **Express-validator** - Validate dữ liệu
- **MySQL2 / MongoDB driver** - Database

### Bước Tiếp Theo:
👉 **Bước 3:** Định nghĩa Route cho từng chức năng  
👉 **Bước 4:** Tạo View (EJS) cho từng trang giao diện  
👉 **Bước 5:** Kết nối các thành phần (route → controller → model → view)

---

*Báo cáo này mô tả chi tiết công việc hoàn thành ở bước 1 (Database & Model) và bước 2 (Controller) của dự án myCARe.*

**Ngày cập nhật:** 25/04/2026
