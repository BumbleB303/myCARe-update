const NoteModel = require('../models/NoteModel');
const UserModel = require('../models/UserModel'); // Import UserModel ở đây

class NoteController {
  constructor(db) {
    this.noteModel = new NoteModel(db);
  }

  // GET /ghichucanhan
  renderIndex(req, res) {
    res.render('ghichucanhan', { user: req.session.user });
  }

  // API: GET /api/ghichucanhan
  async getAll(req, res) {
    try {
      const targetId = req.params.accountId || req.session.user.id;
      const notes = await this.noteModel.findByAccountId(targetId);
      res.json({ success: true, data: notes });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  // API: POST /api/ghichucanhan
  async create(req, res) {
    const { tieu_de, noi_dung } = req.body;
    try {
      const newNote = await this.noteModel.createNote(req.session.user.id, tieu_de, noi_dung);
      res.json({ success: true, data: newNote });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  // API: PUT /api/ghichucanhan/:id
  async update(req, res) {
    const { id } = req.params;
    const { tieu_de, noi_dung } = req.body;
    try {
      const updatedNote = await this.noteModel.updateNote(id, req.session.user.id, tieu_de, noi_dung);
      res.json({ success: true, data: updatedNote });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  // API: DELETE /api/ghichucanhan/:id
  async delete(req, res) {
    try {
      await this.noteModel.delete(req.params.id);
      res.json({ success: true, message: 'Xóa thành công' });
    } catch (err) {
      res.status(500).json({ success: false, message: 'Lỗi server' });
    }
  }

  // Admin: GET /quanly/ghichu/:id
  async adminRender(req, res) {
    try {
      const userModel = new UserModel(this.noteModel.db);
      const user = await userModel.findById(req.params.id);
      if (!user) return res.status(404).send('Không tìm thấy tài khoản');
      res.render('quanlyghichu', { accountId: req.params.id, accountName: user.tentaikhoan });
    } catch (err) {
      res.status(500).send('Lỗi server');
    }
  }
}

module.exports = NoteController;