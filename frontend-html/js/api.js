// API Client
class API {
    // Documents
    async getDocuments(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const response = await fetch(`${API_BASE_URL}/api/documents?${queryString}`);
        return await response.json();
    }

    async getDocument(id) {
        const response = await fetch(`${API_BASE_URL}/api/documents/${id}`);
        return await response.json();
    }

    async createDocument(data) {
        const response = await fetch(`${API_BASE_URL}/api/documents`, {
            method: 'POST',
            headers: auth.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create document');
        return await response.json();
    }

    async updateDocument(id, data) {
        const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
            method: 'PUT',
            headers: auth.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update document');
        return await response.json();
    }

    async deleteDocument(id) {
        const response = await fetch(`${API_BASE_URL}/api/documents/${id}`, {
            method: 'DELETE',
            headers: auth.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete document');
        return await response.json();
    }

    async incrementViews(id) {
        const response = await fetch(`${API_BASE_URL}/api/documents/${id}/view`, {
            method: 'POST',
            headers: auth.getHeaders()
        });
        return await response.json();
    }

    // Comments
    async getComments(documentId) {
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/comments`);
        return await response.json();
    }

    async createComment(data) {
        const response = await fetch(`${API_BASE_URL}/api/comments`, {
            method: 'POST',
            headers: auth.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create comment');
        return await response.json();
    }

    async deleteComment(id) {
        const response = await fetch(`${API_BASE_URL}/api/comments/${id}`, {
            method: 'DELETE',
            headers: auth.getHeaders()
        });
        if (!response.ok) throw new Error('Failed to delete comment');
        return await response.json();
    }

    // Votes
    async vote(data) {
        const response = await fetch(`${API_BASE_URL}/api/votes`, {
            method: 'POST',
            headers: auth.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to vote');
        return await response.json();
    }

    // Categories
    async getCategories() {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        return await response.json();
    }

    // Tags
    async getTags() {
        const response = await fetch(`${API_BASE_URL}/api/tags`);
        return await response.json();
    }

    // Search (IR System)
    async search(query, topK = 20) {
        const response = await fetch(`${API_BASE_URL}/api/search?query=${encodeURIComponent(query)}&top_k=${topK}`);
        return await response.json();
    }

    async logClick(data) {
        const response = await fetch(`${API_BASE_URL}/api/search/click`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return await response.json();
    }

    async getSearchMetrics() {
        const response = await fetch(`${API_BASE_URL}/api/search/metrics`);
        return await response.json();
    }

    async getPopularQueries(limit = 10) {
        const response = await fetch(`${API_BASE_URL}/api/search/popular?limit=${limit}`);
        return await response.json();
    }
}

// Global API instance
const api = new API();
