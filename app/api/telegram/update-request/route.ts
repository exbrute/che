import { type NextRequest, NextResponse } from "next/server"
import { storage } from "../storage"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("X-Bot-Token")
    const envToken = process.env.BOT_TOKEN

    if (envToken && authHeader !== envToken) {
      console.log("[API] ⛔ Unauthorized update attempt")
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, X-Bot-Token",
          },
        },
      )
    }

    const body = await request.json()
    const { requestId, result, status, message, processed } = body

    const finalStatus = status || result?.status
    const finalMessage = message || result?.message

    if (!requestId) {
      return NextResponse.json({ error: "requestId required" }, { status: 400 })
    }

    console.log(`[API] Update request ${requestId}:`, finalStatus)

    // Update the request in memory with the result from bot
    // Mark as processed so it's not picked up again by get-pending
    storage.updateRequest(requestId, {
      status: finalStatus,
      message: finalMessage,
      processed: processed !== undefined ? processed : true, // Mark as handled by bot
      lastUpdated: new Date().toISOString(),
    })

    return NextResponse.json(
      { success: true },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Bot-Token",
        },
      },
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: String(error) },
      {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, X-Bot-Token", // Ensure headers on error too
        },
      },
    )
  }
}

export async function OPTIONS(request: Request) {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, X-Bot-Token",
      },
    },
  )
}
