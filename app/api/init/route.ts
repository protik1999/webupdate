import { NextRequest, NextResponse } from 'next/server'
import { store, User, Movie } from '@/lib/data'
import { hashPassword } from '@/lib/auth'
import { randomUUID } from 'crypto'

let initialized = false

export async function POST(req: NextRequest) {
  try {
    if (initialized || store.getAllUsers().length > 0) {
      return NextResponse.json({ message: 'Already initialized' })
    }

    // Create demo users
    const viewerPassword = await hashPassword('demo123')
    const producerPassword = await hashPassword('demo123')
    const adminPassword = await hashPassword('demo123')

    const viewer: User = {
      id: randomUUID(),
      email: 'viewer@demo.com',
      password: viewerPassword,
      name: 'Demo Viewer',
      role: 'viewer',
      verified: true,
      bio: 'A passionate movie enthusiast',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const producer: User = {
      id: randomUUID(),
      email: 'producer@demo.com',
      password: producerPassword,
      name: 'Demo Producer',
      role: 'producer',
      verified: true,
      bio: 'Independent filmmaker and content creator',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const admin: User = {
      id: randomUUID(),
      email: 'admin@demo.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'admin',
      verified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    store.addUser(viewer)
    store.addUser(producer)
    store.addUser(admin)

    // Create demo movies
    const movies: Movie[] = [
      {
        id: randomUUID(),
        title: 'The Digital Frontier',
        description: 'A thrilling journey into the world of technology and innovation',
        thumbnail: 'https://images.unsplash.com/photo-1485095329183-d0ddc3500399?w=500&h=300&fit=crop',
        duration: 120,
        producerId: producer.id,
        genre: ['Sci-Fi', 'Drama'],
        releaseDate: new Date('2024-01-15'),
        status: 'published',
        rating: 8.5,
        ratingCount: 342,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
      {
        id: randomUUID(),
        title: 'Mountain Tales',
        description: 'An epic adventure documentary exploring the world\'s highest peaks',
        thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500&h=300&fit=crop',
        duration: 90,
        producerId: producer.id,
        genre: ['Documentary', 'Adventure'],
        releaseDate: new Date('2024-02-01'),
        status: 'published',
        rating: 9.0,
        ratingCount: 521,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: randomUUID(),
        title: 'Urban Nights',
        description: 'A noir-inspired story of mystery and secrets in the city',
        thumbnail: 'https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=500&h=300&fit=crop',
        duration: 110,
        producerId: producer.id,
        genre: ['Thriller', 'Drama'],
        releaseDate: new Date('2024-02-15'),
        status: 'published',
        rating: 8.2,
        ratingCount: 289,
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-01'),
      },
      {
        id: randomUUID(),
        title: 'The Last Light',
        description: 'A poignant story about hope and human connection in dark times',
        thumbnail: 'https://images.unsplash.com/photo-1533109752211-118fcf4312e9?w=500&h=300&fit=crop',
        duration: 95,
        producerId: producer.id,
        genre: ['Drama'],
        releaseDate: new Date('2024-03-01'),
        status: 'published',
        rating: 8.7,
        ratingCount: 615,
        createdAt: new Date('2024-02-10'),
        updatedAt: new Date('2024-02-10'),
      },
      {
        id: randomUUID(),
        title: 'Echoes of Tomorrow',
        description: 'A mind-bending sci-fi thriller about time, choices, and destiny',
        thumbnail: 'https://images.unsplash.com/photo-1478720568477-152d9e3fb523?w=500&h=300&fit=crop',
        duration: 130,
        producerId: producer.id,
        genre: ['Sci-Fi', 'Thriller'],
        releaseDate: new Date('2024-03-15'),
        status: 'published',
        rating: 8.8,
        ratingCount: 734,
        createdAt: new Date('2024-02-25'),
        updatedAt: new Date('2024-02-25'),
      },
    ]

    for (const movie of movies) {
      store.addMovie(movie)
    }

    initialized = true

    return NextResponse.json({
      message: 'Initialized successfully',
      users: 3,
      movies: movies.length,
    })
  } catch (error) {
    console.error('[init] Error:', error)
    return NextResponse.json(
      { error: 'Initialization failed' },
      { status: 500 }
    )
  }
}
