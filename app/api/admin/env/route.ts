import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

const ENV_FILE_PATH = path.join(process.cwd(), ".env")

function readEnvFile() {
  if (!fs.existsSync(ENV_FILE_PATH)) {
    return []
  }
  const content = fs.readFileSync(ENV_FILE_PATH, "utf-8")
  const lines = content.split("\n")
  const variables = []

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const [key, ...valueParts] = trimmed.split("=")
    if (key) {
      variables.push({
        key: key.trim(),
        value: valueParts.join("=").trim(),
        description: "", // Description parsing from comments is complex, skipping for now
      })
    }
  }
  return variables
}

function writeEnvFile(variables: { key: string; value: string }[]) {
  const content = variables.map((v) => `${v.key}=${v.value}`).join("\n")
  fs.writeFileSync(ENV_FILE_PATH, content)
}

export async function GET() {
  try {
    let envContent = ""
    if (fs.existsSync(ENV_FILE_PATH)) {
      envContent = fs.readFileSync(ENV_FILE_PATH, "utf-8")
    }

    const envVars: Record<string, string> = {}
    envContent.split("\n").forEach((line) => {
      const match = line.match(/^([^=]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        envVars[key] = value
      }
    })

    // Ensure default values exist in response if not in file
    if (!envVars["CONNECTION_MODE"]) envVars["CONNECTION_MODE"] = "MANUAL"
    if (!envVars["API_URL"]) envVars["API_URL"] = "http://localhost:3000"

    const variables = Object.entries(envVars).map(([key, value]) => ({
      key,
      value,
      description: "",
    }))

    return NextResponse.json({ variables })
  } catch (error) {
    return NextResponse.json({ error: "Failed to read env file" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { key, value } = await request.json()

    const variables = readEnvFile()
    const index = variables.findIndex((v) => v.key === key)

    if (index !== -1) {
      variables[index].value = value
    } else {
      variables.push({ key, value })
    }

    writeEnvFile(variables)
    console.log("[v0] Environment variable updated:", key)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error adding env var:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const { key, value } = await req.json()

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    let envContent = ""
    if (fs.existsSync(ENV_FILE_PATH)) {
      envContent = fs.readFileSync(ENV_FILE_PATH, "utf-8")
    }

    const lines = envContent.split("\n")
    let keyFound = false

    // Process lines to find and update key
    const newLines = lines.map((line) => {
      const lineKey = line.split("=")[0].trim()
      if (lineKey === key) {
        keyFound = true
        // Handle empty value case
        if (value === "" || value === undefined || value === null) {
          return `${key}=`
        }
        return `${key}="${value}"`
      }
      return line
    })

    // If key didn't exist, add it
    if (!keyFound) {
      if (newLines.length > 0 && newLines[newLines.length - 1] !== "") {
        newLines.push("")
      }
      // Handle empty value case
      if (value === "" || value === undefined || value === null) {
        newLines.push(`${key}=`)
      } else {
        newLines.push(`${key}="${value}"`)
      }
    }

    fs.writeFileSync(ENV_FILE_PATH, newLines.join("\n"))

    return NextResponse.json({ success: true, key, value })
  } catch (error) {
    console.error("Error writing env file:", error)
    return NextResponse.json({ error: "Failed to update env file" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get("key")

    let variables = readEnvFile()
    variables = variables.filter((v) => v.key !== key)

    writeEnvFile(variables)
    console.log("[v0] Environment variable deleted:", key)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting env var:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
