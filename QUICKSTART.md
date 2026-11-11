# Terracotta QnA - Quick Start Guide

Get the full-stack platform running in 5 minutes!

## 🚀 Quick Setup

### Step 1: Setup Database (2 minutes)

```bash
# Login to MySQL
mysql -u root -p

# Run schema (creates database and tables)
SOURCE C:/Users/jacks/Downloads/SRC/SEG201/terracotta-fullstack/database/schema.sql;

# Optional: Load sample data (8 questions, 13 answers, 5 users)
SOURCE C:/Users/jacks/Downloads/SRC/SEG201/terracotta-fullstack/database/seed_data.sql;

# Verify
USE terracotta_qna;
SHOW TABLES;
SELECT COUNT(*) FROM users;
```

### Step 2: Setup Backend (2 minutes)

```bash
# Navigate to backend
cd C:\Users\jacks\Downloads\SRC\SEG201\terracotta-fullstack\backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
copy .env.example .env

# Edit .env and set your MySQL password
notepad .env
```

**In .env, update:**
```env
DB_PASSWORD=your_actual_mysql_password
```

**Start the backend:**
```bash
python main.py
```

✅ Backend running at: http://localhost:8000
📚 API docs at: http://localhost:8000/docs

### Step 3: Setup Frontend (1 minute)

**Open a NEW terminal window:**

```bash
# Navigate to frontend
cd C:\Users\jacks\Downloads\SRC\SEG201\terracotta-fullstack\frontend

# Start simple HTTP server
python -m http.server 3000
```

✅ Frontend running at: http://localhost:3000

## 🎯 Test It Out!

### 1. View the Platform
Open http://localhost:3000 in your browser

### 2. Login with Test Account
- **Username:** `admin`
- **Password:** `admin123`

**Or try these users (if you loaded seed data):**
- `alice_search` / admin123
- `bob_backend` / admin123
- `carol_db` / admin123
- `dave_frontend` / admin123
- `eve_devops` / admin123

### 3. Try These Features
- ✅ Browse questions on the home page
- ✅ Search for "BM25" or "MySQL"
- ✅ Click a question to read answers
- ✅ Vote on questions and answers
- ✅ Post your own question (click the + button)
- ✅ Add an answer to a question
- ✅ Filter by category
- ✅ Sort by latest/most viewed/highest voted

## 🎨 What You Get

### With Seed Data (Recommended)
- **8 realistic questions** covering IR, databases, backend, frontend, DevOps
- **13 detailed answers** from community members
- **5 test users** with different roles
- **5 categories** and 20 tags
- Sample votes and search logs

### Without Seed Data
- **1 admin user** (admin/admin123)
- **5 categories** and 20 tags
- Empty Q&A platform ready for your content

## 📊 Explore the API

Visit http://localhost:8000/docs for interactive API documentation.

**Try these endpoints:**
- `GET /api/documents` - List all questions
- `GET /api/categories` - List categories
- `POST /api/auth/login` - Login endpoint
- `GET /api/stats` - Platform statistics

## 🐛 Common Issues

### "Can't connect to database"
```bash
# Check MySQL is running
mysql --version

# Test connection
mysql -u root -p

# Verify .env has correct password
```

### "Port 8000 already in use"
```bash
# Change backend port
python main.py --port 8001

# Or kill the process using port 8000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F
```

### "ModuleNotFoundError"
```bash
# Make sure virtual environment is activated
venv\Scripts\activate

# Reinstall dependencies
pip install -r requirements.txt
```

### "CORS error in browser"
- Make sure backend is running
- Check .env has: `ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000`
- Restart backend after changing .env

## 📁 Project Structure

```
terracotta-fullstack/
├── backend/          ← Python FastAPI server
│   ├── main.py      ← Run this to start API
│   └── .env         ← Database config
├── frontend/        ← HTML/CSS/JS frontend
│   └── index.html   ← Serve this with http.server
└── database/        ← MySQL schema and seed data
    ├── schema.sql   ← Database structure
    └── seed_data.sql ← Sample content
```

## 🎓 Next Steps

1. **Customize the Platform**
   - Change colors in `frontend/index.html` (Tailwind config)
   - Add new categories via API or directly in MySQL
   - Modify user roles and permissions

2. **Add Features**
   - User profile editing
   - Document editing
   - Advanced search with filters
   - Email notifications

3. **Deploy to Production**
   - Use Gunicorn/Uvicorn with multiple workers
   - Set up HTTPS with SSL certificates
   - Use a production MySQL database
   - Add caching with Redis
   - Set up monitoring and logging

## 💡 Tips

- **Development Workflow:**
  - Edit Python code → Backend auto-reloads (with `--reload` flag)
  - Edit HTML/JS → Just refresh browser
  - Edit database → Run SQL directly or use API

- **Testing:**
  - Use the Swagger UI at `/docs` to test API endpoints
  - Create multiple browser profiles to test different users
  - Check browser console for frontend errors

- **Learning:**
  - Read the code comments
  - Experiment with the API
  - Try breaking things and fixing them!

## 🤝 Need Help?

- Check the main README.md for detailed documentation
- Review the API docs at http://localhost:8000/docs
- Look at the database schema in `database/schema.sql`
- Examine sample queries in `database/seed_data.sql`

---

**Happy coding! 🎉**

Built with Python FastAPI, MySQL, and Tailwind CSS
