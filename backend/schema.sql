CREATE DATABASE IF NOT EXISTS mahamanews;
USE mahamanews;

-- Core User and Auth Tables
CREATE TABLE IF NOT EXISTS `users` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `avatar` varchar(255) DEFAULT NULL,
  `bio` text,
  `socials` json DEFAULT NULL,
  `role` enum('user','sub-admin','admin') NOT NULL DEFAULT 'user',
  `subscription` enum('free','standard','premium','pro') NOT NULL DEFAULT 'free',
  `two_factor_enabled` tinyint(1) NOT NULL DEFAULT '0',
  `password_reset_token` varchar(255) DEFAULT NULL,
  `password_reset_expires` datetime DEFAULT NULL,
  `stripe_customer_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_id` varchar(255) DEFAULT NULL,
  `stripe_subscription_status` varchar(50) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `user_settings` (
  `user_id` varchar(255) NOT NULL,
  `theme_name` varchar(50) DEFAULT 'default',
  `theme_accent` varchar(50) DEFAULT 'yellow',
  `font_family` varchar(100) DEFAULT 'Inter',
  `font_weight` varchar(10) DEFAULT '400',
  `homepage_layout` varchar(50) DEFAULT 'grid',
  `content_density` varchar(50) DEFAULT 'comfortable',
  `infinite_scroll` tinyint(1) DEFAULT '0',
  `card_style` varchar(50) DEFAULT 'standard',
  `border_radius` varchar(50) DEFAULT 'rounded',
  `auto_play_audio` tinyint(1) DEFAULT '0',
  `default_summary_view` tinyint(1) DEFAULT '0',
  `line_height` float DEFAULT '1.6',
  `letter_spacing` float DEFAULT '0',
  `justify_text` tinyint(1) DEFAULT '0',
  `notifications_breaking_news` tinyint(1) DEFAULT '1',
  `notifications_weekly_digest` tinyint(1) DEFAULT '1',
  `notifications_special_offers` tinyint(1) DEFAULT '0',
  `font_size` varchar(20) DEFAULT 'small',
  `high_contrast` tinyint(1) DEFAULT '0',
  `reduce_motion` tinyint(1) DEFAULT '0',
  `dyslexia_font` tinyint(1) DEFAULT '0',
  `data_sharing` tinyint(1) DEFAULT '1',
  `ad_personalization` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Content Tables
CREATE TABLE IF NOT EXISTS `articles` (
  `id` varchar(255) NOT NULL,
  `title` varchar(255) NOT NULL,
  `description` text,
  `body` longtext,
  `author` varchar(255) DEFAULT NULL,
  `published_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `source_name` varchar(255) DEFAULT NULL,
  `url_to_image` varchar(1024) DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `tags` json DEFAULT NULL,
  `gallery_images` json DEFAULT NULL,
  `scheduled_for` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` varchar(255) NOT NULL,
  `article_id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `body` text NOT NULL,
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `ads` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `headline` varchar(255) NOT NULL,
  `url` varchar(1024) NOT NULL,
  `image` varchar(1024) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- User Interaction & Logging Tables
CREATE TABLE IF NOT EXISTS `saved_articles` (
  `user_id` varchar(255) NOT NULL,
  `article_id` varchar(255) NOT NULL,
  `saved_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`, `article_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `search_history` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `query` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `article_views` (
  `id` int NOT NULL AUTO_INCREMENT,
  `article_id` varchar(255) NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `user_agent` text,
  `viewed_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`article_id`) REFERENCES `articles` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `activity_log` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `action_type` varchar(100) NOT NULL,
  `details` json DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `notifications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` varchar(255) NOT NULL,
  `type` enum('alert','feature','update','message') NOT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Site Management Tables
CREATE TABLE IF NOT EXISTS `site_settings` (
  `setting_key` varchar(100) NOT NULL,
  `setting_value` text,
  PRIMARY KEY (`setting_key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `nav_links` (
  `id` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `href` varchar(255) NOT NULL,
  `parent_id` varchar(255) DEFAULT NULL,
  `sort_order` int DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `pages` (
  `slug` varchar(100) NOT NULL,
  `title` varchar(255) NOT NULL,
  `content` longtext,
  `last_updated_by` varchar(255) DEFAULT NULL,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`slug`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Insert default pages if they don't exist
INSERT INTO `pages` (`slug`, `title`, `content`) VALUES
('about-us', 'About Mahama News Hub', '<p>Welcome to Mahama News Hub, your premier source for timely and accurate news. Our mission is to provide insightful and unbiased reporting on the events that shape our world. We believe in the power of information to foster understanding and drive positive change.</p>'),
('contact-us', 'Get in touch with us for any inquiries or feedback.', NULL)
ON DUPLICATE KEY UPDATE slug=slug;


CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `subject` varchar(255) DEFAULT NULL,
  `message` text NOT NULL,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


-- Advanced Features Tables
CREATE TABLE IF NOT EXISTS `api_keys` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `prefix` varchar(8) NOT NULL,
  `key_hash` varchar(255) NOT NULL,
  `last_used` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `prefix` (`prefix`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `job_postings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `type` enum('Full-time','Part-time','Contract') NOT NULL,
  `description` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `job_applications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `job_id` int NOT NULL,
  `user_id` varchar(255) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `resume_path` varchar(255) NOT NULL,
  `cover_letter` text,
  `applied_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`job_id`) REFERENCES `job_postings` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE IF NOT EXISTS `payment_history` (
  `id` varchar(255) NOT NULL,
  `user_id` varchar(255) NOT NULL,
  `date` datetime NOT NULL,
  `plan` varchar(50) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `method` varchar(50) NOT NULL,
  `status` enum('succeeded','pending','failed') NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
