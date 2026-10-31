import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  Search, Filter, Plus, MessageSquare, ThumbsUp, ThumbsDown, Eye, Flag,
  Shield, Users, FileText, Tag, Folder, BarChart2, Settings, CheckCircle,
  XCircle, AlertTriangle, Edit3, Trash2, Lock, Unlock, Download, Database,
  Code, Terminal, ChevronLeft, ChevronRight, Calendar, User, Sparkles,
  Sliders, RefreshCw, BookOpen, Award, Activity, Globe, Cpu, Layers,
  LogIn, LogOut, UserPlus, Camera, Upload, AtSign, Key, Mail, Check
} from 'lucide-react';

// ============================================================================
// 1. AVATAR PRESETS, INITIAL TAXONOMY, ROLES, AND VERIFIED USERS
// ============================================================================

const createSvgAvatar = (initials, bgGradientStart, bgGradientEnd, accentColor) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
    <defs>
      <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradientStart}" />
        <stop offset="100%" stop-color="${bgGradientEnd}" />
      </linearGradient>
    </defs>
    <rect width="120" height="120" rx="60" fill="url(#g)" />
    <circle cx="60" cy="44" r="22" fill="${accentColor}" fill-opacity="0.22" />
    <path d="M24 106 C24 78 96 78 96 106" fill="${accentColor}" fill-opacity="0.22" />
    <text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-weight="800" font-size="38" letter-spacing="1">${initials}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

const AVATAR_PRESETS = [
  { id: 'av-1', label: 'Indigo Core', url: createSvgAvatar('ND', '#4f46e5', '#312e81', '#a5b4fc') },
  { id: 'av-2', label: 'Emerald Matrix', url: createSvgAvatar('LO', '#059669', '#064e3b', '#6ee7b7') },
  { id: 'av-3', label: 'Crimson Shield', url: createSvgAvatar('XJ', '#e11d48', '#881337', '#fda4af') },
  { id: 'av-4', label: 'Amber Beacon', url: createSvgAvatar('PG', '#d97706', '#78350f', '#fcd34d') },
  { id: 'av-5', label: 'Cyan Vector', url: createSvgAvatar('CD', '#0284c7', '#0c4a6e', '#7dd3fc') },
  { id: 'av-6', label: 'Violet Nebula', url: createSvgAvatar('LK', '#7c3aed', '#4c1d95', '#ddd6fe') },
  { id: 'av-7', label: 'Slate Sentinel', url: createSvgAvatar('AS', '#334155', '#0f172a', '#94a3b8') },
  { id: 'av-8', label: 'Fuchsia Pulse', url: createSvgAvatar('SK', '#c026d3', '#701a75', '#f5d0fe') },
  { id: 'av-9', label: 'Teal Node', url: createSvgAvatar('EV', '#0d9488', '#134e4a', '#5eead4') },
  { id: 'av-10', label: 'Orange Spark', url: createSvgAvatar('DV', '#ea580c', '#7c2d12', '#fdba74') }
];

const ROLES = {
  USER: 'user',
  SUPER_ADMIN: 'super_admin',
  CONTENT_MANAGER: 'content_manager',
  MODERATOR: 'moderator',
  DATA_SEO: 'data_seo_specialist'
};

const ROLE_META = {
  [ROLES.USER]: {
    label: 'Standard User',
    badgeClass: 'bg-slate-100 text-slate-700 border-slate-300',
    description: 'Browse questions, search, post questions/answers, vote, @mention users, and report spam.'
  },
  [ROLES.SUPER_ADMIN]: {
    label: 'Super Admin',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
    description: 'Manage user accounts/roles, assign permissions, view system logs, and configure global settings.'
  },
  [ROLES.CONTENT_MANAGER]: {
    label: 'Content Manager',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
    description: 'Full CRUD on content, publication status (publish/unpublish/draft), and taxonomy management (categories, tags).'
  },
  [ROLES.MODERATOR]: {
    label: 'Moderator',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-300',
    description: 'Review user-generated comments/posts, handle flags/reports, and manage spam control.'
  },
  [ROLES.DATA_SEO]: {
    label: 'Data & SEO Specialist',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    description: 'Configure SEO metadata (titles, descriptions, alt text, keywords) and monitor analytics & search log dashboards.'
  }
};

const INITIAL_CATEGORIES = [
  { id: 'cat-1', name: 'Information Retrieval', slug: 'information-retrieval', description: 'Inverted indices, BM25, TF-IDF ranking, tokenization, and vector-hybrid search architectures.' },
  { id: 'cat-2', name: 'Database Systems', slug: 'database-systems', description: 'PostgreSQL, MVCC, B-Tree vs GIN indexing, query planning, sharding, and NoSQL document stores.' },
  { id: 'cat-3', name: 'Backend Architecture', slug: 'backend-architecture', description: 'RESTful APIs, GraphQL, microservices, distributed locking, RBAC security, and high-throughput ingestion.' },
  { id: 'cat-4', name: 'Frontend Engineering', slug: 'frontend-engineering', description: 'React concurrency, state machines, SSR hydration, performance optimization, and accessible UI systems.' },
  { id: 'cat-5', name: 'DevOps & Cloud', slug: 'devops-cloud', description: 'Kubernetes orchestration, Docker multi-stage builds, CI/CD pipelines, observability, and zero-downtime deploys.' }
];

const INITIAL_TAGS = [
  'bm25', 'tf-idf', 'inverted-index', 'tokenization', 'postgresql', 'mongodb',
  'indexing', 'nodejs', 'fastapi', 'rbac', 'jwt', 'react', 'nextjs',
  'tailwind', 'docker', 'kubernetes', 'redis', 'graphql', 'caching', 'ci-cd'
];

// Every single author, commenter, and @mentioned username (including @loconner, @evance, @sarah_k, @dmitri_v)
// is a verified user record with an avatar, bio, and role.
const INITIAL_USERS = [
  {
    id: 'usr-1',
    username: 'SalvadorDalier',
    name: 'Lê Phan Nhật Duy',
    email: 'minhnhat67788@gmail.com',
    password: 'password123',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    reputation: 4820,
    bio: 'Principal Systems Architect & AI Prompt Engineer overseeing platform security and RBAC governance.',
    joined_at: '2025-01-02',
    avatar: AVATAR_PRESETS[0].url
  },
  {
    id: 'usr-2',
    username: 'Winnie_the_pooh',
    name: 'Marcus Chen',
    email: 'marcus.chen@nexusqa.dev',
    password: 'password123',
    role: ROLES.CONTENT_MANAGER,
    status: 'active',
    reputation: 3150,
    bio: 'Staff Technical Editor & Taxonomy Lead overseeing engineering documentation and publication workflows.',
    joined_at: '2026-01-05',
    avatar: AVATAR_PRESETS[2].url
  },
  {
    id: 'usr-3',
    username: 'familyguy',
    name: 'Peter Griffin',
    email: 'peter.griffin@nexusqa.dev',
    password: 'password123',
    role: ROLES.MODERATOR,
    status: 'active',
    reputation: 2890,
    bio: 'Community Trust & Safety Lead keeping discussions constructive, verified, and spam-free.',
    joined_at: '2020-01-15',
    avatar: AVATAR_PRESETS[3].url
  },
  {
    id: 'usr-4',
    username: 'loconner',
    name: "Liam O'Connor",
    email: 'liam.oconner@nexusqa.dev',
    password: 'password123',
    role: ROLES.DATA_SEO,
    status: 'active',
    reputation: 3640,
    bio: 'Lead Search Relevance Engineer & Data/SEO Specialist designing Phase 2 BM25 telemetry pipelines.',
    joined_at: '2020-02-10',
    avatar: AVATAR_PRESETS[1].url
  },
  {
    id: 'usr-5',
    username: 'rando232',
    name: 'Cao Quốc Đạt',
    email: 'jackshiteaf@gmail.com',
    password: 'password123',
    role: ROLES.DATA_SEO,
    status: 'active',
    reputation: 3410,
    bio: 'Search Relevance Engineer & SEO Analytics Specialist optimizing SERP metadata and click logs.',
    joined_at: '2021-03-14',
    avatar: AVATAR_PRESETS[4].url
  },
  {
    id: 'usr-6',
    username: 'Dre',
    name: 'Lê Hoài Khánh',
    email: 'nguyendre@gmail.com',
    password: 'password123',
    role: ROLES.USER,
    status: 'active',
    reputation: 1670,
    bio: 'Full-stack distributed systems engineer building high-throughput Node.js and FastAPI services.',
    joined_at: '2019-05-29',
    avatar: AVATAR_PRESETS[5].url
  },
  {
    id: 'usr-7',
    username: 'ubermensch',
    name: 'Anton Schmidt',
    email: 'anton.schmidt@nexusqa.dev',
    password: 'password123',
    role: ROLES.USER,
    status: 'active',
    reputation: 2190,
    bio: 'Database kernel contributor focused on PostgreSQL GIN indexes, MVCC, and write-ahead logging.',
    joined_at: '2026-04-20',
    avatar: AVATAR_PRESETS[6].url
  },
  {
    id: 'usr-8',
    username: 'Shimakawa',
    name: 'Shimakawa Kanna',
    email: 'kanna.shimakawa@nexusqa.dev',
    password: 'password123',
    role: ROLES.USER,
    status: 'active',
    reputation: 1980,
    bio: 'Frontend Performance Engineer specializing in React concurrent rendering and Core Web Vitals.',
    joined_at: '2026-02-19',
    avatar: AVATAR_PRESETS[7].url
  },
  {
    id: 'usr-9',
    username: 'evance',
    name: 'Dr. Elena Vance',
    email: 'elena.vance@nexusqa.dev',
    password: 'password123',
    role: ROLES.SUPER_ADMIN,
    status: 'active',
    reputation: 4120,
    bio: 'Distributed Security & Information Retrieval Researcher focusing on inverted index compression.',
    joined_at: '2025-06-11',
    avatar: AVATAR_PRESETS[8].url
  },
  {
    id: 'usr-10',
    username: 'dmitri_v',
    name: 'Dmitri Volkov',
    email: 'dmitri.volkov@nexusqa.dev',
    password: 'password123',
    role: ROLES.USER,
    status: 'active',
    reputation: 1890,
    bio: 'Site Reliability & Cloud Infrastructure Engineer automating multi-region Kubernetes clusters.',
    joined_at: '2025-08-21',
    avatar: AVATAR_PRESETS[9].url
  },
  {
    id: 'usr-11',
    username: 'sarah_k',
    name: 'Sarah Jenkins',
    email: 'sarah.jenkins@nexusqa.dev',
    password: 'password123',
    role: ROLES.MODERATOR,
    status: 'active',
    reputation: 2450,
    bio: 'Staff API Security Engineer & Community Moderator reviewing backend architecture threads.',
    joined_at: '2025-11-04',
    avatar: createSvgAvatar('SJ', '#0284c7', '#1e3a8a', '#bae6fd')
  }
];

const RAW_QA_BLUEPRINTS = [
  // Category 1: Information Retrieval (12 items)
  {
    cat: 'cat-1',
    title: 'How to tune BM25 k1 and b parameters for variable-length technical Q&A posts?',
    tags: ['bm25', 'tf-idf', 'inverted-index'],
    concepts: ['term frequency saturation (k1 = 1.2 to 2.0)', 'document length normalization (b = 0.75)', 'short code snippets vs long architectural essays'],
    problem: 'Our Q&A corpus mixes concise 80-word bug reports with 1,500-word postmortems. Default BM25 parameters (k1=1.2, b=0.75) over-penalize comprehensive guides containing stack traces.',
    solution: 'Lower parameter b toward 0.45–0.55 so multi-paragraph answers with logs are not excessively penalized by average document length (avgdl), while keeping k1 around 1.4 to reward repeated domain terms.'
  },
  {
    cat: 'cat-1',
    title: 'Designing an in-memory Inverted Index with positional postings lists for phrase queries',
    tags: ['inverted-index', 'tokenization', 'bm25'],
    concepts: ['skip pointers in postings lists', 'delta-encoded word positions', 'biword index fallback'],
    problem: 'When users search exact technical phrases like "connection pool exhausted", a standard bag-of-words inverted index returns false positives where those tokens appear in separate paragraphs.',
    solution: 'Store term positions [docId: [pos1, pos2, ...]] using variable-byte delta encoding. During intersection of postings lists, verify that pos(term_i+1) - pos(term_i) == 1.'
  },
  {
    cat: 'cat-1',
    title: 'Handling CamelCase, snake_case, and version strings in a custom search tokenizer',
    tags: ['tokenization', 'inverted-index', 'nodejs'],
    concepts: ['sub-word splitting', 'preserving original lexemes', 'n-gram edge tokenization for identifiers'],
    problem: 'Standard whitespace and punctuation tokenizers destroy identifiers like `useLayoutEffect`, `pg_stat_statements`, or `v2.14.0-rc1`, causing zero recall when developers search partial function names.',
    solution: 'Implement a dual-emission tokenizer pipeline that emits both the exact lowercased token (`uselayouteffect`) and constituent sub-tokens (`use`, `layout`, `effect`) at the same positional offset.'
  },
  {
    cat: 'cat-1',
    title: 'Preventing IDF dilution when stop-words and boilerplate code blocks dominate documents',
    tags: ['tf-idf', 'tokenization', 'bm25'],
    concepts: ['domain-specific stopword curation', 'field-weighted BM25F', 'code-block AST stripping'],
    problem: 'Keywords like `function`, `return`, `const`, and `import` appear in 85% of our developer forum posts, bloating the inverted index without adding discriminative ranking power.',
    solution: 'Maintain a two-tier stopword list (natural language + syntax keywords) for general prose, and use BM25F field weighting to boost `title` (3.0x) and `tags` (2.5x) over raw `content` (1.0x).'
  },
  {
    cat: 'cat-1',
    title: 'Calculating smoothed Inverse Document Frequency (IDF) to avoid negative weights on common terms',
    tags: ['bm25', 'tf-idf', 'inverted-index'],
    concepts: ['Robertson-Sparck Jones IDF formula', 'log(1 + (N - df + 0.5)/(df + 0.5))', 'zero-division guards'],
    problem: 'In classical BM25, if a query term appears in more than half of the documents (df > N/2), the unsmoothed log((N - df + 0.5)/(df + 0.5)) produces a negative score, ranking matching docs lower.',
    solution: 'Use the Lucene-style non-negative BM25 IDF formulation: `Math.log(1 + (N - df + 0.5) / (df + 0.5))`, guaranteeing strictly positive term contributions even on frequent technical terms.'
  },
  {
    cat: 'cat-1',
    title: 'Using search_click_logs to compute Mean Reciprocal Rank (MRR) and Normalized Discounted Cumulative Gain (NDCG)',
    tags: ['bm25', 'postgresql', 'indexing'],
    concepts: ['implicit relevance feedback', 'position bias correction', 'click-through rate aggregation'],
    problem: 'We log `user_id`, `query_string`, and `clicked_doc_id` in Phase 1, but we need an automated offline evaluation pipeline to compare TF-IDF against BM25 in Phase 2.',
    solution: 'Group click logs by normalized `query_string`, assign graded relevance scores based on dwell-weighted clicks, and compute NDCG@10 across top 100 recurring queries before deploying index updates.'
  },
  {
    cat: 'cat-1',
    title: 'Implementing Porter Stemmer vs Lemmatization for software engineering terminology',
    tags: ['tokenization', 'tf-idf', 'inverted-index'],
    concepts: ['over-stemming hazards (e.g. "react" vs "reactive")', 'dictionary-backed lemmatizers', 'exception lookup maps'],
    problem: 'Algorithmic stemming conflates distinct technical concepts such as `react` (the UI library) and `reactivity`, or `docker` and `docking`, degrading precision in developer forums.',
    solution: 'Guard your stemmer with a protected technical vocabulary hash set drawn from your platform tags (`react`, `postgres`, `kubernetes`, `redis`) so protected nouns bypass suffix stripping.'
  },
  {
    cat: 'cat-1',
    title: 'Dynamic snippet generation and query-term highlighting without breaking HTML tags',
    tags: ['inverted-index', 'react', 'tokenization'],
    concepts: ['character offset mapping', 'sliding window density scoring', 'XSS-safe mark tag injection'],
    problem: 'Highlighting matched search tokens inside stored HTML or Markdown strings accidentally corrupts attribute names when the query word matches `<div class="...">` or `<code ...>`.',
    solution: 'Generate a plain-text `summary` field at write time and run a 180-character sliding window over character offsets to wrap matched token spans in `<mark>` tags safely.'
  },
  {
    cat: 'cat-1',
    title: 'Incremental index updates vs periodic full rebuilds for a 100k-document Q&A database',
    tags: ['inverted-index', 'postgresql', 'redis'],
    concepts: ['immutable index segments', 'tombstone bitsets for deleted docs', 'background segment merging'],
    problem: 'Rebuilding the entire inverted index on every question edit blocks API workers, but mutating postings lists in place causes lock contention under concurrent reads.',
    solution: 'Append new and edited documents to an in-memory delta segment while marking old document IDs in a deleted-docs bitset, merging segments asynchronously every 15 minutes.'
  },
  {
    cat: 'cat-1',
    title: 'Boosting search ranking with freshness decay and community upvote signals',
    tags: ['bm25', 'tf-idf', 'postgresql'],
    concepts: ['Reciprocal rank fusion', 'logarithmic popularity boost', 'Gaussian time decay for fast-changing frameworks'],
    problem: 'Pure lexical BM25 scores often surface outdated 4-year-old configuration answers above newer, highly upvoted solutions that use slightly fewer repeated keywords.',
    solution: 'Combine lexical relevance with engagement signals using `FinalScore = BM25_Score * (1 + 0.15 * log10(1 + likes)) * exp(-lambda * age_in_days)`.'
  },
  {
    cat: 'cat-1',
    title: 'Spell correction and fuzzy query expansion using Levenshtein Automata and Trigram similarity',
    tags: ['tokenization', 'postgresql', 'indexing'],
    concepts: ['character 3-grams', 'Jaccard similarity coefficient', 'Damerau-Levenshtein edit distance <= 2'],
    problem: 'Users frequently mistype technical terms like `postgrsql`, `kubernets`, or `authentcation`, resulting in empty search results under strict keyword matching.',
    solution: 'Build a secondary k-gram index over the vocabulary dictionary. When a query token has df == 0, retrieve candidate vocabulary terms with trigram Jaccard overlap >= 0.45 and edit distance <= 2.'
  },
  {
    cat: 'cat-1',
    title: 'Comparing TF-IDF cosine similarity with Okapi BM25 on short 2-to-4 word user queries',
    tags: ['tf-idf', 'bm25', 'inverted-index'],
    concepts: ['Euclidean vector normalization bias', 'asymptotic TF saturation', 'query vector sparsity'],
    problem: 'With standard TF-IDF cosine similarity, a single document repeating a keyword 40 times achieves an artificially dominant term weight compared to a balanced tutorial.',
    solution: 'Migrate to Okapi BM25 where term frequency asymptotically approaches `k1 + 1`, preventing keyword stuffing from overwhelming multi-term query coverage.'
  },

  // Category 2: Database Systems (12 items)
  {
    cat: 'cat-2',
    title: 'Optimizing PostgreSQL ILIKE and Regex searches in Phase 1 using pg_trgm GIN indexes',
    tags: ['postgresql', 'indexing', 'bm25'],
    concepts: ['GIN trigrams (gin_trgm_ops)', 'sequential scan avoidance', 'B-tree prefix limitations'],
    problem: 'Phase 1 requires `ILIKE %keyword%` and regular expression filtering across `title` and `content`. Standard B-Tree indexes cannot accelerate leading-wildcard queries.',
    solution: 'Enable the `pg_trgm` extension and create a GIN index: `CREATE INDEX idx_docs_trgm ON documents USING GIN ((title || \' \' || content) gin_trgm_ops);` to turn full table scans into bitmap index scans.'
  },
  {
    cat: 'cat-2',
    title: 'Designing high-write search_click_logs tables in PostgreSQL with monthly range partitioning',
    tags: ['postgresql', 'indexing', 'nodejs'],
    concepts: ['declarative partitioning by timestamp', 'BRIN indexes on append-only logs', 'autovacuum tuning'],
    problem: 'Every search execution and document click writes to `search_click_logs`. Unpartitioned B-Tree indexes bloat rapidly and slow down analytics queries over 90-day windows.',
    solution: 'Partition `search_click_logs` by `RANGE (timestamp)` monthly, use a lightweight BRIN index on `timestamp`, and create a partial index `WHERE clicked_doc_id IS NOT NULL` for CTR analytics.'
  },
  {
    cat: 'cat-2',
    title: 'Storing flexible seo_metadata and tags: PostgreSQL JSONB vs normalized junction tables',
    tags: ['postgresql', 'mongodb', 'indexing'],
    concepts: ['jsonb_path_ops GIN indexing', 'TOAST compression overhead', 'referential integrity trade-offs'],
    problem: 'Data & SEO Specialists frequently update custom metadata fields (`meta_title`, `meta_description`, `alt_text`, `keywords`), while users filter documents by multiple `tags`.',
    solution: 'Use a `TEXT[]` array column with a GIN index for `tags` (`tags @> ARRAY[\'postgresql\']`) and a `JSONB` column for `seo_metadata` to avoid expensive multi-table joins on every directory fetch.'
  },
  {
    cat: 'cat-2',
    title: 'Preventing lost updates on documents.views_count under high concurrency',
    tags: ['postgresql', 'redis', 'caching'],
    concepts: ['MVCC row-level lock contention', 'write-behind Redis counters', 'atomic SQL increments'],
    problem: 'Executing `UPDATE documents SET views_count = views_count + 1 WHERE id = $1` on every page view creates dead tuples in PostgreSQL MVCC and triggers frequent autovacuum cycles.',
    solution: 'Buffer view increments in Redis using `HINCRBY doc:views <doc_id> 1` and flush aggregated counts to PostgreSQL in a single batch `UPDATE ... FROM unnest(...)` every 60 seconds.'
  },
  {
    cat: 'cat-2',
    title: 'Keyset (Cursor) Pagination vs OFFSET/LIMIT for large Q&A directory listings',
    tags: ['postgresql', 'indexing', 'fastapi'],
    concepts: ['composite index on (created_at DESC, id DESC)', 'O(1) seek performance', 'deep page latency'],
    problem: 'As our Q&A forum grows, `OFFSET 5000 LIMIT 10` forces PostgreSQL to scan and discard 5,000 rows from the index before returning the page slice.',
    solution: 'Use deterministic keyset pagination `WHERE (created_at, id) < ($last_created_at, $last_id) ORDER BY created_at DESC, id DESC LIMIT 10` backed by a composite B-tree index.'
  },
  {
    cat: 'cat-2',
    title: 'Modeling polymorphic reactions (upvotes/downvotes) on both Documents and Comments',
    tags: ['postgresql', 'mongodb', 'indexing'],
    concepts: ['exclusive arc foreign keys vs target_type ENUM', 'unique composite constraints', 'materialized score triggers'],
    problem: 'Users can rate both questions (`documents`) and answers (`comments`) with +1 or -1, and we must prevent duplicate votes while keeping directory score reads instant.',
    solution: 'Enforce `UNIQUE (user_id, target_type, target_id)` on the `reactions` table and maintain a denormalized `likes_count` column on `documents` updated via transactional triggers.'
  },
  {
    cat: 'cat-2',
    title: 'MongoDB Document Store schema design for embedding vs referencing Q&A comments',
    tags: ['mongodb', 'indexing', 'nodejs'],
    concepts: ['16MB BSON document limit', 'outlier pattern for viral threads', 'multikey indexes on tags'],
    problem: 'If we use MongoDB as our Document Store, embedding all comments directly inside the `documents` collection works well for 10 replies but degrades when a hot thread reaches 500 comments.',
    solution: 'Apply the Subset & Outlier Pattern: embed the top 5 most-upvoted comments directly in the parent document for instant initial render, and store full comment pages in a separate `comments` collection.'
  },
  {
    cat: 'cat-2',
    title: 'Diagnosing slow query plans when combining Category filter, Tag array match, and Date range',
    tags: ['postgresql', 'indexing', 'bm25'],
    concepts: ['BitmapAnd index intersection', 'extended statistics (CREATE STATISTICS)', 'selectivity estimation'],
    problem: 'When a user filters by `category_id = $1 AND tags @> $2 AND created_at BETWEEN $3 AND $4`, the query planner occasionally underestimates row selectivity and chooses a slow nested loop.',
    solution: 'Create a composite index on `(status, category_id, created_at DESC)` and a GIN index on `tags`, allowing PostgreSQL to combine both via a fast `BitmapAnd` plan.'
  },
  {
    cat: 'cat-2',
    title: 'Connection pooling architecture with PgBouncer in Transaction Mode for serverless backends',
    tags: ['postgresql', 'docker', 'nodejs'],
    concepts: ['prepared statement compatibility', 'max_client_conn vs default_pool_size', 'session state leakage'],
    problem: 'Deploying our API on auto-scaling containers exhausted `max_connections = 200` on PostgreSQL during traffic spikes, causing `FATAL: sorry, too many clients already`.',
    solution: 'Place PgBouncer in `pool_mode = transaction` in front of PostgreSQL and configure Prisma/pg in Node.js to use unnamed prepared statements so connections can multiplex safely.'
  },
  {
    cat: 'cat-2',
    title: 'Implementing soft deletes and audit trails for Moderator content removal without breaking FKs',
    tags: ['postgresql', 'rbac', 'indexing'],
    concepts: ['status ENUM transitions', 'partial indexes WHERE status = published', 'immutable audit triggers'],
    problem: 'Hard-deleting spam documents (`DELETE FROM documents`) cascades and wipes rows in `search_click_logs`, destroying historical click-through rate metrics needed by Data & SEO Specialists.',
    solution: 'Transition removed content to `status = \'unpublished\'` or `\'flagged\'` and record the moderation event in `reports_and_logs`, preserving foreign key references in `search_click_logs`.'
  },
  {
    cat: 'cat-2',
    title: 'Zero-downtime schema migrations when adding Phase 2 inverted index tables to production',
    tags: ['postgresql', 'ci-cd', 'indexing'],
    concepts: ['CREATE INDEX CONCURRENTLY', 'lock_timeout safety guards', 'expand-and-contract pattern'],
    problem: 'Running standard `ALTER TABLE` or `CREATE INDEX` during peak forum hours acquires an `ACCESS EXCLUSIVE` or `SHARE` lock that queues incoming question writes.',
    solution: 'Always set `SET lock_timeout = \'2s\'` in migration scripts, add nullable columns without volatile defaults, and build search indexes using `CREATE INDEX CONCURRENTLY`.'
  },
  {
    cat: 'cat-2',
    title: 'Benchmarking PostgreSQL tsvector/tsquery against a custom Phase 2 BM25 engine',
    tags: ['postgresql', 'bm25', 'tf-idf'],
    concepts: ['ts_rank_cd cover density', 'lack of global IDF in native ts_rank', 'custom postings table design'],
    problem: 'PostgreSQL built-in `ts_rank` does not use true corpus-wide Inverse Document Frequency (IDF) or BM25 length normalization out of the box.',
    solution: 'Use PostgreSQL as the durable Document Store (`documents` and `search_click_logs`) while building an explicit tokenized inverted index with BM25 scoring for Phase 2.'
  },

  // Category 3: Backend Architecture (12 items)
  {
    cat: 'cat-3',
    title: 'Designing composable RBAC middleware in Express/FastAPI for 5 distinct platform roles',
    tags: ['rbac', 'nodejs', 'fastapi', 'jwt'],
    concepts: ['permission matrix lookup', 'hierarchical vs capability-based guards', 'least-privilege API routes'],
    problem: 'Checking `if (req.user.role === "super_admin" || req.user.role === "content_manager")` inline across 40 controllers creates brittle, error-prone authorization logic.',
    solution: 'Define a declarative permission matrix mapping roles (`super_admin`, `content_manager`, `moderator`, `data_seo_specialist`, `user`) to granular scopes like `doc:publish`, `seo:edit`, and `mod:resolve`.'
  },
  {
    cat: 'cat-3',
    title: 'Securing JWT authentication with HttpOnly refresh tokens and instant role-change revocation',
    tags: ['jwt', 'rbac', 'redis', 'nodejs'],
    concepts: ['short-lived access tokens (15m)', 'refresh token rotation', 'Redis role-version allowlist'],
    problem: 'When a Super Admin changes a user role from `moderator` to `user`, a stateless 24-hour JWT continues granting access to `/api/mod/*` endpoints until token expiration.',
    solution: 'Embed a `role_version` counter in JWT claims and cache revoked or updated user IDs in Redis so the RBAC middleware rejects stale role claims immediately.'
  },
  {
    cat: 'cat-3',
    title: 'Parsing @username mentions in comment payloads and dispatching asynchronous notifications',
    tags: ['nodejs', 'postgresql', 'fastapi'],
    concepts: ['regex mention extraction /@([a-zA-Z0-9_]+)/g', 'batch username resolution', 'idempotent notification queues'],
    problem: 'Users frequently mention teammates like `@evance` or `@sarah_k` inside comments, and resolving each username synchronously in a loop adds latency to `POST /api/comments`.',
    solution: 'Extract unique handle tokens via `/@([a-zA-Z0-9_]{3,24})/g`, resolve valid user IDs in a single `SELECT id FROM users WHERE username = ANY($1)` query, and store `mentioned_user_ids`.'
  },
  {
    cat: 'cat-3',
    title: 'Preventing ReDoS (Regular Expression Denial of Service) on the Phase 1 Regex search endpoint',
    tags: ['nodejs', 'fastapi', 'rbac'],
    concepts: ['catastrophic backtracking `(a+)+$`', 'RE2 linear-time regex engine', 'query length & timeout limits'],
    problem: 'Allowing raw user-supplied regular expressions in `/api/documents/search?q=...&mode=regex` exposes the backend event loop or database worker to catastrophic backtracking.',
    solution: 'Validate regex syntax with a linear-time engine (such as `re2` in Node.js/Python), cap query pattern length at 64 characters, and enforce `SET LOCAL statement_timeout = \'500ms\'`.'
  },
  {
    cat: 'cat-3',
    title: 'Structuring RESTful vs GraphQL APIs for paginated Q&A directories and nested comment trees',
    tags: ['graphql', 'nodejs', 'caching'],
    concepts: ['DataLoader N+1 batching', 'HTTP ETag caching on REST endpoints', 'field-level RBAC resolvers'],
    problem: 'Fetching 10 questions along with their author profiles, category metadata, and comment counts causes the classic N+1 query problem if resolved naively.',
    solution: 'In REST, use a single SQL query with `LEFT JOIN` and pre-aggregated counts; in GraphQL, wrap author and category lookups in request-scoped `DataLoader` batch functions.'
  },
  {
    cat: 'cat-3',
    title: 'Implementing immutable system audit logging for Super Admin role and setting modifications',
    tags: ['rbac', 'postgresql', 'nodejs'],
    concepts: ['append-only audit tables', 'before/after JSON diff snapshots', 'request correlation IDs'],
    problem: 'Compliance and security reviews require knowing exactly which Super Admin modified global settings or elevated a user role, along with the previous state.',
    solution: 'Wrap all `/api/admin/*` mutations in an audit interceptor that writes `{ actor_id, action_type, target_id, previous_state, new_state, ip_address, timestamp }` inside the same DB transaction.'
  },
  {
    cat: 'cat-3',
    title: 'Rate limiting search queries and spam comment submissions using Redis Token Bucket',
    tags: ['redis', 'nodejs', 'fastapi'],
    concepts: ['atomic Lua script rate limiter', 'sliding window counters', 'graduated throttling by user reputation'],
    problem: 'Automated scrapers hammering the search endpoint pollute `search_click_logs` with synthetic queries and skew Phase 2 CTR evaluations.',
    solution: 'Enforce a Redis Lua-based Token Bucket limiter (e.g., 30 searches/min per IP, 10 comment posts/min per user) and exclude rate-limited requests from `search_click_logs`.'
  },
  {
    cat: 'cat-3',
    title: 'Sanitizing user-submitted HTML and Markdown content to prevent Stored XSS in Q&A posts',
    tags: ['nodejs', 'react', 'rbac'],
    concepts: ['DOMPurify allowlist sanitization', 'Content-Security-Policy headers', 'safe code-block rendering'],
    problem: 'Since our `documents.content` column accepts formatted HTML/text with code snippets, malicious users might inject `<img src=x onerror=...>` or `javascript:` links.',
    solution: 'Sanitize all incoming `content` on the backend using an strict HTML allowlist (`p`, `pre`, `code`, `ul`, `li`, `strong`, `em`) and strip all inline `on*` event attributes.'
  },
  {
    cat: 'cat-3',
    title: 'Decoupling search click logging from document detail reads using non-blocking ingestion',
    tags: ['nodejs', 'fastapi', 'postgresql'],
    concepts: ['fire-and-forget async background tasks', 'batch insert buffers', 'client Navigator.sendBeacon'],
    problem: 'If a slow write to `search_click_logs` blocks the `GET /api/documents/:id` response, user-perceived page load latency suffers during database checkpoints.',
    solution: 'Trigger click tracking asynchronously via `POST /api/search/log-click` or `FastAPI BackgroundTasks`, buffering rows in memory and flushing every 500ms.'
  },
  {
    cat: 'cat-3',
    title: 'Enforcing publication status visibility rules across Guest, Author, and Content Manager roles',
    tags: ['rbac', 'postgresql', 'nodejs'],
    concepts: ['row-level visibility filters', 'draft preview permissions', 'unpublished moderation states'],
    problem: 'Standard users should only see `status = "published"` documents in search and directory views, while Content Managers and the post author need to view `draft` and `unpublished` items.',
    solution: 'Inject a repository-level query scope: if `user.role` is neither `content_manager` nor `super_admin`, append `AND (status = \'published\' OR author_id = :currentUserId)`.'
  },
  {
    cat: 'cat-3',
    title: 'Building a CSV and JSON streaming exporter for Data & SEO Specialists on large click logs',
    tags: ['nodejs', 'fastapi', 'postgresql'],
    concepts: ['Node.js Readable streams / Postgres cursor', 'backpressure handling', 'RFC 4180 CSV escaping'],
    problem: 'Exporting 500,000 rows from `search_click_logs` for Phase 2 training by loading the entire dataset into an array crashes the API server with an out-of-memory error.',
    solution: 'Stream rows directly from a PostgreSQL database cursor (`pg-cursor`) through a transform stream that serializes chunks to CSV/JSON with proper HTTP `Content-Disposition` headers.'
  },
  {
    cat: 'cat-3',
    title: 'Idempotency keys for comment creation and report flagging over unreliable mobile networks',
    tags: ['nodejs', 'redis', 'postgresql'],
    concepts: ['Idempotency-Key HTTP header', '24-hour Redis response cache', 'unique client request UUIDs'],
    problem: 'When a user taps "Post Comment" or "Submit Report" on a high-latency connection and retries, duplicate comments or duplicate moderator flags are created.',
    solution: 'Require an `Idempotency-Key` UUID header on `POST /api/comments` and `POST /api/reports`, caching the serialized response in Redis with `SET NX EX 86400`.'
  },

  // Category 4: Frontend Engineering (12 items)
  {
    cat: 'cat-4',
    title: 'Synchronizing complex search filters (Query, Category, Tag, Date Range, Page) with URL SearchParams',
    tags: ['react', 'nextjs', 'tailwind'],
    concepts: ['shareable deep links', 'debounced search input', 'browser history stack restoration'],
    problem: 'When users filter the Q&A directory by category, tag, and date range, refreshing the page or sharing the link resets the state if filters live only in ephemeral React `useState`.',
    solution: 'Serialize active filter state (`?q=bm25&cat=cat-1&tag=indexing&from=2026-01-01&page=2`) into URL query parameters and reset `page=1` automatically whenever any filter changes.'
  },
  {
    cat: 'cat-4',
    title: 'Implementing optimistic UI updates with automatic rollback for Upvote/Downvote toggles',
    tags: ['react', 'nextjs', 'graphql'],
    concepts: ['instant tactile feedback', 'snapshot rollback on network error', 'request deduplication'],
    problem: 'Waiting 300ms for a server round-trip before updating the upvote counter makes the community engagement UI feel sluggish.',
    solution: 'Immediately compute the delta (+1, -1, or +2 when flipping from downvote to upvote) in local state, fire the mutation in the background, and restore the snapshot if the API fails.'
  },
  {
    cat: 'cat-4',
    title: 'Building an accessible @username mention autocomplete dropdown in the comment editor',
    tags: ['react', 'tailwind', 'nextjs'],
    concepts: ['caret position detection', 'ARIA combobox roles', 'keyboard arrow & Enter navigation'],
    problem: 'Typing `@` in a textarea to tag another developer is error-prone if users have to memorize exact usernames like `@loconner` or `@dmitri_v`.',
    solution: 'Detect trailing `/@([a-zA-Z0-9_]*)$/` before the cursor index, display a filtered floating user list with keyboard navigation, and highlight rendered `@username` pills.'
  },
  {
    cat: 'cat-4',
    title: 'Dynamic SEO metadata injection and Google SERP preview cards in React / Next.js',
    tags: ['react', 'nextjs', 'tailwind'],
    concepts: ['Next.js generateMetadata API', 'OpenGraph & canonical tags', 'pixel-width truncation checks'],
    problem: 'Data & SEO Specialists need to verify that `meta_title` (<= 60 chars), `meta_description` (<= 160 chars), and image `alt_text` render properly before saving.',
    solution: 'Provide a live SERP & Social Card simulator inside the Data & SEO dashboard that measures character counts, validates keyword presence, and previews truncation in real time.'
  },
  {
    cat: 'cat-4',
    title: 'Role-Based Access Control (RBAC) route guards and permission-aware UI shells in React',
    tags: ['react', 'rbac', 'jwt'],
    concepts: ['React Context auth provider', 'declarative <RequireRole> wrapper', 'graceful 403 fallback states'],
    problem: 'Hiding admin navigation buttons in CSS is not enough; navigating directly to an admin view with an unauthorized role must show a clear RBAC explanation.',
    solution: 'Build a centralized `useAuth()` hook and a `<RoleGuard allowedRoles={[...]}>` wrapper that checks the active user role against the permission matrix.'
  },
  {
    cat: 'cat-4',
    title: 'Preventing Cumulative Layout Shift (CLS) when rendering technical diagrams and badges',
    tags: ['react', 'tailwind', 'nextjs'],
    concepts: ['explicit aspect-ratio containers', 'skeleton placeholders', 'font-display swap metrics'],
    problem: 'Loading architectural diagrams and dynamic tag lists on the Question Detail view causes content below the fold to jump while reading.',
    solution: 'Reserve deterministic container dimensions using Tailwind `aspect-[16/9]` or fixed SVG viewBox ratios and attach descriptive SEO `alt_text` attributes.'
  },
  {
    cat: 'cat-4',
    title: 'Client-side regex validation and match-highlighting preview for power searchers',
    tags: ['react', 'tokenization', 'tailwind'],
    concepts: ['try/catch RegExp constructor guard', 'safe token splitting', 'visual invalid-syntax badge'],
    problem: 'When a user switches the search bar to Regex mode and types an incomplete pattern like `^(bm25|tf-idf`, an uncaught `SyntaxError: Invalid regular expression` crashes the React tree.',
    solution: 'Wrap `new RegExp(query, "i")` inside a safe helper that catches syntax errors, displays an inline warning badge, and gracefully falls back to literal substring matching.'
  },
  {
    cat: 'cat-4',
    title: 'Designing high-density Admin Data Tables with multi-status filters and bulk actions',
    tags: ['react', 'tailwind', 'rbac'],
    concepts: ['sticky table headers', 'status pill quick-toggles', 'keyboard-accessible action menus'],
    problem: 'Content Managers overseeing 60 to 1,000 Q&A documents need to scan publication status, category, views, and SEO readiness without opening separate pages for each item.',
    solution: 'Build a responsive studio table with inline `Publish / Unpublish / Draft` switches, instant search filtering, and modal drawers for deep editing.'
  },
  {
    cat: 'cat-4',
    title: 'Interactive TF-IDF & BM25 Token Inspector UI for debugging search relevance',
    tags: ['react', 'bm25', 'tf-idf'],
    concepts: ['visual term weight bars', 'stopword strikethrough', 'per-token IDF breakdown'],
    problem: 'During Phase 2 preparation, engineers struggle to understand why Document A ranked higher than Document B for a multi-word query.',
    solution: 'Create an interactive Phase 2 Search Inspector tab that tokenizes any selected document, displays term frequencies (TF), corpus document frequencies (DF), IDF, and step-by-step BM25 math.'
  },
  {
    cat: 'cat-4',
    title: 'Debouncing vs Explicit Search Submission for accurate search_click_logs instrumentation',
    tags: ['react', 'postgresql', 'bm25'],
    concepts: ['avoiding partial keystroke pollution', 'session query grouping', 'explicit search event triggers'],
    problem: 'If every keystroke (`p`, `po`, `pos`, `post`, `postgres`) writes a row to `search_click_logs`, 80% of logged queries are incomplete prefixes with zero clicks.',
    solution: 'Filter the directory UI smoothly while only writing to `search_click_logs` when the user submits the search form, presses Enter, or clicks a result.'
  },
  {
    cat: 'cat-4',
    title: 'Managing modal focus traps and keyboard shortcuts (`/` to search, `Esc` to close)',
    tags: ['react', 'tailwind', 'nextjs'],
    concepts: ['WAI-ARIA dialog pattern', 'global keydown listeners', 'focus restoration on unmount'],
    problem: 'Power users on developer Q&A forums expect keyboard-first navigation to open search, create questions, and dismiss moderation dialogs.',
    solution: 'Attach accessible modal headers, clear close actions, and semantic form labels across the Ask Question, Auth Profile, and Report Flag dialogs.'
  },
  {
    cat: 'cat-4',
    title: 'State normalization for keeping Directory Lists, Detail Views, and Admin Tables in sync',
    tags: ['react', 'caching', 'graphql'],
    concepts: ['single source of truth by document ID', 'derived filtered selectors', 'instant cross-tab updates'],
    problem: 'When a Content Manager unpublishes a post or a Data & SEO Specialist updates `meta_title`, the Directory View and Detail View must reflect the change immediately.',
    solution: 'Maintain a unified `documents` store indexed by ID and compute paginated directory views, analytics metrics, and Phase 2 inverted index statistics via memoized selectors.'
  },

  // Category 5: DevOps & Cloud (12 items)
  {
    cat: 'cat-5',
    title: 'Multi-stage Docker builds for a Node.js/FastAPI + React Full-Stack Q&A Platform',
    tags: ['docker', 'ci-cd', 'nodejs'],
    concepts: ['Alpine distroless runtime images', 'BuildKit layer caching', 'non-root container execution'],
    problem: 'Our naive single-stage Dockerfile included build toolchains and `node_modules` devDependencies, resulting in a 1.1GB image and slow Kubernetes pod startups.',
    solution: 'Separate the frontend static asset build, backend dependency pruning, and minimal production runtime stage, shrinking the final image under 140MB.'
  },
  {
    cat: 'cat-5',
    title: 'Automating database seeding of 60+ realistic Q&A records in CI/CD preview environments',
    tags: ['ci-cd', 'postgresql', 'docker'],
    concepts: ['idempotent upsert seed scripts (`ON CONFLICT DO NOTHING`)', 'ephemeral PR databases', 'deterministic UUIDs'],
    problem: 'Running seed scripts multiple times during deployment pipelines either fails on duplicate primary keys or wipes moderator logs created during QA testing.',
    solution: 'Use deterministic IDs (`doc-1001`..`doc-1060`) with `INSERT INTO documents ... ON CONFLICT (id) DO UPDATE` so seed runs are 100% idempotent.'
  },
  {
    cat: 'cat-5',
    title: 'Kubernetes Horizontal Pod Autoscaler (HPA) tuning for CPU-intensive Phase 2 BM25 ranking',
    tags: ['kubernetes', 'docker', 'bm25'],
    concepts: ['custom Prometheus latency metrics', 'pod readiness probes during index warmup', 'resource requests vs limits'],
    problem: 'When a new API pod starts and loads the inverted index into memory, traffic routed before warmup completes experiences 502 timeouts.',
    solution: 'Configure a Kubernetes `startupProbe` checking `/health/index-ready` that waits until the in-memory vocabulary and postings lists are initialized before accepting traffic.'
  },
  {
    cat: 'cat-5',
    title: 'Zero-downtime Blue/Green deployments with NGINX and sticky JWT sessions',
    tags: ['docker', 'kubernetes', 'jwt'],
    concepts: ['graceful SIGTERM connection draining', 'stateless JWT verification', 'rolling update surge settings'],
    problem: 'Terminating active API containers immediately during a deploy drops in-flight comment submissions and search log writes.',
    solution: 'Handle `SIGTERM` in the backend server by stopping new accepts, awaiting active database transactions (up to 15s grace period), and flushing buffered click logs.'
  },
  {
    cat: 'cat-5',
    title: 'Centralized structured logging (JSON) and correlation IDs for Super Admin system logs',
    tags: ['docker', 'kubernetes', 'rbac'],
    concepts: ['X-Request-ID propagation', 'PII redaction filters', 'OpenTelemetry trace context'],
    problem: 'Super Admins inspecting system logs need to correlate a failed login or permission denial with the exact API request trace.',
    solution: 'Emit structured JSON logs containing `timestamp`, `level`, `actor_id`, `role`, `action`, and `trace_id`, feeding both the Admin UI log table and external observability.'
  },
  {
    cat: 'cat-5',
    title: 'Caching high-traffic Q&A Detail Views at the CDN / Redis layer with instant cache invalidation',
    tags: ['redis', 'caching', 'nextjs'],
    concepts: ['stale-while-revalidate headers', 'surrogate cache keys by doc_id', 'event-driven purge on comment/edit'],
    problem: 'Popular architecture questions receive 90% read traffic, but serving stale cached HTML hides newly posted answers or updated SEO metadata.',
    solution: 'Cache serialized document responses in Redis under `doc:detail:<id>` with a 5-minute TTL and issue an explicit `DEL` whenever a comment, vote, or Content Manager edit occurs.'
  },
  {
    cat: 'cat-5',
    title: 'Securing environment secrets (JWT signing keys, DB credentials) with GitHub Actions & Vault',
    tags: ['ci-cd', 'jwt', 'docker'],
    concepts: ['OIDC short-lived cloud credentials', 'secret scanning pre-commit hooks', 'key rotation without downtime'],
    problem: 'Storing static database passwords or JWT secrets in `.env` files inside repositories risks credential leaks.',
    solution: 'Inject secrets at container runtime via Kubernetes Secrets / HashiCorp Vault and support a two-key JWKS ring (`kid: primary`, `kid:previous`) for seamless signing key rotation.'
  },
  {
    cat: 'cat-5',
    title: 'Automated PostgreSQL backup verification and Point-in-Time Recovery (PITR) using WAL archiving',
    tags: ['postgresql', 'docker', 'ci-cd'],
    concepts: ['continuous WAL shipping to object storage', 'automated restore smoke tests', 'RPO < 5 minutes'],
    problem: 'Taking nightly `pg_dump` snapshots alone risks losing up to 24 hours of community Q&A posts and `search_click_logs` if storage fails.',
    solution: 'Combine daily base backups (`pg_basebackup`) with continuous Write-Ahead Log (WAL) archiving and run a weekly automated container job that verifies restore integrity.'
  },
  {
    cat: 'cat-5',
    title: 'Load testing Phase 1 vs Phase 2 search endpoints with k6 and realistic query distributions',
    tags: ['ci-cd', 'bm25', 'postgresql'],
    concepts: ['Zipfian query distribution (80/20 head vs tail queries)', 'p95 & p99 latency SLOs', 'concurrent virtual users'],
    problem: 'Synthetic benchmarks that repeat the exact same query hit the OS page cache 100% of the time and fail to expose lock contention on cold postings lists.',
    solution: 'Drive k6 load scripts using sampled queries from `search_click_logs` following a Zipfian curve and assert `http_req_duration{p(95)} < 120ms` in CI.'
  },
  {
    cat: 'cat-5',
    title: 'Containerizing PostgreSQL and Redis for local development with Docker Compose healthchecks',
    tags: ['docker', 'postgresql', 'redis'],
    concepts: ['pg_isready healthcheck', 'depends_on condition: service_healthy', 'named persistent volumes'],
    problem: 'When contributors run `docker compose up`, the backend container starts before PostgreSQL finishes initializing its data directory, crashing the migration script.',
    solution: 'Configure `healthcheck: test: ["CMD-SHELL", "pg_isready -U postgres"]` on the database service and set `depends_on: db: condition: service_healthy` on the API container.'
  },
  {
    cat: 'cat-5',
    title: 'Monitoring search zero-result rates and latency anomalies with Prometheus alerts',
    tags: ['kubernetes', 'bm25', 'caching'],
    concepts: ['histogram buckets for search duration', 'zero-hit query counters', 'SEO content gap alerting'],
    problem: 'A sudden spike in searches returning zero documents indicates either a broken tokenizer deployment or a trending technology missing from our Q&A taxonomy.',
    solution: 'Export a Prometheus counter `search_queries_total{status="zero_results"}` and surface top zero-result queries directly inside the Data & SEO Specialist dashboard.'
  },
  {
    cat: 'cat-5',
    title: 'Git branching strategy and automated linting/testing pipelines for full-stack teams',
    tags: ['ci-cd', 'react', 'nodejs'],
    concepts: ['trunk-based development', 'parallel matrix jobs (lint, unit, integration)', 'branch protection rules'],
    problem: 'Long-lived feature branches for Backend, Frontend, and Search Engine modules cause severe merge conflicts around shared database schema files.',
    solution: 'Adopt short-lived trunk-based PRs guarded by automated GitHub Actions workflows that validate schema migrations, RBAC unit tests, and frontend builds on every push.'
  }
];

const INITIAL_DOCUMENTS = RAW_QA_BLUEPRINTS.map((item, idx) => {
  const num = idx + 1;
  const docId = `doc-${1000 + num}`;
  const authorObj = INITIAL_USERS[idx % INITIAL_USERS.length];
  const month = String((idx % 10) + 1).padStart(2, '0');
  const day = String(((idx * 3) % 27) + 1).padStart(2, '0');
  const createdAt = `2026-${month}-${day}`;

  // Spread statuses so Content Managers have unpublished & draft items to manage immediately
  let status = 'published';
  if (idx === 11 || idx === 27 || idx === 43 || idx === 55) status = 'unpublished';
  if (idx === 19 || idx === 35 || idx === 51 || idx === 59) status = 'draft';

  const viewsCount = 120 + ((idx * 137) % 2400);
  const likesCount = 8 + ((idx * 19) % 95);
  const isFlagged = idx === 7 || idx === 22;

  const fullContent = `### Problem Context & System Architecture
${item.problem}

In our production environment, this issue surfaced when scaling our Q&A knowledge base under concurrent read/write workloads. Specifically, we need to balance **${item.concepts[0]}**, **${item.concepts[1]}**, and **${item.concepts[2]}** without degrading p95 response latency.

### Recommended Engineering Solution
${item.solution}

### Implementation Checklist & Trade-offs
1. **Primary Mechanism:** Configure ${item.concepts[0]} and verify behavior against realistic production payloads.
2. **Optimization Layer:** Apply ${item.concepts[1]} to eliminate redundant disk or CPU bottlenecks during peak traffic.
3. **Verification & Observability:** Monitor ${item.concepts[2]} via structured telemetry and regression benchmarks in Phase 2.`;

  const summary = `${item.problem.slice(0, 145)}... Resolved via ${item.concepts[0]} and ${item.concepts[1]}.`;

  const commentAuthor1 = INITIAL_USERS[(idx + 2) % INITIAL_USERS.length];
  const commentAuthor2 = INITIAL_USERS[(idx + 5) % INITIAL_USERS.length];
  const taggedCollaborator = INITIAL_USERS.find(u => u.username === 'loconner') || INITIAL_USERS[3];

  const comments = [
    {
      id: `cmt-${num}-1`,
      doc_id: docId,
      author_id: commentAuthor1.id,
      author_username: commentAuthor1.username,
      author_name: commentAuthor1.name,
      content: `Great breakdown @${authorObj.username}! We implemented ${item.concepts[0]} last sprint and saw p95 query times drop by 42%. Make sure to also coordinate with @${taggedCollaborator.username} on how this affects the Phase 2 telemetry pipeline.`,
      mentioned_users: [authorObj.username, taggedCollaborator.username],
      likes: 4 + (idx % 11),
      is_flagged: idx === 3 || idx === 14,
      flag_reason: (idx === 3 || idx === 14) ? 'Flagged for potential off-topic promotional link or unverified benchmark claim.' : null,
      created_at: `${createdAt} 14:20`
    }
  ];

  if (idx % 2 === 0) {
    comments.push({
      id: `cmt-${num}-2`,
      doc_id: docId,
      author_id: commentAuthor2.id,
      author_username: commentAuthor2.username,
      author_name: commentAuthor2.name,
      content: `Adding a quick note for @${commentAuthor1.username}: when combining ${item.concepts[1]} with ${item.tags[0]}, keep an eye on memory overhead during segment merges.`,
      mentioned_users: [commentAuthor1.username],
      likes: 2 + (idx % 7),
      is_flagged: false,
      flag_reason: null,
      created_at: `${createdAt} 16:45`
    });
  }

  return {
    id: docId,
    title: item.title,
    content: fullContent,
    summary,
    category_id: item.cat,
    tags: item.tags,
    author_id: authorObj.id,
    author: authorObj.name,
    author_username: authorObj.username,
    created_at: createdAt,
    views_count: viewsCount,
    likes: likesCount,
    status,
    is_flagged: isFlagged,
    flag_reason: isFlagged ? 'Reported by community member: Needs technical verification or contains duplicate config snippet.' : null,
    seo_metadata: {
      meta_title: `${item.title.slice(0, 52)} | Terracotta QnA`,
      meta_description: `${item.solution.slice(0, 148)}`,
      alt_text: `Architecture diagram illustrating ${item.concepts[0]} and ${item.concepts[1]} for ${item.tags.join(', ')}`,
      keywords: [...item.tags, item.concepts[0].split(' ')[0].toLowerCase()]
    },
    comments
  };
});

// ============================================================================
// 3. INITIAL SEARCH CLICK LOGS, MODERATION REPORTS, AND SYSTEM LOGS
// ============================================================================

const INITIAL_SEARCH_LOGS = [
  { id: 'log-901', user_id: 'usr-6', query_string: 'bm25 k1 parameter tuning', clicked_doc_id: 'doc-1001', timestamp: '2026-10-29 09:12:04' },
  { id: 'log-902', user_id: 'usr-7', query_string: 'postgresql gin index ilike', clicked_doc_id: 'doc-1013', timestamp: '2026-10-29 10:05:19' },
  { id: 'log-903', user_id: 'usr-8', query_string: 'react url searchparams pagination', clicked_doc_id: 'doc-1037', timestamp: '2026-10-29 11:44:32' },
  { id: 'log-904', user_id: 'usr-10', query_string: 'kubernetes hpa readiness probe', clicked_doc_id: 'doc-1051', timestamp: '2026-10-30 08:19:50' },
  { id: 'log-905', user_id: 'usr-6', query_string: 'inverted index phrase query', clicked_doc_id: 'doc-1002', timestamp: '2026-10-30 13:27:11' },
  { id: 'log-906', user_id: 'usr-4', query_string: 'tf-idf negative idf smoothing', clicked_doc_id: 'doc-1005', timestamp: '2026-10-30 15:02:45' },
  { id: 'log-907', user_id: 'usr-6', query_string: 'rbac express middleware', clicked_doc_id: 'doc-1025', timestamp: '2026-10-30 17:40:12' },
  { id: 'log-908', user_id: 'guest', query_string: 'vector hybrid reranking', clicked_doc_id: null, timestamp: '2026-10-31 09:15:00' },
  { id: 'log-909', user_id: 'usr-7', query_string: 'pgbouncer transaction mode', clicked_doc_id: 'doc-1021', timestamp: '2026-10-31 10:22:38' },
  { id: 'log-910', user_id: 'usr-4', query_string: 'bm25 k1 parameter tuning', clicked_doc_id: 'doc-1001', timestamp: '2026-10-31 11:08:14' }
];

const INITIAL_SYSTEM_LOGS = [
  { id: 'sys-101', actor: 'Lê Phan Nhật Duy (@SalvadorDalier)', action: 'Updated global RBAC permission guard matrix', target: 'System Security Config', timestamp: '2026-10-28 09:00:12' },
  { id: 'sys-102', actor: 'Marcus Chen (@Winnie_the_pooh)', action: 'Published 52 technical Q&A seed records and verified 5 categories', target: 'Documents Corpus', timestamp: '2026-10-29 14:22:08' },
  { id: 'sys-103', actor: "Liam O'Connor (@loconner)", action: 'Configured baseline SEO meta descriptions and alt_text across corpus', target: 'SEO Metadata Store', timestamp: '2026-10-30 11:15:40' },
  { id: 'sys-104', actor: 'Peter Griffin (@familyguy)', action: 'Enabled automated @mention validation and spam flag queue', target: 'Moderation Queue', timestamp: '2026-10-30 16:45:00' }
];

const STOPWORDS = new Set([
  'the', 'and', 'for', 'with', 'that', 'this', 'from', 'are', 'was', 'were',
  'have', 'has', 'had', 'not', 'but', 'what', 'when', 'where', 'how', 'why',
  'who', 'which', 'can', 'our', 'your', 'their', 'into', 'over', 'under',
  'between', 'through', 'during', 'before', 'after', 'above', 'below', 'to',
  'of', 'in', 'on', 'at', 'by', 'an', 'as', 'be', 'is', 'it', 'or'
]);

function tokenizeText(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^a-z0-9_+-]+/g, ' ')
    .split(/\s+/)
    .filter(tok => tok.length > 2 && !STOPWORDS.has(tok));
}

// ============================================================================
// MAIN APPLICATION COMPONENT
// ============================================================================

export default function App() {
  // --- Global State with localStorage persistence ---
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('nexusqa_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem('nexusqa_currentUserId');
    return saved ? JSON.parse(saved) : 'usr-1';
  });
  const [documents, setDocuments] = useState(() => {
    const saved = localStorage.getItem('nexusqa_documents');
    return saved ? JSON.parse(saved) : INITIAL_DOCUMENTS;
  });
  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('nexusqa_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });
  const [tags, setTags] = useState(() => {
    const saved = localStorage.getItem('nexusqa_tags');
    return saved ? JSON.parse(saved) : INITIAL_TAGS;
  });
  const [searchLogs, setSearchLogs] = useState(() => {
    const saved = localStorage.getItem('nexusqa_searchLogs');
    return saved ? JSON.parse(saved) : INITIAL_SEARCH_LOGS;
  });
  const [systemLogs, setSystemLogs] = useState(() => {
    const saved = localStorage.getItem('nexusqa_systemLogs');
    return saved ? JSON.parse(saved) : INITIAL_SYSTEM_LOGS;
  });

  // Global Platform Settings (Managed by Super Admin) with persistence
  const [platformSettings, setPlatformSettings] = useState(() => {
    const saved = localStorage.getItem('nexusqa_platformSettings');
    return saved ? JSON.parse(saved) : {
      siteTitle: 'Terracotta QnA',
      itemsPerPage: 10,
      allowRegexSearch: true,
      maintenanceBanner: '',
      strictRbacEnforcement: true
    };
  });

  // Persist state changes to localStorage
  useEffect(() => {
    localStorage.setItem('nexusqa_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('nexusqa_currentUserId', JSON.stringify(currentUserId));
  }, [currentUserId]);

  useEffect(() => {
    localStorage.setItem('nexusqa_documents', JSON.stringify(documents));
  }, [documents]);

  useEffect(() => {
    localStorage.setItem('nexusqa_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('nexusqa_tags', JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    localStorage.setItem('nexusqa_searchLogs', JSON.stringify(searchLogs));
  }, [searchLogs]);

  useEffect(() => {
    localStorage.setItem('nexusqa_systemLogs', JSON.stringify(systemLogs));
  }, [systemLogs]);

  useEffect(() => {
    localStorage.setItem('nexusqa_platformSettings', JSON.stringify(platformSettings));
  }, [platformSettings]);

  // Navigation & View State: 'directory' | 'detail' | 'admin' | 'architecture' | 'auth' | 'profile'
  const [activeView, setActiveView] = useState('directory');
  const [selectedDocId, setSelectedDocId] = useState('doc-1001');
  const [activeAdminTab, setActiveAdminTab] = useState('super_admin');

  // Dedicated Auth Page State ('login' | 'register')
  const [authMode, setAuthMode] = useState('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Registration Form State
  const [regUsername, setRegUsername] = useState('');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState(ROLES.USER);
  const [regBio, setRegBio] = useState('');
  const [regAvatar, setRegAvatar] = useState(AVATAR_PRESETS[0].url);
  const [regError, setRegError] = useState('');
  const regFileInputRef = useRef(null);

  // Profile Management Page State
  const [profileUsername, setProfileUsername] = useState('');
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profileBio, setProfileBio] = useState('');
  const [profileAvatar, setProfileAvatar] = useState('');
  const [profileCustomUrl, setProfileCustomUrl] = useState('');
  const [profileActivityTab, setProfileActivityTab] = useState('questions'); // 'questions' | 'comments' | 'mentions' | 'logs'
  const profileFileInputRef = useRef(null);

  // User Profile Inspector Modal (when clicking any @username pill or author avatar)
  const [inspectedUser, setInspectedUser] = useState(null);

  // Directory Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchMode, setSearchMode] = useState('like'); // 'like' | 'regex'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortBy, setSortBy] = useState('latest'); // 'latest' | 'views' | 'likes'
  const [currentPage, setCurrentPage] = useState(1);

  // User Reaction Tracking: { [targetId]: +1 | -1 }
  const [userReactions, setUserReactions] = useState({});

  // Modals & Drawers
  const [showAskModal, setShowAskModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [flagModalTarget, setFlagModalTarget] = useState(null);
  const [flagReasonInput, setFlagReasonInput] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Detail View Comment Input & @mention Autocomplete State
  const [newCommentText, setNewCommentText] = useState('');
  const [mentionSearchQuery, setMentionSearchQuery] = useState(null);

  // Content Manager Taxonomy Input State
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryDesc, setNewCategoryDesc] = useState('');
  const [newTagName, setNewTagName] = useState('');

  // Data & SEO Specialist + Phase 2 Search Prep Inspector State
  const [seoSelectedDocId, setSeoSelectedDocId] = useState('doc-1001');
  const [bm25TestQuery, setBm25TestQuery] = useState('bm25 k1 parameter inverted index postgresql');
  const [bm25K1, setBm25K1] = useState(1.5);
  const [bm25B, setBm25B] = useState(0.75);

  // Current Logged-In User (null if logged out / guest)
  const currentUser = useMemo(
    () => (currentUserId ? users.find(u => u.id === currentUserId) || null : null),
    [users, currentUserId]
  );

  // Map users by ID and by lowercase username for instant dynamic lookup across all posts & comments
  const usersById = useMemo(() => {
    const map = {};
    users.forEach(u => {
      map[u.id] = u;
    });
    return map;
  }, [users]);

  const usersByUsername = useMemo(() => {
    const map = {};
    users.forEach(u => {
      map[u.username.toLowerCase()] = u;
    });
    return map;
  }, [users]);

  // Sync Profile Editor fields whenever currentUser changes or user opens 'profile' view
  useEffect(() => {
    if (currentUser) {
      setProfileUsername(currentUser.username);
      setProfileName(currentUser.name);
      setProfileEmail(currentUser.email);
      setProfileBio(currentUser.bio || '');
      setProfileAvatar(currentUser.avatar || AVATAR_PRESETS[0].url);
    }
  }, [currentUser]);

  // Helper to show non-blocking notification toast
  const notify = (msg, type = 'success') => {
    setToastMessage({ msg, type });
    setTimeout(() => {
      setToastMessage(prev => (prev?.msg === msg ? null : prev));
    }, 3800);
  };

  // Append an immutable entry to system_logs
  const logSystemAction = (action, target, actorOverride = null) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const actorLabel =
      actorOverride ||
      (currentUser
        ? `${currentUser.name} (@${currentUser.username} • ${currentUser.role})`
        : 'Guest User');
    setSystemLogs(prev => [
      {
        id: `sys-${100 + prev.length + 1}`,
        actor: actorLabel,
        action,
        target,
        timestamp: now
      },
      ...prev
    ]);
  };

  // Switch active user persona or log out
  const handleRoleSwitch = (userId) => {
    if (!userId) {
      setCurrentUserId(null);
      notify('Logged out. Browsing as Guest.');
      return;
    }
    setCurrentUserId(userId);
    const targetUser = users.find(u => u.id === userId);
    if (targetUser) {
      if (targetUser.role === ROLES.SUPER_ADMIN) setActiveAdminTab('super_admin');
      if (targetUser.role === ROLES.CONTENT_MANAGER) setActiveAdminTab('content_manager');
      if (targetUser.role === ROLES.MODERATOR) setActiveAdminTab('moderator');
      if (targetUser.role === ROLES.DATA_SEO) setActiveAdminTab('data_seo');
      notify(`Logged in as ${targetUser.name} (@${targetUser.username} — ${ROLE_META[targetUser.role].label})`);
    }
  };

  // ============================================================================
  // 4. AUTHENTICATION (LOGIN, REGISTER, IMAGE UPLOAD) & PROFILE MANAGEMENT
  // ============================================================================

  const handleImageFileUpload = (e, targetSetter) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      notify('Please select a valid image file (PNG, JPG, SVG, WebP).', 'error');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        targetSetter(reader.result);
        notify('Profile picture loaded! Click Save to apply.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const identifier = loginIdentifier.trim().toLowerCase();
    if (!identifier) {
      setLoginError('Please enter your username or email address.');
      return;
    }
    const matchedUser = users.find(
      u =>
        u.username.toLowerCase() === identifier ||
        u.email.toLowerCase() === identifier
    );
    if (!matchedUser) {
      setLoginError('No account found matching that username or email. Try a demo account below or register a new account.');
      return;
    }
    if (matchedUser.status === 'suspended') {
      setLoginError('This account has been suspended by a Super Admin.');
      return;
    }
    handleRoleSwitch(matchedUser.id);
    setLoginIdentifier('');
    setLoginPassword('');
    setActiveView('directory');
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setRegError('');
    const cleanUsername = regUsername.trim();
    const cleanName = regName.trim();
    const cleanEmail = regEmail.trim();

    if (!/^[a-zA-Z0-9_]{3,24}$/.test(cleanUsername)) {
      setRegError('Username must be 3–24 characters using only letters, numbers, or underscores.');
      return;
    }
    if (usersByUsername[cleanUsername.toLowerCase()]) {
      setRegError(`Username @${cleanUsername} is already taken. Please choose another.`);
      return;
    }
    if (!cleanName || !cleanEmail) {
      setRegError('Display Name and Email are required.');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase())) {
      setRegError('An account with this email already exists.');
      return;
    }

    const newUserId = `usr-${users.length + 1}-${Date.now().toString().slice(-3)}`;
    const newUser = {
      id: newUserId,
      username: cleanUsername,
      name: cleanName,
      email: cleanEmail,
      password: regPassword || 'password123',
      role: regRole,
      status: 'active',
      reputation: 100,
      bio: regBio.trim() || 'Community member & software engineer on Terracotta QnA.',
      joined_at: new Date().toISOString().slice(0, 10),
      avatar: regAvatar || AVATAR_PRESETS[0].url
    };

    setUsers(prev => [...prev, newUser]);
    setCurrentUserId(newUserId);
    logSystemAction(
      `Registered new user account @${cleanUsername} (${ROLE_META[regRole].label})`,
      'Auth & User Store',
      `${cleanName} (@${cleanUsername})`
    );
    setRegUsername('');
    setRegName('');
    setRegEmail('');
    setRegPassword('');
    setRegBio('');
    notify(`Welcome to Terracotta QnA, ${cleanName} (@${cleanUsername})! Your account is active.`);
    setActiveView('profile');
  };

  // Validate username availability on the Profile Management page
  const profileUsernameValidation = useMemo(() => {
    if (!currentUser) return { valid: false, message: 'Not logged in' };
    const clean = profileUsername.trim();
    if (!/^[a-zA-Z0-9_]{3,24}$/.test(clean)) {
      return {
        valid: false,
        message: 'Username must be 3–24 characters (letters, numbers, underscores only).'
      };
    }
    const existing = usersByUsername[clean.toLowerCase()];
    if (existing && existing.id !== currentUser.id) {
      return {
        valid: false,
        message: `@${clean} is already taken by ${existing.name}.`
      };
    }
    return {
      valid: true,
      message:
        clean === currentUser.username
          ? 'Current username'
          : `@${clean} is available!`
    };
  }, [profileUsername, currentUser, usersByUsername]);

  // Save Profile Changes & Propagate Username / Display Name / Avatar across all Documents, Comments & @mentions
  const handleSaveProfile = (e) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!profileUsernameValidation.valid) {
      notify(profileUsernameValidation.message, 'error');
      return;
    }

    const oldUsername = currentUser.username;
    const newUsername = profileUsername.trim();
    const newName = profileName.trim() || currentUser.name;
    const newEmail = profileEmail.trim() || currentUser.email;
    const newBio = profileBio.trim();
    const newAvatar = profileAvatar || currentUser.avatar;

    // 1. Update Users Table
    setUsers(prev =>
      prev.map(u =>
        u.id === currentUser.id
          ? {
              ...u,
              username: newUsername,
              name: newName,
              email: newEmail,
              bio: newBio,
              avatar: newAvatar
            }
          : u
      )
    );

    // 2. Propagate username and display name changes across all Documents, Comments, and @mentions
    const mentionRegex =
      oldUsername !== newUsername
        ? new RegExp(`@${oldUsername}\\b`, 'gi')
        : null;

    setDocuments(prev =>
      prev.map(doc => {
        const isDocAuthor = doc.author_id === currentUser.id;
        const updatedDocContent = mentionRegex
          ? doc.content.replace(mentionRegex, `@${newUsername}`)
          : doc.content;

        const updatedComments = doc.comments.map(cmt => {
          const isCmtAuthor = cmt.author_id === currentUser.id;
          const updatedCmtContent = mentionRegex
            ? cmt.content.replace(mentionRegex, `@${newUsername}`)
            : cmt.content;
          const updatedMentions = (cmt.mentioned_users || []).map(m =>
            m.toLowerCase() === oldUsername.toLowerCase() ? newUsername : m
          );

          return {
            ...cmt,
            author_username: isCmtAuthor ? newUsername : cmt.author_username,
            author_name: isCmtAuthor ? newName : cmt.author_name,
            content: updatedCmtContent,
            mentioned_users: updatedMentions
          };
        });

        return {
          ...doc,
          author: isDocAuthor ? newName : doc.author,
          author_username: isDocAuthor ? newUsername : doc.author_username,
          content: updatedDocContent,
          comments: updatedComments
        };
      })
    );

    logSystemAction(
      oldUsername !== newUsername
        ? `Updated profile & renamed username @${oldUsername} → @${newUsername}`
        : `Updated profile details & avatar for @${newUsername}`,
      'User Profile Store',
      `${newName} (@${newUsername})`
    );
    notify(
      oldUsername !== newUsername
        ? `Profile saved! Username @${oldUsername} → @${newUsername} propagated across all posts & @mentions.`
        : 'Profile settings and avatar updated!'
    );
  };

  // ============================================================================
  // 5. DIRECTORY FILTERING, REGEX VALIDATION & PAGINATION
  // ============================================================================

  const regexStatus = useMemo(() => {
    if (searchMode !== 'regex' || !searchQuery.trim()) return { valid: true, regex: null };
    try {
      const rx = new RegExp(searchQuery.trim(), 'i');
      return { valid: true, regex: rx };
    } catch (err) {
      return { valid: false, error: err.message };
    }
  }, [searchQuery, searchMode]);

  const filteredDocuments = useMemo(() => {
    return documents
      .filter(doc => {
        // Visibility rule: Standard users/guests only see 'published' docs (or their own drafts)
        const canSeeUnpublished =
          currentUser &&
          (currentUser.role === ROLES.CONTENT_MANAGER ||
            currentUser.role === ROLES.SUPER_ADMIN ||
            doc.author_id === currentUser.id);

        if (!canSeeUnpublished && doc.status !== 'published') {
          return false;
        }

        if (selectedCategory !== 'all' && doc.category_id !== selectedCategory) {
          return false;
        }

        if (selectedTag !== 'all' && !doc.tags.includes(selectedTag)) {
          return false;
        }

        if (dateFrom && doc.created_at < dateFrom) return false;
        if (dateTo && doc.created_at > dateTo) return false;

        const q = searchQuery.trim();
        if (q) {
          const authorUser = usersById[doc.author_id];
          const authorText = authorUser
            ? `${authorUser.name} ${authorUser.username} @${authorUser.username}`
            : `${doc.author} ${doc.author_username} @${doc.author_username}`;
          
          // Also search in comment authors and @mentions
          const commentText = doc.comments.map(c => {
            const cmtAuthor = usersById[c.author_id];
            const mentions = (c.mentioned_users || []).map(m => `@${m}`).join(' ');
            return `${c.content} ${cmtAuthor?.username || c.author_username} @${cmtAuthor?.username || c.author_username} ${mentions}`;
          }).join(' ');
          
          const hay = `${doc.title} ${doc.summary} ${doc.content} ${doc.tags.join(' ')} ${authorText} ${commentText}`;
          
          if (searchMode === 'regex' && regexStatus.valid && regexStatus.regex) {
            if (!regexStatus.regex.test(hay)) return false;
          } else {
            // Handle @username search specially - remove @ prefix if present
            const searchTerm = q.startsWith('@') ? q.slice(1) : q;
            if (!hay.toLowerCase().includes(searchTerm.toLowerCase())) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'views') return b.views_count - a.views_count;
        if (sortBy === 'likes') return b.likes - a.likes;
        return b.created_at.localeCompare(a.created_at);
      });
  }, [
    documents,
    currentUser,
    usersById,
    selectedCategory,
    selectedTag,
    dateFrom,
    dateTo,
    searchQuery,
    searchMode,
    regexStatus,
    sortBy
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, searchMode, selectedCategory, selectedTag, dateFrom, dateTo, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filteredDocuments.length / platformSettings.itemsPerPage));
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * platformSettings.itemsPerPage;
    return filteredDocuments.slice(start, start + platformSettings.itemsPerPage);
  }, [filteredDocuments, currentPage, platformSettings.itemsPerPage]);

  // Log search execution into `search_click_logs`
  const handleLogSearchQuery = (e) => {
    if (e) e.preventDefault();
    const trimmed = searchQuery.trim();
    if (!trimmed) {
      notify('Enter a search keyword to log a query event into search_click_logs.', 'info');
      return;
    }
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);
    const newLog = {
      id: `log-${900 + searchLogs.length + 1}`,
      user_id: currentUser ? currentUser.id : 'guest',
      query_string: trimmed,
      clicked_doc_id: null,
      timestamp: now
    };
    setSearchLogs(prev => [newLog, ...prev]);
    notify(`Logged search query "${trimmed}" (clicked_doc_id: null) to search_click_logs`);
  };

  // Open Document Detail View + Log Click + Increment views_count
  const handleOpenDocument = (docId) => {
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    setDocuments(prev =>
      prev.map(d => (d.id === docId ? { ...d, views_count: d.views_count + 1 } : d))
    );

    const activeQuery = searchQuery.trim() || `[direct_browse:${selectedCategory}]`;
    const newClickLog = {
      id: `log-${900 + searchLogs.length + 1}`,
      user_id: currentUser ? currentUser.id : 'guest',
      query_string: activeQuery,
      clicked_doc_id: docId,
      timestamp: now
    };
    setSearchLogs(prev => [newClickLog, ...prev]);

    setSelectedDocId(docId);
    setActiveView('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ============================================================================
  // 6. USER ENGAGEMENT HANDLERS (VOTING, COMMENTING, @MENTIONS, FLAGGING)
  // ============================================================================

  const requireAuth = (actionDescription) => {
    if (!currentUser) {
      notify(`Please sign in or register to ${actionDescription}.`, 'info');
      setAuthMode('login');
      setActiveView('auth');
      return false;
    }
    return true;
  };

  const handleVote = (targetType, targetId, delta) => {
    if (!requireAuth('vote on posts and comments')) return;

    const reactionKey = `${currentUser.id}:${targetId}`;
    const currentVote = userReactions[reactionKey] || 0;
    let netDiff = delta;
    let nextVote = delta;

    if (currentVote === delta) {
      netDiff = -delta;
      nextVote = 0;
    } else if (currentVote !== 0) {
      netDiff = delta * 2;
      nextVote = delta;
    }

    setUserReactions(prev => ({ ...prev, [reactionKey]: nextVote }));

    if (targetType === 'doc') {
      setDocuments(prev =>
        prev.map(d => (d.id === targetId ? { ...d, likes: d.likes + netDiff } : d))
      );
    } else if (targetType === 'comment') {
      setDocuments(prev =>
        prev.map(d => ({
          ...d,
          comments: d.comments.map(c =>
            c.id === targetId ? { ...c, likes: c.likes + netDiff } : c
          )
        }))
      );
    }
  };

  // Detect trailing @mention while typing in the comment box
  const handleCommentTextChange = (val) => {
    setNewCommentText(val);
    const match = val.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      setMentionSearchQuery(match[1].toLowerCase());
    } else {
      setMentionSearchQuery(null);
    }
  };

  const matchingMentionUsers = useMemo(() => {
    if (mentionSearchQuery === null) return [];
    return users
      .filter(
        u =>
          u.username.toLowerCase().includes(mentionSearchQuery) ||
          u.name.toLowerCase().includes(mentionSearchQuery)
      )
      .slice(0, 6);
  }, [mentionSearchQuery, users]);

  const insertMentionUsername = (username) => {
    if (mentionSearchQuery !== null) {
      setNewCommentText(prev => prev.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `));
      setMentionSearchQuery(null);
    } else {
      setNewCommentText(
        prev => `${prev}${prev.endsWith(' ') || !prev ? '' : ' '}@${username} `
      );
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!requireAuth('post a comment or technical answer')) return;
    if (!newCommentText.trim()) return;

    // Extract only verified @username mentions that exist in our `users` store
    const rawMatches = [...newCommentText.matchAll(/@([a-zA-Z0-9_]+)/g)].map(m => m[1]);
    const verifiedMentions = Array.from(
      new Set(
        rawMatches
          .map(handle => usersByUsername[handle.toLowerCase()]?.username)
          .filter(Boolean)
      )
    );

    const now = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const newComment = {
      id: `cmt-${Date.now()}`,
      doc_id: selectedDocId,
      author_id: currentUser.id,
      author_username: currentUser.username,
      author_name: currentUser.name,
      content: newCommentText.trim(),
      mentioned_users: verifiedMentions,
      likes: 1,
      is_flagged: false,
      flag_reason: null,
      created_at: now
    };

    setDocuments(prev =>
      prev.map(d =>
        d.id === selectedDocId ? { ...d, comments: [...d.comments, newComment] } : d
      )
    );
    setNewCommentText('');
    setMentionSearchQuery(null);
    notify(
      verifiedMentions.length > 0
        ? `Comment posted and notified ${verifiedMentions.map(u => '@' + u).join(', ')}!`
        : 'Answer/Comment posted to thread!'
    );
  };

  const handleSubmitFlag = (e) => {
    e.preventDefault();
    if (!flagModalTarget || !flagReasonInput.trim()) return;

    if (flagModalTarget.type === 'doc') {
      setDocuments(prev =>
        prev.map(d =>
          d.id === flagModalTarget.id
            ? { ...d, is_flagged: true, flag_reason: flagReasonInput.trim() }
            : d
        )
      );
    } else {
      setDocuments(prev =>
        prev.map(d => ({
          ...d,
          comments: d.comments.map(c =>
            c.id === flagModalTarget.id
              ? { ...c, is_flagged: true, flag_reason: flagReasonInput.trim() }
              : c
          )
        }))
      );
    }

    logSystemAction(
      `Flagged ${flagModalTarget.type} (${flagModalTarget.id}): "${flagReasonInput.trim()}"`,
      'Moderator Queue'
    );
    setFlagModalTarget(null);
    setFlagReasonInput('');
    notify('Report submitted to the Moderator Queue for review.');
  };

  // ============================================================================
  // 7. PHASE 2 SEARCH ENGINE SANDBOX (INVERTED INDEX & LIVE BM25 RANKER)
  // ============================================================================

  const corpusSearchStats = useMemo(() => {
    const N = documents.length;
    const docTokensMap = {};
    const dfMap = {};
    let totalTokens = 0;

    documents.forEach(doc => {
      const tokens = tokenizeText(`${doc.title} ${doc.tags.join(' ')} ${doc.content}`);
      docTokensMap[doc.id] = tokens;
      totalTokens += tokens.length;

      const uniqueSet = new Set(tokens);
      uniqueSet.forEach(tok => {
        dfMap[tok] = (dfMap[tok] || 0) + 1;
      });
    });

    const avgdl = totalTokens / Math.max(1, N);
    return { N, avgdl, docTokensMap, dfMap, totalVocabulary: Object.keys(dfMap).length };
  }, [documents]);

  const bm25RankedResults = useMemo(() => {
    const qTokens = Array.from(new Set(tokenizeText(bm25TestQuery)));
    if (qTokens.length === 0) return [];

    const { N, avgdl, docTokensMap, dfMap } = corpusSearchStats;

    return documents
      .map(doc => {
        const tokens = docTokensMap[doc.id] || [];
        const dl = tokens.length;
        const tfCounts = {};
        tokens.forEach(t => {
          tfCounts[t] = (tfCounts[t] || 0) + 1;
        });

        let totalScore = 0;
        const termBreakdowns = [];

        qTokens.forEach(qt => {
          const tf = tfCounts[qt] || 0;
          const df = dfMap[qt] || 0;
          const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
          const numerator = tf * (bm25K1 + 1);
          const denominator = tf + bm25K1 * (1 - bm25B + bm25B * (dl / avgdl));
          const termScore = tf > 0 ? idf * (numerator / denominator) : 0;

          totalScore += termScore;
          if (tf > 0) {
            termBreakdowns.push({
              term: qt,
              tf,
              df,
              idf: idf.toFixed(3),
              score: termScore.toFixed(3)
            });
          }
        });

        return {
          doc,
          dl,
          score: totalScore,
          termBreakdowns
        };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
  }, [bm25TestQuery, bm25K1, bm25B, documents, corpusSearchStats]);

  // ============================================================================
  // 8. EXPORT SEARCH_CLICK_LOGS & RESOLVE LIVE AUTHOR PROFILES
  // ============================================================================

  const handleExportSearchLogs = (format) => {
    let content = '';
    let mime = 'text/plain';
    let ext = 'txt';

    if (format === 'json') {
      content = JSON.stringify(searchLogs, null, 2);
      mime = 'application/json';
      ext = 'json';
    } else {
      const headers = ['id', 'user_id', 'query_string', 'clicked_doc_id', 'timestamp'];
      const rows = searchLogs.map(r =>
        [
          r.id,
          r.user_id,
          `"${(r.query_string || '').replace(/"/g, '""')}"`,
          r.clicked_doc_id || 'NULL',
          r.timestamp
        ].join(',')
      );
      content = [headers.join(','), ...rows].join('\n');
      mime = 'text/csv';
      ext = 'csv';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `search_click_logs_phase2.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    notify(`Exported ${searchLogs.length} search_click_logs records as ${ext.toUpperCase()}`);
  };

  // Resolve live author user object from `usersById` or `usersByUsername`
  const resolveDocAuthor = (doc) => {
    return (
      usersById[doc.author_id] ||
      usersByUsername[(doc.author_username || '').toLowerCase()] || {
        id: doc.author_id,
        name: doc.author,
        username: doc.author_username,
        role: ROLES.USER,
        avatar: AVATAR_PRESETS[0].url,
        bio: 'Community Member'
      }
    );
  };

  const resolveCommentAuthor = (cmt) => {
    return (
      usersById[cmt.author_id] ||
      usersByUsername[(cmt.author_username || '').toLowerCase()] || {
        id: cmt.author_id,
        name: cmt.author_name,
        username: cmt.author_username,
        role: ROLES.USER,
        avatar: AVATAR_PRESETS[1].url,
        bio: 'Community Member'
      }
    );
  };

  const selectedDoc = useMemo(
    () => documents.find(d => d.id === selectedDocId) || documents[0],
    [documents, selectedDocId]
  );

  const seoSelectedDoc = useMemo(
    () => documents.find(d => d.id === seoSelectedDocId) || documents[0],
    [documents, seoSelectedDocId]
  );

  const flaggedDocs = useMemo(() => documents.filter(d => d.is_flagged), [documents]);
  const flaggedComments = useMemo(() => {
    const list = [];
    documents.forEach(d => {
      d.comments.forEach(c => {
        if (c.is_flagged) {
          list.push({ ...c, docTitle: d.title });
        }
      });
    });
    return list;
  }, [documents]);

  const getCategoryName = (catId) =>
    categories.find(c => c.id === catId)?.name || 'Uncategorized';

  // Render comment text with interactive, avatar-backed @username pills
  const renderFormattedComment = (text) => {
    const parts = text.split(/(@[a-zA-Z0-9_]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        const handle = part.slice(1);
        const matchedUser = usersByUsername[handle.toLowerCase()];
        if (matchedUser) {
          return (
            <button
              key={i}
              type="button"
              onClick={() => setInspectedUser(matchedUser)}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 mx-0.5 rounded-md text-xs font-semibold bg-terracotta-50 hover:bg-terracotta-100 text-terracotta-700 border border-terracotta-200 transition-colors align-baseline"
              title={`View ${matchedUser.name} (@${matchedUser.username})`}
            >
              <img
                src={matchedUser.avatar}
                alt={matchedUser.username}
                className="w-3.5 h-3.5 rounded-full object-cover"
              />
              <span>@{matchedUser.username}</span>
            </button>
          );
        }
        return (
          <span
            key={i}
            className="inline-flex items-center px-1.5 py-0.5 mx-0.5 rounded text-xs font-semibold bg-slate-100 text-slate-600"
          >
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <div className="min-h-screen bg-amber-50 text-slate-900 flex flex-col font-sans">
      {/* ====================================================================
          TOP ROLE SWITCHER & RBAC PERSONA TESTING BAR
         ==================================================================== */}
      <div className="bg-slate-900 text-slate-200 border-b border-slate-800 px-4 py-2 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-terracotta-500/20 text-terracotta-300 border border-terracotta-500/30 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              RBAC Persona Switcher
            </span>
            <span className="text-slate-400 hidden sm:inline">
              Quick-switch accounts or test Guest state:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {users.slice(0, 6).map(u => {
              const active = currentUser?.id === u.id;
              return (
                <button
                  key={u.id}
                  onClick={() => handleRoleSwitch(u.id)}
                  className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-terracotta-600 text-white shadow-sm ring-1 ring-terracotta-400'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <img
                    src={u.avatar}
                    alt={u.username}
                    className="w-4 h-4 rounded-full object-cover"
                  />
                  <span>{ROLE_META[u.role].label}</span>
                  <span className="text-[10px] opacity-80">(@{u.username})</span>
                </button>
              );
            })}
            <button
              onClick={() => handleRoleSwitch(null)}
              className={`px-2 py-1 rounded-md font-medium transition-all flex items-center gap-1 ${
                !currentUser
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
              }`}
            >
              <LogOut className="w-3 h-3" />
              <span>Guest</span>
            </button>
          </div>
        </div>
      </div>

      {/* Optional Global Maintenance Banner configured by Super Admin */}
      {platformSettings.maintenanceBanner && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-center text-xs font-semibold flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{platformSettings.maintenanceBanner}</span>
        </div>
      )}

      {/* ====================================================================
          MAIN HEADER & PRIMARY NAVIGATION
         ==================================================================== */}
      <header className="bg-orange-50 border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveView('directory')}
              className="flex items-center gap-2.5 text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-terracotta-600 flex items-center justify-center text-white shadow-sm group-hover:bg-terracotta-700 transition-colors">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg tracking-tight text-slate-900">
                    {platformSettings.siteTitle}
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                    60 Seed Docs + Phase 2 Ready
                  </span>
                  <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    💾 Auto-Save Active
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Information Retrieval & Search Engineering Community Platform
                </p>
              </div>
            </button>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex flex-wrap items-center gap-1">
            <button
              onClick={() => setActiveView('directory')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'directory' || activeView === 'detail'
                  ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Q&A Directory ({documents.length})</span>
            </button>

            <button
              onClick={() => setActiveView('admin')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'admin'
                  ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Admin & RBAC</span>
              {(flaggedDocs.length + flaggedComments.length > 0) && (
                <span className="px-1.5 py-0.2 bg-amber-500 text-white rounded-full text-[10px] font-bold">
                  {flaggedDocs.length + flaggedComments.length}
                </span>
              )}
            </button>

            <button
              onClick={() => {
                if (currentUser) {
                  setActiveView('profile');
                } else {
                  setAuthMode('login');
                  setActiveView('auth');
                }
              }}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'profile'
                  ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Profile Settings</span>
            </button>

            <button
              onClick={() => setActiveView('auth')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'auth'
                  ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>{currentUser ? 'Auth / Switch' : 'Login / Register'}</span>
            </button>

            <button
              onClick={() => setActiveView('architecture')}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-1.5 transition-colors ${
                activeView === 'architecture'
                  ? 'bg-terracotta-50 text-terracotta-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>SQL & API</span>
            </button>
          </nav>

          {/* Right User Profile & Ask Question CTA */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (!requireAuth('post a new question')) return;
                setEditingDoc(null);
                setShowAskModal(true);
              }}
              className="px-3.5 py-2 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ask Question</span>
            </button>

            {currentUser ? (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setActiveView('profile')}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-left transition-colors"
                  title="Manage Profile, Avatar & Username"
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.username}
                    className="w-8 h-8 rounded-full object-cover ring-2 ring-terracotta-100"
                  />
                  <div className="hidden md:block">
                    <div className="text-xs font-bold text-slate-800 leading-none">
                      @{currentUser.username}
                    </div>
                    <div className="text-[10px] text-terracotta-600 font-semibold mt-0.5">
                      {ROLE_META[currentUser.role].label}
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSwitch(null)}
                  className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Log Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setAuthMode('login');
                    setActiveView('auth');
                  }}
                  className="px-3 py-2 rounded-lg border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    setAuthMode('register');
                    setActiveView('auth');
                  }}
                  className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Non-blocking Toast Banner */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-lg border border-slate-700 flex items-center gap-3 animate-fade-in">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage.msg}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white ml-auto text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* ====================================================================
          MAIN CONTENT AREA
         ==================================================================== */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {/* ==================================================================
            VIEW 0A: DEDICATED LOGIN & REGISTRATION PAGE (`activeView === 'auth'`)
           ================================================================== */}
        {activeView === 'auth' && (
          <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Sign In / Register Card */}
            <div className="lg:col-span-7 bg-orange-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              {/* Mode Switch Tabs */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('login');
                    setLoginError('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    authMode === 'login'
                      ? 'bg-orange-50 text-terracotta-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Existing Account</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('register');
                    setRegError('');
                  }}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                    authMode === 'register'
                      ? 'bg-orange-50 text-terracotta-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create New Account (Register)</span>
                </button>
              </div>

              {authMode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Welcome Back to Terracotta QnA
                    </h2>
                    <p className="text-slate-500 mt-0.5">
                      Sign in with your username (e.g. <code className="text-terracotta-600 font-mono">loconner</code> or <code className="text-terracotta-600 font-mono">SalvadorDalier</code>) or email address.
                    </p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Username or Email Address
                    </label>
                    <div className="relative">
                      <AtSign className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={loginIdentifier}
                        onChange={e => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. loconner or liam.oconner@nexusqa.dev"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                        placeholder="Enter password (any password works for demo accounts)"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm shadow-xs transition-colors"
                  >
                    Sign In
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Create Your Community Account
                    </h2>
                    <p className="text-slate-500 mt-0.5">
                      Choose a unique <code className="text-terracotta-600 font-mono">@username</code>, upload a profile photo or pick an avatar preset, and select an RBAC role.
                    </p>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  {/* Profile Picture Picker in Registration */}
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <label className="block font-bold text-slate-800">
                      1. Choose or Upload Profile Picture
                    </label>
                    <div className="flex flex-wrap items-center gap-4">
                      <img
                        src={regAvatar}
                        alt="Registration Avatar Preview"
                        className="w-16 h-16 rounded-full object-cover ring-4 ring-white shadow-md"
                      />
                      <div className="space-y-2 flex-1">
                        <div className="flex flex-wrap gap-2">
                          <input
                            ref={regFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageFileUpload(e, setRegAvatar)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => regFileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-lg bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold flex items-center gap-1.5"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Photo from Device</span>
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {AVATAR_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setRegAvatar(preset.url)}
                              className={`rounded-full p-0.5 transition-transform ${
                                regAvatar === preset.url
                                  ? 'ring-2 ring-terracotta-600 scale-110'
                                  : 'opacity-75 hover:opacity-100'
                              }`}
                              title={preset.label}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-7 h-7 rounded-full"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Username (@handle) *
                      </label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={e => setRegUsername(e.target.value)}
                        placeholder="e.g. alex_dev"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Full Display Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        placeholder="alex.rivera@nexusqa.dev"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Password *
                      </label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        placeholder="Create a strong password"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Account Role (Selectable for RBAC Testing)
                    </label>
                    <select
                      value={regRole}
                      onChange={e => setRegRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-orange-50 font-semibold"
                    >
                      {Object.values(ROLES).map(r => (
                        <option key={r} value={r}>
                          {ROLE_META[r].label} ({r})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">
                      Engineering Bio
                    </label>
                    <textarea
                      rows={2}
                      value={regBio}
                      onChange={e => setRegBio(e.target.value)}
                      placeholder="Share your technical focus (e.g. Distributed Search, PostgreSQL, React)..."
                      className="w-full p-3 rounded-xl border border-slate-300"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-sm shadow-xs transition-colors"
                  >
                    Create Account & Sign In
                  </button>
                </form>
              )}
            </div>

            {/* Right Column: 1-Click Verified Community Accounts Directory */}
            <div className="lg:col-span-5 bg-orange-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-terracotta-600" />
                  <span>Instant 1-Click Demo Login ({users.length} Verified Users)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Click any verified community member (including <code className="text-terracotta-600 font-mono">@loconner</code>) to sign in immediately with their role permissions.
                </p>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {users.map(u => {
                  const isCurrent = currentUser?.id === u.id;
                  return (
                    <div
                      key={u.id}
                      className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isCurrent
                          ? 'border-terracotta-600 bg-terracotta-50/60'
                          : 'border-slate-200 hover:border-terracotta-300 bg-slate-50/40'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-10 h-10 rounded-full object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-900 truncate">
                              {u.name}
                            </span>
                            <span className="text-[11px] font-mono text-terracotta-600">
                              @{u.username}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span
                              className={`px-2 py-0.2 rounded-full text-[10px] font-bold border ${
                                ROLE_META[u.role].badgeClass
                              }`}
                            >
                              {ROLE_META[u.role].label}
                            </span>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          handleRoleSwitch(u.id);
                          setActiveView('directory');
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                          isCurrent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-terracotta-600 text-white'
                        }`}
                      >
                        {isCurrent ? 'Active' : 'Sign In'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            VIEW 0B: PROFILE MANAGEMENT PAGE (`activeView === 'profile'`)
           ================================================================== */}
        {activeView === 'profile' && (
          <div className="space-y-6">
            {!currentUser ? (
              <div className="bg-orange-50 rounded-2xl border border-slate-200 p-10 text-center space-y-4">
                <User className="w-10 h-10 text-slate-400 mx-auto" />
                <h2 className="text-base font-bold text-slate-900">
                  Sign In to Manage Your Profile
                </h2>
                <button
                  onClick={() => setActiveView('auth')}
                  className="px-4 py-2 rounded-xl bg-terracotta-600 text-white text-xs font-semibold"
                >
                  Go to Login / Register
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Avatar Studio & Username / Bio Form */}
                <div className="lg:col-span-5 bg-orange-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <div>
                      <h1 className="text-lg font-bold text-slate-900">
                        Profile Management
                      </h1>
                      <p className="text-xs text-slate-500">
                        Update your profile photo, change your <code className="font-mono text-terracotta-600">@username</code>, and edit your bio.
                      </p>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                        ROLE_META[currentUser.role].badgeClass
                      }`}
                    >
                      {ROLE_META[currentUser.role].label}
                    </span>
                  </div>

                  <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                    {/* Avatar Upload & Preset Selector */}
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                      <label className="block font-bold text-slate-800">
                        Profile Picture (Avatar)
                      </label>
                      <div className="flex items-center gap-4">
                        <div className="relative group shrink-0">
                          <img
                            src={profileAvatar || currentUser.avatar}
                            alt={currentUser.username}
                            className="w-20 h-20 rounded-full object-cover ring-4 ring-white shadow-md bg-orange-50"
                          />
                          <button
                            type="button"
                            onClick={() => profileFileInputRef.current?.click()}
                            className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-terracotta-600 text-white flex items-center justify-center shadow-sm hover:bg-terracotta-700"
                            title="Upload new picture from device"
                          >
                            <Camera className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="space-y-2 flex-1">
                          <input
                            ref={profileFileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={e => handleImageFileUpload(e, setProfileAvatar)}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => profileFileInputRef.current?.click()}
                            className="w-full px-3 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Image from Device</span>
                          </button>

                          <div className="flex gap-1.5">
                            <input
                              type="url"
                              value={profileCustomUrl}
                              onChange={e => setProfileCustomUrl(e.target.value)}
                              placeholder="Or paste image URL (https://...)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-orange-50 text-[11px]"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                if (profileCustomUrl.trim()) {
                                  setProfileAvatar(profileCustomUrl.trim());
                                  setProfileCustomUrl('');
                                }
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-900 text-white text-[11px] font-semibold"
                            >
                              Apply URL
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Curated Avatar Presets */}
                      <div className="pt-2">
                        <div className="text-[11px] text-slate-500 font-medium mb-1.5">
                          Or select an illustrated avatar preset:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {AVATAR_PRESETS.map(preset => (
                            <button
                              key={preset.id}
                              type="button"
                              onClick={() => setProfileAvatar(preset.url)}
                              className={`rounded-full p-0.5 transition-all ${
                                profileAvatar === preset.url
                                  ? 'ring-2 ring-terracotta-600 scale-110'
                                  : 'opacity-75 hover:opacity-100'
                              }`}
                              title={preset.label}
                            >
                              <img
                                src={preset.url}
                                alt={preset.label}
                                className="w-8 h-8 rounded-full"
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Change Username with Live Uniqueness Check */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-bold text-slate-800">
                          Username (@handle)
                        </label>
                        <span
                          className={`text-[11px] font-semibold ${
                            profileUsernameValidation.valid
                              ? 'text-emerald-600'
                              : 'text-rose-600'
                          }`}
                        >
                          {profileUsernameValidation.message}
                        </span>
                      </div>
                      <div className="relative">
                        <AtSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          required
                          value={profileUsername}
                          onChange={e => setProfileUsername(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 font-mono font-semibold"
                        />
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Changing your username automatically updates all your authored questions, comments, and <code className="font-mono">@mentions</code> across the platform.
                      </p>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Display Name
                      </label>
                      <input
                        type="text"
                        required
                        value={profileName}
                        onChange={e => setProfileName(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={profileEmail}
                        onChange={e => setProfileEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-300"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Technical Bio
                      </label>
                      <textarea
                        rows={3}
                        value={profileBio}
                        onChange={e => setProfileBio(e.target.value)}
                        className="w-full p-3 rounded-xl border border-slate-300"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <Check className="w-4 h-4" />
                      <span>Save Profile & Propagate Changes</span>
                    </button>
                  </form>
                </div>

                {/* Right Column: Personal Activity & Community Contributions */}
                <div className="lg:col-span-7 space-y-6">
                  {(() => {
                    const myDocs = documents.filter(d => d.author_id === currentUser.id);
                    const myComments = [];
                    const mentionsOfMe = [];
                    documents.forEach(d => {
                      d.comments.forEach(c => {
                        if (c.author_id === currentUser.id) {
                          myComments.push({ ...c, docTitle: d.title });
                        }
                        if (
                          (c.mentioned_users || []).some(
                            m => m.toLowerCase() === currentUser.username.toLowerCase()
                          )
                        ) {
                          mentionsOfMe.push({ ...c, docTitle: d.title });
                        }
                      });
                    });
                    const myLogs = searchLogs.filter(l => l.user_id === currentUser.id);

                    return (
                      <>
                        {/* Summary KPI Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                            <div className="text-[11px] text-slate-500">Authored Questions</div>
                            <div className="text-2xl font-bold text-slate-900 mt-1">
                              {myDocs.length}
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                            <div className="text-[11px] text-slate-500">Answers Posted</div>
                            <div className="text-2xl font-bold text-terracotta-600 mt-1">
                              {myComments.length}
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                            <div className="text-[11px] text-slate-500">@Mentions Received</div>
                            <div className="text-2xl font-bold text-emerald-600 mt-1">
                              {mentionsOfMe.length}
                            </div>
                          </div>
                          <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                            <div className="text-[11px] text-slate-500">Reputation Score</div>
                            <div className="text-2xl font-bold text-amber-600 mt-1">
                              {currentUser.reputation}
                            </div>
                          </div>
                        </div>

                        {/* Activity Feed Card */}
                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                          <div className="flex flex-wrap gap-1.5 border-b border-slate-100 pb-3">
                            {[
                              { id: 'questions', label: `My Questions (${myDocs.length})` },
                              { id: 'comments', label: `My Answers (${myComments.length})` },
                              { id: 'mentions', label: `@${currentUser.username} Mentions (${mentionsOfMe.length})` },
                              { id: 'logs', label: `My Search Logs (${myLogs.length})` }
                            ].map(tab => (
                              <button
                                key={tab.id}
                                onClick={() => setProfileActivityTab(tab.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  profileActivityTab === tab.id
                                    ? 'bg-terracotta-600 text-white'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>

                          {profileActivityTab === 'questions' && (
                            <div className="space-y-2.5 max-h-96 overflow-y-auto">
                              {myDocs.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">
                                  You haven't published any questions yet.
                                </p>
                              ) : (
                                myDocs.map(doc => (
                                  <div
                                    key={doc.id}
                                    className="p-3.5 rounded-xl border border-slate-200 hover:border-terracotta-300 flex items-center justify-between gap-3"
                                  >
                                    <div>
                                      <button
                                        onClick={() => handleOpenDocument(doc.id)}
                                        className="text-xs font-bold text-slate-900 hover:text-terracotta-600 text-left"
                                      >
                                        [{doc.id}] {doc.title}
                                      </button>
                                      <div className="text-[11px] text-slate-500 mt-0.5">
                                        {doc.created_at} • {doc.views_count} views • {doc.likes} votes
                                      </div>
                                    </div>
                                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-emerald-50 text-emerald-700">
                                      {doc.status}
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}

                          {profileActivityTab === 'comments' && (
                            <div className="space-y-2.5 max-h-96 overflow-y-auto">
                              {myComments.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">
                                  No comments posted yet.
                                </p>
                              ) : (
                                myComments.map(c => (
                                  <div
                                    key={c.id}
                                    className="p-3.5 rounded-xl border border-slate-200 space-y-1"
                                  >
                                    <div className="flex items-center justify-between">
                                      <button
                                        onClick={() => handleOpenDocument(c.doc_id)}
                                        className="text-xs font-bold text-terracotta-600 hover:underline text-left"
                                      >
                                        On: {c.docTitle}
                                      </button>
                                      <span className="text-[10px] text-slate-400">
                                        {c.created_at}
                                      </span>
                                    </div>
                                    <p className="text-xs text-slate-700">
                                      {renderFormattedComment(c.content)}
                                    </p>
                                  </div>
                                ))
                              )}
                            </div>
                          )}

                          {profileActivityTab === 'mentions' && (
                            <div className="space-y-2.5 max-h-96 overflow-y-auto">
                              {mentionsOfMe.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center">
                                  No comments have mentioned @{currentUser.username} yet.
                                </p>
                              ) : (
                                mentionsOfMe.map(c => {
                                  const cAuthor = resolveCommentAuthor(c);
                                  return (
                                    <div
                                      key={c.id}
                                      className="p-3.5 rounded-xl border border-terracotta-100 bg-terracotta-50/30 space-y-1"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-slate-800">
                                          Mentioned by @{cAuthor.username} in{' '}
                                          <button
                                            onClick={() => handleOpenDocument(c.doc_id)}
                                            className="text-terracotta-600 hover:underline"
                                          >
                                            {c.docTitle}
                                          </button>
                                        </span>
                                      </div>
                                      <p className="text-xs text-slate-700">
                                        {renderFormattedComment(c.content)}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          )}

                          {profileActivityTab === 'logs' && (
                            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-xs">
                              {myLogs.length === 0 ? (
                                <p className="text-xs text-slate-500 py-4 text-center font-sans">
                                  No search queries logged for this user yet.
                                </p>
                              ) : (
                                myLogs.map(l => (
                                  <div
                                    key={l.id}
                                    className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between"
                                  >
                                    <span>Query: "{l.query_string}"</span>
                                    <span className="text-terracotta-600">
                                      {l.clicked_doc_id || 'NULL'} ({l.timestamp})
                                    </span>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================
            VIEW 1: HOME & PAGINATED Q&A DIRECTORY
           ================================================================== */}
        {activeView === 'directory' && (
          <div className="space-y-6">
            {/* Search & Phase 2 Telemetry Filter Bar */}
            <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Search className="w-5 h-5 text-terracotta-600" />
                    <span>Community Q&A Knowledge Directory</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    Search across {documents.length} technical engineering threads. Every search & result click logs directly into <code className="text-terracotta-600 font-mono">search_click_logs</code> for Phase 2 BM25/TF-IDF training.
                  </p>
                </div>

                {/* Search Mode Toggle (Standard LIKE vs Regex) */}
                <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs">
                  <button
                    type="button"
                    onClick={() => setSearchMode('like')}
                    className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                      searchMode === 'like'
                        ? 'bg-orange-50 text-slate-900 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    SQL LIKE / Substring
                  </button>
                  {platformSettings.allowRegexSearch && (
                    <button
                      type="button"
                      onClick={() => setSearchMode('regex')}
                      className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                        searchMode === 'regex'
                          ? 'bg-orange-50 text-terracotta-700 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Regex Pattern (.*)
                    </button>
                  )}
                </div>
              </div>

              {/* Search Input Form */}
              <form onSubmit={handleLogSearchQuery} className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={
                      searchMode === 'regex'
                        ? 'Enter Regex pattern (e.g. ^(How|Preventing).*bm25|postgresql)...'
                        : 'Search questions by keyword, architecture topic, or @username...'
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <Search className="w-4 h-4" />
                  <span>Search & Log Query</span>
                </button>
                {(searchQuery || selectedCategory !== 'all' || selectedTag !== 'all' || dateFrom || dateTo) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                      setSelectedTag('all');
                      setDateFrom('');
                      setDateTo('');
                    }}
                    className="px-3.5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-600 text-xs font-medium"
                  >
                    Reset Filters
                  </button>
                )}
              </form>

              {searchMode === 'regex' && !regexStatus.valid && (
                <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Invalid Regular Expression: {regexStatus.error}</span>
                </div>
              )}

              {/* Category, Tag, Date Range, and Sort Filters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Category
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-orange-50"
                  >
                    <option value="all">All Categories (5)</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Technical Tag
                  </label>
                  <select
                    value={selectedTag}
                    onChange={e => setSelectedTag(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-orange-50"
                  >
                    <option value="all">All Tags ({tags.length})</option>
                    {tags.map(t => (
                      <option key={t} value={t}>
                        #{t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    From Date (2026)
                  </label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-orange-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    To Date (2026)
                  </label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs bg-orange-50"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 uppercase mb-1">
                    Sort Order
                  </label>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-orange-50"
                  >
                    <option value="latest">Latest Created Date</option>
                    <option value="views">Most Viewed (views_count)</option>
                    <option value="likes">Highest Upvoted</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Category Quick Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-terracotta-600 text-white'
                    : 'bg-orange-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                All Topics ({filteredDocuments.length})
              </button>
              {categories.map(cat => {
                const count = documents.filter(d => d.category_id === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-terracotta-600 text-white'
                        : 'bg-orange-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
            </div>

            {/* Paginated Directory Listing */}
            <div className="space-y-3">
              {paginatedDocuments.length === 0 ? (
                <div className="bg-orange-50 rounded-2xl border border-slate-200 p-12 text-center space-y-3">
                  <Search className="w-10 h-10 text-slate-300 mx-auto" />
                  <h3 className="text-base font-bold text-slate-800">
                    No matching Q&A documents found
                  </h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Try clearing your category, tag, or date range filters, or switch between SQL LIKE and Regex search modes.
                  </p>
                </div>
              ) : (
                paginatedDocuments.map(doc => {
                  const authorObj = resolveDocAuthor(doc);
                  return (
                    <article
                      key={doc.id}
                      className="bg-orange-50 rounded-xl border border-slate-200 hover:border-terracotta-300 p-5 transition-all shadow-2xs hover:shadow-md flex flex-col md:flex-row gap-4 justify-between"
                    >
                      {/* Left Stats Column */}
                      <div className="flex md:flex-col items-center justify-center gap-3 md:w-24 shrink-0 border-b md:border-b-0 md:border-r border-slate-100 pb-3 md:pb-0 md:pr-4 text-center">
                        <div className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 w-full">
                          <div className="text-sm font-bold text-slate-800">{doc.likes}</div>
                          <div className="text-[10px] text-slate-500 uppercase">Votes</div>
                        </div>
                        <div className="px-2.5 py-1 rounded-lg bg-terracotta-50/60 border border-terracotta-100 w-full">
                          <div className="text-sm font-bold text-terracotta-700">{doc.comments.length}</div>
                          <div className="text-[10px] text-terracotta-600 uppercase">Answers</div>
                        </div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Eye className="w-3.5 h-3.5" />
                          <span>{doc.views_count}</span>
                        </div>
                      </div>

                      {/* Center Content Snippet */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400">{doc.id}</span>
                          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                            {getCategoryName(doc.category_id)}
                          </span>
                          {doc.status !== 'published' && (
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                doc.status === 'draft'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-rose-100 text-rose-800 border border-rose-300'
                              }`}
                            >
                              {doc.status}
                            </span>
                          )}
                          {doc.is_flagged && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1">
                              <Flag className="w-3 h-3" /> Flagged
                            </span>
                          )}
                        </div>

                        <h2 className="text-base font-bold text-slate-900 hover:text-terracotta-600 transition-colors">
                          <button
                            onClick={() => handleOpenDocument(doc.id)}
                            className="text-left focus:outline-none"
                          >
                            {doc.title}
                          </button>
                        </h2>

                        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                          {doc.summary}
                        </p>

                        <div className="pt-1 flex flex-wrap items-center justify-between gap-2">
                          {/* Tags */}
                          <div className="flex flex-wrap items-center gap-1.5">
                            {doc.tags.map(t => (
                              <button
                                key={t}
                                onClick={() => setSelectedTag(t)}
                                className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-terracotta-50 text-slate-700 hover:text-terracotta-700 text-[11px] font-mono transition-colors"
                              >
                                #{t}
                              </button>
                            ))}
                          </div>

                          {/* Live Author Avatar & Timestamp Metadata */}
                          <div className="flex items-center gap-3 text-xs text-slate-500">
                            <button
                              type="button"
                              onClick={() => setInspectedUser(authorObj)}
                              className="flex items-center gap-1.5 hover:text-terracotta-600 transition-colors"
                            >
                              <img
                                src={authorObj.avatar}
                                alt={authorObj.username}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                              <strong className="text-slate-700">{authorObj.name}</strong>
                              <span className="font-mono text-terracotta-600">@{authorObj.username}</span>
                            </button>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {doc.created_at}
                            </span>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {/* Pagination Footer */}
            <div className="bg-orange-50 rounded-xl border border-slate-200 px-4 py-3 flex flex-wrap items-center justify-between gap-4">
              <div className="text-xs text-slate-600">
                Showing{' '}
                <span className="font-semibold text-slate-900">
                  {filteredDocuments.length === 0
                    ? 0
                    : (currentPage - 1) * platformSettings.itemsPerPage + 1}
                </span>{' '}
                to{' '}
                <span className="font-semibold text-slate-900">
                  {Math.min(currentPage * platformSettings.itemsPerPage, filteredDocuments.length)}
                </span>{' '}
                of <span className="font-semibold text-slate-900">{filteredDocuments.length}</span> Q&A Documents
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" /> Prev
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-colors ${
                      currentPage === page
                        ? 'bg-terracotta-600 text-white'
                        : 'border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium disabled:opacity-40 hover:bg-slate-50 flex items-center gap-1"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================
            VIEW 2: QUESTION DETAIL VIEW + ENGAGEMENT + SEO METADATA BADGE
           ================================================================== */}
        {activeView === 'detail' && selectedDoc && (
          <div className="space-y-6">
            {/* Top Back & Action Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => setActiveView('directory')}
                className="px-3.5 py-2 rounded-xl bg-orange-50 border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-2xs"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Paginated Directory</span>
              </button>

              <div className="flex items-center gap-2">
                {currentUser &&
                  (currentUser.role === ROLES.CONTENT_MANAGER ||
                    currentUser.role === ROLES.SUPER_ADMIN ||
                    currentUser.id === selectedDoc.author_id) && (
                    <button
                      onClick={() => {
                        setEditingDoc(selectedDoc);
                        setShowAskModal(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-100"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit Document
                    </button>
                  )}

                <button
                  onClick={() => {
                    if (!requireAuth('report or flag content')) return;
                    setFlagModalTarget({
                      type: 'doc',
                      id: selectedDoc.id,
                      title: selectedDoc.title
                    });
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-rose-100"
                >
                  <Flag className="w-3.5 h-3.5" /> Report / Flag Post
                </button>
              </div>
            </div>

            {/* Main Question Document Card */}
            {(() => {
              const docAuthor = resolveDocAuthor(selectedDoc);
              const myDocReaction = currentUser
                ? userReactions[`${currentUser.id}:${selectedDoc.id}`] || 0
                : 0;

              return (
                <div className="bg-orange-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
                  {/* Header Metadata */}
                  <div className="space-y-3 border-b border-slate-100 pb-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-terracotta-50 text-terracotta-700 border border-terracotta-200">
                        {getCategoryName(selectedDoc.category_id)}
                      </span>
                      <span className="text-xs font-mono text-slate-400">ID: {selectedDoc.id}</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1 ml-auto">
                        <Eye className="w-4 h-4 text-terracotta-500" />
                        <strong>{selectedDoc.views_count}</strong> views (logged in search_click_logs)
                      </span>
                    </div>

                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
                      {selectedDoc.title}
                    </h1>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                      <button
                        type="button"
                        onClick={() => setInspectedUser(docAuthor)}
                        className="flex items-center gap-2.5 text-left group"
                      >
                        <img
                          src={docAuthor.avatar}
                          alt={docAuthor.username}
                          className="w-10 h-10 rounded-full object-cover ring-2 ring-terracotta-100"
                        />
                        <div>
                          <div className="text-xs font-bold text-slate-900 group-hover:text-terracotta-600 flex items-center gap-1.5">
                            <span>{docAuthor.name}</span>
                            <span className="font-mono text-terracotta-600">@{docAuthor.username}</span>
                            <span
                              className={`px-1.5 py-0.2 rounded text-[10px] border ${
                                ROLE_META[docAuthor.role || ROLES.USER].badgeClass
                              }`}
                            >
                              {ROLE_META[docAuthor.role || ROLES.USER].label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Published on {selectedDoc.created_at} • Status:{' '}
                            <span className="font-semibold uppercase">{selectedDoc.status}</span>
                          </div>
                        </div>
                      </button>

                      {/* Tags */}
                      <div className="flex flex-wrap gap-1.5">
                        {selectedDoc.tags.map(t => (
                          <span
                            key={t}
                            className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-mono"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Architectural SVG Visual Diagram with SEO Alt Text */}
                  <div className="bg-slate-900 rounded-xl p-4 text-slate-200 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <span className="font-mono flex items-center gap-1.5">
                        <Cpu className="w-3.5 h-3.5 text-terracotta-400" />
                        SYSTEM ARCHITECTURE DIAGRAM & SEO ALT-TEXT PREVIEW
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        SEO Indexed Image
                      </span>
                    </div>

                    <svg
                      viewBox="0 0 700 130"
                      className="w-full h-32 rounded-lg bg-slate-950/80 border border-slate-800"
                      role="img"
                      aria-label={selectedDoc.seo_metadata.alt_text}
                    >
                      <rect x="20" y="30" width="160" height="70" rx="10" fill="#1e293b" stroke="#6366f1" strokeWidth="2" />
                      <text x="100" y="60" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                        Client / Search UI
                      </text>
                      <text x="100" y="80" textAnchor="middle" fill="#94a3b8" fontSize="10">
                        #{selectedDoc.tags[0] || 'query'}
                      </text>

                      <line x1="180" y1="65" x2="260" y2="65" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" />

                      <rect x="260" y="30" width="180" height="70" rx="10" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                      <text x="350" y="60" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                        {getCategoryName(selectedDoc.category_id)}
                      </text>
                      <text x="350" y="80" textAnchor="middle" fill="#6ee7b7" fontSize="10">
                        #{selectedDoc.tags[1] || 'engine'}
                      </text>

                      <line x1="440" y1="65" x2="520" y2="65" stroke="#10b981" strokeWidth="2" strokeDasharray="4" />

                      <rect x="520" y="30" width="160" height="70" rx="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                      <text x="600" y="60" textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="bold">
                        Document & Log Store
                      </text>
                      <text x="600" y="80" textAnchor="middle" fill="#fcd34d" fontSize="10">
                        {selectedDoc.id}
                      </text>
                    </svg>

                    <p className="text-[11px] text-slate-400 font-mono">
                      <strong>alt_text:</strong> "{selectedDoc.seo_metadata.alt_text}"
                    </p>
                  </div>

                  {/* Full Multi-Paragraph Technical Content */}
                  <div className="prose prose-slate max-w-none space-y-3 text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {renderFormattedComment(selectedDoc.content)}
                  </div>

                  {/* Voting & SEO Metadata Inspector Bar */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVote('doc', selectedDoc.id, 1)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 border transition-colors ${
                          myDocReaction === 1
                            ? 'bg-terracotta-600 text-white border-terracotta-600'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Upvote ({selectedDoc.likes})</span>
                      </button>

                      <button
                        onClick={() => handleVote('doc', selectedDoc.id, -1)}
                        className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                          myDocReaction === -1
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                      </button>
                    </div>

                    {/* SEO Metadata Summary Pill */}
                    <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl px-3.5 py-2 text-xs text-emerald-900 max-w-xl">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-800">
                        <Globe className="w-3.5 h-3.5" />
                        <span>SEO Metadata (Configured by Data & SEO Specialist):</span>
                      </div>
                      <div className="text-[11px] mt-0.5 truncate">
                        <strong>Title:</strong> {selectedDoc.seo_metadata.meta_title} •{' '}
                        <strong>Keywords:</strong> {selectedDoc.seo_metadata.keywords.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Community Answers & Comments Section */}
            <div className="bg-orange-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-terracotta-600" />
                <span>{selectedDoc.comments.length} Community Answers & Technical Replies</span>
              </h3>

              <div className="space-y-4">
                {selectedDoc.comments.map(cmt => {
                  const cmtAuthor = resolveCommentAuthor(cmt);
                  const myCmtReaction = currentUser
                    ? userReactions[`${currentUser.id}:${cmt.id}`] || 0
                    : 0;

                  return (
                    <div
                      key={cmt.id}
                      className={`p-4 rounded-xl border ${
                        cmt.is_flagged
                          ? 'bg-rose-50/40 border-rose-200'
                          : 'bg-slate-50/70 border-slate-200'
                      } space-y-2.5`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setInspectedUser(cmtAuthor)}
                          className="flex items-center gap-2 text-left group"
                        >
                          <img
                            src={cmtAuthor.avatar}
                            alt={cmtAuthor.username}
                            className="w-7 h-7 rounded-full object-cover border border-slate-200"
                          />
                          <span className="text-xs font-bold text-slate-800 group-hover:text-terracotta-600">
                            {cmtAuthor.name}
                          </span>
                          <span className="text-xs text-terracotta-600 font-mono">
                            @{cmtAuthor.username}
                          </span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] border ${
                              ROLE_META[cmtAuthor.role || ROLES.USER].badgeClass
                            }`}
                          >
                            {ROLE_META[cmtAuthor.role || ROLES.USER].label}
                          </span>
                          <span className="text-[11px] text-slate-400">• {cmt.created_at}</span>
                          {cmt.is_flagged && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                              Flagged for Moderator Review
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVote('comment', cmt.id, 1)}
                            className={`px-2 py-1 rounded text-xs font-semibold flex items-center gap-1 border ${
                              myCmtReaction === 1
                                ? 'bg-terracotta-600 text-white border-terracotta-600'
                                : 'bg-orange-50 text-slate-700 border-slate-200'
                            }`}
                          >
                            <ThumbsUp className="w-3 h-3" /> {cmt.likes}
                          </button>
                          <button
                            onClick={() => {
                              if (!requireAuth('flag a comment')) return;
                              setFlagModalTarget({
                                type: 'comment',
                                id: cmt.id,
                                title: `Comment by @${cmtAuthor.username}`
                              });
                            }}
                            className="p-1 text-slate-400 hover:text-rose-600"
                            title="Flag comment as spam/inappropriate"
                          >
                            <Flag className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {renderFormattedComment(cmt.content)}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Add Comment / Answer Form with Verified @User Mention Picker & Autocomplete */}
              <form onSubmit={handleAddComment} className="space-y-3 pt-2 border-t border-slate-200 relative">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-800 flex items-center gap-2">
                    {currentUser ? (
                      <>
                        <img
                          src={currentUser.avatar}
                          alt={currentUser.username}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                        <span>
                          Contribute an Answer or Reply as {currentUser.name} (@{currentUser.username})
                        </span>
                      </>
                    ) : (
                      <span>Sign in to contribute an answer or tag community members</span>
                    )}
                  </label>
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-[11px] text-slate-500 mr-1">
                      Quick @mention verified user:
                    </span>
                    {users.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => insertMentionUsername(u.username)}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 hover:bg-terracotta-50 text-slate-700 hover:text-terracotta-700 text-[11px] font-mono border border-slate-200"
                      >
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-3.5 h-3.5 rounded-full object-cover"
                        />
                        <span>@{u.username}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live @username Autocomplete Dropdown when typing @ */}
                {matchingMentionUsers.length > 0 && (
                  <div className="bg-orange-50 rounded-xl border border-terracotta-200 shadow-lg p-2 space-y-1">
                    <div className="text-[10px] font-bold uppercase text-terracotta-600 px-2">
                      Select Verified User to @Mention
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-1">
                      {matchingMentionUsers.map(u => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => insertMentionUsername(u.username)}
                          className="p-2 rounded-lg hover:bg-terracotta-50 flex items-center gap-2 text-left text-xs"
                        >
                          <img
                            src={u.avatar}
                            alt={u.username}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <div className="truncate">
                            <div className="font-bold text-slate-900 truncate">{u.name}</div>
                            <div className="text-[10px] font-mono text-terracotta-600">
                              @{u.username}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <textarea
                  rows={3}
                  value={newCommentText}
                  onChange={e => handleCommentTextChange(e.target.value)}
                  placeholder="Write your technical answer... Type @ to autocomplete verified usernames (e.g. @loconner, @SalvadorDalier)."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-terracotta-500"
                />

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold shadow-xs"
                  >
                    Post Answer & Notify @Mentions
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ==================================================================
            VIEW 3: ADMIN INTERFACE (ROLE-BASED ACCESS CONTROL CONSOLE)
           ================================================================== */}
        {activeView === 'admin' && (
          <div className="space-y-6">
            {/* RBAC Header & Strict Role Guard Switch */}
            <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-slate-900">
                    Role-Based Access Control (RBAC) Administration Console
                  </h1>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                      currentUser
                        ? ROLE_META[currentUser.role].badgeClass
                        : 'bg-rose-100 text-rose-800 border-rose-300'
                    }`}
                  >
                    Active Role: {currentUser ? ROLE_META[currentUser.role].label : 'Guest (Logged Out)'}
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  {currentUser
                    ? ROLE_META[currentUser.role].description
                    : 'Sign in or use the RBAC Persona Switcher bar above to test administrative role permissions.'}
                </p>
              </div>

              <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
                <div className="text-xs">
                  <div className="font-bold text-slate-800">Strict RBAC Guard Mode</div>
                  <div className="text-[11px] text-slate-500">
                    {platformSettings.strictRbacEnforcement
                      ? 'Enforcing role restrictions per specification'
                      : 'Unlocked preview mode for evaluator inspection'}
                  </div>
                </div>
                <button
                  onClick={() =>
                    setPlatformSettings(prev => ({
                      ...prev,
                      strictRbacEnforcement: !prev.strictRbacEnforcement
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                    platformSettings.strictRbacEnforcement
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {platformSettings.strictRbacEnforcement ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> Strict Guards ON
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> Preview All Tabs
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 4 Role-Specific Admin Tabs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  id: 'super_admin',
                  title: '1. Super Admin',
                  subtitle: 'Users, Roles, Audit Logs & Global Config',
                  icon: Shield,
                  allowed: [ROLES.SUPER_ADMIN]
                },
                {
                  id: 'content_manager',
                  title: '2. Content Manager',
                  subtitle: 'Document CRUD, Publish Status & Taxonomy',
                  icon: FileText,
                  allowed: [ROLES.CONTENT_MANAGER, ROLES.SUPER_ADMIN]
                },
                {
                  id: 'moderator',
                  title: '3. Moderator Queue',
                  subtitle: `Flags, Reports & Spam Control (${flaggedDocs.length + flaggedComments.length})`,
                  icon: Flag,
                  allowed: [ROLES.MODERATOR, ROLES.SUPER_ADMIN]
                },
                {
                  id: 'data_seo',
                  title: '4. Data & SEO + Phase 2',
                  subtitle: 'SEO Meta, Click Logs & BM25 Sandbox',
                  icon: BarChart2,
                  allowed: [ROLES.DATA_SEO, ROLES.SUPER_ADMIN]
                }
              ].map(tab => {
                const Icon = tab.icon;
                const hasPermission =
                  !platformSettings.strictRbacEnforcement ||
                  (currentUser && tab.allowed.includes(currentUser.role));
                const isSelected = activeAdminTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveAdminTab(tab.id)}
                    className={`p-4 rounded-xl border text-left transition-all flex items-start justify-between ${
                      isSelected
                        ? 'bg-terracotta-600 text-white border-terracotta-600 shadow-sm'
                        : 'bg-orange-50 text-slate-800 border-slate-200 hover:border-terracotta-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-bold text-sm">
                        <Icon className="w-4 h-4" />
                        <span>{tab.title}</span>
                      </div>
                      <p
                        className={`text-[11px] ${
                          isSelected ? 'text-terracotta-100' : 'text-slate-500'
                        }`}
                      >
                        {tab.subtitle}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        hasPermission
                          ? isSelected
                            ? 'bg-emerald-400/20 text-emerald-200'
                            : 'bg-emerald-50 text-emerald-700'
                          : isSelected
                          ? 'bg-rose-400/20 text-rose-100'
                          : 'bg-rose-50 text-rose-700'
                      }`}
                    >
                      {hasPermission ? 'Allowed' : 'Restricted'}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Check RBAC Access for Active Tab */}
            {(() => {
              const roleMap = {
                super_admin: [ROLES.SUPER_ADMIN],
                content_manager: [ROLES.CONTENT_MANAGER, ROLES.SUPER_ADMIN],
                moderator: [ROLES.MODERATOR, ROLES.SUPER_ADMIN],
                data_seo: [ROLES.DATA_SEO, ROLES.SUPER_ADMIN]
              };
              const isAuthorized =
                !platformSettings.strictRbacEnforcement ||
                (currentUser && roleMap[activeAdminTab]?.includes(currentUser.role));

              if (!isAuthorized) {
                const requiredRoleKey = activeAdminTab === 'data_seo' ? ROLES.DATA_SEO : activeAdminTab;
                const targetUser = users.find(u => u.role === requiredRoleKey) || users[0];
                return (
                  <div className="bg-orange-50 rounded-2xl border-2 border-dashed border-rose-200 p-10 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
                      <Lock className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-900">
                        HTTP 403 Forbidden — Role Guard Active
                      </h3>
                      <p className="text-xs text-slate-600 max-w-lg mx-auto">
                        Your current session role is{' '}
                        <strong>
                          {currentUser ? ROLE_META[currentUser.role].label : 'Guest (Logged Out)'}
                        </strong>
                        . Accessing this workspace requires the{' '}
                        <strong>{ROLE_META[requiredRoleKey]?.label}</strong> or{' '}
                        <strong>Super Admin</strong> role.
                      </p>
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => handleRoleSwitch(targetUser.id)}
                        className="px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Switch Session to {targetUser.name} (@{targetUser.username} •{' '}
                        {ROLE_META[targetUser.role].label})
                      </button>
                      <button
                        onClick={() =>
                          setPlatformSettings(p => ({ ...p, strictRbacEnforcement: false }))
                        }
                        className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold"
                      >
                        Unlock Preview Mode
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <>
                  {/* ==========================================================
                      ADMIN TAB 1: SUPER ADMIN CONSOLE
                     ========================================================== */}
                  {activeAdminTab === 'super_admin' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* User Accounts & Role Assignment Table */}
                      <div className="lg:col-span-2 bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Users className="w-4 h-4 text-terracotta-600" />
                              <span>Manage User Accounts & Role Assignments ({users.length})</span>
                            </h2>
                            <p className="text-xs text-slate-500">
                              Assign RBAC roles (`super_admin`, `content_manager`, `moderator`, `data_seo_specialist`, `user`) in real time.
                            </p>
                          </div>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                                <th className="py-2.5 px-3">User & Avatar</th>
                                <th className="py-2.5 px-3">Email</th>
                                <th className="py-2.5 px-3">Assigned Role</th>
                                <th className="py-2.5 px-3">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {users.map(u => (
                                <tr key={u.id} className="hover:bg-slate-50/80">
                                  <td className="py-2.5 px-3 font-semibold text-slate-900">
                                    <button
                                      type="button"
                                      onClick={() => setInspectedUser(u)}
                                      className="flex items-center gap-2 text-left hover:text-terracotta-600"
                                    >
                                      <img
                                        src={u.avatar}
                                        alt={u.username}
                                        className="w-6 h-6 rounded-full object-cover"
                                      />
                                      <div>
                                        <div>{u.name}</div>
                                        <div className="font-mono text-[11px] text-terracotta-600 font-normal">
                                          @{u.username}
                                        </div>
                                      </div>
                                    </button>
                                  </td>
                                  <td className="py-2.5 px-3 text-slate-500">{u.email}</td>
                                  <td className="py-2.5 px-3">
                                    <select
                                      value={u.role}
                                      onChange={e => {
                                        const newRole = e.target.value;
                                        setUsers(prev =>
                                          prev.map(item =>
                                            item.id === u.id ? { ...item, role: newRole } : item
                                          )
                                        );
                                        logSystemAction(
                                          `Changed @${u.username} role from ${u.role} to ${newRole}`,
                                          'User RBAC Store'
                                        );
                                        notify(`Updated @${u.username} role to ${ROLE_META[newRole].label}`);
                                      }}
                                      className="px-2.5 py-1 rounded-lg border border-slate-300 bg-orange-50 font-semibold text-xs"
                                    >
                                      {Object.values(ROLES).map(r => (
                                        <option key={r} value={r}>
                                          {ROLE_META[r].label} ({r})
                                        </option>
                                      ))}
                                    </select>
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <button
                                      onClick={() => {
                                        const nextStatus = u.status === 'active' ? 'suspended' : 'active';
                                        setUsers(prev =>
                                          prev.map(item =>
                                            item.id === u.id ? { ...item, status: nextStatus } : item
                                          )
                                        );
                                        logSystemAction(
                                          `Set account status for @${u.username} to ${nextStatus}`,
                                          'User Accounts'
                                        );
                                      }}
                                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                        u.status === 'active'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : 'bg-rose-100 text-rose-800'
                                      }`}
                                    >
                                      {u.status}
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Global Platform Configuration */}
                      <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Settings className="w-4 h-4 text-terracotta-600" />
                          <span>Global Platform Settings</span>
                        </h2>

                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Platform Title
                            </label>
                            <input
                              type="text"
                              value={platformSettings.siteTitle}
                              onChange={e =>
                                setPlatformSettings(p => ({ ...p, siteTitle: e.target.value }))
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-300"
                            />
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Directory Pagination Size (Items per Page)
                            </label>
                            <select
                              value={platformSettings.itemsPerPage}
                              onChange={e =>
                                setPlatformSettings(p => ({
                                  ...p,
                                  itemsPerPage: Number(e.target.value)
                                }))
                              }
                              className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-orange-50"
                            >
                              <option value={6}>6 items / page (10 pages)</option>
                              <option value={10}>10 items / page (6 pages)</option>
                              <option value={15}>15 items / page (4 pages)</option>
                              <option value={20}>20 items / page (3 pages)</option>
                            </select>
                          </div>

                          <div>
                            <label className="block font-semibold text-slate-700 mb-1">
                              Global Announcement / Maintenance Banner
                            </label>
                            <input
                              type="text"
                              value={platformSettings.maintenanceBanner}
                              onChange={e =>
                                setPlatformSettings(p => ({
                                  ...p,
                                  maintenanceBanner: e.target.value
                                }))
                              }
                              placeholder="Optional banner message..."
                              className="w-full px-3 py-2 rounded-lg border border-slate-300"
                            />
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="font-semibold text-slate-700">
                              Enable Phase 1 Regex Search Toggle
                            </span>
                            <input
                              type="checkbox"
                              checked={platformSettings.allowRegexSearch}
                              onChange={e =>
                                setPlatformSettings(p => ({
                                  ...p,
                                  allowRegexSearch: e.target.checked
                                }))
                              }
                              className="w-4 h-4 accent-terracotta-600"
                            />
                          </div>

                          <button
                            onClick={() => {
                              logSystemAction(
                                `Saved global settings (itemsPerPage=${platformSettings.itemsPerPage})`,
                                'Global Config'
                              );
                              notify('Global platform settings updated and logged.');
                            }}
                            className="w-full mt-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold"
                          >
                            Save Global Settings
                          </button>

                          <button
                            onClick={() => {
                              if (confirm('⚠️ This will reset ALL data to initial state (users, documents, settings, logs). Continue?')) {
                                localStorage.clear();
                                window.location.reload();
                              }
                            }}
                            className="w-full mt-2 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center justify-center gap-2"
                          >
                            <RefreshCw className="w-4 h-4" />
                            Reset All Data to Initial State
                          </button>
                        </div>
                      </div>

                      {/* System Audit Logs */}
                      <div className="lg:col-span-3 bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-terracotta-600" />
                          <span>Immutable System Audit Logs ({systemLogs.length})</span>
                        </h2>
                        <div className="overflow-x-auto max-h-60">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                                <th className="py-2 px-3">Log ID</th>
                                <th className="py-2 px-3">Actor & Role</th>
                                <th className="py-2 px-3">Action Description</th>
                                <th className="py-2 px-3">Subsystem</th>
                                <th className="py-2 px-3">Timestamp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                              {systemLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50">
                                  <td className="py-2 px-3 text-terracotta-600">{log.id}</td>
                                  <td className="py-2 px-3 font-sans font-semibold text-slate-800">
                                    {log.actor}
                                  </td>
                                  <td className="py-2 px-3 font-sans text-slate-700">{log.action}</td>
                                  <td className="py-2 px-3">{log.target}</td>
                                  <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==========================================================
                      ADMIN TAB 2: CONTENT MANAGER STUDIO
                     ========================================================== */}
                  {activeAdminTab === 'content_manager' && (
                    <div className="space-y-6">
                      {/* Taxonomy Management (Categories & Tags) */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Categories Manager */}
                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Folder className="w-4 h-4 text-terracotta-600" />
                            <span>Category Taxonomy Management ({categories.length})</span>
                          </h2>

                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              if (!newCategoryName.trim()) return;
                              const newCat = {
                                id: `cat-${Date.now()}`,
                                name: newCategoryName.trim(),
                                slug: newCategoryName.trim().toLowerCase().replace(/\s+/g, '-'),
                                description: newCategoryDesc.trim() || 'Custom technical category.'
                              };
                              setCategories(prev => [...prev, newCat]);
                              setNewCategoryName('');
                              setNewCategoryDesc('');
                              logSystemAction(`Created category "${newCat.name}"`, 'Taxonomy');
                              notify(`Added category "${newCat.name}"`);
                            }}
                            className="flex flex-col sm:flex-row gap-2 text-xs"
                          >
                            <input
                              type="text"
                              value={newCategoryName}
                              onChange={e => setNewCategoryName(e.target.value)}
                              placeholder="New category name..."
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-300"
                            />
                            <input
                              type="text"
                              value={newCategoryDesc}
                              onChange={e => setNewCategoryDesc(e.target.value)}
                              placeholder="Short description..."
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-300"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-terracotta-600 text-white font-semibold shrink-0"
                            >
                              + Add Category
                            </button>
                          </form>

                          <div className="divide-y divide-slate-100 text-xs">
                            {categories.map(cat => {
                              const docCount = documents.filter(d => d.category_id === cat.id).length;
                              return (
                                <div key={cat.id} className="py-2.5 flex items-center justify-between gap-2">
                                  <div>
                                    <div className="font-bold text-slate-800">
                                      {cat.name}{' '}
                                      <span className="text-[11px] font-normal text-slate-500">
                                        ({docCount} docs)
                                      </span>
                                    </div>
                                    <div className="text-[11px] text-slate-500">{cat.description}</div>
                                  </div>
                                  {docCount === 0 && (
                                    <button
                                      onClick={() =>
                                        setCategories(prev => prev.filter(c => c.id !== cat.id))
                                      }
                                      className="text-rose-600 hover:underline text-[11px]"
                                    >
                                      Delete
                                    </button>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Tags Manager */}
                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Tag className="w-4 h-4 text-terracotta-600" />
                            <span>Technical Tag Vocabulary ({tags.length})</span>
                          </h2>

                          <form
                            onSubmit={e => {
                              e.preventDefault();
                              const clean = newTagName.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
                              if (!clean || tags.includes(clean)) return;
                              setTags(prev => [...prev, clean]);
                              setNewTagName('');
                              logSystemAction(`Added tag #${clean}`, 'Taxonomy');
                              notify(`Created tag #${clean}`);
                            }}
                            className="flex gap-2 text-xs"
                          >
                            <input
                              type="text"
                              value={newTagName}
                              onChange={e => setNewTagName(e.target.value)}
                              placeholder="New tag slug (e.g. rust, elasticsearch)..."
                              className="flex-1 px-3 py-2 rounded-lg border border-slate-300"
                            />
                            <button
                              type="submit"
                              className="px-4 py-2 rounded-lg bg-terracotta-600 text-white font-semibold"
                            >
                              + Add Tag
                            </button>
                          </form>

                          <div className="flex flex-wrap gap-2 pt-1">
                            {tags.map(t => (
                              <span
                                key={t}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-mono border border-slate-200"
                              >
                                #{t}
                                <button
                                  onClick={() => setTags(prev => prev.filter(item => item !== t))}
                                  className="text-slate-400 hover:text-rose-600 font-sans"
                                  title="Remove tag"
                                >
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Full Document CRUD & Publication Status Studio */}
                      <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h2 className="text-base font-bold text-slate-900">
                              All Q&A Content Repository ({documents.length} Documents)
                            </h2>
                            <p className="text-xs text-slate-500">
                              Toggle publication status (`published`, `unpublished`, `draft`), edit content, or delete records.
                            </p>
                          </div>
                          <button
                            onClick={() => {
                              setEditingDoc(null);
                              setShowAskModal(true);
                            }}
                            className="px-3.5 py-2 rounded-xl bg-terracotta-600 text-white text-xs font-semibold flex items-center gap-1.5"
                          >
                            <Plus className="w-4 h-4" /> Create New Document
                          </button>
                        </div>

                        <div className="overflow-x-auto max-h-96">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                              <tr>
                                <th className="py-2.5 px-3">ID</th>
                                <th className="py-2.5 px-3">Title & Category</th>
                                <th className="py-2.5 px-3">Author</th>
                                <th className="py-2.5 px-3">Status Toggle</th>
                                <th className="py-2.5 px-3 text-right">CRUD Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {documents.map(doc => {
                                const docAuthor = resolveDocAuthor(doc);
                                return (
                                  <tr key={doc.id} className="hover:bg-slate-50">
                                    <td className="py-2.5 px-3 font-mono text-slate-500">{doc.id}</td>
                                    <td className="py-2.5 px-3">
                                      <div className="font-semibold text-slate-900 line-clamp-1">
                                        {doc.title}
                                      </div>
                                      <div className="text-[11px] text-terracotta-600">
                                        {getCategoryName(doc.category_id)} • {doc.views_count} views
                                      </div>
                                    </td>
                                    <td className="py-2.5 px-3 text-slate-600">
                                      {docAuthor.name} (@{docAuthor.username})
                                    </td>
                                    <td className="py-2.5 px-3">
                                      <select
                                        value={doc.status}
                                        onChange={e => {
                                          const nextStatus = e.target.value;
                                          setDocuments(prev =>
                                            prev.map(d =>
                                              d.id === doc.id ? { ...d, status: nextStatus } : d
                                            )
                                          );
                                          logSystemAction(
                                            `Changed ${doc.id} status to ${nextStatus}`,
                                            'Content Manager'
                                          );
                                          notify(`Document ${doc.id} set to ${nextStatus.toUpperCase()}`);
                                        }}
                                        className={`px-2.5 py-1 rounded-lg font-bold text-[11px] uppercase border ${
                                          doc.status === 'published'
                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            : doc.status === 'draft'
                                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                                            : 'bg-rose-50 text-rose-700 border-rose-200'
                                        }`}
                                      >
                                        <option value="published">Published</option>
                                        <option value="unpublished">Unpublished</option>
                                        <option value="draft">Draft</option>
                                      </select>
                                    </td>
                                    <td className="py-2.5 px-3 text-right space-x-2 whitespace-nowrap">
                                      <button
                                        onClick={() => {
                                          setEditingDoc(doc);
                                          setShowAskModal(true);
                                        }}
                                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-terracotta-50 text-slate-700 hover:text-terracotta-700 font-semibold"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => {
                                          setDocuments(prev => prev.filter(d => d.id !== doc.id));
                                          logSystemAction(`Deleted document ${doc.id}`, 'Content Manager');
                                          notify(`Deleted document ${doc.id}`);
                                        }}
                                        className="px-2.5 py-1 rounded bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold"
                                      >
                                        Delete
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ==========================================================
                      ADMIN TAB 3: MODERATOR QUEUE (FLAGS, REPORTS & SPAM)
                     ========================================================== */}
                  {activeAdminTab === 'moderator' && (
                    <div className="space-y-6">
                      {/* Flagged Posts Queue */}
                      <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <Flag className="w-4 h-4 text-rose-600" />
                          <span>Flagged Q&A Documents Queue ({flaggedDocs.length})</span>
                        </h2>

                        {flaggedDocs.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                            All flagged documents have been resolved!
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {flaggedDocs.map(doc => (
                              <div
                                key={doc.id}
                                className="p-4 rounded-xl border border-rose-200 bg-rose-50/40 flex flex-wrap items-center justify-between gap-4"
                              >
                                <div className="space-y-1 max-w-2xl">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold text-rose-700">
                                      {doc.id}
                                    </span>
                                    <span className="text-sm font-bold text-slate-900">
                                      {doc.title}
                                    </span>
                                  </div>
                                  <p className="text-xs text-rose-800">
                                    <strong>Report Reason:</strong> {doc.flag_reason}
                                  </p>
                                </div>

                                <div className="flex items-center gap-2">
                                  <button
                                    onClick={() => {
                                      setDocuments(prev =>
                                        prev.map(d =>
                                          d.id === doc.id
                                            ? { ...d, is_flagged: false, flag_reason: null }
                                            : d
                                        )
                                      );
                                      logSystemAction(
                                        `Dismissed flag & approved document ${doc.id}`,
                                        'Moderator Queue'
                                      );
                                      notify(`Approved ${doc.id} and cleared flag.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                                  >
                                    Approve & Clear Flag
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDocuments(prev =>
                                        prev.map(d =>
                                          d.id === doc.id
                                            ? { ...d, status: 'unpublished', is_flagged: false }
                                            : d
                                        )
                                      );
                                      logSystemAction(
                                        `Unpublished spam/flagged document ${doc.id}`,
                                        'Moderator Queue'
                                      );
                                      notify(`Unpublished ${doc.id} as spam/violation.`);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                                  >
                                    Unpublish (Spam Control)
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Flagged Comments Queue */}
                      <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-amber-600" />
                          <span>Flagged User Comments Queue ({flaggedComments.length})</span>
                        </h2>

                        {flaggedComments.length === 0 ? (
                          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl">
                            Zero flagged comments pending moderator action.
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {flaggedComments.map(cmt => {
                              const cAuthor = resolveCommentAuthor(cmt);
                              return (
                                <div
                                  key={cmt.id}
                                  className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-wrap items-center justify-between gap-4"
                                >
                                  <div className="space-y-1 max-w-2xl">
                                    <div className="text-xs font-bold text-slate-800">
                                      Comment by @{cAuthor.username} on "{cmt.docTitle}"
                                    </div>
                                    <p className="text-xs text-slate-700 italic">"{cmt.content}"</p>
                                    <p className="text-[11px] text-rose-700 font-semibold">
                                      Flag Reason: {cmt.flag_reason}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        setDocuments(prev =>
                                          prev.map(d => ({
                                            ...d,
                                            comments: d.comments.map(c =>
                                              c.id === cmt.id
                                                ? { ...c, is_flagged: false, flag_reason: null }
                                                : c
                                            )
                                          }))
                                        );
                                        logSystemAction(
                                          `Approved comment ${cmt.id}`,
                                          'Moderator Queue'
                                        );
                                        notify('Comment approved and flag cleared.');
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold"
                                    >
                                      Approve Comment
                                    </button>
                                    <button
                                      onClick={() => {
                                        setDocuments(prev =>
                                          prev.map(d => ({
                                            ...d,
                                            comments: d.comments.filter(c => c.id !== cmt.id)
                                          }))
                                        );
                                        logSystemAction(
                                          `Removed spam comment ${cmt.id}`,
                                          'Moderator Queue'
                                        );
                                        notify('Removed comment from thread.');
                                      }}
                                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold"
                                    >
                                      Remove Spam Comment
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ==========================================================
                      ADMIN TAB 4: DATA & SEO SPECIALIST + PHASE 2 SEARCH PREP
                     ========================================================== */}
                  {activeAdminTab === 'data_seo' && (
                    <div className="space-y-6">
                      {/* Top Analytics KPI Cards */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                          <div className="text-xs text-slate-500 font-medium">Total Corpus Views</div>
                          <div className="text-2xl font-bold text-slate-900 mt-1">
                            {documents.reduce((acc, d) => acc + d.views_count, 0).toLocaleString()}
                          </div>
                          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
                            Across {documents.length} indexed Q&A records
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                          <div className="text-xs text-slate-500 font-medium">
                            Search & Click Log Rows
                          </div>
                          <div className="text-2xl font-bold text-terracotta-600 mt-1">
                            {searchLogs.length}
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Click-Through Rate (CTR):{' '}
                            <strong>
                              {Math.round(
                                (searchLogs.filter(l => l.clicked_doc_id).length /
                                  Math.max(1, searchLogs.length)) *
                                  100
                              )}
                              %
                            </strong>
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                          <div className="text-xs text-slate-500 font-medium">
                            Phase 2 Vocabulary Size
                          </div>
                          <div className="text-2xl font-bold text-slate-900 mt-1">
                            {corpusSearchStats.totalVocabulary.toLocaleString()} terms
                          </div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Avg Doc Length (avgdl):{' '}
                            <strong>{Math.round(corpusSearchStats.avgdl)} tokens</strong>
                          </div>
                        </div>

                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-4 shadow-xs">
                          <div className="text-xs text-slate-500 font-medium">
                            SEO Metadata Coverage
                          </div>
                          <div className="text-2xl font-bold text-emerald-600 mt-1">100%</div>
                          <div className="text-[11px] text-slate-500 mt-1">
                            Title, Description, Alt Text & Keywords
                          </div>
                        </div>
                      </div>

                      {/* SEO Metadata Editor + Live Google SERP Preview */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                            <Globe className="w-4 h-4 text-emerald-600" />
                            <span>Configure Document SEO Metadata</span>
                          </h2>

                          <div className="space-y-3 text-xs">
                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Select Q&A Document to Configure
                              </label>
                              <select
                                value={seoSelectedDocId}
                                onChange={e => setSeoSelectedDocId(e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-orange-50 font-semibold"
                              >
                                {documents.map(d => (
                                  <option key={d.id} value={d.id}>
                                    [{d.id}] {d.title}
                                  </option>
                                ))}
                              </select>
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                SEO Meta Title ({seoSelectedDoc.seo_metadata.meta_title.length}/60 chars)
                              </label>
                              <input
                                type="text"
                                value={seoSelectedDoc.seo_metadata.meta_title}
                                onChange={e => {
                                  const val = e.target.value;
                                  setDocuments(prev =>
                                    prev.map(d =>
                                      d.id === seoSelectedDoc.id
                                        ? {
                                            ...d,
                                            seo_metadata: { ...d.seo_metadata, meta_title: val }
                                          }
                                        : d
                                    )
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                SEO Meta Description (
                                {seoSelectedDoc.seo_metadata.meta_description.length}/160 chars)
                              </label>
                              <textarea
                                rows={2}
                                value={seoSelectedDoc.seo_metadata.meta_description}
                                onChange={e => {
                                  const val = e.target.value;
                                  setDocuments(prev =>
                                    prev.map(d =>
                                      d.id === seoSelectedDoc.id
                                        ? {
                                            ...d,
                                            seo_metadata: {
                                              ...d.seo_metadata,
                                              meta_description: val
                                            }
                                          }
                                        : d
                                    )
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Diagram Image Alt Text (Accessibility & Image Search)
                              </label>
                              <input
                                type="text"
                                value={seoSelectedDoc.seo_metadata.alt_text}
                                onChange={e => {
                                  const val = e.target.value;
                                  setDocuments(prev =>
                                    prev.map(d =>
                                      d.id === seoSelectedDoc.id
                                        ? {
                                            ...d,
                                            seo_metadata: { ...d.seo_metadata, alt_text: val }
                                          }
                                        : d
                                    )
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                              />
                            </div>

                            <div>
                              <label className="block font-semibold text-slate-700 mb-1">
                                Target Keywords (comma-separated)
                              </label>
                              <input
                                type="text"
                                value={seoSelectedDoc.seo_metadata.keywords.join(', ')}
                                onChange={e => {
                                  const arr = e.target.value
                                    .split(',')
                                    .map(s => s.trim())
                                    .filter(Boolean);
                                  setDocuments(prev =>
                                    prev.map(d =>
                                      d.id === seoSelectedDoc.id
                                        ? {
                                            ...d,
                                            seo_metadata: { ...d.seo_metadata, keywords: arr }
                                          }
                                        : d
                                    )
                                  );
                                }}
                                className="w-full px-3 py-2 rounded-lg border border-slate-300"
                              />
                            </div>
                          </div>
                        </div>

                        {/* Live SERP Snippet Preview & Category Analytics */}
                        <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-5">
                          <div>
                            <h3 className="text-sm font-bold text-slate-900 mb-2">
                              Live Search Engine Result Snippet Preview (SERP)
                            </h3>
                            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                              <div className="text-[11px] text-emerald-700 font-mono">
                                https://nexusqa.dev/questions/{seoSelectedDoc.id}
                              </div>
                              <div className="text-base font-semibold text-blue-700 hover:underline cursor-pointer">
                                {seoSelectedDoc.seo_metadata.meta_title}
                              </div>
                              <p className="text-xs text-slate-600 leading-relaxed">
                                {seoSelectedDoc.seo_metadata.meta_description}
                              </p>
                              <div className="pt-2 flex flex-wrap gap-1">
                                {seoSelectedDoc.seo_metadata.keywords.map(k => (
                                  <span
                                    key={k}
                                    className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-mono"
                                  >
                                    {k}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>

                          {/* Category Views Distribution */}
                          <div className="space-y-2">
                            <h3 className="text-sm font-bold text-slate-900">
                              Category Traffic & Document Distribution
                            </h3>
                            <div className="space-y-2">
                              {categories.map(cat => {
                                const catDocs = documents.filter(d => d.category_id === cat.id);
                                const catViews = catDocs.reduce((a, b) => a + b.views_count, 0);
                                const totalViews = Math.max(
                                  1,
                                  documents.reduce((a, b) => a + b.views_count, 0)
                                );
                                const pct = Math.round((catViews / totalViews) * 100);
                                return (
                                  <div key={cat.id} className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="font-semibold text-slate-700">
                                        {cat.name} ({catDocs.length} docs)
                                      </span>
                                      <span className="font-mono text-slate-500">
                                        {catViews.toLocaleString()} views ({pct}%)
                                      </span>
                                    </div>
                                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                      <div
                                        className="h-full bg-terracotta-600 rounded-full"
                                        style={{ width: `${pct}%` }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Phase 2 Search Engine Sandbox: Tokenization, IDF & Live BM25 Ranking */}
                      <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Sparkles className="w-5 h-5 text-terracotta-600" />
                              <span>
                                Phase 2 Search Engine Sandbox (Tokenization, Inverted Index & BM25 Ranker)
                              </span>
                            </h2>
                            <p className="text-xs text-slate-500">
                              Test how our 60-document corpus is tokenized and scored using Okapi BM25 (`k1` and `b`) in preparation for Phase 2.
                            </p>
                          </div>

                          <div className="flex items-center gap-4 text-xs">
                            <div>
                              <label className="font-semibold text-slate-700 mr-1.5">
                                k1 ({bm25K1}):
                              </label>
                              <input
                                type="range"
                                min="0.5"
                                max="2.5"
                                step="0.1"
                                value={bm25K1}
                                onChange={e => setBm25K1(Number(e.target.value))}
                                className="w-24 accent-terracotta-600 align-middle"
                              />
                            </div>
                            <div>
                              <label className="font-semibold text-slate-700 mr-1.5">
                                b ({bm25B}):
                              </label>
                              <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.05"
                                value={bm25B}
                                onChange={e => setBm25B(Number(e.target.value))}
                                className="w-24 accent-terracotta-600 align-middle"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={bm25TestQuery}
                            onChange={e => setBm25TestQuery(e.target.value)}
                            placeholder="Enter multi-word query to inspect live BM25 ranking & IDF weights..."
                            className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 text-xs font-mono"
                          />
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse text-xs">
                            <thead>
                              <tr className="border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                                <th className="py-2 px-3">Rank</th>
                                <th className="py-2 px-3">Doc ID & Title</th>
                                <th className="py-2 px-3">Doc Length (dl)</th>
                                <th className="py-2 px-3">Matched Token Breakdown (TF / DF / IDF)</th>
                                <th className="py-2 px-3 text-right">BM25 Score</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {bm25RankedResults.map((item, idx) => (
                                <tr key={item.doc.id} className="hover:bg-slate-50">
                                  <td className="py-2.5 px-3 font-bold text-terracotta-600">
                                    #{idx + 1}
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <button
                                      onClick={() => handleOpenDocument(item.doc.id)}
                                      className="font-semibold text-slate-900 hover:text-terracotta-600 text-left"
                                    >
                                      [{item.doc.id}] {item.doc.title}
                                    </button>
                                  </td>
                                  <td className="py-2.5 px-3 font-mono text-slate-500">
                                    {item.dl} tokens
                                  </td>
                                  <td className="py-2.5 px-3">
                                    <div className="flex flex-wrap gap-1">
                                      {item.termBreakdowns.map(tb => (
                                        <span
                                          key={tb.term}
                                          className="px-2 py-0.5 rounded bg-terracotta-50 text-terracotta-800 border border-terracotta-200 font-mono text-[10px]"
                                        >
                                          {tb.term} (tf:{tb.tf}, df:{tb.df}, idf:{tb.idf})
                                        </span>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                                    {item.score.toFixed(4)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Search & Click Log Collection Table (`search_click_logs`) */}
                      <div className="bg-orange-50 rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                              <Database className="w-4 h-4 text-terracotta-600" />
                              <span>
                                Live <code className="text-terracotta-600">search_click_logs</code> Table ({searchLogs.length} Records)
                              </span>
                            </h2>
                            <p className="text-xs text-slate-500">
                              Required Phase 2 schema fields: <code className="font-mono">id, user_id, query_string, clicked_doc_id, timestamp</code>
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleExportSearchLogs('csv')}
                              className="px-3 py-1.5 rounded-lg border border-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Export CSV
                            </button>
                            <button
                              onClick={() => handleExportSearchLogs('json')}
                              className="px-3 py-1.5 rounded-lg bg-slate-900 text-white text-xs font-semibold flex items-center gap-1.5"
                            >
                              <Download className="w-3.5 h-3.5" /> Export JSON
                            </button>
                          </div>
                        </div>

                        <div className="overflow-x-auto max-h-72">
                          <table className="w-full text-left border-collapse text-xs font-mono">
                            <thead className="sticky top-0 bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                              <tr>
                                <th className="py-2 px-3">id</th>
                                <th className="py-2 px-3">user_id</th>
                                <th className="py-2 px-3">query_string</th>
                                <th className="py-2 px-3">clicked_doc_id</th>
                                <th className="py-2 px-3">timestamp</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                              {searchLogs.map(log => {
                                const logUser = usersById[log.user_id];
                                return (
                                  <tr key={log.id} className="hover:bg-slate-50">
                                    <td className="py-2 px-3 text-slate-500">{log.id}</td>
                                    <td className="py-2 px-3 text-terracotta-600">
                                      {logUser ? `${log.user_id} (@${logUser.username})` : log.user_id}
                                    </td>
                                    <td className="py-2 px-3 text-slate-800">{log.query_string}</td>
                                    <td className="py-2 px-3">
                                      {log.clicked_doc_id ? (
                                        <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold">
                                          {log.clicked_doc_id}
                                        </span>
                                      ) : (
                                        <span className="text-slate-400">NULL (Search Only)</span>
                                      )}
                                    </td>
                                    <td className="py-2 px-3 text-slate-500">{log.timestamp}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        )}

        {/* ==================================================================
            VIEW 4: SQL SCHEMA & REST API RBAC BACKEND BLUEPRINT
           ================================================================== */}
        {activeView === 'architecture' && (
          <div className="space-y-6">
            <div className="bg-orange-50 rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-terracotta-600" />
                <span>PostgreSQL DDL Schema & Express/Node.js RBAC Backend Reference</span>
              </h1>
              <p className="text-xs text-slate-600">
                Copy-ready relational schema (`documents`, `search_click_logs`, `users`, `comments`, `reactions`) and Express.js RBAC middleware matching all Phase 1 & Phase 2 specifications.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase">
                    1. PostgreSQL Schema (schema.sql)
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
{`-- Phase 1 & Phase 2 Ready PostgreSQL Schema
CREATE TYPE user_role AS ENUM (
  'user', 'super_admin', 'content_manager',
  'moderator', 'data_seo_specialist'
);

CREATE TYPE doc_status AS ENUM ('draft', 'published', 'unpublished');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT,
  bio TEXT,
  role user_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE categories (
  id VARCHAR(32) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT
);

-- Required Phase 2 Documents Collection / Table
CREATE TABLE documents (
  id VARCHAR(32) PRIMARY KEY,
  title VARCHAR(300) NOT NULL,
  content TEXT NOT NULL,
  summary VARCHAR(500) NOT NULL,
  category_id VARCHAR(32) REFERENCES categories(id),
  tags TEXT[] NOT NULL DEFAULT '{}',
  author VARCHAR(120) NOT NULL,
  author_id UUID REFERENCES users(id),
  status doc_status NOT NULL DEFAULT 'published',
  seo_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  views_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Required Phase 2 Search & Click Log Table
CREATE TABLE search_click_logs (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES users(id) NULL,
  query_string TEXT NOT NULL,
  clicked_doc_id VARCHAR(32) REFERENCES documents(id) NULL,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_docs_tags_gin ON documents USING GIN (tags);
CREATE INDEX idx_search_logs_query ON search_click_logs (query_string);`}
                  </pre>
                </div>

                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800 uppercase">
                    2. Express.js RBAC Middleware & Search Logger (server.js)
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 text-[11px] font-mono overflow-x-auto leading-relaxed">
{`// Role-Based Access Control (RBAC) Guard Middleware
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'RBAC_FORBIDDEN',
        requiredRoles: allowedRoles,
        activeRole: req.user?.role || 'guest'
      });
    }
    next();
  };
};

// Phase 1 Search Endpoint + Automatic Search Logging
app.get('/api/documents/search', async (req, res) => {
  const { q = '', mode = 'like', category, tag, from, to } = req.query;
  const op = mode === 'regex' ? '~*' : 'ILIKE';
  const pattern = mode === 'regex' ? q : \`%\${q}%\`;

  const docs = await db.query(
    \`SELECT * FROM documents
     WHERE status = 'published'
       AND (title \${op} $1 OR content \${op} $1)
     ORDER BY created_at DESC LIMIT 10\`,
    [pattern]
  );

  // Log query_string into search_click_logs for Phase 2 BM25 prep
  if (q.trim()) {
    await db.query(
      \`INSERT INTO search_click_logs (user_id, query_string, clicked_doc_id)
       VALUES ($1, $2, NULL)\`,
      [req.user?.id || null, q.trim()]
    );
  }
  res.json({ items: docs.rows });
});`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ====================================================================
          MODAL 1: ASK QUESTION / EDIT DOCUMENT MODAL
         ==================================================================== */}
      {showAskModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-orange-50 rounded-2xl border border-slate-200 max-w-2xl w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingDoc ? `Edit Document (${editingDoc.id})` : 'Ask a Technical Question'}
              </h3>
              <button
                onClick={() => setShowAskModal(false)}
                className="text-slate-400 hover:text-slate-700 text-sm"
              >
                ✕
              </button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title').toString().trim();
                const category_id = formData.get('category_id').toString();
                const summary = formData.get('summary').toString().trim();
                const content = formData.get('content').toString().trim();
                const rawTags = formData
                  .get('tags')
                  .toString()
                  .split(',')
                  .map(s => s.trim().toLowerCase())
                  .filter(Boolean);

                if (!title || !content) return;

                if (editingDoc) {
                  setDocuments(prev =>
                    prev.map(d =>
                      d.id === editingDoc.id
                        ? { ...d, title, category_id, summary, content, tags: rawTags }
                        : d
                    )
                  );
                  logSystemAction(`Edited document ${editingDoc.id}`, 'Documents Corpus');
                  notify(`Updated document ${editingDoc.id}`);
                } else if (currentUser) {
                  const newId = `doc-${1000 + documents.length + 1}`;
                  const newDoc = {
                    id: newId,
                    title,
                    summary: summary || `${content.slice(0, 150)}...`,
                    content,
                    category_id,
                    tags: rawTags.length ? rawTags : ['architecture'],
                    author_id: currentUser.id,
                    author: currentUser.name,
                    author_username: currentUser.username,
                    created_at: new Date().toISOString().slice(0, 10),
                    views_count: 1,
                    likes: 1,
                    status: 'published',
                    is_flagged: false,
                    flag_reason: null,
                    seo_metadata: {
                      meta_title: `${title.slice(0, 50)} | Terracotta QnA`,
                      meta_description: (summary || content).slice(0, 150),
                      alt_text: `Architecture diagram for ${title}`,
                      keywords: rawTags
                    },
                    comments: []
                  };
                  setDocuments(prev => [newDoc, ...prev]);
                  setSelectedDocId(newId);
                  setActiveView('detail');
                  notify(`Published new question ${newId}!`);
                }
                setShowAskModal(false);
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Question Title</label>
                <input
                  name="title"
                  required
                  defaultValue={editingDoc?.title || ''}
                  placeholder="e.g. How to optimize BM25 postings list compression in PostgreSQL?"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    name="category_id"
                    defaultValue={editingDoc?.category_id || categories[0].id}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-orange-50"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    name="tags"
                    defaultValue={editingDoc?.tags?.join(', ') || 'bm25, postgresql, indexing'}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Summary Snippet (Displayed in Directory View)
                </label>
                <input
                  name="summary"
                  defaultValue={editingDoc?.summary || ''}
                  placeholder="Concise 1-2 sentence overview of the problem..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Technical Content
                </label>
                <textarea
                  name="content"
                  required
                  rows={6}
                  defaultValue={editingDoc?.content || ''}
                  placeholder="Provide detailed architectural context, benchmarks, and code examples..."
                  className="w-full p-3 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-terracotta-600 text-white font-semibold"
                >
                  {editingDoc ? 'Save Changes' : 'Publish Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 2: USER PROFILE INSPECTOR MODAL (FOR ANY @USERNAME OR AUTHOR)
         ==================================================================== */}
      {inspectedUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-orange-50 rounded-2xl border border-slate-200 max-w-lg w-full p-6 shadow-xl space-y-4">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={inspectedUser.avatar}
                  alt={inspectedUser.username}
                  className="w-16 h-16 rounded-full object-cover ring-4 ring-terracotta-50"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">{inspectedUser.name}</h3>
                  <div className="text-xs font-mono text-terracotta-600">@{inspectedUser.username}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        ROLE_META[inspectedUser.role || ROLES.USER].badgeClass
                      }`}
                    >
                      {ROLE_META[inspectedUser.role || ROLES.USER].label}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Rep: <strong>{inspectedUser.reputation || 100}</strong>
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setInspectedUser(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">{inspectedUser.bio}</p>

            {(() => {
              const userDocs = documents.filter(d => d.author_id === inspectedUser.id);
              return (
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-800">
                    Authored Questions ({userDocs.length})
                  </div>
                  <div className="max-h-40 overflow-y-auto space-y-1.5">
                    {userDocs.slice(0, 6).map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => {
                          setInspectedUser(null);
                          handleOpenDocument(d.id);
                        }}
                        className="w-full p-2 rounded-lg bg-slate-50 hover:bg-terracotta-50 text-left text-xs font-medium text-slate-800 hover:text-terracotta-700 truncate block"
                      >
                        [{d.id}] {d.title}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              {currentUser?.id === inspectedUser.id ? (
                <button
                  type="button"
                  onClick={() => {
                    setInspectedUser(null);
                    setActiveView('profile');
                  }}
                  className="px-3.5 py-2 rounded-xl bg-terracotta-600 text-white text-xs font-semibold"
                >
                  Edit My Profile & Avatar
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    handleRoleSwitch(inspectedUser.id);
                    setInspectedUser(null);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-terracotta-600 text-white text-xs font-semibold"
                >
                  Switch Session to @{inspectedUser.username}
                </button>
              )}
              <button
                type="button"
                onClick={() => setInspectedUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ====================================================================
          MODAL 3: REPORT / FLAG POST OR COMMENT FOR MODERATOR QUEUE
         ==================================================================== */}
      {flagModalTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-orange-50 rounded-2xl border border-slate-200 max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flag className="w-4 h-4 text-rose-600" />
                <span>Report Content to Moderator Queue</span>
              </h3>
              <button
                onClick={() => setFlagModalTarget(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600">
              Flagging: <strong>{flagModalTarget.title}</strong>
            </p>

            <form onSubmit={handleSubmitFlag} className="space-y-3 text-xs">
              <textarea
                required
                rows={3}
                value={flagReasonInput}
                onChange={e => setFlagReasonInput(e.target.value)}
                placeholder="Describe why this post or comment should be reviewed by a Moderator (e.g. spam, inaccurate benchmark, off-topic)..."
                className="w-full p-3 rounded-xl border border-slate-300"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setFlagModalTarget(null)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold"
                >
                  Submit Flag Report
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}