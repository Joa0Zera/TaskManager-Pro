-- TaskManager Pro - Schema do Banco de Dados
-- Execute: mysql -u root -p < database/schema.sql

CREATE DATABASE IF NOT EXISTS taskmanager_pro
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE taskmanager_pro;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  titulo VARCHAR(200) NOT NULL,
  descricao TEXT,
  prioridade ENUM('baixa', 'media', 'alta') NOT NULL DEFAULT 'media',
  categoria ENUM('trabalho', 'estudos', 'pessoal') NOT NULL DEFAULT 'pessoal',
  status ENUM('pendente', 'em_andamento', 'concluida') NOT NULL DEFAULT 'pendente',
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_prioridade (prioridade),
  INDEX idx_categoria (categoria)
);
