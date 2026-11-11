from fastapi import FastAPI, HTTPException, Depends, status, BackgroundTasks, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials, OAuth2PasswordRequestForm
from fastapi.staticfiles import StaticFiles
from typing import Optional, List
import os
import uuid
from pathlib import Path
from dotenv import load_dotenv

from models import *
from database import execute_query, get_db_connection
from auth import verify_password, get_password_hash, create_access_token, decode_access_token

# Import IR Search System
from search_api import register_search_routes, initialize_search_engine

load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title="Terracotta QnA API",
    description="Information Retrieval & Search Engineering Community Platform with Advanced IR",
    version="2.0.0"
)

# CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Create uploads directory for profile pictures
UPLOAD_DIR = Path("uploads/avatars")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# Mount static files for serving uploaded images
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Security
security = HTTPBearer()

# ============================================================================
# STARTUP: Initialize IR Search Engine
# ============================================================================

@app.on_event("startup")
async def startup_event():
    """Initialize search engine on startup"""
    print("\n[STARTUP] Starting Terracotta QnA API...")
    try:
        initialize_search_engine()
        print("[SUCCESS] IR Search Engine initialized successfully!\n")
    except Exception as e:
        print(f"[WARNING] Could not initialize search engine: {e}")
        print("   The API will run without advanced IR features.\n")

# ============================================================================
# REGISTER IR SEARCH ROUTES
# ============================================================================

register_search_routes(app)

# ============================================================================
# AUTHENTICATION & AUTHORIZATION
# ============================================================================

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    """Get current authenticated user from JWT token"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
    
    username = payload.get("sub")
    if username is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )
    
    # Get user from database
    user = execute_query(
        "SELECT * FROM users WHERE username = %s",
        (username,),
        fetch_one=True
    )
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return user

def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[dict]:
    """Get current user if authenticated, None otherwise"""
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None

# ============================================================================
# AUTH ROUTES
# ============================================================================

@app.post("/api/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate):
    """Register a new user"""
    
    # Check if username exists
    existing = execute_query(
        "SELECT id FROM users WHERE username = %s OR email = %s",
        (user_data.username, user_data.email),
        fetch_one=True
    )
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username or email already registered"
        )
    
    # Hash password
    password_hash = get_password_hash(user_data.password)
    
    # Insert user
    user_id = execute_query(
        """INSERT INTO users (username, email, password_hash, name, bio, avatar_url, role)
           VALUES (%s, %s, %s, %s, %s, %s, %s)""",
        (user_data.username, user_data.email, password_hash, user_data.name,
         user_data.bio, user_data.avatar_url, user_data.role.value)
    )
    
    # Get created user
    user = execute_query(
        "SELECT * FROM users WHERE id = %s",
        (user_id,),
        fetch_one=True
    )
    
    # Create access token
    access_token = create_access_token(data={"sub": user['username']})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.post("/api/auth/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login user - OAuth2 compatible"""
    
    # Get user
    user = execute_query(
        "SELECT * FROM users WHERE username = %s OR email = %s",
        (form_data.username, form_data.username),
        fetch_one=True
    )
    
    if not user or not verify_password(form_data.password, user['password_hash']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    if user['status'] == 'suspended':
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended"
        )
    
    # Create access token
    access_token = create_access_token(data={"sub": user['username']})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": user
    }

@app.get("/api/auth/me", response_model=UserResponse)
def get_me(current_user: dict = Depends(get_current_user)):
    """Get current user profile"""
    return current_user

# ============================================================================
# USER ROUTES
# ============================================================================

@app.get("/api/users/{username}", response_model=UserResponse)
def get_user(username: str):
    """Get user by username"""
    user = execute_query(
        "SELECT * FROM users WHERE username = %s",
        (username,),
        fetch_one=True
    )
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user

@app.put("/api/users/me", response_model=UserResponse)
def update_profile(user_update: UserUpdate, current_user: dict = Depends(get_current_user)):
    """Update current user profile"""
    
    # Build update query
    updates = []
    params = []
    
    if user_update.name is not None:
        updates.append("name = %s")
        params.append(user_update.name)
    if user_update.bio is not None:
        updates.append("bio = %s")
        params.append(user_update.bio)
    if user_update.avatar_url is not None:
        updates.append("avatar_url = %s")
        params.append(user_update.avatar_url)
    if user_update.email is not None:
        updates.append("email = %s")
        params.append(user_update.email)
    
    if not updates:
        return current_user
    
    params.append(current_user['id'])
    
    execute_query(
        f"UPDATE users SET {', '.join(updates)} WHERE id = %s",
        tuple(params)
    )
    
    # Return updated user
    user = execute_query(
        "SELECT * FROM users WHERE id = %s",
        (current_user['id'],),
        fetch_one=True
    )
    
    return user

@app.post("/api/users/me/avatar")
async def upload_avatar(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user)
):
    """Upload profile avatar image"""
    
    # Validate file type
    allowed_types = ["image/jpeg", "image/png", "image/gif", "image/webp"]
    if file.content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_types)}"
        )
    
    # Validate file size (max 5MB)
    contents = await file.read()
    if len(contents) > 5 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large. Maximum size: 5MB")
    
    # Generate unique filename
    file_extension = file.filename.split(".")[-1] if "." in file.filename else "jpg"
    unique_filename = f"{uuid.uuid4()}.{file_extension}"
    file_path = UPLOAD_DIR / unique_filename
    
    # Save file
    with open(file_path, "wb") as f:
        f.write(contents)
    
    # Update user avatar_url in database
    avatar_url = f"/uploads/avatars/{unique_filename}"
    execute_query(
        "UPDATE users SET avatar_url = %s WHERE id = %s",
        (avatar_url, current_user['id'])
    )
    
    return {
        "avatar_url": avatar_url,
        "message": "Avatar uploaded successfully"
    }

# ============================================================================
# DOCUMENT ROUTES
# ============================================================================

@app.get("/api/documents", response_model=List[DocumentResponse])
def get_documents(
    category_id: Optional[int] = None,
    tag_id: Optional[int] = None,
    search: Optional[str] = None,
    sort_by: str = "created_at",
    limit: int = 20,
    offset: int = 0
):
    """Get documents with filtering and pagination"""
    
    query = """
        SELECT d.*, 
               u.name as author_name, 
               u.username as author_username,
               c.name as category_name,
               (SELECT COUNT(*) FROM comments WHERE document_id = d.id) as comment_count
        FROM documents d
        JOIN users u ON d.author_id = u.id
        LEFT JOIN categories c ON d.category_id = c.id
        WHERE d.status = 'published'
    """
    
    params = []
    
    if category_id:
        query += " AND d.category_id = %s"
        params.append(category_id)
    
    if tag_id:
        query += " AND EXISTS (SELECT 1 FROM document_tags WHERE document_id = d.id AND tag_id = %s)"
        params.append(tag_id)
    
    if search:
        query += " AND (d.title LIKE %s OR d.content LIKE %s OR d.summary LIKE %s)"
        search_pattern = f"%{search}%"
        params.extend([search_pattern, search_pattern, search_pattern])
    
    # Sort
    valid_sorts = {"created_at": "d.created_at DESC", "views_count": "d.views_count DESC", "vote_count": "d.vote_count DESC"}
    query += f" ORDER BY {valid_sorts.get(sort_by, 'd.created_at DESC')}"
    
    # Pagination
    query += " LIMIT %s OFFSET %s"
    params.extend([limit, offset])
    
    documents = execute_query(query, tuple(params), fetch_all=True)
    
    # Get tags for each document
    for doc in documents:
        tags = execute_query(
            """SELECT t.name FROM tags t
               JOIN document_tags dt ON t.id = dt.tag_id
               WHERE dt.document_id = %s""",
            (doc['id'],),
            fetch_all=True
        )
        doc['tags'] = [tag['name'] for tag in tags]
    
    return documents

@app.get("/api/documents/{document_id}", response_model=DocumentResponse)
def get_document(document_id: int):
    """Get single document by ID"""
    
    doc = execute_query(
        """SELECT d.*, 
                  u.name as author_name, 
                  u.username as author_username,
                  c.name as category_name,
                  (SELECT COUNT(*) FROM comments WHERE document_id = d.id) as comment_count
           FROM documents d
           JOIN users u ON d.author_id = u.id
           LEFT JOIN categories c ON d.category_id = c.id
           WHERE d.id = %s""",
        (document_id,),
        fetch_one=True
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Increment view count
    execute_query("UPDATE documents SET views_count = views_count + 1 WHERE id = %s", (document_id,))
    doc['views_count'] += 1
    
    # Get tags
    tags = execute_query(
        """SELECT t.name FROM tags t
           JOIN document_tags dt ON t.id = dt.tag_id
           WHERE dt.document_id = %s""",
        (document_id,),
        fetch_all=True
    )
    doc['tags'] = [tag['name'] for tag in tags]
    
    return doc

@app.post("/api/documents", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(doc_data: DocumentCreate, current_user: dict = Depends(get_current_user)):
    """Create a new document"""
    
    # Insert document
    doc_id = execute_query(
        """INSERT INTO documents (title, content, summary, category_id, author_id, status)
           VALUES (%s, %s, %s, %s, %s, %s)""",
        (doc_data.title, doc_data.content, doc_data.summary, 
         doc_data.category_id, current_user['id'], doc_data.status.value)
    )
    
    # Add tags
    if doc_data.tag_ids:
        for tag_id in doc_data.tag_ids:
            execute_query(
                "INSERT INTO document_tags (document_id, tag_id) VALUES (%s, %s)",
                (doc_id, tag_id)
            )
    
    # Return created document
    return get_document(doc_id)

@app.put("/api/documents/{document_id}", response_model=DocumentResponse)
def update_document(
    document_id: int,
    doc_update: DocumentUpdate,
    current_user: dict = Depends(get_current_user)
):
    """Update a document"""
    
    # Check ownership
    doc = execute_query(
        "SELECT author_id FROM documents WHERE id = %s",
        (document_id,),
        fetch_one=True
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc['author_id'] != current_user['id'] and current_user['role'] not in ['super_admin', 'content_manager']:
        raise HTTPException(status_code=403, detail="Not authorized to update this document")
    
    # Build update query
    updates = []
    params = []
    
    if doc_update.title is not None:
        updates.append("title = %s")
        params.append(doc_update.title)
    if doc_update.content is not None:
        updates.append("content = %s")
        params.append(doc_update.content)
    if doc_update.summary is not None:
        updates.append("summary = %s")
        params.append(doc_update.summary)
    if doc_update.category_id is not None:
        updates.append("category_id = %s")
        params.append(doc_update.category_id)
    if doc_update.status is not None:
        updates.append("status = %s")
        params.append(doc_update.status.value)
    
    if updates:
        params.append(document_id)
        execute_query(
            f"UPDATE documents SET {', '.join(updates)} WHERE id = %s",
            tuple(params)
        )
    
    # Update tags if provided
    if doc_update.tag_ids is not None:
        execute_query("DELETE FROM document_tags WHERE document_id = %s", (document_id,))
        for tag_id in doc_update.tag_ids:
            execute_query(
                "INSERT INTO document_tags (document_id, tag_id) VALUES (%s, %s)",
                (document_id, tag_id)
            )
    
    return get_document(document_id)

@app.delete("/api/documents/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: int, current_user: dict = Depends(get_current_user)):
    """Delete a document"""
    
    # Check ownership
    doc = execute_query(
        "SELECT author_id FROM documents WHERE id = %s",
        (document_id,),
        fetch_one=True
    )
    
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if doc['author_id'] != current_user['id'] and current_user['role'] not in ['super_admin', 'content_manager']:
        raise HTTPException(status_code=403, detail="Not authorized to delete this document")
    
    execute_query("DELETE FROM documents WHERE id = %s", (document_id,))
    
    return None

# ============================================================================
# COMMENT ROUTES
# ============================================================================

@app.get("/api/documents/{document_id}/comments", response_model=List[CommentResponse])
def get_comments(document_id: int):
    """Get comments for a document"""
    
    comments = execute_query(
        """SELECT c.*, u.name as author_name, u.username as author_username
           FROM comments c
           JOIN users u ON c.author_id = u.id
           WHERE c.document_id = %s
           ORDER BY c.created_at DESC""",
        (document_id,),
        fetch_all=True
    )
    
    return comments

@app.post("/api/comments", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(comment_data: CommentCreate, current_user: dict = Depends(get_current_user)):
    """Create a new comment"""
    
    # Insert comment
    comment_id = execute_query(
        """INSERT INTO comments (document_id, author_id, content)
           VALUES (%s, %s, %s)""",
        (comment_data.document_id, current_user['id'], comment_data.content)
    )
    
    # Return created comment
    comment = execute_query(
        """SELECT c.*, u.name as author_name, u.username as author_username
           FROM comments c
           JOIN users u ON c.author_id = u.id
           WHERE c.id = %s""",
        (comment_id,),
        fetch_one=True
    )
    
    return comment

# ============================================================================
# VOTE ROUTES
# ============================================================================

@app.post("/api/votes", status_code=status.HTTP_201_CREATED)
def create_vote(vote_data: VoteCreate, current_user: dict = Depends(get_current_user)):
    """Create or update a vote"""
    
    # Check if vote exists
    existing = execute_query(
        """SELECT id, vote_type FROM votes 
           WHERE user_id = %s AND target_type = %s AND target_id = %s""",
        (current_user['id'], vote_data.target_type, vote_data.target_id),
        fetch_one=True
    )
    
    if existing:
        if existing['vote_type'] == vote_data.vote_type.value:
            # Remove vote
            execute_query("DELETE FROM votes WHERE id = %s", (existing['id'],))
            vote_change = -1 if vote_data.vote_type == VoteType.UPVOTE else 1
        else:
            # Change vote
            execute_query(
                "UPDATE votes SET vote_type = %s WHERE id = %s",
                (vote_data.vote_type.value, existing['id'])
            )
            vote_change = 2 if vote_data.vote_type == VoteType.UPVOTE else -2
    else:
        # Create new vote
        execute_query(
            """INSERT INTO votes (user_id, target_type, target_id, vote_type)
               VALUES (%s, %s, %s, %s)""",
            (current_user['id'], vote_data.target_type, vote_data.target_id, vote_data.vote_type.value)
        )
        vote_change = 1 if vote_data.vote_type == VoteType.UPVOTE else -1
    
    # Update vote count
    table = "documents" if vote_data.target_type == "document" else "comments"
    execute_query(
        f"UPDATE {table} SET vote_count = vote_count + %s WHERE id = %s",
        (vote_change, vote_data.target_id)
    )
    
    return {"message": "Vote updated", "vote_change": vote_change}

# ============================================================================
# CATEGORY & TAG ROUTES
# ============================================================================

@app.get("/api/categories", response_model=List[CategoryResponse])
def get_categories():
    """Get all categories"""
    return execute_query("SELECT * FROM categories ORDER BY name", fetch_all=True)

@app.post("/api/categories", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
def create_category(category_data: CategoryCreate, current_user: dict = Depends(get_current_user)):
    """Create a new category (admin only)"""
    
    if current_user['role'] not in ['super_admin', 'content_manager']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    category_id = execute_query(
        "INSERT INTO categories (name, description) VALUES (%s, %s)",
        (category_data.name, category_data.description)
    )
    
    return execute_query("SELECT * FROM categories WHERE id = %s", (category_id,), fetch_one=True)

@app.get("/api/tags", response_model=List[TagResponse])
def get_tags():
    """Get all tags"""
    return execute_query("SELECT * FROM tags ORDER BY name", fetch_all=True)

@app.post("/api/tags", response_model=TagResponse, status_code=status.HTTP_201_CREATED)
def create_tag(tag_data: TagCreate, current_user: dict = Depends(get_current_user)):
    """Create a new tag (admin only)"""
    
    if current_user['role'] not in ['super_admin', 'content_manager']:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    tag_id = execute_query(
        "INSERT INTO tags (name) VALUES (%s)",
        (tag_data.name,)
    )
    
    return execute_query("SELECT * FROM tags WHERE id = %s", (tag_id,), fetch_one=True)

# ============================================================================
# SEARCH & STATS
# ============================================================================

@app.post("/api/search/log")
def log_search(
    query: str,
    result_count: int,
    clicked_document_id: Optional[int] = None,
    current_user: Optional[dict] = Depends(get_optional_user)
):
    """Log a search query"""
    
    user_id = current_user['id'] if current_user else None
    
    execute_query(
        """INSERT INTO search_logs (user_id, query, result_count, clicked_document_id)
           VALUES (%s, %s, %s, %s)""",
        (user_id, query, result_count, clicked_document_id)
    )
    
    return {"message": "Search logged"}

@app.get("/api/stats")
def get_stats():
    """Get platform statistics"""
    
    stats = {}
    
    stats['total_users'] = execute_query("SELECT COUNT(*) as count FROM users", fetch_one=True)['count']
    stats['total_documents'] = execute_query("SELECT COUNT(*) as count FROM documents WHERE status = 'published'", fetch_one=True)['count']
    stats['total_comments'] = execute_query("SELECT COUNT(*) as count FROM comments", fetch_one=True)['count']
    stats['total_categories'] = execute_query("SELECT COUNT(*) as count FROM categories", fetch_one=True)['count']
    stats['total_tags'] = execute_query("SELECT COUNT(*) as count FROM tags", fetch_one=True)['count']
    
    return stats

# ============================================================================
# ROOT ENDPOINT
# ============================================================================

@app.get("/")
def root():
    """API root endpoint"""
    return {
        "name": "Terracotta QnA API",
        "version": "1.0.0",
        "description": "Information Retrieval & Search Engineering Community Platform",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
