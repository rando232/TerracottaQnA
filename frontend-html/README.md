# Terracotta QnA - HTML Frontend

Pure HTML/CSS/JavaScript frontend for Terracotta QnA with advanced Information Retrieval features.

## Features

### ✅ No Build Step Required
- Pure HTML, CSS, and vanilla JavaScript
- No npm, no dependencies, no compilation
- Just open `index.html` in a browser or serve with any web server

### 🎨 Pages Included
1. **index.html** - Home page with hero, stats, and question listings
2. **login.html** - User authentication
3. **register.html** - User registration (to be created)
4. **search.html** - BM25 IR search with spell correction
5. **question.html** - Question detail with voting and comments
6. **directory.html** - Question directory with filters (to be created)
7. **ask.html** - Create new questions (to be created)
8. **profile.html** - User profile (to be created)

### 🚀 Core Features
- ✅ Modern responsive design
- ✅ BM25 search with spell correction
- ✅ Query-focused snippets
- ✅ User authentication (JWT)
- ✅ Voting system
- ✅ Commenting/answers
- ✅ Markdown rendering
- ✅ Real-time search stats

## Quick Start

### Option 1: Open Directly
Simply open `index.html` in your web browser.

**Note**: Due to CORS restrictions, API calls won't work when opening files directly. Use Option 2 or 3 instead.

### Option 2: Python HTTP Server
```bash
cd terracotta-fullstack/frontend-html
python -m http.server 3001
```
Then visit: http://localhost:3001

### Option 3: Node.js HTTP Server
```bash
cd terracotta-fullstack/frontend-html
npx http-server -p 3001
```
Then visit: http://localhost:3001

### Option 4: PHP Built-in Server
```bash
cd terracotta-fullstack/frontend-html
php -S localhost:3001
```
Then visit: http://localhost:3001

## Configuration

The API endpoint is configured in `js/config.js`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

Change this if your backend is running on a different port.

## File Structure

```
frontend-html/
├── index.html              # Home page
├── login.html              # Login page
├── search.html             # IR search interface
├── question.html           # Question detail view
├── css/
│   └── style.css          # All styles
└── js/
    ├── config.js          # API configuration
    ├── auth.js            # Authentication logic
    ├── api.js             # API client
    ├── utils.js           # Utility functions
    └── home.js            # Home page logic
```

## How It Works

### Authentication
- JWT tokens stored in `localStorage`
- Automatic token injection in API requests
- Navbar updates based on auth state

### API Client
- Centralized API calls in `js/api.js`
- Automatic error handling
- Promise-based async/await

### State Management
- Simple global `auth` object
- Page-specific state in script tags
- No external state management library

## Browser Support

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Test Accounts

```
Username: admin
Password: admin123
```

## Development

### Adding a New Page
1. Create HTML file (e.g., `newpage.html`)
2. Include required scripts:
   ```html
   <script src="js/config.js"></script>
   <script src="js/auth.js"></script>
   <script src="js/api.js"></script>
   <script src="js/utils.js"></script>
   ```
3. Add page-specific logic in inline `<script>` tag or separate JS file

### Styling
All styles are in `css/style.css` using CSS custom properties (variables).

Theme colors:
```css
--primary-600: #e14515  /* Main orange/terracotta */
--gray-600: #4b5563     /* Text color */
```

## Advantages Over React Version

✅ **No Build Step** - Edit and refresh  
✅ **Smaller Size** - No framework overhead  
✅ **Faster Load** - No bundle to download  
✅ **Simple Deployment** - Just copy files  
✅ **Easy to Understand** - Vanilla JS  
✅ **No Dependencies** - Zero npm packages  

## Limitations

❌ No component reusability (use template strings instead)  
❌ No hot module replacement (manual refresh)  
❌ No TypeScript support  
❌ Manual DOM manipulation  

## Next Steps

To complete the frontend, create these remaining pages:
- [ ] `register.html` - User registration form
- [ ] `directory.html` - Full question listing with filters
- [ ] `ask.html` - Question creation form
- [ ] `profile.html` - User profile and activity

## API Integration

The frontend integrates with FastAPI backend running on port 8000:

### Endpoints Used
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user
- `GET /api/documents` - List questions
- `GET /api/documents/:id` - Get question detail
- `POST /api/documents` - Create question
- `GET /api/documents/:id/comments` - Get answers
- `POST /api/comments` - Post answer
- `POST /api/votes` - Vote on content
- `GET /api/search` - BM25 search
- `POST /api/search/click` - Log search clicks
- `GET /api/search/popular` - Popular queries

## Performance

- **Initial Load**: ~50KB (HTML + CSS + JS)
- **Search Response**: 1-3ms (backend)
- **Page Navigation**: Instant (no SPA routing)

## Troubleshooting

### CORS Errors
Make sure FastAPI backend has CORS enabled:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Connection Failed
1. Check backend is running: http://localhost:8000/docs
2. Verify `API_BASE_URL` in `js/config.js`
3. Check browser console for errors

### Login Not Working
- Check credentials (admin/admin123)
- Verify token is saved in localStorage (DevTools → Application → Local Storage)
- Check network tab for API response

## License

Part of the Terracotta QnA project.
