import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ADMINS_FILE = path.join(process.cwd(), "data", "admins.json")

// Ensure data directory exists
function ensureDataDir() {
  const dataDir = path.join(process.cwd(), "data")
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }
  if (!fs.existsSync(ADMINS_FILE)) {
    fs.writeFileSync(
      ADMINS_FILE,
      JSON.stringify(
        [
          {
            id: "1",
            username: "superadmin",
            role: "super_admin",
            permissions: ["all"],
            createdAt: new Date().toLocaleDateString("ru-RU"),
            lastLogin: new Date().toLocaleString("ru-RU"),
            active: true,
          },
        ],
        null,
        2,
      ),
    )
  }
}

export async function GET() {
  try {
    ensureDataDir()
    const data = JSON.parse(fs.readFileSync(ADMINS_FILE, "utf-8"))
    return NextResponse.json({ admins: data })
  } catch (error) {
    console.error("Error reading admins:", error)
    return NextResponse.json({ admins: [] })
  }
}

export async function POST(request: Request) {
  try {
    ensureDataDir()
    const { username, password, role } = await request.json()

    const admins = JSON.parse(fs.readFileSync(ADMINS_FILE, "utf-8"))

    const permissions =
      role === "super_admin" ? ["all"] : role === "admin" ? ["view", "edit", "manage_bots"] : ["view"]

    const newAdmin = {
      id: Date.now().toString(),
      username,
      role,
      permissions,
      createdAt: new Date().toLocaleDateString("ru-RU"),
      lastLogin: "Никогда",
      active: true,
    }

    admins.push(newAdmin)
    fs.writeFileSync(ADMINS_FILE, JSON.stringify(admins, null, 2))

    return NextResponse.json({ success: true, admin: newAdmin })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json({ success: false, error: "Failed to create admin" }, { status: 500 })
  }
}
