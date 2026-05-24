const taskModel = require('../models/taskModel');

const VALID_PRIORIDADES = ['baixa', 'media', 'alta'];
const VALID_CATEGORIAS = ['trabalho', 'estudos', 'pessoal'];
const VALID_STATUS = ['pendente', 'em_andamento', 'concluida'];

const taskController = {
  async getAll(req, res) {
    try {
      const filters = {
        prioridade: req.query.prioridade || null,
        categoria: req.query.categoria || null,
        status: req.query.status || null,
        search: req.query.search || null,
      };

      const tasks = await taskModel.findAllByUser(req.userId, filters);
      const stats = await taskModel.getStats(req.userId);

      res.json({ tasks, stats });
    } catch (error) {
      console.error('Erro ao listar tarefas:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  async create(req, res) {
    try {
      const { titulo, descricao, prioridade, categoria, status } = req.body;

      if (!titulo) {
        return res.status(400).json({ message: 'O título é obrigatório.' });
      }

      if (prioridade && !VALID_PRIORIDADES.includes(prioridade)) {
        return res.status(400).json({ message: 'Prioridade inválida.' });
      }
      if (categoria && !VALID_CATEGORIAS.includes(categoria)) {
        return res.status(400).json({ message: 'Categoria inválida.' });
      }
      if (status && !VALID_STATUS.includes(status)) {
        return res.status(400).json({ message: 'Status inválido.' });
      }

      const id = await taskModel.create({
        titulo,
        descricao,
        prioridade: prioridade || 'media',
        categoria: categoria || 'pessoal',
        status: status || 'pendente',
        user_id: req.userId,
      });

      const task = await taskModel.findById(id, req.userId);
      res.status(201).json({ message: 'Tarefa criada com sucesso.', task });
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const { titulo, descricao, prioridade, categoria, status } = req.body;

      const existing = await taskModel.findById(id, req.userId);
      if (!existing) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      if (prioridade && !VALID_PRIORIDADES.includes(prioridade)) {
        return res.status(400).json({ message: 'Prioridade inválida.' });
      }
      if (categoria && !VALID_CATEGORIAS.includes(categoria)) {
        return res.status(400).json({ message: 'Categoria inválida.' });
      }
      if (status && !VALID_STATUS.includes(status)) {
        return res.status(400).json({ message: 'Status inválido.' });
      }

      await taskModel.update(id, req.userId, {
        titulo: titulo ?? existing.titulo,
        descricao: descricao ?? existing.descricao,
        prioridade: prioridade ?? existing.prioridade,
        categoria: categoria ?? existing.categoria,
        status: status ?? existing.status,
      });

      const task = await taskModel.findById(id, req.userId);
      res.json({ message: 'Tarefa atualizada com sucesso.', task });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;
      const deleted = await taskModel.delete(id, req.userId);

      if (!deleted) {
        return res.status(404).json({ message: 'Tarefa não encontrada.' });
      }

      res.json({ message: 'Tarefa excluída com sucesso.' });
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },
};

module.exports = taskController;
