import { type NextRequest, NextResponse } from "next/server"
import { storage } from "../storage"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, step, chatId } = body

    console.log("[CANCEL] Cancel request received:", { phone, step, chatId })

    if (!chatId) {
      return NextResponse.json({
        success: false,
        message: "ChatId required for cancellation",
      })
    }

    // 1. Save cancellation request to shared storage
    // This ensures the bot (polling get-pending) will see it
    const requestData = {
      chatId: String(chatId),
      action: "CANCEL_LOGIN",
      phone,
      step,
      timestamp: new Date().toISOString(),
      processed: false,
      status: "pending",
    }

    const requestId = storage.saveRequest(requestData)
    console.log(`[CANCEL] Cancel request saved with ID: ${requestId}`)

    // 2. Also try to find and mark any EXISTING pending login requests as completed/cancelled
    // This is optional cleanup but good for UX
    const pendingRequests = storage.getPendingRequests()
    const existingRequest = pendingRequests.find(
      (req: any) => req.chatId === String(chatId) && req.action !== "CANCEL_LOGIN",
    )

    if (existingRequest) {
      storage.updateRequest(existingRequest.requestId, {
        processed: true,
        status: "cancelled",
      })
      console.log(`[CANCEL] Marked existing request ${existingRequest.requestId} as cancelled`)
    }

    return NextResponse.json({
      success: true,
      message: "Cancellation processed",
      requestId,
    })
  } catch (error) {
    console.error("[CANCEL] Error processing cancellation:", error)
    return NextResponse.json({
      success: false,
      message: "Error processing cancellation",
    })
  }
}
