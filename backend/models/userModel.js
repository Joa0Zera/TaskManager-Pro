const pool = require('../config/db');

const userModel = {
  async findByEmail(email) {
    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  },

  async findById(id) {
    const [rows] = await pool.execute(
      'SELECT id, nome, email, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  },

  async create(nome, email, senhaHash) {
    const [result] = await pool.execute(
      'INSERT INTO users (nome, email, senha) VALUES (?, ?, ?)',
      [nome, email, senhaHash]
    );
    return result.insertId;
  },
};

module.exports = userModel;
