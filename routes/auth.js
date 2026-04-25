const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');

module.exports = (db) => {
  const authController = new AuthController(db);

  router.get('/dangnhap', (req, res) => authController.renderLogin(req, res));
  router.post('/login', (req, res) => authController.login(req, res));
  router.get('/dangky', (req, res) => authController.renderRegister(req, res));
  router.post('/dangky', (req, res) => authController.register(req, res));
  router.get('/dangxuat', (req, res) => authController.logout(req, res));

  return router;
};