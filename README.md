# StreamVerse - Movie Streaming Platform

A comprehensive movie streaming platform built with Next.js 16, featuring user authentication, movie browsing, video playback, community forums, ratings system, and producer monetization.

## Features

### 🔐 Authentication & User Management
- User registration and login with role-based access (Viewer, Producer, Admin)
- Secure session management with HTTP-only cookies
- User profiles with customizable bio and avatar
- Account settings and preferences

### 🎬 Movie Browsing & Streaming
- Browse published movies with search and genre filtering
- Movie detail pages with ratings and reviews
- Video player interface (demo-ready for video integration)
- Watch history tracking with progress indicators
- Movie recommendations based on watch history

### 💰 Payment System & Producer Earnings
- Subscription model: $4.99/month per producer
- Producer dashboard with earnings and analytics
- Transaction tracking and history
- Subscriber management for producers
- Movie status workflow (draft → pending → approved → published)

### ⭐ Ratings & Reviews System
- 1-10 star rating system with written reviews
- User ratings visible on movie detail pages
- Aggregated rating calculations
- Review management and history

### 💬 Community Forum
- Create discussion threads about movies or general topics
- Nested reply system for discussions
- Search and filter forum threads
- User attribution and timestamp tracking
- Real-time discussion engagement metrics

### 👤 User Profiles
- Public user profiles with bio and watch history
- Personalized watch history with progress tracking
- Account statistics (movies watched, average progress, member status)
- Profile customization options

### 📧 Messaging System
- Direct messaging between users
- Conversation history
- Message timestamps and read status
- User-to-user communication infrastructure

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API with SWR for data fetching
- **Authentication**: Custom JWT implementation with secure cookies
- **Data Storage**: In-memory store (upgradeable to Neon/PostgreSQL)
- **API**: Next.js API routes with proper error handling

## Project Structure

```
app/
├── api/                      # API Routes
│   ├── auth/                 # Authentication endpoints
│   ├── movies/               # Movie management
│   ├── watch-history/        # Viewing history
│   ├── ratings/              # Reviews and ratings
│   ├── subscriptions/        # Subscription management
│   ├── forum/                # Forum discussions
│   ├── messages/             # Direct messaging
│   ├── producer/             # Producer-specific endpoints
│   └── init/                 # Data initialization
├── components/               # Reusable components
├── context/                  # React Context (Auth)
├── movies/                   # Movie browsing pages
├── forum/                    # Forum pages
├── profile/                  # User profile pages
├── settings/                 # Settings pages
├── producer/                 # Producer dashboard
└── login|signup|            # Authentication pages
lib/
├── auth.ts                   # Authentication utilities
├── data.ts                   # Data layer and storage
└── utils.ts                  # Utility functions
```

## Demo Accounts

### Viewer Account
- **Email**: viewer@demo.com
- **Password**: demo123
- Can watch movies, rate and review, participate in forums

### Producer Account
- **Email**: producer@demo.com
- **Password**: demo123
- Full access to producer dashboard, movie management, and analytics

### Admin Account
- **Email**: admin@demo.com
- **Password**: demo123
- System administration capabilities

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)

### Installation

1. Clone the repository
```bash
git clone <repo-url>
cd streamverse
```

2. Install dependencies
```bash
pnpm install
```

3. Run the development server
```bash
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### First Time Setup

On first visit to the login page, the system automatically initializes with demo data:
- 3 demo users (viewer, producer, admin)
- 5 sample movies from the demo producer
- Forum infrastructure ready for discussions

## API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Movies
- `GET /api/movies` - List published movies (supports search and filtering)
- `GET /api/movies/[id]` - Get movie details
- `POST /api/watch-history` - Record watch activity

### Ratings
- `GET /api/ratings?movieId=[id]` - Get movie ratings
- `POST /api/ratings` - Submit rating and review

### Forum
- `GET /api/forum/threads` - List forum threads
- `POST /api/forum/threads` - Create new thread
- `GET /api/forum/posts?threadId=[id]` - Get thread posts
- `POST /api/forum/posts` - Reply to thread

### Subscriptions
- `GET /api/subscriptions?producerId=[id]` - Check subscription status
- `POST /api/subscriptions` - Subscribe to producer

### Producer
- `GET /api/producer/stats` - Get producer dashboard statistics

### Messages
- `GET /api/messages` - Get conversations
- `POST /api/messages` - Send message

## Key Features Implementation

### Role-Based Access
Different features are available based on user role:
- **Viewers**: Watch movies, rate, review, forum participation, messaging
- **Producers**: Movie management, subscriber management, earnings tracking
- **Admins**: Content moderation, system management

### In-Memory Data Store
The current implementation uses an in-memory data store for quick prototyping. For production:

1. Replace with PostgreSQL (Neon)
2. Update data layer in `/lib/data.ts`
3. Implement proper migrations
4. Add Row Level Security (RLS) policies

### Security Considerations

**Current Demo Security (NOT for production):**
- Basic JWT with base64 encoding
- Passwords stored as base64 (should use bcrypt)
- Session cookies are HTTP-only but not fully secured

**Production Requirements:**
- Implement bcrypt for password hashing
- Use proper JWT library with RS256 signing
- Add rate limiting on auth endpoints
- Implement CSRF protection
- Use environment variables for secrets
- Add database-level access controls

## Future Enhancements

1. **Real Video Streaming**
   - Integrate AWS S3 or similar for video storage
   - Implement HLS/DASH streaming protocols
   - Add video quality selection

2. **Advanced Analytics**
   - Viewer engagement metrics
   - Content performance tracking
   - Revenue reports and payouts

3. **Social Features**
   - User follows and followers
   - Social notifications
   - Content recommendations algorithm

4. **Producer Tools**
   - Bulk movie upload
   - Analytics dashboard with detailed metrics
   - Content moderation queue

5. **Payment Integration**
   - Stripe integration for real payments
   - Subscription management
   - Invoice generation

6. **Notification System**
   - Real-time notifications
   - Email digest
   - Push notifications

## Deployment

### On Vercel
1. Push code to GitHub
2. Import repository in Vercel
3. Add environment variables if needed
4. Deploy

### Environment Variables
```
# For production (not needed for demo)
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
STRIPE_SECRET_KEY=your-stripe-key
```

## Performance Optimizations

- Image optimization with Next.js Image component
- Code splitting with dynamic imports
- Server-side rendering for initial page load
- Client-side caching with SWR
- Tailwind CSS purging

## Testing

Current implementation includes demo data for testing all features:
- Use demo accounts to test different user roles
- Navigate through movie browsing and playback
- Test forum discussions and ratings
- Try messaging between different accounts
- Check producer dashboard

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit pull request with description

## License

MIT License - see LICENSE file for details

## Support

For issues, questions, or feature requests, please open an issue in the repository.

---

**Built with Next.js 16 and TypeScript**

This is a fully functional MVP of a modern streaming platform. The in-memory architecture is suitable for demo and testing purposes. For production deployment, integrate with a proper database like PostgreSQL (Neon) and implement the security considerations mentioned above.
#   w e b u p d a t e  
 