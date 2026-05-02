# StreamVerse Quick Start Guide

Get up and running with StreamVerse in 5 minutes!

## 🚀 Installation

### 1. Prerequisites
- Node.js 18 or higher
- pnpm (npm or yarn also work)

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Run Development Server
```bash
pnpm dev
```

### 4. Open in Browser
Navigate to [http://localhost:3000](http://localhost:3000)

---

## 🔑 Demo Accounts

Three pre-configured accounts are available immediately:

### Account 1: Viewer
```
Email: viewer@demo.com
Password: demo123
Role: Viewer
Permissions: Watch movies, rate, review, forum, messaging
```

### Account 2: Producer
```
Email: producer@demo.com
Password: demo123
Role: Producer
Permissions: All viewer features + upload movies, manage earnings
```

### Account 3: Admin
```
Email: admin@demo.com
Password: demo123
Role: Admin
Permissions: All features + moderation + system management
```

---

## 📋 What to Try First

### 1. Create an Account
- Go to [/signup](http://localhost:3000/signup)
- Choose a role (Viewer or Producer)
- Sign up with your own email

OR use demo account above

### 2. Browse Movies
- Click "Browse" in header (or go to [/movies](http://localhost:3000/movies))
- Try searching for movies
- Click a movie to see details
- Rate and review the movie

### 3. Join the Forum
- Click "Forum" in header (or go to [/forum](http://localhost:3000/forum))
- Create a new discussion thread
- Reply to existing threads
- See live discussions

### 4. Send Messages
- Click "Messages" in header (or go to [/messages](http://localhost:3000/messages))
- Start a conversation with another user
- Send and receive messages

### 5. Discover Users
- Click "Discover" in header (or go to [/discover](http://localhost:3000/discover))
- Search for users
- Filter by role (Producers, Viewers)
- Visit user profiles

### 6. View Your Profile
- Click your avatar in top-right
- Select "Profile"
- See your watch history
- View your activity stats

### 7. Manage Settings
- Click your avatar in top-right
- Select "Settings"
- Update profile information
- Change preferences

### 8. Producer Features (if using producer account)
- Click "Dashboard" in header
- View earnings metrics
- See subscriber information
- Track analytics

### 9. Admin Features (if using admin account)
- Click "Admin" in header
- View moderation queue
- See platform statistics
- Manage content

---

## 🎯 Feature Overview

### Movies (15+ included)
- Browse and search published movies
- View movie details and metadata
- Play video (preview ready)
- Track watch history with progress

### Ratings (⭐ System)
- Rate movies 1-10
- Write text reviews
- View all community ratings
- See your personal ratings

### Forum (💬 Community)
- Create discussion threads
- Reply to threads (nested replies)
- Search and filter discussions
- Real-time engagement

### Messaging (💌 Direct)
- Send private messages
- View conversation history
- Real-time chat interface
- User-to-user communication

### Subscriptions (💰 Monetization)
- Subscribe to producers
- Track subscriptions
- View earnings (producer)
- Manage subscribers

### Profiles (👤 Social)
- Personal profile with stats
- Watch history timeline
- Public producer profiles
- User discovery

---

## 🛠️ Development Tips

### Hot Reload
Changes save automatically. Just refresh the browser.

### Debug Auth
Check logged-in user in browser console:
```javascript
fetch('/api/auth/me').then(r => r.json()).then(console.log)
```

### Clear Session
Open DevTools → Application → Cookies → Delete session cookie

### Reset Data
Stop server and restart - data resets (it's in-memory)

### Check API Responses
Open DevTools → Network tab to see API calls and responses

---

## 📱 Mobile Testing

The site is fully responsive:
- Desktop: 1920px and up
- Tablet: 768px to 1024px
- Mobile: Below 768px

Test responsive design:
- Open DevTools (F12)
- Click responsive device toolbar (Ctrl+Shift+M)
- Test different screen sizes

---

## 🔗 Key Pages

| Page | URL | Description |
|------|-----|-------------|
| Home | / | Landing page |
| Demo Info | /demo-info | Feature showcase |
| Movies | /movies | Browse movies |
| Movie Detail | /movies/:id | Watch & rate |
| Forum | /forum | Discussions |
| Forum Thread | /forum/:id | Thread detail |
| Messages | /messages | Direct chat |
| Profile | /profile | Your profile |
| User Profile | /profile/:id | User details |
| Settings | /settings | Preferences |
| Discover | /discover | Find users |
| Producer Dashboard | /producer/dashboard | Analytics |
| Admin Panel | /admin | Moderation |
| Login | /login | Sign in |
| Signup | /signup | Register |

---

## 🎨 Customization

### Theme Colors
Edit `/app/globals.css` to change:
- Primary color (green)
- Accent color (orange)
- Neutral colors (grays)
- Background colors (dark)

### Content
Demo movies are in `/app/api/init/route.ts` - customize them

### Branding
- Logo: `/app/components/header.tsx`
- Site name: "StreamVerse" - replace throughout
- Favicon: `/public/`

---

## 🚀 Ready to Deploy?

### Deploy to Vercel
1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Click "Deploy"
4. That's it!

### Deploy to Other Platforms
- AWS Amplify
- Railway
- Render
- Heroku

(Requires paid tier for databases)

---

## ❓ Frequently Asked Questions

### Q: Where is data stored?
**A:** Currently in-memory (server RAM). Resets on restart. For production, upgrade to PostgreSQL.

### Q: How do I add real videos?
**A:** Integrate AWS S3 or similar. See DEVELOPER_GUIDE.md for steps.

### Q: Can I modify the theme?
**A:** Yes! Edit colors in `/app/globals.css` using CSS variables.

### Q: How do I add more demo data?
**A:** Modify `/app/api/init/route.ts` to include more movies/users.

### Q: Is this production-ready?
**A:** The code quality is production-ready, but you should:
- Upgrade to PostgreSQL database
- Implement proper password hashing (bcrypt)
- Add rate limiting
- Set up monitoring

See DEVELOPER_GUIDE.md for full checklist.

### Q: Can I customize the movies?
**A:** Yes! Edit `/app/api/init/route.ts` Movie definitions.

### Q: How do I add new features?
**A:** Follow the pattern in DEVELOPER_GUIDE.md "Adding New Features" section.

---

## 🆘 Troubleshooting

### Port 3000 already in use?
```bash
# Use a different port
pnpm dev -- -p 3001
```

### Dependencies not installing?
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
pnpm install
```

### Changes not showing?
```bash
# Clear Next.js cache
rm -rf .next
pnpm dev
```

### Session not persisting?
- Check browser console for errors
- Clear cookies and try again
- Ensure cookies are enabled

### API returning 500 error?
- Check terminal for error logs
- Verify request is properly formatted
- Check API route file exists

---

## 📚 Learn More

- [README.md](./README.md) - Feature documentation
- [DEVELOPER_GUIDE.md](./DEVELOPER_GUIDE.md) - Development reference
- [PROJECT_COMPLETION.md](./PROJECT_COMPLETION.md) - Architecture overview

---

## 🎉 You're Ready!

Your StreamVerse instance is ready to explore. 

**Next Steps:**
1. Try logging in with a demo account
2. Explore different features
3. Create your own account
4. Check out the code in `/app`

Enjoy! 🎬

---

**Need Help?**
- Check the documentation files
- Review the code comments
- Check error messages carefully
- Look at existing examples

**Happy Streaming!** 🚀
