import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Try to get country from Vercel's geo headers first
    const countryCode = request.headers.get("x-vercel-ip-country")

    if (countryCode) {
      // Map country code to calling code
      const countryToCallingCode: Record<string, string> = {
        RU: "+7",
        US: "+1",
        GB: "+44",
        DE: "+49",
        FR: "+33",
        IT: "+39",
        ES: "+34",
        NL: "+31",
        BE: "+32",
        CH: "+41",
        AT: "+43",
        SE: "+46",
        NO: "+47",
        DK: "+45",
        FI: "+358",
        PL: "+48",
        UA: "+380",
        KZ: "+7",
        BY: "+375",
        TR: "+90",
        CN: "+86",
        JP: "+81",
        KR: "+82",
        IN: "+91",
        AU: "+61",
        NZ: "+64",
        CA: "+1",
        MX: "+52",
        BR: "+55",
        AR: "+54",
        CL: "+56",
        CO: "+57",
        PE: "+51",
        VE: "+58",
        ZA: "+27",
        EG: "+20",
        IL: "+972",
        SA: "+966",
        AE: "+971",
        SG: "+65",
        MY: "+60",
        TH: "+66",
        VN: "+84",
        PH: "+63",
        ID: "+62",
      }

      const callingCode = countryToCallingCode[countryCode]
      if (callingCode) {
        return NextResponse.json({
          country_calling_code: callingCode,
          country_code: countryCode,
        })
      }
    }

    // Fallback: Default to Russia
    return NextResponse.json({
      country_calling_code: "+7",
      country_code: "RU",
    })
  } catch (error) {
    console.error("[v0] Country detection error:", error)
    // Default to Russia if detection fails
    return NextResponse.json({
      country_calling_code: "+7",
      country_code: "RU",
    })
  }
}
