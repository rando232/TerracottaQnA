# Troubleshooting Guide - HTML Frontend Issues

## Issues Reported
1. ❌ Login doesn't work
2. ❌ Questions don't show up
3. ❌ Searching shows nothing
4. ❌ UI is broken
5. ❌ Images are far too big

## Fixes Applied

### 1. CORS Configuration ✅
**Problem**: Backend only allowed `http://localhost:3000` (React port)  
**Fix**: Updated `backend/main.py` to also allow `http://localhost:3001`

```python
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:3001").split(",")
```

### 2. Icon/Image Sizing ✅
**Problem**: SVG icons expanding too large  
**Fix**: Added `min-width`, `min-height`, and `flex-shrink: 0` to CSS

```css
.icon {
    width: 1.25rem;
    height: 1.25rem;
    min-width: 1.25rem;
    min-height: 1.25rem;
    flex-shrink: 0;
}
```

### 3. Backend Restarted ✅
Restarted backend with updated CORS settings

## Testing

### Test Page Created
Visit: http://localhost:3001/test.html

This page has 3 test buttons:
1. **Test API Connection** - Fetches documents from API
2. **Test Login** - Attempts login with admin/admin123
3. **Test Search** - Tests BM25 search

The page auto-runs "Test API Connection" on load.

### Expected Results
- ✅ Green boxes = Working
- ❌ Red boxes = Failed (shows error details)

## Manual Verification

### 1. Check Backend is Running
```bash
# Should return data
curl http://localhost:8000/api/documents?limit=1
```

### 2. Check Frontend Server
```bash
# Should return 200
curl http://localhost:3001/index.html
```

### 3. Browser Console
Open browser DevTools (F12) and check:
- **Console tab**: Look for JavaScript errors
- **Network tab**: Check if API calls are succeeding (200 status)
- **Application > Local Storage**: Check if token is saved after login

## Common Issues & Solutions

### Issue: "CORS error" in console
**Solution**: 
1. Backend must be restarted after CORS changes
2. Check `main.py` line 25 includes port 3001
3. Clear browser cache (Ctrl+F5)

### Issue: Login returns 400 Bad Request
**Cause**: Login endpoint expects `application/x-www-form-urlencoded`
**Solution**: Check `auth.js` is sending correct format:
```javascript
const formData = new URLSearchParams();
formData.append('username', username);
formData.append('password', password);
```

### Issue: Questions not loading
**Possible causes**:
1. JavaScript error preventing API call
2. CORS blocking the request
3. Backend not running

**Debug steps**:
```javascript
// Open browser console and run:
fetch('http://localhost:8000/api/documents?limit=5')
  .then(r => r.json())
  .then(data => console.log(data))
  .catch(err => console.error(err));
```

### Issue: Images/icons too large
**Fixed in CSS** - All icons now have fixed dimensions with `min-width`/`min-height`

### Issue: UI looks broken
**Possible causes**:
1. CSS file not loading (check Network tab)
2. JavaScript errors (check Console tab)
3. Browser cache (hard refresh with Ctrl+F5)

## Verification Checklist

Run through these steps:

### Backend
- [ ] Backend running on port 8000
- [ ] Can access http://localhost:8000/docs
- [ ] `/api/documents` returns JSON data
- [ ] CORS includes port 3001

### Frontend  
- [ ] Python HTTP server running on port 3001
- [ ] Can access http://localhost:3001/test.html
- [ ] Test page shows green success for API connection
- [ ] CSS file loads (check Network tab)
- [ ] No JavaScript errors in Console

### Functionality
- [ ] Home page shows questions
- [ ] Can click on a question to view details
- [ ] Search page accepts queries
- [ ] Login accepts admin/admin123
- [ ] After login, navbar shows username

## Current Status

### What Should Work Now ✅
1. ✅ API calls from frontend to backend
2. ✅ CORS properly configured
3. ✅ Icons sized correctly
4. ✅ Login authentication flow
5. ✅ Questions loading on home page
6. ✅ Search functionality
7. ✅ Question detail pages

### What Might Still Need Work
- Login form UX (better error messages)
- Loading states (show spinners)
- Better responsive design
- Additional pages (register, directory, ask, profile)

## Next Steps

1. **Open test page**: http://localhost:3001/test.html
2. **Click all 3 test buttons** - verify all show green ✅
3. **If tests pass**: Try the main site at http://localhost:3001
4. **If tests fail**: Check error messages and browser console

## Quick Debug Commands

### Check what's running
```bash
# Check backend
netstat -ano | findstr ":8000"

# Check frontend  
netstat -ano | findstr ":3001"
```

### Test API directly
```bash
# Get documents
curl http://localhost:8000/api/documents?limit=2

# Test search
curl "http://localhost:8000/api/search?query=BM25&top_k=3"
```

### Browser Console Tests
Open DevTools (F12) and paste:

```javascript
// Test API
fetch('http://localhost:8000/api/documents?limit=2')
  .then(r => r.json())
  .then(data => console.log('API works!', data))
  .catch(err => console.error('API failed:', err));

// Test login
const formData = new URLSearchParams();
formData.append('username', 'admin');
formData.append('password', 'admin123');

fetch('http://localhost:8000/api/auth/login', {
  method: 'POST',
  headers: {'Content-Type': 'application/x-www-form-urlencoded'},
  body: formData
})
  .then(r => r.json())
  .then(data => console.log('Login works!', data))
  .catch(err => console.error('Login failed:', err));
```

## Contact Points

- **Test Page**: http://localhost:3001/test.html
- **Home Page**: http://localhost:3001
- **API Docs**: http://localhost:8000/docs
- **Backend Health**: http://localhost:8000/api/documents

---

After running these tests, please report:
1. What color boxes do you see on test.html?
2. Any errors in browser console?
3. What does the Network tab show for API calls?
