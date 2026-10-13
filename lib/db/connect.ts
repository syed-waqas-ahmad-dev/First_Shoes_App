/**
 * @file lib/db/connect.ts
 * @description Enterprise singleton MongoDB connection manager for OX Shoes.
 * Utilizes NodeJS global caching to prevent duplicate connections during Next.js hot-reloads.
 * Strict TypeScript: ZERO `any`.
 */

import mongoose, { type Mongoose } from 'mongoose';

/**
 * Interface representing the cached connection structure in NodeJS global scope
 */
interface MongooseConnectionCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

// Extend NodeJS Global interface to store the mongoose connection safely
declare global {
  var mongooseConnectionCache: MongooseConnectionCache | undefined;
}

// Initialize cached object from global or default empty cache
const cached: MongooseConnectionCache = global.mongooseConnectionCache ?? {
  conn: null,
  promise: null,
};

if (!global.mongooseConnectionCache) {
  global.mongooseConnectionCache = cached;
}

/**
 * Validates and retrieves the MongoDB connection string.
 * Defaults to demo replica set URI if not provided in environment.
 */
function getMongoUri(): string {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    // Provide a standard fallback format or throw helpful configuration error
    const fallback = 'mongodb://127.0.0.1:27017/ox_shoes_pk';
    return fallback;
  }
  return uri;
}

/**
 * Retrieves the configured database name.
 * Returns undefined if not explicitly set, allowing Mongoose to use the database in the URI path.
 */
function getDatabaseName(): string | undefined {
  return process.env.MONGODB_DB_NAME || undefined;
}

/**
 * Establishes or retrieves the cached singleton MongoDB connection.
 * Configured with enterprise connection pooling, socket timeouts, and index management.
 *
 * @returns Promise resolving to active Mongoose instance
 */
export async function connectToDatabase(): Promise<Mongoose> {
  // Return active connection if already established and ready
  if (cached.conn && cached.conn.connection.readyState === 1) {
    return cached.conn;
  }

  // If a connection attempt is in-flight, await the same promise
  if (!cached.promise) {
    const uri = getMongoUri();
    const dbName = getDatabaseName();

    const options: mongoose.ConnectOptions = {
      ...(dbName ? { dbName } : {}),
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 2, // Keep at least 2 warm connections in pool
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      serverSelectionTimeoutMS: 10000, // Keep trying to send operations for 10 seconds
      family: 4, // Use IPv4, skip trying IPv6
      autoIndex: process.env.NODE_ENV !== 'production', // Build indexes in dev, rely on migrations in prod
    };

    mongoose.set('strictQuery', true);

    // Register connection listeners once
    if (mongoose.connection.listenerCount('connected') === 0) {
      mongoose.connection.on('connected', () => {
        // Connection successfully established
      });

      mongoose.connection.on('error', (err: Error) => {
        // Log connection error without crashing process unexpectedly
        console.error('[OX Shoes DB] Connection error:', err.message);
      });

      mongoose.connection.on('disconnected', () => {
        // Cached connection invalidated upon disconnect
        cached.conn = null;
        cached.promise = null;
      });
    }

    cached.promise = mongoose.connect(uri, options).then((mongooseInstance) => {
      cached.conn = mongooseInstance;
      return mongooseInstance;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error: unknown) {
    // Reset promise cache so subsequent requests can retry
    cached.promise = null;
    cached.conn = null;
    const errorMessage = error instanceof Error ? error.message : 'Unknown connection error';
    throw new Error(`Failed to connect to MongoDB Atlas [OX Shoes]: ${errorMessage}`);
  }

  return cached.conn;
}

/**
 * Returns human-readable connection status and pool statistics.
 */
export function getConnectionState(): {
  status: 'disconnected' | 'connected' | 'connecting' | 'disconnecting' | 'uninitialized';
  readyState: number;
  host: string | null;
  database: string | null;
  isConfigured: boolean;
} {
  const readyState = mongoose.connection.readyState;
  const statusMap: Record<number, 'disconnected' | 'connected' | 'connecting' | 'disconnecting'> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const status = statusMap[readyState] ?? 'uninitialized';
  const hasEnvUri = Boolean(process.env.MONGODB_URI);

  return {
    status,
    readyState,
    host: mongoose.connection.host || null,
    database: mongoose.connection.name || (hasEnvUri ? getDatabaseName() ?? null : null),
    isConfigured: hasEnvUri,
  };
}

/**
 * Gracefully closes the database connection (useful for unit tests & serverless teardown).
 */
export async function disconnectFromDatabase(): Promise<void> {
  if (cached.conn) {
    await mongoose.disconnect();
    cached.conn = null;
    cached.promise = null;
  }
}
