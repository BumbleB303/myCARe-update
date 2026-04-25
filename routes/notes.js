const express = require('express');
const router = express.Router();
const NoteController = require('../controllers/NoteController');
const { isAuthenticated, isAdmin } = require('../middleware/auth');

module.exports = (db) => {
  const noteController = new NoteController(db);

  router.get('/ghichucanhan', isAuthenticated, (req, res) => noteController.renderIndex(req, res));
  
  // API Ghi chú
  router.get('/api/ghichucanhan', isAuthenticated, (req, res) => noteController.getAll(req, res));
  router.post('/api/ghichucanhan', isAuthenticated, (req, res) => noteController.create(req, res));
  router.put('/api/ghichucanhan/:id', isAuthenticated, (req, res) => noteController.update(req, res));
  router.delete('/api/ghichucanhan/:id', isAuthenticated, (req, res) => noteController.delete(req, res));

  // Admin xem ghi chú
  router.get('/quanly/ghichu/:id', isAdmin, (req, res) => noteController.adminRender(req, res));

  return router;
};