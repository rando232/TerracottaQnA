# Terracotta QnA

A full-stack Q&A platform with advanced Information Retrieval capabilities, built with React and FastAPI.

## Features

- 🔍 **Advanced IR Search** - BM25-based search engine with query expansion
- 👤 **User Authentication** - JWT-based auth with secure login/registration
- 📝 **Question & Answer System** - Create, view, and manage Q&A content
- 💬 **Comments & Discussions** - Engage with community through comments
- 🖼️ **Profile Pictures** - Upload and manage user avatars
- 📊 **User Profiles** - Track questions, answers, and activity
- 🎨 **Modern UI** - Responsive design with Tailwind CSS

## Tech Stack

### Frontend
- React 18
- React Router v6
- Tailwind CSS
- Heroicons
- Axios

### Backend
- FastAPI
- MySQL
- JWT Authentication
- BM25 Search Algorithm
- Python 3.x

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL Server

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create `.env` file:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=terracotta_qa
SECRET_KEY=your_secret_key
```

5. Start the server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend-react
```

2. Install dependencies:
```bash
npm install
```

3. Start development server:
```bash
npm start
```

The application will be available at `http://localhost:3001`

## Default Admin Credentials

- Username: `admin`
- Password: `MegaMeg`

## API Documentation

Once the backend is running, visit `http://localhost:8000/docs` for interactive API documentation.

## Project Structure

```
terracotta-fullstack/
├── backend/
│   ├── main.py              # FastAPI application
│   ├── models.py            # Pydantic models
│   ├── database.py          # Database connection
│   ├── auth.py              # Authentication logic
│   ├── search_api.py        # IR search engine
│   └── uploads/avatars/     # User profile pictures
├── frontend-react/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   └── api/             # API client
│   └── public/
└── README.md
```

## License

MIT
