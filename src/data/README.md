# NexusQA Dataset Files

This folder contains documentation and utilities for working with the NexusQA dataset.

## Quick Start: Export Data

### Method 1: Browser Console (Easiest)

1. Open the NexusQA app in your browser: http://localhost:5173
2. Open Developer Tools (F12)
3. Go to the Console tab
4. Paste this code and press Enter:

```javascript
// Export all data as JSON files
function exportAll() {
  const keys = ['nexusqa_users', 'nexusqa_documents', 'nexusqa_categories', 
                'nexusqa_tags', 'nexusqa_searchLogs', 'nexusqa_systemLogs'];
  
  keys.forEach(key => {
    const data = localStorage.getItem(key);
    if (data) {
      const blob = new Blob([data], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = key.replace('nexusqa_', '') + '.json';
      a.click();
      URL.revokeObjectURL(url);
    }
  });
  console.log('✅ Export complete!');
}

exportAll();
```

### Method 2: Using the Export Utility

1. Copy the contents of `export-utility.js`
2. Paste into browser console
3. Run: `exportNexusQAData()`

This will download:
- `users.json` - All 11 users
- `documents.json` - All 60 Q&A posts with comments
- `categories.json` - 5 categories
- `tags.json` - 20 technical tags
- `search_logs.json` - Search query history
- `system_logs.json` - Admin action audit trail
- `platform_settings.json` - Global configuration
- `nexusqa_complete_dataset.json` - Combined dataset

### Method 3: Direct localStorage Access

```javascript
// Get specific data
const documents = JSON.parse(localStorage.getItem('nexusqa_documents'));
const users = JSON.parse(localStorage.getItem('nexusqa_users'));

// View in console
console.table(users);
console.log(documents);
```

## Data Files

### 📄 DATASET_DOCUMENTATION.md
Complete documentation of the dataset structure, including:
- Data location in source code
- Field descriptions
- Statistics
- Sample queries

### 📄 export-utility.js
JavaScript utility to export all data from browser localStorage to JSON files.

## Dataset Overview

| Dataset | Count | Location in Code |
|---------|-------|------------------|
| Users | 11 | Line 96-240 |
| Categories | 5 | Line 80-86 |
| Tags | 20 | Line 88-92 |
| Q&A Posts | 60 | Line 242-732 (blueprints), Line 734-826 (generated) |
| Search Logs | 10+ | Line 832-843 (initial) |
| System Logs | 4+ | Line 845-850 (initial) |

## Data Persistence

- Data is automatically saved to browser **localStorage**
- Changes persist across page refreshes
- To reset: Use "Reset All Data" button in Super Admin settings

## Use Cases

1. **Machine Learning Training** - Export documents for BM25/TF-IDF model training
2. **Analytics** - Export search logs for CTR analysis
3. **Backup** - Save current state before testing
4. **Data Migration** - Move data between environments
5. **Research** - Analyze Q&A patterns and user behavior

## Example: Filter and Export Specific Data

```javascript
// Get only published documents
const docs = JSON.parse(localStorage.getItem('nexusqa_documents'));
const published = docs.filter(d => d.status === 'published');

// Get documents by category
const irDocs = docs.filter(d => d.category_id === 'cat-1');

// Get documents by author
const evanceDocs = docs.filter(d => d.author_username === 'evance');

// Export filtered data
const dataStr = JSON.stringify(published, null, 2);
const blob = new Blob([dataStr], {type: 'application/json'});
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'published_documents.json';
a.click();
```

## Need Help?

See `DATASET_DOCUMENTATION.md` for detailed information about the dataset structure and usage.
