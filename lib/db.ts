import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

export interface DbUser {
  id: string
  email: string
  password: string
  name: string
  role: 'admin' | 'producer' | 'viewer'
  verified: boolean
  avatar?: string | null
  bio?: string | null
  createdAt: string
  updatedAt: string
}

let db: Database.Database | null = null

function getDb(): Database.Database {
  if (db) return db

  const dbPath = path.join(process.cwd(), '.data', 'streamverse.db')
  
  // Ensure directory exists
  const dataDir = path.dirname(dbPath)
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  db = new Database(dbPath)
  db.pragma('journal_mode = WAL')
  
  // Initialize schema
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer',
      verified INTEGER NOT NULL DEFAULT 1,
      avatar TEXT,
      bio TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `)

  return db
}

export const database = {
  addUser(user: DbUser) {
    const database = getDb()
    const stmt = database.prepare(`
      INSERT INTO users (id, email, password, name, role, verified, avatar, bio, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    
    stmt.run(
      user.id,
      user.email,
      user.password,
      user.name,
      user.role,
      user.verified ? 1 : 0,
      user.avatar || null,
      user.bio || null,
      user.createdAt,
      user.updatedAt
    )
  },

  getUserById(id: string): DbUser | null {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM users WHERE id = ?')
    const row = stmt.get(id) as any
    
    if (!row) return null
    
    return {
      ...row,
      verified: Boolean(row.verified),
    }
  },

  getUserByEmail(email: string): DbUser | null {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM users WHERE email = ?')
    const row = stmt.get(email) as any
    
    if (!row) return null
    
    return {
      ...row,
      verified: Boolean(row.verified),
    }
  },

  getAllUsers(): DbUser[] {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM users')
    const rows = stmt.all() as any[]
    
    return rows.map(row => ({
      ...row,
      verified: Boolean(row.verified),
    }))
  },

  updateUser(id: string, updates: Partial<DbUser>): DbUser | null {
    const database = getDb()
    const user = this.getUserById(id)
    
    if (!user) return null
    
    const updatedUser = {
      ...user,
      ...updates,
      updatedAt: new Date().toISOString(),
    }
    
    const stmt = database.prepare(`
      UPDATE users 
      SET email = ?, password = ?, name = ?, role = ?, verified = ?, avatar = ?, bio = ?, updatedAt = ?
      WHERE id = ?
    `)
    
    stmt.run(
      updatedUser.email,
      updatedUser.password,
      updatedUser.name,
      updatedUser.role,
      updatedUser.verified ? 1 : 0,
      updatedUser.avatar || null,
      updatedUser.bio || null,
      updatedUser.updatedAt,
      id
    )
    
    return updatedUser
  },

  deleteUser(id: string): boolean {
    const database = getDb()
    const stmt = database.prepare('DELETE FROM users WHERE id = ?')
    const result = stmt.run(id)
    
    return result.changes > 0
  },

  getUsersByRole(role: string): DbUser[] {
    const database = getDb()
    const stmt = database.prepare('SELECT * FROM users WHERE role = ?')
    const rows = stmt.all(role) as any[]
    
    return rows.map(row => ({
      ...row,
      verified: Boolean(row.verified),
    }))
  },

  close() {
    if (db) {
      db.close()
      db = null
    }
  },
}
