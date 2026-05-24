const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

const generateToken = (user) =>
  jwt.sign(
    { id: user.id, nome: user.nome, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

const authController = {
  async register(req, res) {
    try {
      const { nome, email, senha } = req.body;

      if (!nome || !email || !senha) {
        return res.status(400).json({ message: 'Nome, email e senha são obrigatórios.' });
      }

      if (senha.length < 6) {
        return res.status(400).json({ message: 'A senha deve ter no mínimo 6 caracteres.' });
      }

      const existing = await userModel.findByEmail(email);
      if (existing) {
        return res.status(409).json({ message: 'Este email já está cadastrado.' });
      }

      const senhaHash = await bcrypt.hash(senha, 10);
      const userId = await userModel.create(nome, email, senhaHash);
      const user = await userModel.findById(userId);
      const token = generateToken({ id: userId, nome, email });

      res.status(201).json({
        message: 'Usuário cadastrado com sucesso.',
        token,
        user,
      });
    } catch (error) {
      console.error('Erro no registro:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  async login(req, res) {
    try {
      const { email, senha } = req.body;

      if (!email || !senha) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios.' });
      }

      const user = await userModel.findByEmail(email);
      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const senhaValida = await bcrypt.compare(senha, user.senha);
      if (!senhaValida) {
        return res.status(401).json({ message: 'Credenciais inválidas.' });
      }

      const token = generateToken(user);
      const { senha: _, ...userSafe } = user;

      res.json({
        message: 'Login realizado com sucesso.',
        token,
        user: userSafe,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },

  async me(req, res) {
    try {
      const user = await userModel.findById(req.userId);
      if (!user) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
      }
      res.json({ user });
    } catch (error) {
      console.error('Erro ao buscar usuário:', error);
      res.status(500).json({ message: 'Erro interno do servidor.' });
    }
  },
};

module.exports = authController;
