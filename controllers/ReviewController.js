const ReviewModel = require('../models/ReviewModel');

class ReviewController {
  constructor(db) {
    this.reviewModel = new ReviewModel(db);
  }

  async getReviewsByLocation(req, res) {
    try {
      const { type, gid } = req.params;
      const reviews = await this.reviewModel.getByLocation(type, gid);
      res.json(reviews);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi lấy đánh giá: " + err.message });
    }
  }

  async createReview(req, res) {
    try {
      const { placeId, rating, comment } = req.body;
      const user = req.session.user;
      
      if (!user) {
        return res.status(401).json({ error: "Bạn cần đăng nhập để đánh giá" });
      }

      const parts = placeId.split("_");
      if (parts.length !== 2) {
        return res.status(400).json({ error: "ID địa điểm không hợp lệ" });
      }
      
      const type = parts[0];
      const gid = parseInt(parts[1]);

      if (isNaN(gid)) {
        return res.status(400).json({ error: "GID không hợp lệ" });
      }

      const newReview = await this.reviewModel.create(type, {
        gid,
        account_id: user.id,
        rating,
        comment
      });

      res.status(201).json(newReview);
    } catch (err) {
      res.status(500).json({ error: "Lỗi khi gửi đánh giá: " + err.message });
    }
  }
}

module.exports = ReviewController;