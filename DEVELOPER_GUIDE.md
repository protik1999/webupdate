# StreamVerse Developer Guide

A comprehensive guide to understanding and extending the StreamVerse streaming platform.

## Architecture Overview

StreamVerse is built using a modern Next.js 16 architecture with:

- **Frontend**: React 19 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **Backend**: Next.js API routes
- **Authentication**: Custom JWT + HTTP-only cookies
- **Data**: In-memory store (easily upgradeable to PostgreSQL)

## Project Structure

```
streamverse/
├── app/
│   ├── api/                    # Backend API routes
│   │   ├── auth/              # Authentication (login, signup, logout)
│   │   ├── movies/            # Movie management and streaming
│   │   ├── ratings/           # Review and rating system
│   │   ├── forum/             # Community discussions
│   │   ├── messages/          # Direct messaging
│   │   ├── subscriptions/     # Producer subscriptions
│   │   ├── watch-history/     # Viewing history tracking
│   │   ├── producer/          # Producer-specific endpoints
│   │   ├── users/             # User discovery and profiles
│   │   └── init/              # Demo data initialization
│   ├── components/             # Reusable React components
│   │   └── header.tsx         # Main navigation header
│   ├── context/                # React Context providers
│   │   └── auth-context.tsx   # Authentication state
│   ├── (pages)/                # Next.js pages
│   │   ├── page.tsx           # Home page
│   │   ├── login/             # Login page
│   │   ├── signup/            # Registration page
│   │   ├── movies/            # Movie browse page
│   │   ├── movies/[id]/       # Movie detail and player
│   │   ├── forum/             # Forum listing
│   │   ├── forum/[id]/        # Thread detail
│   │   ├── messages/          # Messaging interface
│   │   ├── profile/           # User profile
│   │   ├── profile/[id]/      # Public user profile
│   │   ├── settings/          # Account settings
│   │   ├── producer/          # Producer dashboard
│   │   ├── discover/          # User discovery
│   │   ├── demo-info/         # Demo information
│   │   └── admin/             # Admin panel
│   ├── globals.css             # Global styles and design tokens
│   └── layout.tsx              # Root layout
├── lib/
│   ├── auth.ts                # Authentication utilities
│   ├── data.ts                # Data layer and models
│   └── utils.ts               # Helper utilities
├── components/ui/              # shadcn/ui components
├── hooks/                      # React hooks
├── public/                     # Static assets
└── package.json

```

## Core Concepts

### 1. Authentication Flow

```
User Input (Email/Password)
    ↓
API Route (login/signup)
    ↓
Verify against Data Store
    ↓
Create JWT Token
    ↓
Set HTTP-only Cookie
    ↓
Return User Object to Client
    ↓
Auth Context Updates
    ↓
User Logged In
```

**Key Files:**
- `lib/auth.ts` - JWT creation and verification
- `app/api/auth/` - Auth endpoints
- `app/context/auth-context.tsx` - Client-side auth state

### 2. Data Layer Architecture

The `lib/data.ts` file provides a complete in-memory database abstraction:

```typescript
// Access data globally
import { store } from '@/lib/data'

// User operations
store.addUser(user)
store.getUser(id)
store.getUserByEmail(email)
store.updateUser(id, updates)

// Movie operations
store.addMovie(movie)
store.getMovie(id)
store.getPublishedMovies()
store.searchMovies(query)

// Forum operations
store.addForumThread(thread)
store.getForumThreads(movieId?)
store.addForumPost(post)
store.getForumPosts(threadId)

// And more...
```

### 3. API Route Pattern

All API routes follow this pattern:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { store } from '@/lib/data'
import { getSession } from '@/lib/auth'

export async function GET(req: NextRequest) {
  try {
    // Get authenticated user (optional)
    const session = await getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query parameters
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get('q')

    // Fetch data
    const data = store.getPublicMovies()

    // Return response
    return NextResponse.json({ data })
  } catch (error) {
    console.error('[endpoint] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    // Validate input
    if (!body.email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Process request
    const result = await processData(body)

    // Return success
    return NextResponse.json({ result })
  } catch (error) {
    console.error('[endpoint] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### 4. Client-Side Data Fetching

Use the `useAuth` hook and standard `fetch` API:

```typescript
import { useAuth } from '@/app/context/auth-context'

export default function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/endpoint')
      if (res.ok) {
        const result = await res.json()
        setData(result)
      }
    }

    fetchData()
  }, [])

  return (
    <div>
      {data && <p>{JSON.stringify(data)}</p>}
    </div>
  )
}
```

## Adding New Features

### Example: Adding a New Movie List Type

1. **Add Data Method** (`lib/data.ts`):
```typescript
class DataStore {
  getTrendingMovies() {
    return Array.from(this.movies.values())
      .filter(m => m.status === 'published')
      .sort((a, b) => b.ratingCount - a.ratingCount)
      .slice(0, 10)
  }
}
```

2. **Create API Route** (`app/api/movies/trending/route.ts`):
```typescript
export async function GET(req: NextRequest) {
  try {
    const movies = store.getTrendingMovies()
    return NextResponse.json({ movies })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch trending movies' },
      { status: 500 }
    )
  }
}
```

3. **Create Component** (`app/components/trending-movies.tsx`):
```typescript
'use client'

export default function TrendingMovies() {
  const [movies, setMovies] = useState([])

  useEffect(() => {
    fetch('/api/movies/trending')
      .then(r => r.json())
      .then(d => setMovies(d.movies))
  }, [])

  return (
    <div>
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}
```

4. **Add to Page** (`app/page.tsx`):
```typescript
import TrendingMovies from '@/app/components/trending-movies'

export default function HomePage() {
  return (
    <>
      <TrendingMovies />
    </>
  )
}
```

## Database Migration Path

### Current: In-Memory Store
Suitable for demo/prototyping. Data is lost on server restart.

### Step 1: Add PostgreSQL (Neon)

```bash
npm install @neondatabase/serverless
```

Create `lib/db.ts`:
```typescript
import { Pool } from '@neondatabase/serverless'

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export async function query(text: string, params?: any[]) {
  const result = await pool.query(text, params)
  return result.rows
}
```

### Step 2: Migrate Data Layer

Replace `store.getUser()` calls with:
```typescript
const user = await query(
  'SELECT * FROM users WHERE id = $1',
  [id]
)
```

### Step 3: Add Migrations

Create `migrations/001_initial_schema.sql`:
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR DEFAULT 'viewer',
  bio TEXT,
  avatar VARCHAR,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR NOT NULL,
  description TEXT,
  thumbnail VARCHAR,
  duration INT,
  producer_id UUID REFERENCES users(id),
  genre TEXT[],
  status VARCHAR DEFAULT 'draft',
  rating DECIMAL,
  rating_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add more tables for other entities...
```

Run migrations:
```bash
npm run migrate
```

## Role-Based Access Control

The system supports three roles with different permissions:

### Viewer
- Browse published movies
- Rate and review movies
- Participate in forums
- Send messages
- View profiles
- Subscribe to producers

### Producer
- Upload and manage movies
- View earnings dashboard
- Manage subscribers
- See analytics
- Create movies in draft status
- Submit for approval

### Admin
- Approve/reject movies
- Moderate forum content
- View platform analytics
- Manage users
- Access admin dashboard

## Security Checklist

### Current Implementation (Demo)
- ✅ Basic JWT tokens
- ✅ HTTP-only session cookies
- ✅ User input validation
- ❌ Password hashing (uses base64)
- ❌ Rate limiting
- ❌ CSRF protection

### Before Production
- [ ] Implement bcrypt password hashing
- [ ] Add rate limiting (express-rate-limit)
- [ ] Enable CSRF protection
- [ ] Add input sanitization
- [ ] Implement RLS policies in database
- [ ] Add API key management
- [ ] Set up monitoring and logging
- [ ] Add email verification
- [ ] Implement 2FA
- [ ] Add audit logging

## Environment Variables

### Development (No Setup Needed)
```
NODE_ENV=development
```

### Production Required
```
NODE_ENV=production
JWT_SECRET=your-secret-key-here
DATABASE_URL=postgresql://user:pass@host/db
NEXTAUTH_URL=https://yourdomain.com
STRIPE_SECRET_KEY=sk_live_xxx
```

## Performance Optimization Tips

1. **Code Splitting**: Use dynamic imports for heavy components
```typescript
const HeavyComponent = dynamic(() => import('./heavy'), {
  loading: () => <div>Loading...</div>
})
```

2. **Image Optimization**: Use Next.js Image component
```typescript
import Image from 'next/image'

<Image src="/movie.jpg" alt="Movie" width={500} height={300} />
```

3. **API Optimization**: Add caching headers
```typescript
return NextResponse.json(data, {
  headers: {
    'Cache-Control': 'public, max-age=60, s-maxage=120'
  }
})
```

## Testing

### Manual Testing Checklist

- [ ] Create new user account
- [ ] Login with demo accounts
- [ ] Browse and search movies
- [ ] Rate and review a movie
- [ ] Create forum thread
- [ ] Reply in forum
- [ ] Send message to another user
- [ ] View watch history
- [ ] Test producer dashboard
- [ ] Test admin panel

### Automated Testing (To Implement)

```bash
npm install --save-dev jest @testing-library/react
```

## Debugging Tips

### Enable Debug Logging
```typescript
console.log('[component] Debug:', value)
```

### Check Auth State
Open browser console:
```javascript
// Check session
fetch('/api/auth/me').then(r => r.json()).then(console.log)
```

### Inspect Data Store
```typescript
import { store } from '@/lib/data'
console.log(store.getAllUsers())
```

## Common Issues & Solutions

### 1. Session Not Persisting
- Check if cookies are being set: DevTools > Application > Cookies
- Verify `secure` flag in production
- Check `sameSite` settings

### 2. API 404 Errors
- Verify file path matches API route
- Check for typos in route names
- Restart dev server after adding routes

### 3. Data Not Loading
- Check browser Network tab for failed requests
- Verify auth token is valid
- Check data store has initialized

### 4. Styling Issues
- Verify Tailwind CSS configuration
- Check for conflicting CSS classes
- Clear `.next` build cache

## Resources

- [Next.js 16 Docs](https://nextjs.org/docs)
- [React 19 Docs](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [shadcn/ui](https://ui.shadcn.com)
- [Vercel Deployment](https://vercel.com/docs)

## Contributing

1. Create feature branch: `git checkout -b feature/my-feature`
2. Make changes with clear commit messages
3. Test thoroughly before pushing
4. Create pull request with description
5. Address review feedback

## Support

For questions or issues:
1. Check this guide first
2. Review existing code examples
3. Check GitHub issues
4. Open a new issue with details

---

**Last Updated**: March 2026
**Version**: 1.0.0
