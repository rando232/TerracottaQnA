# Terracotta QnA - React Frontend

Modern React-based frontend for Terracotta QnA with advanced Information Retrieval features.

## Features

### User Interface
- **Modern Design**: Clean, responsive UI built with React and Tailwind CSS
- **Home Page**: Hero section with stats, sortable question listings (Latest, Top Voted, Most Viewed)
- **Directory Page**: Comprehensive question listing with advanced filters and pagination
- **Question Detail**: Full question view with voting, comments/answers, and markdown support
- **Search Page**: Advanced IR search interface with BM25 ranking and spell correction

### User Engagement
- **Authentication**: Login and registration with JWT tokens
- **Profile Management**: View and edit user profiles with activity tracking
- **Voting System**: Upvote/downvote questions and answers
- **Commenting**: Post answers with markdown formatting
- **Ask Questions**: Rich question editor with category and tag selection

### Advanced Search (IR System)
- **BM25 Ranking**: Industry-standard probabilistic ranking function
- **Spell Correction**: Automatic query correction using Levenshtein distance
- **Query-focused Snippets**: Context-aware result previews with highlighting
- **Popular Queries**: Trending searches displayed on search page
- **Real-time Stats**: Response time and result count display
- **Click Logging**: User interaction tracking for search quality metrics

## Technology Stack

- **React 18.2**: Modern React with hooks
- **React Router 6**: Client-side routing
- **Tailwind CSS 3.3**: Utility-first styling
- **Axios**: HTTP client for API calls
- **Heroicons**: Beautiful SVG icons
- **React Markdown**: Markdown rendering
- **date-fns**: Date formatting utilities
- **Vite**: Fast development server and build tool

## Project Structure

```
frontend-react/
├── src/
│   ├── api.js                 # API client with all endpoints
│   ├── App.jsx                # Main app component with routing
│   ├── main.jsx               # React entry point
│   ├── index.css              # Global styles and Tailwind
│   ├── components/
│   │   ├── Navbar.jsx         # Navigation bar
│   │   ├── QuestionCard.jsx   # Question list item
│   │   ├── Pagination.jsx     # Pagination controls
│   │   └── LoadingSkeleton.jsx # Loading placeholder
│   ├── contexts/
│   │   └── AuthContext.jsx    # Authentication state management
│   └── pages/
│       ├── Home.jsx           # Home page with hero
│       ├── Directory.jsx      # Question directory with filters
│       ├── QuestionDetail.jsx # Single question view
│       ├── Search.jsx         # IR search interface
│       ├── AskQuestion.jsx    # Create question form
│       ├── Profile.jsx        # User profile page
│       ├── Login.jsx          # Login page
│       └── Register.jsx       # Registration page
├── index.html
├── package.json
├── vite.config.js
└── tailwind.config.js
```

## Setup and Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will run on http://localhost:3001

3. **Build for Production**
   ```bash
   npm run build
   ```

4. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Configuration

### API Endpoint
The frontend is configured to connect to the backend API at `http://localhost:8000`. The Vite proxy configuration in `vite.config.js` handles CORS:

```javascript
server: {
  port: 3001,
  proxy: {
    '/api': {
      target: 'http://localhost:8000',
      changeOrigin: true
    }
  }
}
```

### Tailwind Theme
Custom color palette in `tailwind.config.js`:
- Primary colors: Orange/terracotta theme (50-900 shades)
- Extended with custom animations and utilities

## Key Components

### AuthContext
Manages authentication state throughout the app:
- Login/logout functionality
- User profile data
- JWT token storage
- Protected route handling

### API Client (api.js)
Centralized API communication with organized endpoints:
- `authAPI`: Login, register, profile
- `documentsAPI`: Questions CRUD
- `commentsAPI`: Answers/comments
- `votesAPI`: Voting functionality
- `categoriesAPI`: Categories
- `tagsAPI`: Tags
- `searchAPI`: IR search features

### Routing
React Router setup in App.jsx:
- `/` - Home page
- `/directory` - Question directory
- `/questions/:id` - Question detail
- `/search` - IR search
- `/ask` - Create question
- `/profile` - User profile
- `/login` - Login
- `/register` - Registration

## Features in Detail

### Search Page
- Real-time search with BM25 ranking
- Spell correction suggestions
- Query-focused snippets with highlighting
- Search statistics (response time, result count)
- Popular queries display
- Click tracking for analytics

### Question Detail Page
- Full markdown content rendering
- Voting on questions and answers
- Comment/answer posting
- View count tracking
- Author information
- Category and tags display
- Edit/delete for authorized users

### Directory Page
- Advanced filtering:
  - Category filter
  - Tag filter
  - Keyword search
  - Sort by latest/votes/views
- Pagination controls
- Responsive sidebar filters
- Mobile-friendly filter drawer

### Profile Page
- User statistics (questions, answers, reputation)
- Activity tabs (questions, answers)
- Profile editing
- Avatar with initials
- Bio and contact information

## Default Accounts

Test with these credentials:
- **Username**: `admin`
- **Password**: `admin123`

(All users in the database have the same password: `admin123`)

## Development Notes

### Styling
- Uses Tailwind CSS utility classes
- Custom markdown content styling in index.css
- Responsive design (mobile-first)
- Custom animations and transitions

### State Management
- React Context for global auth state
- Local state for component-specific data
- No external state management library needed

### Code Organization
- Functional components with hooks
- Consistent error handling
- Loading states for all async operations
- Reusable components

## API Integration

All API calls go through the centralized `api.js` client:

```javascript
// Example: Search
const results = await searchAPI.search('BM25 ranking', 20);

// Example: Vote
await votesAPI.vote({
  target_type: 'document',
  target_id: 123,
  vote_type: 'upvote'
});

// Example: Create question
await documentsAPI.create({
  title: 'My Question',
  content: 'Question content',
  category_id: 1,
  tag_ids: [1, 2, 3]
});
```

## Browser Support

Modern browsers with ES6+ support:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Performance

- Fast HMR with Vite
- Code splitting with React Router
- Optimized bundle size
- Lazy loading for routes (can be added)

## Troubleshooting

### Port Already in Use
If port 3001 is busy, change it in `vite.config.js`:
```javascript
server: {
  port: 3002, // Use different port
  ...
}
```

### API Connection Issues
Ensure the backend is running on port 8000:
```bash
cd ../backend
uvicorn main:app --reload --port 8000
```

### Dependencies Issues
Clear node_modules and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Future Enhancements

- [ ] Real-time notifications
- [ ] Image upload support
- [ ] Advanced text editor (WYSIWYG)
- [ ] User mentions and tagging
- [ ] Bookmarking questions
- [ ] Follow users/tags
- [ ] Email notifications
- [ ] Mobile app (React Native)
- [ ] Dark mode theme
- [ ] Internationalization (i18n)

## License

Part of the Terracotta QnA project.
