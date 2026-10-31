# 📊 NexusQA Dataset - Quick Reference

## Where is the Data?

### In the Source Code
All initial data is embedded in: **`src/App.tsx`**

**Key Sections:**
- **Lines 80-86**: Categories (5 items)
- **Lines 88-92**: Tags (20 items)
- **Lines 96-240**: Users (11 users with full profiles)
- **Lines 242-732**: Q&A Blueprints (60 detailed technical posts)
- **Lines 734-826**: Document generation logic
- **Lines 832-843**: Initial search logs
- **Lines 845-850**: Initial system logs

### In Browser Storage
After the app runs, all data is stored in **browser localStorage** with these keys:
- `nexusqa_users`
- `nexusqa_documents`
- `nexusqa_categories`
- `nexusqa_tags`
- `nexusqa_searchLogs`
- `nexusqa_systemLogs`
- `nexusqa_platformSettings`

## 🚀 How to Export Data

### Fastest Way (Copy/Paste to Console)

Open browser console (F12) on http://localhost:5173 and run:

```javascript
function quickExport() {
  const data = {
    users: JSON.parse(localStorage.getItem('nexusqa_users')),
    documents: JSON.parse(localStorage.getItem('nexusqa_documents')),
    categories: JSON.parse(localStorage.getItem('nexusqa_categories')),
    tags: JSON.parse(localStorage.getItem('nexusqa_tags')),
    searchLogs: JSON.parse(localStorage.getItem('nexusqa_searchLogs')),
    systemLogs: JSON.parse(localStorage.getItem('nexusqa_systemLogs'))
  };
  
  const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'nexusqa_dataset_' + Date.now() + '.json';
  a.click();
  console.log('✅ Dataset exported!');
}

quickExport();
```

## 📈 Dataset Statistics

| Item | Count | Details |
|------|-------|---------|
| **Users** | 11 | 5 roles: Super Admin (2), Content Manager (1), Moderator (2), Data/SEO (2), User (4) |
| **Documents** | 60 | Distributed across 5 categories (12 each) |
| **Categories** | 5 | Info Retrieval, Database, Backend, Frontend, DevOps |
| **Tags** | 20 | Technical keywords (bm25, postgresql, react, docker, etc.) |
| **Comments** | ~60-90 | 1-2 per document with @mentions |
| **Search Logs** | 10+ | Growing with usage |

## 🎯 Notable Users

| Username | Role | Email |
|----------|------|-------|
| @SalvadorDalier | Super Admin | minhnhat67788@gmail.com |
| @evance | Super Admin | elena.vance@nexusqa.dev |
| @loconner | Data & SEO | liam.oconner@nexusqa.dev |
| @Winnie_the_pooh | Content Manager | marcus.chen@nexusqa.dev |
| @familyguy | Moderator | peter.griffin@nexusqa.dev |

## 📁 Files in `src/data/` Folder

1. **README.md** - This file
2. **DATASET_DOCUMENTATION.md** - Complete dataset documentation
3. **export-utility.js** - Copy/paste script for exporting

## 🔄 Data Flow

```
Source Code (App.tsx)
    ↓
Initial Load → React State
    ↓
Auto-save → localStorage
    ↓
Export → JSON Files
```

## 💡 Common Tasks

### View All Documents
```javascript
console.table(JSON.parse(localStorage.getItem('nexusqa_documents')))
```

### Find Documents by Author
```javascript
const docs = JSON.parse(localStorage.getItem('nexusqa_documents'));
docs.filter(d => d.author_username === 'evance')
```

### Count Documents by Category
```javascript
const docs = JSON.parse(localStorage.getItem('nexusqa_documents'));
const counts = docs.reduce((acc, d) => {
  acc[d.category_id] = (acc[d.category_id] || 0) + 1;
  return acc;
}, {});
console.log(counts);
```

### Export Search Logs for Analysis
```javascript
const logs = JSON.parse(localStorage.getItem('nexusqa_searchLogs'));
const csv = logs.map(l => `${l.query_string},${l.clicked_doc_id || 'NULL'},${l.timestamp}`).join('\n');
console.log('query,clicked_doc,timestamp\n' + csv);
```

## 🎨 Sample Data Structure

### User
```json
{
  "id": "usr-9",
  "username": "evance",
  "name": "Dr. Elena Vance",
  "email": "elena.vance@nexusqa.dev",
  "role": "super_admin",
  "reputation": 4120,
  "bio": "Distributed Security & IR Researcher..."
}
```

### Document
```json
{
  "id": "doc-1001",
  "title": "How to tune BM25 k1 and b parameters...",
  "category_id": "cat-1",
  "tags": ["bm25", "tf-idf", "inverted-index"],
  "author_username": "SalvadorDalier",
  "status": "published",
  "views_count": 1847,
  "likes": 27,
  "comments": [...]
}
```

---

**Questions?** See `DATASET_DOCUMENTATION.md` for complete details!
