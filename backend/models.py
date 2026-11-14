from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

# Enums
class UserRole(str, Enum):
    SUPER_ADMIN = "super_admin"
    CONTENT_MANAGER = "content_manager"
    MODERATOR = "moderator"
    DATA_SPECIALIST = "data_specialist"
    USER = "user"

class UserStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"

class DocumentStatus(str, Enum):
    PUBLISHED = "published"
    DRAFT = "draft"
    UNPUBLISHED = "unpublished"

class VoteType(str, Enum):
    UPVOTE = "upvote"
    DOWNVOTE = "downvote"

class FlagReason(str, Enum):
    SPAM = "spam"
    OFFENSIVE = "offensive"
    MISINFORMATION = "misinformation"
    OFF_TOPIC = "off_topic"
    OTHER = "other"

class FlagStatus(str, Enum):
    PENDING = "pending"
    REVIEWED = "reviewed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"

# User Models
class UserBase(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    name: str = Field(..., min_length=1, max_length=100)
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)
    role: UserRole = UserRole.USER

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    status: UserStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    email: Optional[EmailStr] = None

# Document Models
class DocumentBase(BaseModel):
    title: str = Field(..., min_length=5, max_length=255)
    content: str = Field(..., min_length=10)
    summary: Optional[str] = None
    category_id: Optional[int] = None
    status: DocumentStatus = DocumentStatus.PUBLISHED

class DocumentCreate(DocumentBase):
    tag_ids: Optional[List[int]] = []

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    summary: Optional[str] = None
    category_id: Optional[int] = None
    status: Optional[DocumentStatus] = None
    tag_ids: Optional[List[int]] = None

class DocumentResponse(DocumentBase):
    id: int
    author_id: int
    author_name: str
    author_username: str
    category_name: Optional[str] = None
    tags: List[str] = []
    views_count: int
    vote_count: int
    comment_count: int = 0
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# Comment Models
class CommentBase(BaseModel):
    content: str = Field(..., min_length=1)

class CommentCreate(CommentBase):
    document_id: int

class CommentResponse(CommentBase):
    id: int
    document_id: int
    author_id: int
    author_name: str
    author_username: str
    vote_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Vote Models
class VoteCreate(BaseModel):
    target_type: str = Field(..., pattern="^(document|comment)$")
    target_id: int
    vote_type: VoteType

# Flag Models
class FlagCreate(BaseModel):
    target_type: str = Field(..., pattern="^(document|comment)$")
    target_id: int
    reason: FlagReason
    description: Optional[str] = None

class FlagResponse(BaseModel):
    id: int
    target_type: str
    target_id: int
    reason: FlagReason
    description: Optional[str]
    status: FlagStatus
    reporter_id: int
    reporter_username: str
    created_at: datetime
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    
    class Config:
        from_attributes = True

# Category Models
class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Tag Models
class TagBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=50)

class TagCreate(TagBase):
    pass

class TagResponse(TagBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Search Models
class SearchQuery(BaseModel):
    query: str = Field(..., min_length=1)
    category_id: Optional[int] = None
    tag_ids: Optional[List[int]] = []
    sort_by: Optional[str] = "created_at"
    limit: int = Field(default=20, le=100)
    offset: int = Field(default=0, ge=0)

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None
