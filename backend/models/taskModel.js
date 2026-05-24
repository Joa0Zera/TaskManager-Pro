const pool = require('../config/db');

const taskModel = {
  async findAllByUser(userId, filters = {}) {
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    const params = [userId];

    if (filters.prioridade) {
      query += ' AND prioridade = ?';
      params.push(filters.prioridade);
    }
    if (filters.categoria) {
      query += ' AND categoria = ?';
      params.push(filters.categoria);
    }
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters.search) {
      query += ' AND (titulo LIKE ? OR descricao LIKE ?)';
      const term = `%${filters.search}%`;
      params.push(term, term);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await pool.execute(query, params);
    return rows;
  },

  async findById(id, userId) {
    const [rows] = await pool.execute(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return rows[0] || null;
  },

  async create(data) {
    const { titulo, descricao, prioridade, categoria, status, user_id } = data;
    const [result] = await pool.execute(
      `INSERT INTO tasks (titulo, descricao, prioridade, categoria, status, user_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [titulo, descricao || '', prioridade, categoria, status, user_id]
    );
    return result.insertId;
  },

  async update(id, userId, data) {
    const { titulo, descricao, prioridade, categoria, status } = data;
    const [result] = await pool.execute(
      `UPDATE tasks SET titulo = ?, descricao = ?, prioridade = ?, categoria = ?, status = ?
       WHERE id = ? AND user_id = ?`,
      [titulo, descricao || '', prioridade, categoria, status, id, userId]
    );
    return result.affectedRows > 0;
  },

  async delete(id, userId) {
    const [result] = await pool.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  },

  async getStats(userId) {
    const [rows] = await pool.execute(
      `SELECT
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'pendente' THEN 1 ELSE 0 END) AS pendentes,
        SUM(CASE WHEN status = 'concluida' THEN 1 ELSE 0 END) AS concluidas,
        SUM(CASE WHEN status = 'em_andamento' THEN 1 ELSE 0 END) AS em_andamento
       FROM tasks WHERE user_id = ?`,
      [userId]
    );
    const stats = rows[0];
    const total = Number(stats.total) || 0;
    const concluidas = Number(stats.concluidas) || 0;
    const produtividade = total > 0 ? Math.round((concluidas / total) * 100) : 0;

    return {
      total,
      pendentes: Number(stats.pendentes) || 0,
      concluidas,
      em_andamento: Number(stats.em_andamento) || 0,
      produtividade,
    };
  },
};

module.exports = taskModel;
