// Home page JavaScript
let currentSort = 'created_at';

async function loadQuestions() {
    const questionsList = document.getElementById('questionsList');
    
    try {
        const questions = await api.getDocuments({
            sort_by: currentSort,
            limit: 10
        });
        
        if (questions.length === 0) {
            questionsList.innerHTML = `
                <div class="empty-state">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <h3>No questions yet</h3>
                    <p>Be the first to ask a question!</p>
                    <a href="ask.html" class="btn btn-primary">Ask a Question</a>
                </div>
            `;
        } else {
            questionsList.innerHTML = questions.map(q => createQuestionCard(q)).join('');
        }
        
        // Update stats
        updateStats(questions);
    } catch (error) {
        console.error('Failed to load questions:', error);
        questionsList.innerHTML = `
            <div class="alert alert-error">
                Failed to load questions. Please try again later.
            </div>
        `;
    }
}

function updateStats(questions) {
    const statsQuestions = document.getElementById('statsQuestions');
    const statsAnswers = document.getElementById('statsAnswers');
    
    if (statsQuestions) {
        statsQuestions.textContent = questions.length + '+';
    }
    
    if (statsAnswers) {
        const totalAnswers = questions.reduce((sum, q) => sum + (q.comment_count || 0), 0);
        statsAnswers.textContent = totalAnswers + '+';
    }
}

function changeSortOrder(sortBy) {
    currentSort = sortBy;
    
    // Update active tab
    document.querySelectorAll('.sort-tab').forEach(tab => {
        if (tab.dataset.sort === sortBy) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    loadQuestions();
}

function performHeroSearch() {
    const searchInput = document.getElementById('heroSearch');
    const query = searchInput.value.trim();
    
    if (query) {
        window.location.href = `search.html?q=${encodeURIComponent(query)}`;
    }
}

// Setup sort tabs
document.addEventListener('DOMContentLoaded', () => {
    const sortTabs = document.querySelectorAll('.sort-tab');
    sortTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            changeSortOrder(tab.dataset.sort);
        });
    });
    
    // Load initial questions
    loadQuestions();
    
    // Handle Enter key in search
    const heroSearch = document.getElementById('heroSearch');
    if (heroSearch) {
        heroSearch.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performHeroSearch();
            }
        });
    }
});
