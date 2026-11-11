# Terracotta QnA - Quick Start Guide

## 🚀 You're All Set!

Your modern React-based Terracotta QnA platform is now running with advanced Information Retrieval features.

### 🌐 Access Points

| Service | URL | Status |
|---------|-----|--------|
| **React Frontend** | http://localhost:3001 | ✅ Running |
| **FastAPI Backend** | http://localhost:8000 | ✅ Running |
| **API Documentation** | http://localhost:8000/docs | ✅ Available |
| **MySQL Database** | localhost:3306 | ✅ Connected |

### 🔑 Test Login

```
Username: admin
Password: admin123
```
(All users in the database use this password)

## 📱 Pages Overview

### Public Pages (No Login Required)

#### 1️⃣ Home (`/`)
- **Hero section** with platform description
- **Search bar** leading to IR search
- **Statistics** (questions, answers, members)
- **Latest questions** with sorting options:
  - 🕐 Latest
  - 🔥 Top Voted
  - ✨ Most Viewed

#### 2️⃣ Directory (`/directory`)
- **All questions** with pagination
- **Advanced filters**:
  - Search by keyword
  - Filter by category
  - Filter by tag
  - Sort options
- **Mobile-friendly** filter drawer
- **Clear filters** button

#### 3️⃣ Question Detail (`/questions/:id`)
- **Full question** with markdown rendering
- **Vote buttons** (upvote/downvote)
- **Category and tags**
- **All answers** with voting
- **View count** tracking
- **Author information**

#### 4️⃣ Search (`/search`)
- **BM25 search** with relevance ranking
- **Spell correction** ("Did you mean...?")
- **Query-focused snippets** with highlighting
- **Popular queries** suggestions
- **Search statistics**:
  - Response time (ms)
  - Result count
  - Query terms
- **Click tracking** for analytics

#### 5️⃣ Login (`/login`)
- **Simple login form**
- **Remember me** option
- Link to registration

#### 6️⃣ Register (`/register`)
- **User registration** form
- Required: username, email, name, password
- Optional: bio

### Protected Pages (Login Required)

#### 7️⃣ Ask Question (`/ask`)
- **Rich question editor**
- **Title** (200 char limit)
- **Summary** (optional one-liner)
- **Content** (markdown supported)
- **Category** selection (required)
- **Tags** (optional, multi-select)
- **Preview mode** for content
- **Tips** for writing good questions

#### 8️⃣ Profile (`/profile`)
- **User information** display
- **Edit profile** functionality
- **Statistics**:
  - Questions posted
  - Answers given
  - Reputation score
- **Activity tabs**:
  - Your questions
  - Your answers
- **Avatar** with initials

## 🎯 Quick Actions

### For First-Time Users

1. **Browse Content**
   ```
   Navigate to Home → See latest questions
   Click any question → View full details
   ```

2. **Try Search**
   ```
   Click Search in navbar
   Try: "BM25 ranking" or "information retrieval"
   See spell corrections and relevance scores
   ```

3. **Create Account**
   ```
   Click Sign Up → Fill registration form
   Auto-login after registration
   ```

4. **Ask Your First Question**
   ```
   Login → Click "Ask Question"
   Fill in title, content, category
   Add tags → Post Question
   ```

### For Active Users

1. **Engage with Content**
   - Upvote/downvote questions and answers
   - Post detailed answers
   - Use markdown formatting

2. **Discover Questions**
   - Use Directory filters
   - Search with IR system
   - Follow categories and tags

3. **Build Reputation**
   - Post quality questions
   - Provide helpful answers
   - Earn upvotes

## 🔍 IR Search Examples

Try these queries to see the IR system in action:

| Query | Expected Results |
|-------|-----------------|
| `BM25` | Documents about BM25 ranking algorithm |
| `information retrival` | Spell correction → "information retrieval" |
| `ranking algorithm` | Multiple matches with relevance scores |
| `search engine` | Query-focused snippets |
| `indexing` | Documents about indexing techniques |

### Understanding Search Results

Each result shows:
- **Title** (clickable link)
- **Snippet** with highlighted terms
- **BM25 Score** (higher = more relevant)
- **Rank** position
- **Category** badge

## 🎨 UI Features

### Navigation
- **Sticky navbar** stays visible while scrolling
- **Mobile menu** for small screens
- **User dropdown** when logged in
- **Quick actions** in navbar

### Responsive Design
- **Mobile-first** approach
- **Breakpoints**: sm, md, lg, xl
- **Touch-friendly** buttons
- **Collapsible menus**

### Visual Feedback
- **Loading skeletons** during data fetch
- **Hover effects** on interactive elements
- **Smooth transitions** between states
- **Color-coded** votes (green=positive, red=negative)

### Typography
- **Clear hierarchy** with heading sizes
- **Readable fonts** (system font stack)
- **Proper spacing** for content
- **Markdown styling** for code, lists, quotes

## 🛠️ Technical Details

### Frontend Stack
```javascript
React 18.2          // UI library
React Router 6      // Client-side routing
Tailwind CSS 3      // Utility-first styling
Axios              // HTTP client
Context API        // State management
React Markdown     // Markdown rendering
date-fns           // Date formatting
Heroicons          // SVG icons
Vite               // Build tool
```

### API Endpoints Used

```javascript
// Authentication
POST /api/auth/login
POST /api/auth/register
GET  /api/auth/me
PUT  /api/auth/profile

// Documents (Questions)
GET    /api/documents
GET    /api/documents/:id
POST   /api/documents
PUT    /api/documents/:id
DELETE /api/documents/:id
POST   /api/documents/:id/view

// Comments (Answers)
GET    /api/documents/:id/comments
POST   /api/comments
PUT    /api/comments/:id
DELETE /api/comments/:id

// Votes
POST /api/votes
GET  /api/votes/:type/:id

// Search (IR System)
GET  /api/search?query=...&top_k=20
POST /api/search/click
GET  /api/search/metrics
GET  /api/search/popular

// Categories & Tags
GET /api/categories
GET /api/tags
```

### State Management

```javascript
// Global State (Context)
- User authentication state
- JWT token
- User profile data

// Local State (Component)
- Form inputs
- Loading states
- Error messages
- Pagination
```

## 📊 Performance Metrics

### Search Performance
- **Query Time**: 1-3ms average
- **Index Size**: 8 documents, 304 terms
- **Compression**: Delta-encoded inverted index
- **Algorithm**: BM25 with DAAT

### Frontend Performance
- **HMR**: Instant updates in dev mode
- **Build Time**: ~2-3 seconds
- **Bundle Size**: Optimized with Vite
- **Load Time**: Fast SPA navigation

## 🐛 Troubleshooting

### Frontend Won't Start
```bash
cd terracotta-fullstack/frontend-react
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Backend Connection Failed
Check if backend is running:
```bash
netstat -ano | findstr ":8000"
```

If not running:
```bash
cd terracotta-fullstack/backend
uvicorn main:app --reload --port 8000
```

### Database Connection Issues
Verify MySQL is running on port 3306 with credentials:
- Host: localhost
- User: root
- Password: admin123
- Database: terracotta_ir

### Port Already in Use
Change port in `vite.config.js`:
```javascript
server: {
  port: 3002, // Use different port
  ...
}
```

## 📚 Documentation Files

- `frontend-react/README.md` - Frontend documentation
- `IR_SYSTEM_DOCUMENTATION.md` - IR system details
- `REACT_FRONTEND_COMPLETE.md` - Complete setup guide
- `QUICK_START_GUIDE.md` - This file

## 🎓 Learning Path

### For Beginners
1. Explore the UI as a guest user
2. Create an account
3. Post a test question
4. Try the search feature
5. Vote and comment on content

### For Developers
1. Review the component structure
2. Examine the API client (`src/api.js`)
3. Study the AuthContext pattern
4. Explore the IR search implementation
5. Check the Tailwind styling approach

### For IR Students
1. Use the search page extensively
2. Compare queries with/without spelling errors
3. Examine BM25 scores
4. Review the backend IR code
5. Study the evaluation metrics

## 🌟 Best Practices Implemented

### Code Quality
- ✅ Consistent file naming
- ✅ Component reusability
- ✅ Proper error handling
- ✅ Loading states
- ✅ Clean code structure

### User Experience
- ✅ Responsive design
- ✅ Clear navigation
- ✅ Helpful error messages
- ✅ Loading indicators
- ✅ Mobile-friendly

### Security
- ✅ JWT authentication
- ✅ Protected routes
- ✅ Role-based access
- ✅ Input validation
- ✅ XSS prevention

### Performance
- ✅ Code splitting
- ✅ Lazy loading ready
- ✅ Optimized builds
- ✅ Efficient re-renders
- ✅ Fast IR queries

## 🎉 You're Ready!

Open your browser and visit:
# 🌐 http://localhost:3001

Login with:
- **Username**: admin
- **Password**: admin123

Enjoy your modern Terracotta QnA platform! 🚀
