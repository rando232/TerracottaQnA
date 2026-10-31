# NexusQA Dataset Documentation

## Overview

The NexusQA platform contains a rich dataset of technical Q&A content, users, and metadata embedded within the application.

## Data Location

All initial data is currently embedded in: `src/App.tsx`

## Dataset Components

### 1. **Users** (11 total)
- **Location**: Lines 96-240 in `src/App.tsx`
- **Variable**: `INITIAL_USERS`
- **Fields**: id, username, name, email, password, role, status, reputation, bio, joined_at, avatar

**Notable Users:**
- `@SalvadorDalier` - Super Admin
- `@loconner` - Data & SEO Specialist
- `@evance` - Super Admin (Dr. Elena Vance)
- `@Winnie_the_pooh` - Content Manager
- `@familyguy` - Moderator

### 2. **Categories** (5 total)
- **Location**: Lines 80-86 in `src/App.tsx`
- **Variable**: `INITIAL_CATEGORIES`
- **Categories**:
  1. Information Retrieval
  2. Database Systems
  3. Backend Architecture
  4. Frontend Engineering
  5. DevOps & Cloud

### 3. **Tags** (20 total)
- **Location**: Lines 88-92 in `src/App.tsx`
- **Variable**: `INITIAL_TAGS`
- **Tags**: bm25, tf-idf, inverted-index, tokenization, postgresql, mongodb, indexing, nodejs, fastapi, rbac, jwt, react, nextjs, tailwind, docker, kubernetes, redis, graphql, caching, ci-cd

### 4. **Q&A Blueprints** (60 total)
- **Location**: Lines 242-732 in `src/App.tsx`
- **Variable**: `RAW_QA_BLUEPRINTS`
- **Distribution**:
  - Information Retrieval: 12 posts
  - Database Systems: 12 posts
  - Backend Architecture: 12 posts
  - Frontend Engineering: 12 posts
  - DevOps & Cloud: 12 posts

**Each blueprint contains:**
- `cat`: Category ID
- `title`: Question title
- `tags`: Array of technical tags
- `concepts`: 3 key engineering concepts
- `problem`: Problem description
- `solution`: Engineering solution

### 5. **Documents** (60 generated)
- **Location**: Lines 734-826 in `src/App.tsx`
- **Variable**: `INITIAL_DOCUMENTS`
- **Generated from**: RAW_QA_BLUEPRINTS with additional metadata
- **Fields**: id, title, content, summary, category_id, tags, author_id, author, author_username, created_at, views_count, likes, status, is_flagged, flag_reason, seo_metadata, comments

### 6. **Search Logs** (10 initial)
- **Location**: Lines 832-843 in `src/App.tsx`
- **Variable**: `INITIAL_SEARCH_LOGS`
- **Purpose**: Track search queries and click-through rates for Phase 2 BM25 training

### 7. **System Logs** (4 initial)
- **Location**: Lines 845-850 in `src/App.tsx`
- **Variable**: `INITIAL_SYSTEM_LOGS`
- **Purpose**: Audit trail for admin actions

## Exporting Data

The application now stores all data in **browser localStorage** after the first load. To export:

### Option 1: Use Browser DevTools
1. Open browser console (F12)
2. Run: `console.log(JSON.parse(localStorage.getItem('nexusqa_documents')))`
3. Copy the output

### Option 2: Use the Export Feature (Search Logs)
1. Login as `@loconner` (Data & SEO Specialist)
2. Go to: Admin & RBAC → Data & SEO + Phase 2
3. Click: "Export as CSV" or "Export as JSON"

### Option 3: Extract from Source File
All data is in `src/App.tsx` - you can copy the constants directly

## Data Statistics

- **Total Q&A Posts**: 60
- **Total Users**: 11
- **Total Comments**: ~60-90 (1-2 per post)
- **Categories**: 5
- **Tags**: 20
- **Roles**: 5 (user, super_admin, content_manager, moderator, data_seo_specialist)
- **Publication Statuses**: published, draft, unpublished

## Sample Data Access

To access current data programmatically in the browser console:

```javascript
// Get all documents
const docs = JSON.parse(localStorage.getItem('nexusqa_documents'));

// Get all users
const users = JSON.parse(localStorage.getItem('nexusqa_users'));

// Get search logs
const searchLogs = JSON.parse(localStorage.getItem('nexusqa_searchLogs'));

// Export to file
const dataStr = JSON.stringify(docs, null, 2);
const dataBlob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(dataBlob);
const link = document.createElement('a');
link.href = url;
link.download = 'nexusqa_documents.json';
link.click();
```

## Resetting Data

To reset all data to initial state:
1. Login as Super Admin (@SalvadorDalier)
2. Go to: Admin & RBAC → Super Admin
3. Scroll to: Global Platform Settings
4. Click: "Reset All Data to Initial State"

Or manually: `localStorage.clear()` in console, then refresh.
