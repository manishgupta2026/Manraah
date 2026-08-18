-- ============================================================
-- Migration 002: Categories and Questions Schema
-- ============================================================

CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(100) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id INT PRIMARY KEY,
    key VARCHAR(100) NOT NULL,
    text TEXT NOT NULL,
    description TEXT,
    category VARCHAR(100) REFERENCES categories(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL DEFAULT 'category',
    options JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
