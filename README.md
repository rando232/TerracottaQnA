# Terracotta QnA - Information Retrieval & Search Engineering Community

A full-stack React + TypeScript Q&A community platform with advanced search, RBAC, and BM25 ranking.

## Features

- **60 Pre-seeded Q&A Posts** across 5 engineering categories
- **11 Verified Users** with role-based access control
- **Advanced Search**: SQL LIKE and Regex pattern matching
- **BM25 Search Engine Sandbox** with live parameter tuning
- **Role-Based Access Control** (5 roles: Super Admin, Content Manager, Moderator, Data/SEO Specialist, User)
- **@Mention System** with autocomplete
- **SEO Metadata Management**
- **Search Click Telemetry** for Phase 2 training
- **Profile Management** with avatar upload
- **Moderation Queue** with flagging system

## Quick Start

```bash
# Install dependencies (already done)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Default Users

Test the RBAC system by logging in as:

- **@SalvadorDalier** (Super Admin) - Full system access
- **@loconner** (Data & SEO Specialist) - SEO metadata, analytics, BM25 sandbox
- **@Winnie_the_pooh** (Content Manager) - Document CRUD, taxonomy
- **@familyguy** (Moderator) - Review flags and reports
- **@rando232** (Data & SEO Specialist) - Search analytics
- **@Dre** (Standard User) - Post, vote, comment

Password: Any password works for demo accounts (authentication is simulated)

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React Icons

## File Structure

```
src/
├── App.tsx          # Main application (5,272 lines)
├── main.tsx         # Entry point
└── index.css        # Tailwind imports + custom styles
```

## Key Views

1. **Q&A Directory** - Paginated, filtered search results
2. **Question Detail** - Full post with comments and @mentions
3. **Admin Console** - 4 role-specific dashboards
4. **Profile Management** - Avatar, username, bio editing
5. **Auth Page** - Login/registration with instant 1-click demo accounts
6. **Architecture View** - SQL/API documentation (partial)

## Development Notes

- The app runs entirely client-side (no backend required)
- All data is stored in React state
- Search click logs export to CSV/JSON
- BM25 algorithm implemented in-browser
- Username changes propagate across all content

## License

Demo/Educational Project
