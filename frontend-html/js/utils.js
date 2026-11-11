// Utility Functions

// Format date relative to now
function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);
    
    const intervals = {
        year: 31536000,
        month: 2592000,
        week: 604800,
        day: 86400,
        hour: 3600,
        minute: 60
    };
    
    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
        const interval = Math.floor(seconds / secondsInUnit);
        if (interval >= 1) {
            return `${interval} ${unit}${interval !== 1 ? 's' : ''} ago`;
        }
    }
    
    return 'just now';
}

// Create question card HTML
function createQuestionCard(question) {
    const voteClass = question.vote_count > 0 ? 'positive' : question.vote_count < 0 ? 'negative' : '';
    const tags = question.tags || [];
    const tagsHTML = tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    
    return `
        <div class="question-card">
            <div class="question-content">
                <div class="vote-section">
                    <button class="vote-btn" onclick="handleVote(${question.id}, 'document', 'upvote')" title="Upvote">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>
                        </svg>
                    </button>
                    <span class="vote-count ${voteClass}">${question.vote_count || 0}</span>
                    <button class="vote-btn" onclick="handleVote(${question.id}, 'document', 'downvote')" title="Downvote">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                        </svg>
                    </button>
                </div>
                
                <div class="question-main">
                    <h2 class="question-title">
                        <a href="question.html?id=${question.id}">${escapeHtml(question.title)}</a>
                    </h2>
                    
                    ${question.summary ? `<p class="question-summary">${escapeHtml(question.summary)}</p>` : ''}
                    
                    ${tagsHTML ? `<div class="question-tags">${tagsHTML}</div>` : ''}
                    
                    <div class="question-meta">
                        ${question.category_name ? `<span class="category-badge">${escapeHtml(question.category_name)}</span>` : ''}
                        
                        <span class="meta-item">
                            <a href="profile.html?username=${question.author_username}">
                                ${escapeHtml(question.author_name || question.author_username)}
                            </a>
                        </span>
                        
                        <span class="meta-item">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            ${formatRelativeTime(question.created_at)}
                        </span>
                        
                        <span class="meta-item">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
                            </svg>
                            ${question.comment_count || 0} answers
                        </span>
                        
                        <span class="meta-item">
                            <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                            ${question.views_count || 0} views
                        </span>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Show alert message
function showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alert, container.firstChild);
        setTimeout(() => alert.remove(), 5000);
    }
}

// Handle vote
async function handleVote(targetId, targetType, voteType) {
    if (!auth.isAuthenticated()) {
        showAlert('Please login to vote', 'error');
        setTimeout(() => window.location.href = 'login.html', 1500);
        return;
    }
    
    try {
        await api.vote({
            target_type: targetType,
            target_id: targetId,
            vote_type: voteType
        });
        
        // Reload the page to show updated vote count
        window.location.reload();
    } catch (error) {
        console.error('Vote failed:', error);
        showAlert('Failed to vote. Please try again.', 'error');
    }
}

// Simple markdown to HTML converter
function markdownToHtml(markdown) {
    if (!markdown) return '';
    
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code inline
    html = html.replace(/`(.*?)`/g, '<code>$1</code>');
    
    // Code blocks
    html = html.replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>');
    
    // Links
    html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// Get URL parameters
function getUrlParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
}

// Set current year in footer
document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('currentYear');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});

// Mobile menu toggle
document.addEventListener('DOMContentLoaded', () => {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
        });
    }
});
