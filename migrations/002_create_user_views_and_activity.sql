CREATE TABLE IF NOT EXISTS user_views (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NULL,
  article_id VARCHAR(255) NOT NULL,
  viewed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (article_id),
  INDEX (viewed_at)
);

CREATE TABLE IF NOT EXISTS user_activity (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(100) NOT NULL,
  activity_type VARCHAR(50) NOT NULL,
  payload JSON NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX (user_id),
  INDEX (activity_type)
);
