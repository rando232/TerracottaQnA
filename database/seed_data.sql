-- Terracotta QnA - Seed Data for Testing
-- Run this after schema.sql to populate the database with sample content

USE terracotta_qna;

-- Insert additional test users
INSERT INTO users (username, email, password_hash, name, bio, role, status) VALUES
('alice_search', 'alice@terracotta.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LE2LJ.xUxN4K', 
 'Alice Johnson', 'Information Retrieval specialist focusing on BM25 and ranking algorithms', 'data_specialist', 'active'),
 
('bob_backend', 'bob@terracotta.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LE2LJ.xUxN4K',
 'Bob Martinez', 'Backend engineer passionate about API design and scalability', 'content_manager', 'active'),
 
('carol_db', 'carol@terracotta.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LE2LJ.xUxN4K',
 'Carol Chen', 'Database expert specializing in MySQL optimization', 'moderator', 'active'),
 
('dave_frontend', 'dave@terracotta.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LE2LJ.xUxN4K',
 'Dave Wilson', 'Frontend developer with a love for clean, responsive interfaces', 'user', 'active'),
 
('eve_devops', 'eve@terracotta.dev', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5LE2LJ.xUxN4K',
 'Eve Thompson', 'DevOps engineer ensuring smooth deployments and infrastructure', 'user', 'active');

-- Note: All test users have the same password: "admin123"

-- Insert sample questions/documents
INSERT INTO documents (title, content, summary, category_id, author_id, status, views_count, vote_count) VALUES
(
    'How does BM25 ranking algorithm work?',
    'I''m trying to understand the BM25 (Best Matching 25) ranking algorithm used in search engines. Can someone explain how it differs from TF-IDF and why it''s considered better for many use cases?\n\nSpecifically, I''m curious about:\n- The role of document length normalization\n- How the k1 and b parameters affect ranking\n- When to use BM25 vs. TF-IDF\n\nAny practical examples would be greatly appreciated!',
    'Question about BM25 ranking algorithm, its parameters, and comparison with TF-IDF',
    1, -- Information Retrieval
    2, -- alice_search
    'published',
    156,
    12
),
(
    'MySQL indexing strategy for full-text search',
    'I have a table with millions of text documents and I need to implement efficient full-text search. I''ve looked at MySQL FULLTEXT indexes but I''m not sure about the best approach.\n\nMy table structure:\n```sql\nCREATE TABLE documents (\n    id INT PRIMARY KEY,\n    title VARCHAR(255),\n    content TEXT,\n    created_at TIMESTAMP\n);\n```\n\nQuestions:\n1. Should I use FULLTEXT index on both title and content?\n2. What about performance with large datasets?\n3. Are there better alternatives (Elasticsearch, etc.)?\n\nCurrent dataset: 5M documents, growing by 100K/month.',
    'Best practices for MySQL full-text search indexing with large datasets',
    2, -- Database Systems
    4, -- carol_db
    'published',
    203,
    18
),
(
    'FastAPI vs Flask: Which is better for REST APIs?',
    'I''m starting a new project and trying to decide between FastAPI and Flask for building a REST API. I''ve used Flask before but I keep hearing great things about FastAPI.\n\nKey requirements:\n- JWT authentication\n- Database integration (PostgreSQL)\n- Auto-generated API documentation\n- Good performance (handling 1000+ req/sec)\n- Easy to test\n\nWhat are your experiences? Is FastAPI really that much better, or is it just hype?',
    'Comparison between FastAPI and Flask for REST API development',
    3, -- Backend Architecture
    3, -- bob_backend
    'published',
    342,
    25
),
(
    'Implementing responsive navigation with Tailwind CSS',
    'I''m building a responsive website with Tailwind CSS and struggling with the mobile navigation menu. I want a hamburger menu that slides in from the side on mobile devices but shows as a horizontal navbar on desktop.\n\nI''ve tried using Tailwind''s responsive utilities but can''t get the animation smooth. Should I use JavaScript or can this be done purely with Tailwind classes?\n\nAny code examples or CodePen demos would be super helpful!',
    'Creating responsive mobile navigation menu with Tailwind CSS',
    4, -- Frontend Engineering
    5, -- dave_frontend
    'published',
    128,
    8
),
(
    'Docker Compose for multi-container microservices',
    'I have a microservices architecture with 5 services:\n- Frontend (React)\n- API Gateway (Node.js)\n- Auth Service (Python)\n- Database (PostgreSQL)\n- Redis Cache\n\nI''m trying to set up Docker Compose to run everything locally for development. However, I''m running into issues with:\n- Service discovery and networking\n- Volume mounting for hot reload\n- Managing environment variables across services\n\nWhat''s the best way to structure docker-compose.yml for this setup?',
    'Docker Compose configuration for microservices development environment',
    5, -- DevOps & Cloud
    6, -- eve_devops
    'published',
    189,
    15
),
(
    'Vector search vs keyword search: When to use each?',
    'With the rise of embeddings and vector databases, I''m wondering when to use traditional keyword search (like BM25) versus semantic vector search.\n\nFor a Q&A platform like Stack Overflow:\n- Would vector search help find similar questions better?\n- How do you combine both approaches (hybrid search)?\n- What about latency and cost implications?\n\nHas anyone implemented both and can share their experience?',
    'Comparing vector search and keyword search approaches for Q&A platforms',
    1, -- Information Retrieval
    2, -- alice_search
    'published',
    95,
    7
),
(
    'SQL JOIN performance optimization tips',
    'I have a query that joins 4 tables and it''s taking 8+ seconds to execute. I''ve added indexes on foreign keys but it''s still slow.\n\nThe query:\n```sql\nSELECT u.name, p.title, c.content, t.name\nFROM users u\nJOIN posts p ON u.id = p.user_id\nJOIN comments c ON p.id = c.post_id\nJOIN tags t ON p.id = t.post_id\nWHERE u.created_at > ''2024-01-01''\nORDER BY p.created_at DESC\nLIMIT 100;\n```\n\nWhat am I missing? Should I denormalize or use different indexes?',
    'Optimizing slow SQL queries with multiple JOINs',
    2, -- Database Systems
    4, -- carol_db
    'published',
    267,
    22
),
(
    'API rate limiting strategies in FastAPI',
    'I need to implement rate limiting in my FastAPI application to prevent abuse. I''ve seen several approaches:\n\n1. slowapi library\n2. Custom middleware\n3. Redis-based rate limiting\n4. API Gateway (AWS, Kong)\n\nWhich approach is most production-ready? I need:\n- Per-user rate limits (different for free vs paid)\n- IP-based limits for anonymous users\n- Graceful error messages\n- Easy monitoring',
    'Best practices for implementing rate limiting in FastAPI applications',
    3, -- Backend Architecture
    3, -- bob_backend
    'published',
    145,
    11
);

-- Tag the documents
INSERT INTO document_tags (document_id, tag_id) VALUES
-- Document 1: BM25 question
(1, 1), -- bm25
(1, 2), -- tf-idf
(1, 3), -- elasticsearch

-- Document 2: MySQL indexing
(2, 5), -- mysql
(2, 8), -- indexing
(2, 3), -- elasticsearch

-- Document 3: FastAPI vs Flask
(3, 9), -- rest-api
(3, 11), -- microservices
(3, 12), -- caching

-- Document 4: Tailwind navigation
(4, 15), -- tailwind
(4, 16), -- responsive
(4, 14), -- javascript

-- Document 5: Docker Compose
(5, 17), -- docker
(5, 19), -- ci-cd
(5, 11), -- microservices

-- Document 6: Vector search
(6, 1), -- bm25
(6, 4), -- vector-search
(6, 3), -- elasticsearch

-- Document 7: SQL JOINs
(7, 5), -- mysql
(7, 8), -- indexing

-- Document 8: Rate limiting
(8, 9), -- rest-api
(8, 12); -- caching

-- Insert answers (comments)
INSERT INTO comments (document_id, author_id, content, vote_count) VALUES
-- Answers for Document 1 (BM25)
(1, 4, 'Great question! BM25 improves on TF-IDF mainly through document length normalization. The key formula is:\n\nscore = IDF * (tf * (k1 + 1)) / (tf + k1 * (1 - b + b * |D| / avgdl))\n\nWhere:\n- k1 controls term frequency saturation (typical: 1.2-2.0)\n- b controls document length normalization (typical: 0.75)\n- |D| is document length\n- avgdl is average document length\n\nThe b parameter is crucial: b=1 means full normalization, b=0 means no normalization. For most cases, b=0.75 works well.', 8),

(1, 3, 'To add to the previous answer, here''s when to use each:\n\nUse BM25 when:\n- You have varying document lengths\n- You need proven, battle-tested ranking\n- You''re building a search engine\n\nUse TF-IDF when:\n- Document lengths are similar\n- You need simple document similarity\n- You''re doing document clustering\n\nIn practice, modern search engines (Elasticsearch, Solr) use BM25 as default because it handles real-world document collections better.', 5),

-- Answers for Document 2 (MySQL indexing)
(2, 2, 'For MySQL full-text search with large datasets, here''s my recommendation:\n\n```sql\nALTER TABLE documents ADD FULLTEXT INDEX idx_fulltext (title, content);\n```\n\nPros:\n- Fast for most queries\n- Built into MySQL\n- Good for up to ~10M documents\n\nCons:\n- Limited relevance ranking\n- No fuzzy matching\n- Higher storage overhead\n\nFor 5M documents, MySQL FULLTEXT is fine. But consider Elasticsearch if:\n- You need better relevance\n- You want faceted search\n- You''re planning to scale beyond 10M docs\n\nMigration to Elasticsearch can happen later without major code changes.', 12),

(2, 6, 'I''ve worked with both MySQL FULLTEXT and Elasticsearch at scale. Here''s my experience:\n\nMySQL FULLTEXT worked great up to 8M documents, then we started seeing:\n- Slower index updates\n- Increased table locks during indexing\n- Limited ranking options\n\nWe migrated to Elasticsearch and gained:\n- 5x faster search\n- Better relevance (BM25)\n- Faceted search capabilities\n- Near real-time indexing\n\nThe tradeoff: Elasticsearch adds operational complexity. You need to maintain another service, handle reindexing, and monitor cluster health.', 7),

-- Answers for Document 3 (FastAPI vs Flask)
(3, 2, 'I''ve used both extensively. Here''s my take:\n\n**FastAPI wins for:**\n- Auto-generated OpenAPI docs (huge time saver)\n- Built-in data validation with Pydantic\n- Native async support\n- Better performance (3x faster in my tests)\n- Type hints everywhere\n\n**Flask wins for:**\n- Larger ecosystem and more tutorials\n- More extensions available\n- Been around longer (more Stack Overflow answers)\n\nFor new projects, I always choose FastAPI now. The developer experience is just better, and the async support is crucial for modern APIs.', 16),

(3, 6, 'FastAPI isn''t hype - it''s genuinely better for API development. I migrated a Flask API to FastAPI and saw:\n\n- 40% less code\n- Automatic request/response validation\n- Interactive API docs without extra work\n- Better performance under load\n\nThe only downside: smaller community. But the docs are excellent and the framework is intuitive if you know Python type hints.', 9),

-- Answers for Document 4 (Tailwind navigation)
(4, 3, 'Here''s a pure Tailwind approach with minimal JavaScript:\n\n```html\n<nav class="bg-white shadow">\n  <div class="max-w-7xl mx-auto px-4">\n    <!-- Mobile menu button -->\n    <button id="menu-btn" class="md:hidden">\n      <svg class="h-6 w-6">...</svg>\n    </button>\n    \n    <!-- Menu (hidden on mobile by default) -->\n    <div id="menu" class="hidden md:block">\n      <a href="#" class="px-3 py-2">Home</a>\n      <a href="#" class="px-3 py-2">About</a>\n    </div>\n  </div>\n</nav>\n\n<script>\n  document.getElementById(''menu-btn'').onclick = () => {\n    document.getElementById(''menu'').classList.toggle(''hidden'');\n  };\n</script>\n```\n\nFor smooth animations, add transition classes: `transition-all duration-300 ease-in-out`', 6),

-- Answers for Document 5 (Docker Compose)
(5, 3, 'Here''s a solid docker-compose.yml structure:\n\n```yaml\nversion: ''3.8''\n\nservices:\n  frontend:\n    build: ./frontend\n    ports:\n      - "3000:3000"\n    volumes:\n      - ./frontend:/app\n      - /app/node_modules\n    depends_on:\n      - api-gateway\n    \n  api-gateway:\n    build: ./gateway\n    ports:\n      - "8000:8000"\n    environment:\n      - AUTH_SERVICE_URL=http://auth:5000\n    depends_on:\n      - auth\n      - redis\n  \n  auth:\n    build: ./auth\n    environment:\n      - DATABASE_URL=postgresql://user:pass@db:5432/auth\n    depends_on:\n      - db\n  \n  db:\n    image: postgres:14\n    environment:\n      - POSTGRES_PASSWORD=secret\n    volumes:\n      - postgres_data:/var/lib/postgresql/data\n  \n  redis:\n    image: redis:7-alpine\n\nvolumes:\n  postgres_data:\n```\n\nKey points:\n- Use `depends_on` for startup order\n- Service names become DNS hostnames\n- Mount source code for hot reload\n- Use named volumes for data persistence', 11),

-- Answers for Document 6 (Vector search)
(6, 4, 'Hybrid search is the sweet spot! Here''s the approach:\n\n1. **Use BM25 for exact matches**: "BM25 algorithm" should find posts with those exact terms\n\n2. **Use vector search for semantic similarity**: "ranking function" might find posts about BM25 even without those exact words\n\n3. **Combine scores**: `final_score = 0.7 * bm25_score + 0.3 * vector_score`\n\nImplementation:\n- Store text in Elasticsearch for BM25\n- Store embeddings in Pinecone/Weaviate for vector search\n- Query both and merge results\n\nLatency: ~50-100ms for hybrid search\nCost: Embedding API + vector DB hosting (~$100-500/month for 1M documents)', 9),

-- Answers for Document 7 (SQL JOINs)
(7, 2, 'Your query is slow because:\n\n1. You''re filtering on `u.created_at` but joining through multiple tables first\n2. The ORDER BY on `p.created_at` happens after all joins\n3. The many-to-many relationship with tags creates a Cartesian product\n\nOptimizations:\n\n```sql\n-- Add composite indexes\nCREATE INDEX idx_users_created ON users(created_at, id);\nCREATE INDEX idx_posts_user_created ON posts(user_id, created_at);\n\n-- Rewrite query to filter early\nWITH recent_users AS (\n  SELECT id FROM users WHERE created_at > ''2024-01-01''\n),\nrecent_posts AS (\n  SELECT * FROM posts \n  WHERE user_id IN (SELECT id FROM recent_users)\n  ORDER BY created_at DESC\n  LIMIT 100\n)\nSELECT u.name, rp.title, c.content, t.name\nFROM recent_posts rp\nJOIN users u ON rp.user_id = u.id\nLEFT JOIN comments c ON rp.id = c.post_id\nLEFT JOIN tags t ON rp.id = t.post_id;\n```\n\nThis should drop query time to under 500ms.', 14),

-- Answers for Document 8 (Rate limiting)
(8, 6, 'I''ve implemented all 4 approaches. Here''s what works in production:\n\n**For FastAPI, use slowapi + Redis:**\n\n```python\nfrom slowapi import Limiter\nfrom slowapi.util import get_remote_address\n\nlimiter = Limiter(key_func=get_remote_address, storage_uri="redis://localhost:6379")\n\n@app.get("/api/search")\n@limiter.limit("100/hour")  # Anonymous users\nasync def search(request: Request, user: User = Depends(get_current_user_optional)):\n    if user and user.is_premium:\n        # Premium users get higher limits\n        pass\n    # ... search logic\n```\n\nBenefits:\n- Works across multiple app instances\n- Persistent rate limit state\n- Easy to customize per-user\n\nFor monitoring, log rate limit hits to your observability platform (Datadog, New Relic, etc.).', 10);

-- Insert some votes
INSERT INTO votes (user_id, target_type, target_id, vote_type) VALUES
-- Votes on documents
(2, 'document', 1, 'upvote'),
(3, 'document', 1, 'upvote'),
(4, 'document', 1, 'upvote'),
(5, 'document', 2, 'upvote'),
(6, 'document', 2, 'upvote'),
(2, 'document', 3, 'upvote'),
(4, 'document', 3, 'upvote'),

-- Votes on comments
(3, 'comment', 1, 'upvote'),
(5, 'comment', 1, 'upvote'),
(6, 'comment', 1, 'upvote'),
(2, 'comment', 2, 'upvote'),
(4, 'comment', 3, 'upvote');

-- Insert some search logs
INSERT INTO search_logs (user_id, query, result_count, clicked_document_id) VALUES
(2, 'BM25 algorithm', 3, 1),
(3, 'MySQL indexing', 2, 2),
(4, 'FastAPI tutorial', 1, 3),
(5, 'Tailwind responsive', 1, 4),
(6, 'Docker compose', 1, 5),
(2, 'vector search', 2, 6),
(3, 'SQL optimization', 1, 7),
(4, 'rate limiting API', 1, 8);

-- Insert system logs
INSERT INTO system_logs (user_id, action, details, subsystem) VALUES
(1, 'USER_LOGIN', 'Admin user logged in', 'auth'),
(2, 'DOCUMENT_CREATED', 'Created document: How does BM25 ranking algorithm work?', 'content'),
(3, 'DOCUMENT_CREATED', 'Created document: FastAPI vs Flask', 'content'),
(4, 'COMMENT_CREATED', 'Posted answer on document #1', 'content'),
(5, 'VOTE_CAST', 'Upvoted document #2', 'engagement');

-- Summary
SELECT 
    'Seed data loaded successfully!' as status,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM documents) as total_documents,
    (SELECT COUNT(*) FROM comments) as total_comments,
    (SELECT COUNT(*) FROM votes) as total_votes,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM tags) as total_tags;
