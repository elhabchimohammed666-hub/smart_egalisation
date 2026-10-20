import mongoose from 'mongoose';
import { config } from './config.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // First attempt to connect to configured MongoDB URI (Atlas or local mongod)
    console.log(`[DB] Attempting connection to MongoDB at ${config.mongoUri}...`);
    
    // Set a 4-second timeout for the initial connection attempt
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 4000
    });
    
    console.log(`[DB] MongoDB Connected successfully to: ${mongoose.connection.host}`);
  } catch (err) {
    console.warn(`[DB] Could not connect to primary MongoDB (${err.message}). Initializing fallback in-memory database for seamless local operation...`);
    
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      
      console.log(`[DB] In-Memory MongoDB Server started at: ${inMemoryUri}`);
      await mongoose.connect(inMemoryUri);
      console.log(`[DB] Fallback In-Memory MongoDB Connected successfully!`);
    } catch (memErr) {
      console.error(`[DB] Fatal: Failed to start fallback MongoDB server:`, memErr);
      process.exit(1);
    }
  }

  mongoose.connection.on('error', (err) => {
    console.error(`[DB] Runtime MongoDB error: ${err.message}`);
  });
};

export const closeDB = async () => {
  try {
    await mongoose.disconnect();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
  } catch (err) {
    console.error(`[DB] Error closing database connection:`, err);
  }
};
