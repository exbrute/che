import { NextResponse } from "next/server"

interface BotConfig {
  id: string
  name: string
  token: string
  chatId: string
  webhookUrl: string
  status: "active" | "inactive"
  enabled: boolean
  createdAt: string
  requestCount: number
}

let botsCache: BotConfig[] = [
  {
    id: "default-bot-1",
    name: "Main Bot",
    token: "8437625246:AAGpNrLk-piaMfakjLr7PIdFF36YSktdp_c",
    chatId: "6233384461",
    webhookUrl: "",
    status: "active",
    enabled: true,
    createdAt: new Date().toLocaleString("ru-RU"),
    requestCount: 0,
  },
]

export const runtime = 'nodejs'

export async function GET() {
  try {
    console.log("[v0] GET /api/admin/bots - returning", botsCache.length, "bots")
    return NextResponse.json({ bots: botsCache })
  } catch (error) {
    console.error("[v0] Error loading bots:", error)
    return NextResponse.json({ 
      error: "Failed to load bots",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, token, chatId, webhookUrl } = await request.json()

    console.log("[v0] Creating bot with data:", { name, token: token?.slice(0, 10) + '...', chatId, webhookUrl })

    if (!name || !token || !chatId) {
      console.log("[v0] Missing required fields")
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const newBot: BotConfig = {
      id: Date.now().toString(),
      name,
      token,
      chatId,
      webhookUrl: webhookUrl || "",
      status: "active",
      enabled: true,
      createdAt: new Date().toLocaleString("ru-RU"),
      requestCount: 0,
    }

    botsCache.push(newBot)
    console.log("[v0] Bot created successfully with ID:", newBot.id)
    console.log("[v0] Total bots now:", botsCache.length)

    return NextResponse.json({ success: true, bot: newBot })
  } catch (error) {
    console.error("[v0] Error creating bot:", error)
    return NextResponse.json({ 
      error: "Failed to create bot", 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 })
  }
}
