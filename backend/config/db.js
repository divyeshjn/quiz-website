import mongoose from "mongoose";
import dns from "node:dns";

const connectDB = async () => {
  try {
    // Use Google DNS in the local development environment
    if (process.env.NODE_ENV !== "production") {
      dns.setServers(["8.8.8.8"]);
    }

    const conn = await mongoose.connect(
      process.env.MONGO_URI,
      {
        maxPoolSize: 20,
        minPoolSize: 2,
        serverSelectionTimeoutMS: 30000,
        maxIdleTimeMS: 60000,
      }
    );

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Database connection failed: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;