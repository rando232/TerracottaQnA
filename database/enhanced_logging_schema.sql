-- Enhanced Search Logging Schema
-- Add additional tables for comprehensive IR evaluation

USE terracotta_qna;

-- Drop and recreate search_logs with enhanced fields
DROP TABLE IF EXISTS search_logs;
CREATE TABLE search_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    query VARCHAR(500) NOT NULL,
    query_tokens JSON,  -- Processed query terms
    corrections JSON,  -- Spell corrections applied
    results_returned JSON,  -- Array of document IDs returned
    result_count INT DEFAULT 0,
    clicked_document_id INT,
    click_position INT,  -- Position in results (1-based)
    time_to_click_ms INT,  -- Time from search to click
    response_time_ms FLOAT,  -- Query processing time
    session_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (clicked_document_id) REFERENCES documents(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_query (query),
    INDEX idx_created (created_at),
    INDEX idx_session (session_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Relevance Judgments for IR Evaluation
CREATE TABLE IF NOT EXISTS relevance_judgments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query VARCHAR(500) NOT NULL,
    document_id INT NOT NULL,
    relevance_score INT NOT NULL,  -- 0=irrelevant, 1=marginal, 2=relevant, 3=highly relevant, 4=perfect
    judge_user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (document_id) REFERENCES documents(id) ON DELETE CASCADE,
    FOREIGN KEY (judge_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_query (query),
    INDEX idx_document (document_id),
    UNIQUE KEY unique_judgment (query, document_id, judge_user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A/B Testing Experiments
CREATE TABLE IF NOT EXISTS ab_experiments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'completed', 'paused') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- A/B Test Results
CREATE TABLE IF NOT EXISTS ab_test_results (
    id INT AUTO_INCREMENT PRIMARY KEY,
    experiment_id INT NOT NULL,
    user_id INT,
    variant VARCHAR(50) NOT NULL,  -- 'control', 'variant_a', 'variant_b', etc.
    metric_value FLOAT NOT NULL,  -- MRR, CTR, NDCG, etc.
    metadata JSON,  -- Additional context
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (experiment_id) REFERENCES ab_experiments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_experiment (experiment_id),
    INDEX idx_variant (variant)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Query Cache for Performance
CREATE TABLE IF NOT EXISTS query_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    query_hash VARCHAR(64) NOT NULL UNIQUE,  -- MD5/SHA256 of query
    query TEXT NOT NULL,
    results JSON NOT NULL,  -- Cached search results
    hit_count INT DEFAULT 1,
    last_accessed TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_hash (query_hash),
    INDEX idx_accessed (last_accessed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Index Performance Metrics
CREATE TABLE IF NOT EXISTS index_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    metric_name VARCHAR(100) NOT NULL,
    metric_value FLOAT NOT NULL,
    metadata JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_name (metric_name),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SHOW TABLES;
