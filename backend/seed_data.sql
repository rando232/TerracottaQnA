-- Create search_queries table for tracking search and click logs
CREATE TABLE IF NOT EXISTS search_queries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    query TEXT NOT NULL,
    clicked_document_id INT NULL,
    result_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (clicked_document_id) REFERENCES documents(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_clicked_doc (clicked_document_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add summary column to documents (ignore error if exists)
SET @query = 'ALTER TABLE documents ADD COLUMN summary TEXT AFTER content';
SET @check_column = (SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS 
                      WHERE TABLE_SCHEMA = 'terracotta_qna' 
                      AND TABLE_NAME = 'documents' 
                      AND COLUMN_NAME = 'summary');
SET @query = IF(@check_column = 0, @query, 'SELECT 1');
PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Insert realistic Q&A documents about Information Retrieval, Databases, and Software Engineering
INSERT INTO documents (title, content, summary, category_id, author_id, created_at, views_count) VALUES
-- Information Retrieval Questions
('What is the difference between precision and recall in IR systems?',
'Precision and recall are fundamental metrics in information retrieval. Precision measures the fraction of retrieved documents that are relevant (true positives / (true positives + false positives)), while recall measures the fraction of relevant documents that were retrieved (true positives / (true positives + false negatives)). In practice, there is often a trade-off between these two metrics. High precision means few irrelevant results, while high recall means most relevant documents are found. F1-score combines both metrics into a single value.',
'Explanation of precision vs recall metrics in information retrieval with formulas and trade-offs',
1, 1, '2024-01-15 10:30:00', 245),

('How does TF-IDF weighting work in document retrieval?',
'TF-IDF (Term Frequency-Inverse Document Frequency) is a numerical statistic that reflects how important a word is to a document in a collection. The TF component measures how frequently a term appears in a document, while IDF measures how rare the term is across all documents. The formula is: TF-IDF(t,d) = TF(t,d) × log(N/DF(t)), where N is total documents and DF(t) is the number of documents containing term t. High TF-IDF scores indicate terms that are frequent in a specific document but rare across the corpus, making them good discriminators.',
'Detailed explanation of TF-IDF weighting scheme with formula and use cases',
1, 2, '2024-01-16 14:20:00', 312),

('What are inverted indexes and why are they important?',
'An inverted index is a data structure that maps terms to the documents containing them. Instead of storing documents with their terms, it stores terms with pointers to documents. This enables efficient full-text search by allowing O(1) lookup of which documents contain a given term. The structure typically includes: term dictionary (vocabulary), postings lists (document IDs per term), and often positional information. Inverted indexes are the backbone of modern search engines like Elasticsearch, Solr, and Lucene.',
'Overview of inverted index data structure and its role in efficient text search',
1, 3, '2024-01-17 09:45:00', 428),

('How do I implement BM25 ranking algorithm?',
'BM25 (Best Matching 25) is a probabilistic ranking function used in search engines. The formula is: BM25(D,Q) = Σ IDF(qi) × (f(qi,D) × (k1+1)) / (f(qi,D) + k1 × (1-b+b × |D|/avgdl)). Key parameters: k1 (1.2-2.0) controls term frequency saturation, b (0.75) controls length normalization. Implementation steps: 1) Calculate document length normalization, 2) Compute IDF for each query term, 3) Calculate term frequency component, 4) Sum scores for all query terms. Modern variants include BM25+ and BM25F for fielded search.',
'Complete guide to implementing BM25 ranking with parameters and optimization tips',
1, 1, '2024-01-18 11:00:00', 567),

('What is query expansion and when should I use it?',
'Query expansion improves retrieval by adding related terms to the original query. Techniques include: 1) Relevance feedback - use terms from relevant documents, 2) Pseudo-relevance feedback - assume top-k results are relevant, 3) Synonyms from thesaurus, 4) Word embeddings for semantic similarity. Use query expansion when: initial results are poor, queries are short (1-2 words), domain has rich terminology, or users expect semantic search. Be careful of query drift where expansion adds unrelated terms.',
'Query expansion techniques for improving search recall with practical guidelines',
1, 4, '2024-01-19 15:30:00', 289),

('How to handle stop words in search engines?',
'Stop words are common words (the, is, at) with little semantic value. Three approaches: 1) Remove completely - saves space but loses phrase queries, 2) Keep but give low weight - maintains phrases while reducing noise, 3) Context-dependent removal - remove in some queries but not others. Modern trend: keep stop words because storage is cheap and they matter for phrase queries like "to be or not to be". If removing, maintain a configurable list and apply during both indexing and query processing.',
'Strategies for handling stop words in search systems with pros and cons',
1, 2, '2024-01-20 08:15:00', 198),

-- Database Systems Questions
('What is database normalization and why is it important?',
'Database normalization is the process of organizing data to reduce redundancy and improve data integrity. The normal forms are: 1NF (atomic values, no repeating groups), 2NF (no partial dependencies), 3NF (no transitive dependencies), BCNF (every determinant is a candidate key). Benefits include: reduced data duplication, easier updates, smaller database size, and better consistency. However, over-normalization can hurt read performance, so denormalization is sometimes used for read-heavy workloads. Balance normalization with query performance needs.',
'Complete guide to database normalization forms with examples and trade-offs',
2, 3, '2024-01-21 10:45:00', 445),

('How do database indexes improve query performance?',
'Indexes are data structures that allow fast data retrieval without scanning entire tables. B-tree indexes (most common) provide O(log n) lookup time. Key concepts: 1) Clustered index - determines physical order of data, 2) Non-clustered index - separate structure with pointers, 3) Composite index - multiple columns, 4) Covering index - includes all needed columns. Trade-offs: indexes speed up SELECT but slow down INSERT/UPDATE/DELETE. Best practices: index foreign keys, columns in WHERE clauses, and JOIN conditions. Monitor index usage and remove unused indexes.',
'Comprehensive overview of database indexing strategies and best practices',
2, 1, '2024-01-22 13:20:00', 534),

('What are ACID properties in database transactions?',
'ACID ensures reliable database transactions: Atomicity - all operations succeed or all fail (no partial updates), Consistency - database moves from one valid state to another, Isolation - concurrent transactions don''t interfere, Durability - committed changes survive system failures. Implementation uses: write-ahead logging for atomicity/durability, locking or MVCC for isolation, constraints for consistency. Trade-offs exist with performance - strict ACID reduces throughput. NoSQL databases often relax ACID for scalability (BASE model).',
'Explanation of ACID properties with implementation details and trade-offs',
2, 4, '2024-01-23 09:00:00', 612),

('How do I optimize slow database queries?',
'Query optimization steps: 1) Use EXPLAIN to analyze execution plan, 2) Add appropriate indexes, 3) Avoid SELECT *, query only needed columns, 4) Use JOINs instead of subqueries when possible, 5) Limit result sets with WHERE clauses, 6) Denormalize for read-heavy tables, 7) Use query caching, 8) Partition large tables, 9) Optimize database configuration (buffer pool, cache sizes). Tools: EXPLAIN ANALYZE, slow query log, profiling tools. Remember: premature optimization is evil - measure first, optimize bottlenecks.',
'Practical guide to identifying and fixing slow database queries',
2, 2, '2024-01-24 14:45:00', 723),

('What is the difference between SQL and NoSQL databases?',
'SQL databases (MySQL, PostgreSQL) use structured schemas, ACID transactions, and relational model. Best for: complex queries, transactions, data integrity. NoSQL databases (MongoDB, Cassandra) use flexible schemas, eventual consistency, horizontal scaling. Types: document stores, key-value, column-family, graph databases. Choose SQL when: data is structured, need ACID, complex relationships. Choose NoSQL when: rapid development, massive scale, flexible schema, high availability. Many systems use both (polyglot persistence). Consider: query patterns, consistency needs, scale, and team expertise.',
'Comparison of SQL vs NoSQL databases with use cases and selection criteria',
2, 3, '2024-01-25 11:30:00', 891),

-- Backend Architecture Questions
('What is the difference between REST and GraphQL APIs?',
'REST uses multiple endpoints (resources) with HTTP methods (GET, POST, PUT, DELETE). Each endpoint returns fixed data structure. Pros: simple, cacheable, stateless. Cons: over-fetching, under-fetching, multiple requests needed. GraphQL uses single endpoint where clients specify exact data needed in query. Pros: fetch exactly what you need, one request, strongly typed. Cons: caching complexity, query complexity, learning curve. Choose REST for: simple CRUD, public APIs, caching needs. Choose GraphQL for: complex data requirements, mobile apps, rapid frontend development.',
'Comparison of REST vs GraphQL API architectures with practical examples',
3, 1, '2024-01-26 10:00:00', 456),

('How do I implement JWT authentication in web applications?',
'JWT (JSON Web Token) authentication flow: 1) User logs in with credentials, 2) Server validates and creates JWT with payload (user ID, roles, expiry), 3) Server signs JWT with secret key, 4) Client stores JWT (localStorage/cookie), 5) Client sends JWT in Authorization header for requests, 6) Server verifies signature and checks expiry. Security: use HTTPS, short expiry times, refresh tokens for renewal, store secrets securely. Advantages: stateless, scalable, cross-domain. Disadvantages: cannot revoke before expiry, larger than session IDs.',
'Complete guide to implementing JWT authentication with security best practices',
3, 2, '2024-01-27 15:20:00', 678),

('What are microservices and when should I use them?',
'Microservices architecture splits applications into small, independent services that communicate via APIs. Each service: owns its data, deploys independently, uses best-fit technology. Benefits: scalability, resilience, team autonomy, technology diversity. Challenges: distributed system complexity, data consistency, testing, deployment coordination. Use microservices when: team is large, different scaling needs, independent deployment cycles needed. Avoid when: small team, simple domain, tight coupling. Start monolithic, split into microservices when clear boundaries emerge.',
'Overview of microservices architecture with benefits, challenges, and guidelines',
3, 4, '2024-01-28 09:45:00', 534),

('How does load balancing work in distributed systems?',
'Load balancers distribute incoming requests across multiple servers. Types: 1) L4 (transport layer) - routes by IP/port, fast but less flexible, 2) L7 (application layer) - routes by URL/headers, slower but smarter. Algorithms: round-robin (simple, even distribution), least connections (balances load), IP hash (session persistence), weighted (different server capacities). Can be hardware (F5, Citrix) or software (NGINX, HAProxy). Health checks ensure traffic goes to healthy instances. Use session stores (Redis) or sticky sessions for stateful apps.',
'Explanation of load balancing types, algorithms, and implementation strategies',
3, 3, '2024-01-29 12:00:00', 412),

('What is the CAP theorem in distributed databases?',
'CAP theorem states distributed databases can guarantee only 2 of 3: Consistency (all nodes see same data), Availability (every request gets response), Partition Tolerance (system works despite network failures). Since partitions are inevitable, choose CP or AP: CP systems (MongoDB, HBase) - sacrifice availability for consistency, AP systems (Cassandra, DynamoDB) - sacrifice consistency for availability. Modern view: it''s a spectrum, tune consistency levels per operation. Use eventual consistency, CRDTs, or consensus protocols (Raft, Paxos) based on requirements.',
'Explanation of CAP theorem with practical implications for system design',
3, 1, '2024-01-30 14:30:00', 789),

-- Frontend Engineering Questions  
('What is the virtual DOM and how does React use it?',
'Virtual DOM is an in-memory representation of the actual DOM. React''s reconciliation process: 1) State changes trigger re-render, 2) React creates new virtual DOM tree, 3) Diff algorithm compares old and new trees, 4) Minimal changes are applied to real DOM. Benefits: better performance by batching updates, declarative UI, cross-platform (React Native). Keys are crucial for list reconciliation - help React identify which items changed. Virtual DOM isn''t always faster than manual DOM manipulation, but it makes code simpler and prevents common performance mistakes.',
'How React virtual DOM works with reconciliation algorithm and performance benefits',
4, 2, '2024-01-31 10:15:00', 523),

('How do I optimize React application performance?',
'React performance optimization techniques: 1) Use React.memo for functional components to prevent unnecessary re-renders, 2) useMemo and useCallback hooks to memoize values and functions, 3) Code splitting with React.lazy and Suspense, 4) Virtualize long lists (react-window), 5) Avoid inline functions/objects in JSX, 6) Use production build, 7) Profile with React DevTools, 8) Proper key usage in lists. Only optimize when needed - premature optimization is wasteful. Measure with Chrome DevTools and React Profiler first.',
'Practical guide to optimizing React apps with memoization and code splitting',
4, 3, '2024-02-01 13:45:00', 687),

('What is Redux and when should I use it?',
'Redux is a state management library with single store, immutable state, and unidirectional data flow. Actions describe what happened, reducers specify how state changes. Benefits: predictable state, debugging (time-travel), testing, state persistence. Use Redux when: complex state logic, shared state across components, state needs to persist. Don''t use for: small apps, local component state, server cache (use React Query). Modern alternatives: Context API (built-in), Zustand (simpler), Recoil (atomic). Redux Toolkit simplifies traditional Redux boilerplate.',
'Overview of Redux state management with use cases and modern alternatives',
4, 1, '2024-02-02 11:20:00', 456),

('What are React Hooks and why were they introduced?',
'Hooks let you use state and lifecycle in functional components. Common hooks: useState (state), useEffect (side effects), useContext (context), useReducer (complex state), useMemo/useCallback (optimization). Benefits: reuse stateful logic without HOCs or render props, simpler code than classes, better code organization. Rules: only call at top level, only call from React functions. Custom hooks let you extract reusable logic. Introduced in React 16.8 to solve: wrapper hell, giant components, confusing classes. Most new React code uses hooks exclusively.',
'Complete guide to React Hooks with examples and best practices',
4, 4, '2024-02-03 09:00:00', 812),

('How does CSS-in-JS compare to traditional CSS?',
'CSS-in-JS (styled-components, emotion) writes CSS in JavaScript. Pros: scoped styles (no global conflicts), dynamic styling based on props, automatic critical CSS, co-located with components. Cons: runtime overhead, larger bundle size, learning curve. Traditional CSS: simpler, cacheable, better for static styles. CSS Modules: middle ground with local scoping. Choose CSS-in-JS for: component libraries, theming, dynamic styles. Choose traditional for: static sites, performance-critical apps. Modern trend: zero-runtime solutions (Linaria, vanilla-extract) combining benefits.',
'Comparison of CSS-in-JS vs traditional CSS with use case recommendations',
4, 2, '2024-02-04 15:30:00', 378),

-- DevOps & Cloud Questions
('What is Docker and why should I use containers?',
'Docker packages applications into containers with all dependencies, ensuring consistent environments. Benefits: 1) Isolation - each container runs independently, 2) Portability - works anywhere Docker runs, 3) Efficiency - lighter than VMs, 4) Scalability - easy to replicate, 5) Version control - Dockerfiles track changes. Key concepts: images (templates), containers (running instances), Dockerfile (build instructions), Docker Compose (multi-container apps). Use cases: microservices, CI/CD, development environments, cloud deployment. Not suitable for: GUI applications, hardware-dependent apps.',
'Introduction to Docker containers with benefits and practical use cases',
5, 3, '2024-02-05 10:45:00', 923),

('How do I set up CI/CD pipelines?',
'CI/CD automates code integration and deployment. CI (Continuous Integration): 1) Code commit triggers build, 2) Run tests automatically, 3) Report results. CD (Continuous Deployment): 1) Automated staging deployment, 2) Integration/E2E tests, 3) Automatic production deployment. Tools: Jenkins, GitLab CI, GitHub Actions, CircleCI. Best practices: fast builds (<10min), comprehensive tests, feature flags, rollback capability, monitoring. Stages: source control trigger → build → test → deploy to staging → deploy to production. Measure: deployment frequency, lead time, failure rate.',
'Step-by-step guide to implementing CI/CD pipelines with best practices',
5, 1, '2024-02-06 14:00:00', 645),

('What is Kubernetes and when do I need it?',
'Kubernetes orchestrates containerized applications across clusters. Features: auto-scaling, self-healing, load balancing, rolling updates, service discovery. Key objects: Pods (container groups), Deployments (manage replicas), Services (networking), ConfigMaps/Secrets (configuration). Use Kubernetes when: running microservices, need high availability, auto-scaling required, multi-cloud deployment. Don''t use when: simple monolith, small scale, team lacks expertise. Alternatives: Docker Swarm (simpler), cloud-managed (ECS, Cloud Run), serverless. Steep learning curve but powerful at scale.',
'Overview of Kubernetes container orchestration with use cases and alternatives',
5, 4, '2024-02-07 11:15:00', 567),

('How do I implement monitoring and observability?',
'Observability has three pillars: Metrics (Prometheus, Datadog) - time-series data, aggregated views. Logs (ELK, Loki) - discrete events, debugging. Traces (Jaeger, Zipkin) - request flows, latency analysis. Implementation: 1) Instrument code with metrics, 2) Structured logging with context, 3) Distributed tracing with correlation IDs, 4) Centralized collection, 5) Dashboards and alerts. Key metrics: latency (p50, p95, p99), error rate, throughput, saturation. Set up SLOs (Service Level Objectives) and monitor against them. Observability helps debug production issues.',
'Complete guide to implementing monitoring and observability in production systems',
5, 2, '2024-02-08 09:30:00', 734),

('What are the differences between IaaS, PaaS, and SaaS?',
'Cloud service models: IaaS (Infrastructure) - VMs, storage, networks. You manage: OS, runtime, apps. Examples: AWS EC2, Google Compute. Use for: full control, custom stacks. PaaS (Platform) - runtime environment provided. You manage: apps only. Examples: Heroku, Google App Engine. Use for: faster development, managed infrastructure. SaaS (Software) - complete applications. Examples: Gmail, Salesforce. Use for: ready-to-use software. Choose based on: control needs, team skills, development speed. Hybrid approaches common - use different models for different components.',
'Explanation of cloud service models (IaaS/PaaS/SaaS) with selection criteria',
5, 3, '2024-02-09 13:00:00', 489),

-- Additional IR Questions
('How do search engines handle misspellings and typos?',
'Spell correction techniques: 1) Edit distance (Levenshtein) - count character operations to match dictionary, 2) Phonetic algorithms (Soundex, Metaphone) - match similar sounds, 3) N-gram indexing - break words into character sequences, 4) Query suggestion - "did you mean?", 5) Context-aware correction - use query history. Implementation: build dictionary from corpus, pre-compute common misspellings, use trie for prefix matching. Balance precision vs recall - too aggressive correction loses meaning. Elasticsearch has built-in fuzzy matching with configurable edit distance.',
'Techniques for handling spelling errors in search with implementation details',
1, 2, '2024-02-10 10:00:00', 345),

('What is semantic search and how is it different from keyword search?',
'Semantic search understands meaning and intent, not just keyword matching. Approaches: 1) Query expansion with synonyms, 2) Word embeddings (Word2Vec, GloVe) capture semantic similarity, 3) Sentence transformers (BERT, Sentence-BERT) for dense retrieval, 4) Knowledge graphs for entity relationships. Benefits: finds relevant docs without exact keywords, handles synonyms naturally. Challenges: computationally expensive, requires training data. Implementation: combine with keyword search (hybrid approach), use vector databases (Pinecone, Weaviate), fine-tune models on domain data.',
'Introduction to semantic search with modern approaches and implementation',
1, 1, '2024-02-11 15:45:00', 578),

('How do you evaluate search engine quality?',
'Evaluation methods: 1) Online metrics - CTR, dwell time, bounce rate, conversion. 2) Offline metrics - Precision@K, Recall@K, MAP (Mean Average Precision), NDCG (Normalized Discounted Cumulative Gain), MRR (Mean Reciprocal Rank). 3) A/B testing - compare algorithm variants. Need ground truth: explicit relevance judgments, implicit signals (clicks), editorial ratings. NDCG considers ranking order and graded relevance. Challenges: judging relevance is subjective, need large test sets, metrics don''t always correlate with user satisfaction.',
'Comprehensive guide to evaluating search quality with metrics and methods',
1, 3, '2024-02-12 09:15:00', 467),

('What is faceted search and when should I implement it?',
'Faceted search lets users filter by attributes (categories, price, date). Implementation: 1) Index facet fields separately, 2) Count documents per facet value, 3) Apply filters as AND/OR queries, 4) Update counts dynamically. Best practices: show facet counts, display most common values first, allow multi-select, hierarchical facets for categories. UI patterns: checkboxes, sliders for ranges, tag clouds. Use when: structured data, multiple attributes, users need to explore. Elasticsearch and Solr have built-in faceting. Performance: pre-aggregate common facets.',
'Guide to implementing faceted search with best practices and patterns',
1, 4, '2024-02-13 12:30:00', 289),

('How do you implement auto-complete suggestions?',
'Auto-complete approaches: 1) Prefix matching - trie data structure for fast lookup, 2) Popular queries - suggest frequent searches, 3) Personalized - use user history, 4) Fuzzy matching - handle typos. Implementation: pre-compute suggestions, rank by popularity, limit to top-N, cache heavily. Real-time: use streaming to backend, debounce requests (200-300ms). Enhance with: entity recognition, trending queries, contextual suggestions. Data sources: query logs, product names, popular entities. Solr SuggestComponent and Elasticsearch completion suggester handle this. Balance latency vs freshness.',
'Technical guide to implementing search auto-complete with ranking',
1, 2, '2024-02-14 14:00:00', 356);

-- Insert search queries and clicks (realistic search behavior)
-- Note: Using existing document IDs from database
INSERT INTO search_queries (user_id, query, clicked_document_id, result_count, created_at) VALUES
(1, 'precision recall difference', 1, 5, '2024-02-15 10:00:00'),
(1, 'BM25 implementation', 4, 8, '2024-02-15 10:05:00'),
(2, 'tf-idf algorithm', 2, 12, '2024-02-15 10:10:00'),
(3, 'inverted index explained', 3, 6, '2024-02-15 10:15:00'),
(4, 'database normalization', 7, 15, '2024-02-15 10:20:00'),
(1, 'microservices architecture', 1, 10, '2024-02-15 10:25:00'),
(2, 'React hooks tutorial', 2, 20, '2024-02-15 10:30:00'),
(NULL, 'Docker containers', 3, 18, '2024-02-15 10:35:00'),
(3, 'semantic search', 5, 7, '2024-02-15 10:40:00'),
(4, 'query expansion techniques', 5, 9, '2024-02-15 10:45:00'),
(1, 'stop words handling', 6, 11, '2024-02-15 10:50:00'),
(2, 'SQL vs NoSQL', 11, 16, '2024-02-15 10:55:00'),
(NULL, 'JWT authentication', 10, 13, '2024-02-15 11:00:00'),
(3, 'load balancing', 4, 8, '2024-02-15 11:05:00'),
(4, 'CAP theorem', 8, 10, '2024-02-15 11:10:00'),
(1, 'virtual DOM React', 7, 14, '2024-02-15 11:15:00'),
(2, 'Redux state management', 6, 12, '2024-02-15 11:20:00'),
(3, 'CI/CD pipeline setup', 5, 15, '2024-02-15 11:25:00'),
(NULL, 'Kubernetes tutorial', 4, 20, '2024-02-15 11:30:00'),
(4, 'IaaS PaaS SaaS', 3, 11, '2024-02-15 11:35:00'),
(1, 'spell correction', 2, 8, '2024-02-15 11:40:00'),
(2, 'faceted search', 1, 6, '2024-02-15 11:45:00'),
(3, 'auto-complete suggestions', 8, 9, '2024-02-15 11:50:00'),
(NULL, 'database indexes', 8, 14, '2024-02-15 11:55:00'),
(4, 'ACID properties', 7, 10, '2024-02-15 12:00:00'),
(1, 'query optimization', 10, 12, '2024-02-15 12:05:00'),
(2, 'REST vs GraphQL', 11, 15, '2024-02-15 12:10:00'),
(3, 'observability monitoring', 6, 11, '2024-02-15 12:15:00'),
(4, 'CSS-in-JS', 5, 8, '2024-02-15 12:20:00'),
(NULL, 'information retrieval', NULL, 25, '2024-02-15 12:25:00'),
(1, 'search engine evaluation', 4, 7, '2024-02-15 12:30:00'),
(2, 'React performance', 3, 13, '2024-02-15 12:35:00'),
(3, 'database design', NULL, 22, '2024-02-15 12:40:00'),
(4, 'cloud computing', NULL, 18, '2024-02-15 12:45:00'),
(1, 'ranking algorithms', 4, 9, '2024-02-15 12:50:00'),
(NULL, 'distributed systems', 2, 14, '2024-02-15 12:55:00'),
(2, 'web API design', 11, 10, '2024-02-15 13:00:00'),
(3, 'container orchestration', 1, 12, '2024-02-15 13:05:00'),
(4, 'frontend frameworks', NULL, 20, '2024-02-15 13:10:00'),
(1, 'text search', 3, 16, '2024-02-15 13:15:00'),
(2, 'data modeling', 7, 11, '2024-02-15 13:20:00'),
(1, 'distributed database', 8, 14, '2024-02-15 13:25:00'),
(3, 'search algorithms', 1, 10, '2024-02-15 13:30:00'),
(4, 'API authentication', 10, 15, '2024-02-15 13:35:00'),
(NULL, 'web performance', 5, 12, '2024-02-15 13:40:00'),
(2, 'database transactions', 7, 18, '2024-02-15 13:45:00'),
(1, 'search ranking', 4, 9, '2024-02-15 13:50:00'),
(3, 'cloud architecture', NULL, 20, '2024-02-15 13:55:00'),
(4, 'web frameworks', 6, 16, '2024-02-15 14:00:00'),
(NULL, 'data structures', 8, 22, '2024-02-15 14:05:00'),
(1, 'query processing', 2, 11, '2024-02-15 14:10:00');

-- Update views_count to match realistic patterns
UPDATE documents SET views_count = views_count + FLOOR(RAND() * 100);

SELECT 'Database seeded successfully with 30 realistic Q&A documents and 41 search queries!' as message;
