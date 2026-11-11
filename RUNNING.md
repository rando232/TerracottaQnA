# ✅ Terracotta QnA - Running Successfully!

## 🎉 System Status

**All systems operational!**

- ✅ MySQL Database: Running on port 3306
- ✅ Backend API: Running on http://localhost:8000
- ✅ Frontend: Running on http://localhost:3000
- ✅ Authentication: Working correctly
- ✅ Sample Data: 8 questions, 11 answers, 6 users loaded

---

## 🌐 Access URLs

### Main Application
**http://localhost:3000**
- Browse questions
- Search and filter
- Login and post content
- Vote and comment

### API Documentation
**http://localhost:8000/docs**
- Interactive Swagger UI
- Test all endpoints
- See request/response schemas

---

## 👤 Test Accounts

All accounts use password: **admin123**

| Username | Role | Description |
|----------|------|-------------|
| `admin` | Super Admin | Full access to everything |
| `alice_search` | Data Specialist | IR specialist |
| `bob_backend` | Content Manager | Backend engineer |
| `carol_db` | Moderator | Database expert |
| `dave_frontend` | User | Frontend developer |
| `eve_devops` | User | DevOps engineer |

---

## 📊 Sample Content

### 8 Questions Available:
1. **How does BM25 ranking algorithm work?** (Information Retrieval)
2. **MySQL indexing strategy for full-text search** (Database Systems)
3. **FastAPI vs Flask: Which is better for REST APIs?** (Backend Architecture)
4. **Implementing responsive navigation with Tailwind CSS** (Frontend Engineering)
5. **Docker Compose for multi-container microservices** (DevOps & Cloud)
6. **Vector search vs keyword search: When to use each?** (Information Retrieval)
7. **SQL JOIN performance optimization tips** (Database Systems)
8. **API rate limiting strategies in FastAPI** (Backend Architecture)

### 11 Detailed Answers
Professional, helpful responses with code examples and best practices.

---

## 🎯 Quick Start

1. **Open the app**: http://localhost:3000
2. **Click "Login"** in the top right
3. **Enter credentials**:
   - Username: `admin`
   - Password: `admin123`
4. **Try these features**:
   - 🔍 Search for "BM25" or "MySQL"
   - 📂 Filter by category
   - 📊 Sort by latest/most viewed/highest voted
   - 👍 Click a question and vote
   - 💬 Post an answer
   - ➕ Create your own question (+ button)

---

## 🛠️ Technical Details

### Backend (Python FastAPI)
- **Port:** 8000
- **Process ID:** Check task manager
- **Virtual Environment:** `backend/venv/`
- **Configuration:** `backend/.env`

### Frontend (HTTP Server)
- **Port:** 3000
- **Server:** Python http.server
- **Files:** `frontend/index.html`, `frontend/app.js`

### Database (MySQL 8.0.46)
- **Port:** 3306
- **Database:** terracotta_qna
- **Tables:** 10 (users, documents, comments, votes, etc.)
- **Service:** MySQL80 (running automatically)

---

## 🔧 Managing the Servers

### To Stop Servers:
Press `Ctrl+C` in the terminal windows or close the terminals

### To Restart Backend:
```bash
cd C:\Users\jacks\Downloads\SRC\SEG201\terracotta-fullstack\backend
venv\Scripts\activate
python main.py
```

### To Restart Frontend:
```bash
cd C:\Users\jacks\Downloads\SRC\SEG201\terracotta-fullstack\frontend
python -m http.server 3000
```

### To Check MySQL:
```bash
# Check service status
Get-Service MySQL80

# Connect to MySQL
mysql -u root -p
# Password: admini123jklul@
```

---

## 📚 Documentation

- **README.md** - Complete technical documentation
- **QUICKSTART.md** - 5-minute setup guide
- **PROJECT_SUMMARY.md** - Full project overview
- **API Docs** - http://localhost:8000/docs

---

## 🎨 Features You Can Try

### As a User:
- ✅ Browse and search questions
- ✅ Vote on questions and answers (upvote/downvote)
- ✅ Post new questions
- ✅ Answer existing questions
- ✅ Filter by category
- ✅ Sort by different criteria
- ✅ View user profiles

### As Admin (login as `admin`):
- ✅ All user features
- ✅ Delete any content
- ✅ Create new categories
- ✅ Create new tags
- ✅ Moderate the platform

---

## 🐛 Troubleshooting

### If login doesn't work:
- Make sure backend is running on port 8000
- Check browser console for errors (F12)
- Verify you're using: admin / admin123

### If frontend doesn't load:
- Make sure frontend server is running on port 3000
- Try http://127.0.0.1:3000 instead
- Clear browser cache (Ctrl+F5)

### If backend has errors:
- Check backend terminal for error messages
- Verify MySQL is running
- Check .env file has correct database password

---

## 🎉 Success Indicators

If everything is working, you should see:
- ✅ Login screen with "Welcome to Terracotta QnA"
- ✅ 8 questions displayed after login
- ✅ Search bar and filters working
- ✅ Ability to click questions and see details
- ✅ Vote buttons (up/down arrows)
- ✅ Answer form at bottom of question pages
- ✅ Floating + button to create questions

---

**Enjoy exploring your Terracotta QnA platform!** 🚀✨

Built with Python FastAPI, MySQL, and Tailwind CSS
