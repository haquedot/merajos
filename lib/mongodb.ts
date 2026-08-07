import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/meraj_os';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

/**
 * Interface defining the globally cached Mongoose instance.
 */
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

/**
 * Extend globalThis to prevent TypeScript warnings and maintain a single connection pool
 * across hot-reloading in development and serverless invocations in production.
 */
declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

// Guarantee globalThis.mongooseCache is initialized
if (!globalThis.mongooseCache) {
  globalThis.mongooseCache = { conn: null, promise: null };
}

const cached: MongooseCache = globalThis.mongooseCache;

/**
 * Establishes and reuses a single Mongoose connection per server instance.
 * Restricts maximum connection pool size to prevent exceeding MongoDB Atlas connection limits.
 */
export async function connectToDatabase(): Promise<typeof mongoose> {
  // 1. Return active connection if readyState is connected (1)
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // 2. Return active connecting promise if readyState is connecting (2)
  if (mongoose.connection.readyState === 2 && cached.promise) {
    cached.conn = await cached.promise;
    return cached.conn;
  }

  // 3. Reset cached references if readyState is disconnected (0)
  if (mongoose.connection.readyState === 0) {
    cached.conn = null;
    cached.promise = null;
  }

  // 4. Create single connection promise if none exists
  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      maxPoolSize: 10,                 // Prevents opening up to 100 default connections per worker (fixes Atlas 80% limit alert)
      minPoolSize: 1,                  // Keeps 1 socket ready for instant performance
      serverSelectionTimeoutMS: 10000, // Timeout after 10 seconds if MongoDB is unreachable
      socketTimeoutMS: 45000,          // Close idle sockets after 45 seconds
    };

    cached.promise = mongoose
      .connect(MONGODB_URI, opts)
      .then((mongooseInstance) => {
        console.log('[MongoDB] Singleton connection established (maxPoolSize: 10).');
        return mongooseInstance;
      })
      .catch((err) => {
        cached.promise = null;
        cached.conn = null;
        console.error('[MongoDB] Connection failed:', err);
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    cached.conn = null;
    throw e;
  }

  return cached.conn;
}

