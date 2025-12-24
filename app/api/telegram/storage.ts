// This works better in serverless environments like Vercel
import { v4 as uuidv4 } from "uuid"
import fs from "fs"
import path from "path"
import os from "os"

// In-memory storage (primary)
let memoryStore: Record<string, any> = {}

// File storage (backup) - may work if requests hit same container
const TMP_DIR = os.tmpdir()
const DATA_FILE = path.join(TMP_DIR, "telegram_requests.json")

// Try to load from file on startup
try {
  if (fs.existsSync(DATA_FILE)) {
    const data = fs.readFileSync(DATA_FILE, "utf8")
    memoryStore = JSON.parse(data)
    console.log("[Storage] Loaded from file:", Object.keys(memoryStore).length, "requests")
  }
} catch (e) {
  console.log("[Storage] Starting fresh (no file found)")
}

// Helper to sync to file (best effort)
const syncToFile = () => {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(memoryStore, null, 2))
  } catch (e) {
    // Ignore write errors in serverless
  }
}

// Try to load from file each time (in case different container has newer data)
const tryLoadFromFile = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, "utf8")
      const fileStore = JSON.parse(data)
      // Merge with memory store (file takes precedence for newer data)
      Object.keys(fileStore).forEach((key) => {
        if (!memoryStore[key] || fileStore[key].timestamp > memoryStore[key].timestamp) {
          memoryStore[key] = fileStore[key]
        }
      })
    }
  } catch (e) {
    // Ignore read errors
  }
}

export const storage = {
  saveRequest: (data: any) => {
    tryLoadFromFile() // Try to get latest data

    const id = data.requestId || uuidv4()
    const cleanData = {
      ...data,
      chatId: String(data.chatId),
      requestId: id,
      createdAt: Date.now(),
      timestamp: data.timestamp || new Date().toISOString(),
      delivered: false, // Mark as not delivered yet
    }

    memoryStore[id] = cleanData
    syncToFile()

    console.log("[Storage] Saved request:", id)
    return id
  },

  getRequest: (id: string) => {
    tryLoadFromFile()
    return memoryStore[id] || null
  },

  updateRequest: (id: string, data: any) => {
    tryLoadFromFile()

    if (memoryStore[id]) {
      memoryStore[id] = {
        ...memoryStore[id],
        ...data,
        timestamp: new Date().toISOString(), // Update timestamp
      }

      // Clean up old requests (> 1 hour)
      const now = Date.now()
      const oneHour = 3600000
      Object.keys(memoryStore).forEach((key) => {
        const req = memoryStore[key]
        if (req.createdAt && now - req.createdAt > oneHour) {
          delete memoryStore[key]
        }
      })

      syncToFile()
      console.log("[Storage] Updated request:", id, "status:", data.status)
      return memoryStore[id]
    }
    return null
  },

  markAsDelivered: (id: string) => {
    tryLoadFromFile()
    if (memoryStore[id]) {
      memoryStore[id].delivered = true
      memoryStore[id].deliveredAt = Date.now()
      syncToFile()
      console.log("[Storage] Marked as delivered:", id)
    }
  },

  getPendingRequests: () => {
    tryLoadFromFile()

    const now = Date.now()
    const oneHour = 3600000
    const fiveMinutes = 300000

    const pending = Object.values(memoryStore)
      .filter((req: any) => !req.processed) // Not yet processed by bot
      .filter((req: any) => req.status !== "in_progress") // Filter out tasks marked 'in_progress'
      .filter((req: any) => {
        if (!req.delivered) return true // Not delivered yet - include
        const deliveredAge = now - (req.deliveredAt || 0)
        return deliveredAge > fiveMinutes // Re-deliver if stuck for 5+ mins
      })
      .filter((req: any) => !req.createdAt || now - req.createdAt < oneHour) // Recent only

    console.log("[Storage] Found", pending.length, "pending requests")
    return pending
  },

  // For debugging
  getAllRequests: () => {
    tryLoadFromFile()
    return Object.values(memoryStore)
  },
}
