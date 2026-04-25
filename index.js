require('dotenv').config();
const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");

// Import Config & Middleware
const db = require("./config/database");
const { upload } = require("./config/multer");
const { isAuthenticated, isAdmin } = require("./middleware/auth");

// Import Controllers cho trang chủ
const DashboardController = require("./controllers/DashboardController");
const AdminController = require("./controllers/AdminController");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(session({
  secret: process.env.SESSION_SECRET || "fallback_secret",
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

// Import Routers
const authRouter = require("./routes/auth")(db);
const locationRouter = require("./routes/locations")(db, upload);
const userRouter = require("./routes/users")(db);
const noteRouter = require("./routes/notes")(db);
const vehicleRouter = require("./routes/vehicles")(db, upload);
const costRouter = require("./routes/costs")(db);
const reviewRouter = require("./routes/reviews")(db);

// Trang chủ
const dashboardController = new DashboardController(db);
app.get("/", (req, res) => dashboardController.renderHome(req, res));

app.use("/", authRouter);
app.use("/", userRouter);
app.use("/", noteRouter);
app.use("/", locationRouter);
app.use("/", vehicleRouter); 
app.use("/", costRouter);    
app.use("/", reviewRouter);  

// Quản lý (Admin Dashboard)
const adminController = new AdminController(db);
app.get("/quanly", isAdmin, (req, res) => adminController.index(req, res));

app.listen(PORT, () => console.log(`Server chạy tại http://localhost:${PORT}`));