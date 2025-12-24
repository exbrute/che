import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ADMINS_FILE = path.join(process.cwd(), "data", "admins.json")

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const { active } = await request.json()
    const admins = JSON.parse(fs.readFileSync(ADMINS_FILE, "utf-8"))

    const adminIndex = admins.findIndex((a: any) => a.id === params.id)
    if (adminIndex !== -1) {
      admins[adminIndex].active = active
      fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2))
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating admin:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
