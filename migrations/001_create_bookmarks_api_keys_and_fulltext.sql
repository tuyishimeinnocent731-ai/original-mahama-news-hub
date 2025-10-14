-- Run this against your MySQL database
-- Creates bookmarks and api_keys tables and suggests adding FULLTEXT index for articles

CREATE TABLE IF NOT EXISTS bookmarks (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  article_id VARCHAR(100) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (article_id)
);

CREATE TABLE IF NOT EXISTS api_keys (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  api_key VARCHAR(255) NOT NULL UNIQUE,
  active TINYINT(1) DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Optional: add FULLTEXT index on articles for better search (requires ENGINE=InnoDB or MyISAM)
-- Adjust `articles` table name/columns if different in your schema.
ALTER TABLE articles
  ADD FULLTEXT IF NOT EXISTS idx_fulltext_title_description_body (title, description, body);
