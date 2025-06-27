import mongoose from "mongoose"
import dotenv from "dotenv"

dotenv.config()

const connectString = process.env.MONGODB_URI

class Database {
  constructor() {
    this.connect()
  }

  async connect() {
    try {
      mongoose.set('debug', true)
      mongoose.set('debug', { color: true })

      await mongoose.connect(connectString, {
        useNewUrlParser: true,
        useUnifiedTopology: true
      })
      console.log('Connected to MongoDB successfully!')
    } catch ( error ) {
      console.error('MongoDB connection error:', error.message)
    }
  }

  static getInstance() {
    if(!Database.instance) {
      Database.instance = new Database()
    }
    return Database.instance
  }
}

const instanceMongoDB = Database.getInstance()
export default instanceMongoDB