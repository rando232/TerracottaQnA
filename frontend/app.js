// Terracotta QnA - Frontend Application
// ============================================================================

const API_BASE = 'http://localhost:8000/api';

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

let state = {
    user: null,
    token: null,
    currentView: 'home',
    currentDocument: null,
    categories: [],
    tags: [],
    documents: []
};

// ============================================================================
// API UTILITIES
// ============================================================================

async function apiCall(endpoint, options = {}) {
    const url = `${API_BASE}${endpoint}`;
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add auth token if available
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }
    
    try {
        const response = await fetch(url, {
            ...options,
            headers
        });
        
        if (!response.ok) {
            const error = await response.json().catch(() => ({ detail: 'Request failed' }));
            throw new Error(error.detail || `HTTP ${response.status}`);
        }
        
        // Handle 204 No Content
        if (response.status === 204) {
            return null;
        }
        
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

async function login(event) {
    event.preventDefault();
    
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        
        state.token = data.access_token;
        state.user = data.user;
        
        // Save to localStorage
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        
        showToast('Login successful!', 'success');
        updateAuthUI();
        showView('home');
        loadDocuments();
    } catch (error) {
        showToast(error.message || 'Login failed', 'error');
    }
}

async function register(event) {
    event.preventDefault();
    
    const username = document.getElementById('reg-username').value;
    const email = document.getElementById('reg-email').value;
    const name = document.getElementById('reg-name').value;
    const password = document.getElementById('reg-password').value;
    
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ username, email, name, password, role: 'user' })
        });
        
        state.token = data.access_token;
        state.user = data.user;
        
        localStorage.setItem('token', state.token);
        localStorage.setItem('user', JSON.stringify(state.user));
        
        showToast('Account created successfully!', 'success');
        updateAuthUI();
        showView('home');
        loadDocuments();
    } catch (error) {
        showToast(error.message || 'Registration failed', 'error');
    }
}

function logout() {
    state.token = null;
    state.user = null;
    
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    updateAuthUI();
    showView('home');
    showToast('Logged out successfully', 'info');
}

function updateAuthUI() {
    const authBtn = document.getElementById('auth-btn');
    const profileBtn = document.getElementById('profile-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const createBtn = document.getElementById('create-btn');
    
    if (state.user) {
        authBtn.classList.add('hidden');
        profileBtn.classList.remove('hidden');
        logoutBtn.classList.remove('hidden');
        createBtn.classList.remove('hidden');
        profileBtn.textContent = state.user.username;
    } else {
        authBtn.classList.remove('hidden');
        profileBtn.classList.add('hidden');
        logoutBtn.classList.add('hidden');
        createBtn.classList.add('hidden');
    }
}

// ============================================================================
// VIEW MANAGEMENT
// ============================================================================

function showView(viewName) {
    const views = ['home-view', 'auth-view', 'detail-view', 'profile-view'];
    
    views.forEach(view => {
        document.getElementById(view).classList.add('hidden');
    });
    
    document.getElementById(`${viewName}-view`).classList.remove('hidden');
    state.currentView = viewName;
    
    // Load view-specific data
    if (viewName === 'home') {
        loadDocuments();
    } else if (viewName === 'profile' && state.user) {
        loadProfile();
    }
}

function showLoginForm() {
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
}

function showRegisterForm() {
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
}

// ============================================================================
// DOCUMENTS
// ============================================================================

async function loadDocuments() {
    const searchQuery = document.getElementById('search-input').value;
    const categoryFilter = document.getElementById('category-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    const params = new URLSearchParams({
        sort_by: sortFilter,
        limit: 20,
        offset: 0
    });
    
    if (searchQuery) params.append('search', searchQuery);
    if (categoryFilter) params.append('category_id', categoryFilter);
    
    try {
        const documents = await apiCall(`/documents?${params}`);
        state.documents = documents;
        renderDocuments(documents);
        
        // Log search if there's a query
        if (searchQuery) {
            logSearch(searchQuery, documents.length);
        }
    } catch (error) {
        showToast('Failed to load documents', 'error');
    }
}

function renderDocuments(documents) {
    const container = document.getElementById('documents-container');
    
    if (documents.length === 0) {
        container.innerHTML = `
            <div class="bg-orange-50 rounded-xl border-2 border-terracotta-200 p-8 text-center">
                <p class="text-slate-600">No questions found. Be the first to ask!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = documents.map(doc => `
        <div class="bg-orange-50 rounded-xl border-2 border-terracotta-200 p-6 hover:shadow-md transition-shadow cursor-pointer" onclick="viewDocument(${doc.id})">
            <div class="flex items-start justify-between gap-4">
                <div class="flex-1">
                    <h3 class="text-lg font-bold text-slate-900 mb-2 hover:text-terracotta-600">${escapeHtml(doc.title)}</h3>
                    <p class="text-sm text-slate-600 mb-3 line-clamp-2">${escapeHtml(doc.summary || doc.content.substring(0, 150))}...</p>
                    
                    <div class="flex items-center gap-4 text-xs text-slate-500">
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            ${escapeHtml(doc.author_name)}
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            ${doc.views_count}
                        </span>
                        <span class="flex items-center gap-1">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                            </svg>
                            ${doc.comment_count}
                        </span>
                        <span class="flex items-center gap-1 font-semibold" style="color: ${doc.vote_count >= 0 ? '#059669' : '#dc2626'}">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                            </svg>
                            ${doc.vote_count}
                        </span>
                    </div>
                    
                    ${doc.tags.length > 0 ? `
                        <div class="flex flex-wrap gap-2 mt-3">
                            ${doc.tags.map(tag => `<span class="px-2 py-1 bg-terracotta-100 text-terracotta-700 text-xs rounded-lg font-medium">${escapeHtml(tag)}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
                
                ${doc.category_name ? `
                    <div class="px-3 py-1 bg-terracotta-600 text-white text-xs rounded-lg font-semibold whitespace-nowrap">
                        ${escapeHtml(doc.category_name)}
                    </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function viewDocument(documentId) {
    try {
        const doc = await apiCall(`/documents/${documentId}`);
        state.currentDocument = doc;
        
        renderDocumentDetail(doc);
        loadComments(documentId);
        showView('detail');
    } catch (error) {
        showToast('Failed to load document', 'error');
    }
}

function renderDocumentDetail(doc) {
    const container = document.getElementById('detail-view');
    
    const canEdit = state.user && (state.user.id === doc.author_id || ['super_admin', 'content_manager'].includes(state.user.role));
    
    container.innerHTML = `
        <div class="flex items-center gap-3 mb-4">
            <button onclick="showView('home')" class="px-4 py-2 rounded-lg hover:bg-terracotta-100 transition-colors text-sm font-medium">
                ← Back to Questions
            </button>
        </div>
        
        <div class="bg-orange-50 rounded-2xl border-2 border-terracotta-200 p-8 shadow-sm">
            <div class="flex items-start justify-between gap-4 mb-4">
                <h1 class="text-3xl font-bold text-slate-900 flex-1">${escapeHtml(doc.title)}</h1>
                ${doc.category_name ? `
                    <div class="px-4 py-2 bg-terracotta-600 text-white text-sm rounded-lg font-semibold">
                        ${escapeHtml(doc.category_name)}
                    </div>
                ` : ''}
            </div>
            
            <div class="flex items-center gap-4 text-sm text-slate-600 mb-6">
                <span class="flex items-center gap-2">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    ${escapeHtml(doc.author_name)} (@${escapeHtml(doc.author_username)})
                </span>
                <span>${new Date(doc.created_at).toLocaleDateString()}</span>
                <span class="flex items-center gap-1">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    ${doc.views_count} views
                </span>
            </div>
            
            ${doc.tags.length > 0 ? `
                <div class="flex flex-wrap gap-2 mb-6">
                    ${doc.tags.map(tag => `<span class="px-3 py-1 bg-terracotta-100 text-terracotta-700 text-sm rounded-lg font-medium">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            
            <div class="prose max-w-none mb-6">
                <p class="text-slate-700 whitespace-pre-wrap">${escapeHtml(doc.content)}</p>
            </div>
            
            <div class="flex items-center gap-4 pt-6 border-t-2 border-terracotta-200">
                <div class="flex items-center gap-2">
                    <button onclick="vote(${doc.id}, 'document', 'upvote')" class="p-2 rounded-lg hover:bg-terracotta-100 transition-colors ${state.user ? '' : 'opacity-50 cursor-not-allowed'}" ${state.user ? '' : 'disabled'}>
                        <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <span class="text-xl font-bold ${doc.vote_count >= 0 ? 'text-green-600' : 'text-red-600'}">${doc.vote_count}</span>
                    <button onclick="vote(${doc.id}, 'document', 'downvote')" class="p-2 rounded-lg hover:bg-terracotta-100 transition-colors ${state.user ? '' : 'opacity-50 cursor-not-allowed'}" ${state.user ? '' : 'disabled'}>
                        <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                
                ${canEdit ? `
                    <button onclick="deleteDocument(${doc.id})" class="ml-auto px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors">
                        Delete Question
                    </button>
                ` : ''}
            </div>
        </div>
        
        <!-- Comments Section -->
        <div class="mt-6">
            <h2 class="text-2xl font-bold text-slate-900 mb-4">Answers (${doc.comment_count})</h2>
            
            ${state.user ? `
                <div class="bg-orange-50 rounded-xl border-2 border-terracotta-200 p-6 mb-6">
                    <h3 class="text-lg font-semibold mb-3">Your Answer</h3>
                    <form onsubmit="postComment(event, ${doc.id})">
                        <textarea 
                            id="comment-input" 
                            rows="4" 
                            placeholder="Share your knowledge..." 
                            class="w-full px-4 py-3 rounded-lg border-2 border-terracotta-600 mb-3"
                            required
                        ></textarea>
                        <button type="submit" class="px-6 py-2 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 transition-colors">
                            Post Answer
                        </button>
                    </form>
                </div>
            ` : `
                <div class="bg-orange-50 rounded-xl border-2 border-terracotta-200 p-6 mb-6 text-center">
                    <p class="text-slate-600 mb-3">Want to answer? Please log in first.</p>
                    <button onclick="showView('auth')" class="px-6 py-2 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 transition-colors">
                        Login to Answer
                    </button>
                </div>
            `}
            
            <div id="comments-container" class="space-y-4">
                <!-- Comments will be loaded here -->
            </div>
        </div>
    `;
}

async function loadComments(documentId) {
    try {
        const comments = await apiCall(`/documents/${documentId}/comments`);
        renderComments(comments);
    } catch (error) {
        showToast('Failed to load comments', 'error');
    }
}

function renderComments(comments) {
    const container = document.getElementById('comments-container');
    
    if (comments.length === 0) {
        container.innerHTML = `
            <div class="bg-orange-50 rounded-xl border-2 border-terracotta-200 p-6 text-center">
                <p class="text-slate-600">No answers yet. Be the first to answer!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = comments.map(comment => `
        <div class="bg-orange-50 rounded-xl border-2 border-terracotta-200 p-6">
            <div class="flex items-start gap-4">
                <div class="flex flex-col items-center gap-2">
                    <button onclick="vote(${comment.id}, 'comment', 'upvote')" class="p-1 rounded hover:bg-terracotta-100 transition-colors ${state.user ? '' : 'opacity-50 cursor-not-allowed'}" ${state.user ? '' : 'disabled'}>
                        <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7" />
                        </svg>
                    </button>
                    <span class="text-lg font-bold ${comment.vote_count >= 0 ? 'text-green-600' : 'text-red-600'}">${comment.vote_count}</span>
                    <button onclick="vote(${comment.id}, 'comment', 'downvote')" class="p-1 rounded hover:bg-terracotta-100 transition-colors ${state.user ? '' : 'opacity-50 cursor-not-allowed'}" ${state.user ? '' : 'disabled'}>
                        <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                </div>
                
                <div class="flex-1">
                    <div class="flex items-center gap-3 mb-2 text-sm text-slate-600">
                        <span class="font-semibold text-slate-900">${escapeHtml(comment.author_name)}</span>
                        <span>@${escapeHtml(comment.author_username)}</span>
                        <span>${new Date(comment.created_at).toLocaleDateString()}</span>
                    </div>
                    <p class="text-slate-700 whitespace-pre-wrap">${escapeHtml(comment.content)}</p>
                </div>
            </div>
        </div>
    `).join('');
}

async function postComment(event, documentId) {
    event.preventDefault();
    
    const content = document.getElementById('comment-input').value;
    
    try {
        await apiCall('/comments', {
            method: 'POST',
            body: JSON.stringify({ document_id: documentId, content })
        });
        
        document.getElementById('comment-input').value = '';
        showToast('Answer posted!', 'success');
        
        // Reload document and comments
        await viewDocument(documentId);
    } catch (error) {
        showToast('Failed to post answer', 'error');
    }
}

async function vote(targetId, targetType, voteType) {
    if (!state.user) {
        showToast('Please log in to vote', 'info');
        return;
    }
    
    try {
        await apiCall('/votes', {
            method: 'POST',
            body: JSON.stringify({ target_id: targetId, target_type: targetType, vote_type: voteType })
        });
        
        showToast('Vote recorded!', 'success');
        
        // Reload current view
        if (state.currentDocument) {
            await viewDocument(state.currentDocument.id);
        }
    } catch (error) {
        showToast('Failed to vote', 'error');
    }
}

async function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
        return;
    }
    
    try {
        await apiCall(`/documents/${documentId}`, { method: 'DELETE' });
        showToast('Question deleted', 'success');
        showView('home');
    } catch (error) {
        showToast('Failed to delete question', 'error');
    }
}

function showCreateForm() {
    const html = `
        <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onclick="if(event.target === this) this.remove()">
            <div class="bg-orange-50 rounded-2xl border-2 border-terracotta-200 p-8 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                <h2 class="text-2xl font-bold text-slate-900 mb-6">Ask a Question</h2>
                
                <form onsubmit="createDocument(event)" class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Title</label>
                        <input 
                            type="text" 
                            id="doc-title" 
                            placeholder="What's your question about information retrieval?"
                            required 
                            minlength="5"
                            class="w-full px-4 py-2 rounded-lg border-2 border-terracotta-600"
                        >
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Category</label>
                        <select id="doc-category" class="w-full px-4 py-2 rounded-lg border-2 border-terracotta-600">
                            <option value="">Select a category...</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Question Details</label>
                        <textarea 
                            id="doc-content" 
                            rows="8"
                            placeholder="Provide details about your question..."
                            required
                            minlength="10"
                            class="w-full px-4 py-3 rounded-lg border-2 border-terracotta-600"
                        ></textarea>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Summary (optional)</label>
                        <textarea 
                            id="doc-summary" 
                            rows="2"
                            placeholder="Brief summary for search results..."
                            class="w-full px-4 py-3 rounded-lg border-2 border-terracotta-600"
                        ></textarea>
                    </div>
                    
                    <div class="flex gap-3">
                        <button type="submit" class="flex-1 px-6 py-3 rounded-lg bg-terracotta-600 text-white font-semibold hover:bg-terracotta-700 transition-colors">
                            Post Question
                        </button>
                        <button type="button" onclick="this.closest('.fixed').remove()" class="px-6 py-3 rounded-lg border-2 border-terracotta-600 text-terracotta-600 font-semibold hover:bg-terracotta-50 transition-colors">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', html);
    
    // Load categories into dropdown
    loadCategoriesForForm();
}

async function loadCategoriesForForm() {
    try {
        const categories = await apiCall('/categories');
        const select = document.getElementById('doc-category');
        
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories', error);
    }
}

async function createDocument(event) {
    event.preventDefault();
    
    const title = document.getElementById('doc-title').value;
    const content = document.getElementById('doc-content').value;
    const summary = document.getElementById('doc-summary').value;
    const categoryId = document.getElementById('doc-category').value;
    
    try {
        const doc = await apiCall('/documents', {
            method: 'POST',
            body: JSON.stringify({
                title,
                content,
                summary: summary || null,
                category_id: categoryId ? parseInt(categoryId) : null,
                status: 'published',
                tag_ids: []
            })
        });
        
        showToast('Question posted successfully!', 'success');
        
        // Close modal
        document.querySelector('.fixed.inset-0').remove();
        
        // View the new document
        await viewDocument(doc.id);
    } catch (error) {
        showToast('Failed to post question', 'error');
    }
}

// ============================================================================
// SEARCH
// ============================================================================

async function searchDocuments() {
    await loadDocuments();
}

async function logSearch(query, resultCount) {
    try {
        await apiCall('/search/log', {
            method: 'POST',
            body: JSON.stringify({ query, result_count: resultCount })
        });
    } catch (error) {
        // Silent fail for search logging
        console.error('Search logging failed', error);
    }
}

// ============================================================================
// PROFILE
// ============================================================================

async function loadProfile() {
    if (!state.user) return;
    
    const container = document.getElementById('profile-content');
    
    container.innerHTML = `
        <div class="space-y-6">
            <div class="flex items-center gap-4">
                <div class="w-20 h-20 rounded-full bg-terracotta-600 text-white flex items-center justify-center text-3xl font-bold">
                    ${state.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                    <h3 class="text-2xl font-bold text-slate-900">${escapeHtml(state.user.name)}</h3>
                    <p class="text-slate-600">@${escapeHtml(state.user.username)}</p>
                    <p class="text-sm text-slate-500 mt-1">${escapeHtml(state.user.email)}</p>
                </div>
            </div>
            
            ${state.user.bio ? `
                <div>
                    <h4 class="font-semibold text-slate-900 mb-2">Bio</h4>
                    <p class="text-slate-700">${escapeHtml(state.user.bio)}</p>
                </div>
            ` : ''}
            
            <div>
                <h4 class="font-semibold text-slate-900 mb-2">Account Details</h4>
                <dl class="space-y-1 text-sm">
                    <div class="flex">
                        <dt class="w-32 text-slate-600">Role:</dt>
                        <dd class="text-slate-900 font-medium">${state.user.role.replace('_', ' ')}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 text-slate-600">Status:</dt>
                        <dd class="text-slate-900 font-medium">${state.user.status}</dd>
                    </div>
                    <div class="flex">
                        <dt class="w-32 text-slate-600">Member since:</dt>
                        <dd class="text-slate-900">${new Date(state.user.created_at).toLocaleDateString()}</dd>
                    </div>
                </dl>
            </div>
        </div>
    `;
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function loadCategories() {
    try {
        const categories = await apiCall('/categories');
        state.categories = categories;
        
        const select = document.getElementById('category-filter');
        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load categories', error);
    }
}

function init() {
    // Load saved auth state
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    
    if (savedToken && savedUser) {
        state.token = savedToken;
        state.user = JSON.parse(savedUser);
        updateAuthUI();
    }
    
    // Load initial data
    loadCategories();
    loadDocuments();
}

// ============================================================================
// UTILITIES
// ============================================================================

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function showToast(message, type = 'info') {
    const colors = {
        success: 'bg-green-600',
        error: 'bg-red-600',
        info: 'bg-blue-600',
        warning: 'bg-yellow-600'
    };
    
    const toast = document.createElement('div');
    toast.className = `toast ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3`;
    toast.innerHTML = `
        <span>${escapeHtml(message)}</span>
        <button onclick="this.parentElement.remove()" class="ml-2 hover:opacity-80">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
        </button>
    `;
    
    document.getElementById('toast-container').appendChild(toast);
    
    setTimeout(() => toast.remove(), 5000);
}

// Start the app
init();
