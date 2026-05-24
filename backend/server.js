const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3001',
].filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
  res.json({
    name: 'TaskManager Pro API',
    version: '1.0.0',
    status: 'online',
  });
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' });
});

app.use((err, _req, res, _next) => {
  console.error('Erro não tratado:', err);
  res.status(500).json({ message: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`TaskManager Pro API rodando na porta ${PORT}`);
});
