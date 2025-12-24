import { type NextRequest, NextResponse } from "next/server"
import { storage } from "../storage"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestId = searchParams.get("requestId")

    if (!requestId) {
      return NextResponse.json({ success: false, error: "requestId required" })
    }

    const req = storage.getRequest(requestId)

    if (!req) {
      return NextResponse.json({ success: false, error: "Request not found" })
    }

    // Return the full request object which includes any updates from the bot
    return NextResponse.json({
      success: true,
      data: req,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) })
  }
}
