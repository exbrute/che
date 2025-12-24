import { NextResponse } from "next/server"

export const runtime = 'nodejs'

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

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await request.json()
    const botIndex = botsCache.findIndex((b) => b.id === params.id)

    if (botIndex === -1) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    botsCache[botIndex] = { ...botsCache[botIndex], ...updates }
    console.log("[v0] Bot updated:", botsCache[botIndex])

    return NextResponse.json({ success: true, bot: botsCache[botIndex] })
  } catch (error) {
    console.error("[v0] Error updating bot:", error)
    return NextResponse.json({ error: "Failed to update bot" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const botIndex = botsCache.findIndex((b) => b.id === params.id)

    if (botIndex === -1) {
      return NextResponse.json({ error: "Bot not found" }, { status: 404 })
    }

    botsCache.splice(botIndex, 1)
    console.log("[v0] Bot deleted, remaining bots:", botsCache.length)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting bot:", error)
    return NextResponse.json({ error: "Failed to delete bot" }, { status: 500 })
  }
}
