// In-memory data store for the streaming platform
// This can be easily upgraded to PostgreSQL/Neon with minimal changes

export interface User {
  id: string
  email: string
  password: string // hashed
  name: string
  role: 'admin' | 'producer' | 'viewer'
  verified: boolean // producers need admin verification
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

export interface Movie {
  id: string
  title: string
  description: string
  thumbnail: string
  videoUrl?: string
  trailerUrl?: string
  duration: number // in minutes
  producerId: string
  genre: string[]
  releaseDate: Date
  status: 'draft' | 'pending' | 'approved' | 'published'
  rating: number // 0-10
  ratingCount: number
  createdAt: Date
  updatedAt: Date
}

export interface WatchHistory {
  id: string
  userId: string
  movieId: string
  watchedAt: Date
  progress: number // percentage watched
  duration: number // total minutes watched
}

export interface Rating {
  id: string
  userId: string
  movieId: string
  rating: number // 1-10
  review?: string
  createdAt: Date
  updatedAt: Date
}

export interface Subscription {
  id: string
  userId: string
  producerId: string
  amount: number
  status: 'active' | 'cancelled'
  createdAt: Date
  renewsAt: Date
}

export interface Transaction {
  id: string
  userId: string
  amount: number
  type: 'subscription' | 'purchase'
  status: 'pending' | 'completed' | 'failed'
  description: string
  createdAt: Date
}

export interface ForumThread {
  id: string
  title: string
  description: string
  authorId: string
  movieId?: string
  createdAt: Date
  updatedAt: Date
}

export interface ForumPost {
  id: string
  threadId: string
  authorId: string
  content: string
  parentId?: string // for nested replies
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  id: string
  senderId: string
  recipientId: string
  content: string
  read: boolean
  createdAt: Date
}

// In-memory storage
class DataStore {
  private users: Map<string, User> = new Map()
  private movies: Map<string, Movie> = new Map()
  private watchHistory: Map<string, WatchHistory> = new Map()
  private ratings: Map<string, Rating> = new Map()
  private subscriptions: Map<string, Subscription> = new Map()
  private transactions: Map<string, Transaction> = new Map()
  private forumThreads: Map<string, ForumThread> = new Map()
  private forumPosts: Map<string, ForumPost> = new Map()
  private messages: Map<string, Message> = new Map()

  constructor() {
    this.loadPersistedUsers()
  }

  private loadPersistedUsers() {
    try {
      if (typeof window === 'undefined') {
        // Server-side: try to load from file
        const { readFileSync, existsSync } = require('fs')
        const path = require('path')
        const dataFile = path.join(process.cwd(), '.data', 'users.json')
        
        if (existsSync(dataFile)) {
          const data = readFileSync(dataFile, 'utf-8')
          const usersArray = JSON.parse(data)
          usersArray.forEach((user: any) => {
            const userObj = {
              ...user,
              createdAt: new Date(user.createdAt),
              updatedAt: new Date(user.updatedAt),
            }
            this.users.set(user.id, userObj)
          })
        }
      }
    } catch (error) {
      console.error('Failed to load persisted users:', error)
    }
  }

  private persistUsers() {
    try {
      if (typeof window === 'undefined') {
        // Server-side: save to file
        const { writeFileSync, mkdirSync } = require('fs')
        const path = require('path')
        const dataDir = path.join(process.cwd(), '.data')
        const dataFile = path.join(dataDir, 'users.json')
        
        mkdirSync(dataDir, { recursive: true })
        const usersArray = Array.from(this.users.values())
        writeFileSync(dataFile, JSON.stringify(usersArray, null, 2), 'utf-8')
      }
    } catch (error) {
      console.error('Failed to persist users:', error)
    }
  }

  // User operations
  addUser(user: User) {
    this.users.set(user.id, user)
    this.persistUsers()
  }

  getUser(id: string) {
    return this.users.get(id)
  }

  getUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return user
    }
    return null
  }

  getAllUsers() {
    return Array.from(this.users.values())
  }

  getUsersByRole(role: string) {
    return Array.from(this.users.values()).filter(u => u.role === role)
  }

  deleteUser(id: string) {
    const result = this.users.delete(id)
    if (result) {
      this.persistUsers()
    }
    return result
  }

  updateUser(id: string, updates: Partial<User>) {
    const user = this.users.get(id)
    if (user) {
      const updated = { ...user, ...updates, updatedAt: new Date() }
      this.users.set(id, updated)
      this.persistUsers()
      return updated
    }
    return null
  }

  // Movie operations
  addMovie(movie: Movie) {
    this.movies.set(movie.id, movie)
  }

  getMovie(id: string) {
    return this.movies.get(id)
  }

  getMoviesByProducer(producerId: string) {
    return Array.from(this.movies.values()).filter(
      (m) => m.producerId === producerId
    )
  }

  getPublishedMovies() {
    return Array.from(this.movies.values()).filter((m) => m.status === 'published')
  }

  searchMovies(query: string) {
    const lower = query.toLowerCase()
    return Array.from(this.movies.values()).filter(
      (m) =>
        m.status === 'published' &&
        (m.title.toLowerCase().includes(lower) ||
          m.description.toLowerCase().includes(lower) ||
          m.genre.some((g) => g.toLowerCase().includes(lower)))
    )
  }

  updateMovie(id: string, updates: Partial<Movie>) {
    const movie = this.movies.get(id)
    if (movie) {
      const updated = { ...movie, ...updates, updatedAt: new Date() }
      this.movies.set(id, updated)
      return updated
    }
    return null
  }

  // Watch history operations
  addWatchHistory(history: WatchHistory) {
    this.watchHistory.set(history.id, history)
  }

  getWatchHistory(userId: string) {
    return Array.from(this.watchHistory.values())
      .filter((h) => h.userId === userId)
      .sort((a, b) => b.watchedAt.getTime() - a.watchedAt.getTime())
  }

  // Rating operations
  addRating(rating: Rating) {
    // Remove existing rating if present
    for (const [id, r] of this.ratings.entries()) {
      if (r.userId === rating.userId && r.movieId === rating.movieId) {
        this.ratings.delete(id)
        break
      }
    }
    this.ratings.set(rating.id, rating)
  }

  getRatings(movieId: string) {
    return Array.from(this.ratings.values()).filter((r) => r.movieId === movieId)
  }

  getUserRating(userId: string, movieId: string) {
    for (const rating of this.ratings.values()) {
      if (rating.userId === userId && rating.movieId === movieId) {
        return rating
      }
    }
    return null
  }

  // Subscription operations
  addSubscription(subscription: Subscription) {
    this.subscriptions.set(subscription.id, subscription)
  }

  getSubscription(userId: string, producerId: string) {
    for (const sub of this.subscriptions.values()) {
      if (sub.userId === userId && sub.producerId === producerId) {
        return sub
      }
    }
    return null
  }

  getProducerSubscribers(producerId: string) {
    return Array.from(this.subscriptions.values()).filter(
      (s) => s.producerId === producerId && s.status === 'active'
    )
  }

  // Transaction operations
  addTransaction(transaction: Transaction) {
    this.transactions.set(transaction.id, transaction)
  }

  getTransactions(userId: string) {
    return Array.from(this.transactions.values()).filter((t) => t.userId === userId)
  }

  // Forum operations
  addForumThread(thread: ForumThread) {
    this.forumThreads.set(thread.id, thread)
  }

  getForumThreads(movieId?: string) {
    return Array.from(this.forumThreads.values())
      .filter((t) => !movieId || t.movieId === movieId)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
  }

  addForumPost(post: ForumPost) {
    this.forumPosts.set(post.id, post)
  }

  getForumPosts(threadId: string) {
    return Array.from(this.forumPosts.values())
      .filter((p) => p.threadId === threadId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }

  // Message operations
  addMessage(message: Message) {
    this.messages.set(message.id, message)
  }

  getMessages(userId: string) {
    return Array.from(this.messages.values())
      .filter((m) => m.senderId === userId || m.recipientId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
  }

  getConversation(user1Id: string, user2Id: string) {
    return Array.from(this.messages.values())
      .filter(
        (m) =>
          (m.senderId === user1Id && m.recipientId === user2Id) ||
          (m.senderId === user2Id && m.recipientId === user1Id)
      )
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
  }
}

export const store = new DataStore()
