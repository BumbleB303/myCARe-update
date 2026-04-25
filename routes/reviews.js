const express = require('express');
const router = express.Router();
const ReviewController = require('../controllers/ReviewController');
const { isAuthenticated } = require('../middleware/auth');

module.exports = (db) => {
  const reviewController = new ReviewController(db);

  router.get('/danhgia/:type/:gid', (req, res) => reviewController.getReviewsByLocation(req, res));
  router.post('/danhgia', isAuthenticated, (req, res) => reviewController.createReview(req, res));

  return router;
};