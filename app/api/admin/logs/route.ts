import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    const logsDir = path.join(process.cwd(), "telegram_requests")

    if (!fs.existsSync(logsDir)) {
      return NextResponse.json({ logs: [] })
    }

    const files = fs.readdirSync(logsDir).filter((f) => f.endsWith(".json"))

    const logs = files
      .slice(-20)
      .reverse()
      .map((file) => {
        try {
          const filePath = path.join(logsDir, file)
          const data = JSON.parse(fs.readFileSync(filePath, "utf-8"))
          const timestamp = new Date(data.timestamp || Date.now()).toLocaleString("ru-RU")
          return `[${timestamp}] Request from chatId: ${data.chatId} | Phone: ${data.phone || "N/A"} | Status: ${data.status || "pending"}`
        } catch {
          return null
        }
      })
      .filter(Boolean)

    return NextResponse.json({ logs })
  } catch (error) {
    console.error("Error reading logs:", error)
    return NextResponse.json({ logs: [] })
  }
}
