// Authentication Management
class Auth {
    constructor() {
        this.token = localStorage.getItem('token');
        this.user = null;
        if (this.token) {
            this.loadUser();
        }
    }

    async loadUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
            
            if (response.ok) {
                this.user = await response.json();
                this.updateNavbar();
            } else {
                this.logout();
            }
        } catch (error) {
            console.error('Failed to load user:', error);
            this.logout();
        }
    }

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData
        });

        if (!response.ok) {
            throw new Error('Login failed');
        }

        const data = await response.json();
        this.token = data.access_token;
        this.user = data.user;
        localStorage.setItem('token', this.token);
        this.updateNavbar();
        return data;
    }

    async register(userData) {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }

        const data = await response.json();
        this.token = data.access_token;
        this.user = data.user;
        localStorage.setItem('token', this.token);
        this.updateNavbar();
        return data;
    }

    logout() {
        this.token = null;
        this.user = null;
        localStorage.removeItem('token');
        this.updateNavbar();
        window.location.href = 'index.html';
    }

    isAuthenticated() {
        return !!this.token && !!this.user;
    }

    getHeaders() {
        const headers = {
            'Content-Type': 'application/json',
        };
        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }
        return headers;
    }

    updateNavbar() {
        const navActions = document.getElementById('navActions');
        if (!navActions) return;

        if (this.isAuthenticated()) {
            navActions.innerHTML = `
                <a href="ask.html" class="btn btn-primary btn-icon">
                    <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
                    </svg>
                    Ask Question
                </a>
                <a href="profile.html" class="btn btn-secondary">
                    ${this.user.username}
                </a>
                <button onclick="auth.logout()" class="btn btn-secondary">
                    Logout
                </button>
            `;
        } else {
            navActions.innerHTML = `
                <a href="login.html" class="btn btn-secondary">Login</a>
                <a href="register.html" class="btn btn-primary">Sign Up</a>
            `;
        }
    }
}

// Global auth instance
const auth = new Auth();

// Update navbar on page load
document.addEventListener('DOMContentLoaded', () => {
    auth.updateNavbar();
});
