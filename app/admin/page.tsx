"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Activity,
  Zap,
  Globe,
  Server,
  Database,
  Lock,
  Eye,
  TrendingUp,
  Users,
  Shield,
  Settings,
  Key,
  UserPlus,
  FileText,
  Terminal,
  RefreshCw,
  Bot,
  Plus,
  Trash2,
} from "lucide-react"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart"
import { BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

interface BotConnection {
  id: string
  chatId: string
  ip: string
  status: "active" | "idle" | "error"
  lastActivity: string
  requestCount: number
  country: string
}

interface BotConfig {
  id: string
  name: string
  token: string
  chatId: string
  webhookUrl: string
  status: "active" | "inactive"
  createdAt: string
  requestCount: number
}

interface Admin {
  id: string
  username: string
  role: "super_admin" | "admin" | "viewer"
  permissions: string[]
  createdAt: string
  lastLogin: string
  active: boolean
}

interface EnvVariable {
  key: string
  value: string
  description: string
}

interface ChartDataPoint {
  time: string
  requests: number
  success: number
  errors: number
}

// Changed TabType to include "bots"
type TabType = "dashboard" | "bots" | "admins" | "env" | "logs" | "settings"

export default function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  // Changed initial activeTab to "dashboard"
  const [activeTab, setActiveTab] = useState<TabType>("dashboard")
  const [stats, setStats] = useState({
    totalRequests: 0,
    activeBots: 0,
    successRate: 0,
    uptime: "0h 0m",
  })
  const [connections, setConnections] = useState<BotConnection[]>([])
  const [admins, setAdmins] = useState<Admin[]>([])
  const [envVars, setEnvVars] = useState<EnvVariable[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  const [bots, setBots] = useState<BotConfig[]>([])
  const [chartData, setChartData] = useState<ChartDataPoint[]>([])

  // New admin form
  const [newAdmin, setNewAdmin] = useState({
    username: "",
    password: "",
    role: "viewer" as Admin["role"],
  })

  // New env var form
  const [newEnvVar, setNewEnvVar] = useState({
    key: "",
    value: "",
    description: "",
  })

  const [newBot, setNewBot] = useState({
    name: "",
    token: "",
    chatId: "",
    webhookUrl: "",
  })

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData()
      const interval = setInterval(loadDashboardData, 5000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const loadDashboardData = async () => {
    try {
      const response = await fetch("/api/admin/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setConnections(data.connections)
        if (data.chartData) {
          setChartData(data.chartData)
        }
      }

      const botsResponse = await fetch("/api/admin/bots")
      if (botsResponse.ok) {
        const botsData = await botsResponse.json()
        setBots(botsData.bots)
      }

      // Load admins
      const adminsResponse = await fetch("/api/admin/users")
      if (adminsResponse.ok) {
        const adminsData = await adminsResponse.json()
        setAdmins(adminsData.admins)
      }

      // Load env vars
      const envResponse = await fetch("/api/admin/env")
      if (envResponse.ok) {
        const envData = await envResponse.json()
        setEnvVars(envData.variables)
      }

      // Load logs
      const logsResponse = await fetch("/api/admin/logs")
      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setLogs(logsData.logs)
      }
    } catch (error) {
      console.error("Failed to load dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === "pupete2332") {
      setIsAuthenticated(true)
      setError("")
    } else {
      setError("Неверный пароль")
      setTimeout(() => setError(""), 3000)
    }
  }

  const handleCreateBot = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newBot),
      })
      if (response.ok) {
        setNewBot({ name: "", token: "", chatId: "", webhookUrl: "" })
        loadDashboardData()
      }
    } catch (error) {
      console.error("Failed to create bot:", error)
    }
  }

  const handleDeleteBot = async (botId: string) => {
    try {
      await fetch(`/api/admin/bots/${botId}`, {
        method: "DELETE",
      })
      loadDashboardData()
    } catch (error) {
      console.error("Failed to delete bot:", error)
    }
  }

  const handleToggleBot = async (botId: string, status: "active" | "inactive") => {
    try {
      console.log("[v0] Toggling bot:", botId, "to status:", status)

      await fetch(`/api/admin/bots/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      loadDashboardData()
    } catch (error) {
      console.error("Failed to toggle bot:", error)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAdmin),
      })
      if (response.ok) {
        setNewAdmin({ username: "", password: "", role: "viewer" })
        loadDashboardData()
      }
    } catch (error) {
      console.error("Failed to create admin:", error)
    }
  }

  const handleToggleAdmin = async (adminId: string, active: boolean) => {
    try {
      await fetch(`/api/admin/users/${adminId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active }),
      })
      loadDashboardData()
    } catch (error) {
      console.error("Failed to toggle admin:", error)
    }
  }

  const handleAddEnvVar = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch("/api/admin/env", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEnvVar),
      })
      if (response.ok) {
        setNewEnvVar({ key: "", value: "", description: "" })
        loadDashboardData()
      }
    } catch (error) {
      console.error("Failed to add env var:", error)
    }
  }

  const handleDeleteEnvVar = async (key: string) => {
    try {
      await fetch(`/api/admin/env?key=${key}`, {
        method: "DELETE",
      })
      loadDashboardData()
    } catch (error) {
      console.error("Failed to delete env var:", error)
    }
  }

  // Function to update a specific env variable
  const handleUpdateEnv = async (key: string, value: string) => {
    try {
      const response = await fetch("/api/admin/env", {
        method: "PUT", // Use PUT to update existing
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      })
      if (response.ok) {
        loadDashboardData() // Reload data to reflect changes
      } else {
        console.error("Failed to update env var:", response.statusText)
      }
    } catch (error) {
      console.error("Failed to update env var:", error)
    }
  }

  const chartConfig = {
    requests: {
      label: "Запросы",
      color: "hsl(217, 91%, 60%)",
    },
    success: {
      label: "Успешные",
      color: "hsl(142, 76%, 36%)",
    },
    errors: {
      label: "Ошибки",
      color: "hsl(0, 84%, 60%)",
    },
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-gray-900/80 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8 shadow-2xl shadow-blue-500/20">
            <div className="flex items-center justify-center mb-8">
              <div className="relative">
                <Shield className="w-16 h-16 text-blue-400 animate-pulse" />
                <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Админ Панель
            </h1>
            <p className="text-gray-400 text-center mb-8">Введите пароль для доступа</p>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Пароль"
                  className="w-full px-4 py-3 bg-gray-800/50 border border-blue-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all"
                  autoFocus
                />
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg text-sm text-center animate-shake">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-600 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-500/30"
              >
                Войти
              </button>
            </form>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-blue-950 to-purple-950 text-white">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-gray-900/80 backdrop-blur-xl border-r border-blue-500/30 p-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-8 h-8 text-blue-400" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Admin Panel
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-full w-fit">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-green-400 text-xs">Online</span>
          </div>
        </div>

        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "dashboard"
                ? "bg-blue-500/20 border border-blue-500/30 text-blue-400"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <Activity className="w-5 h-5" />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("bots")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "bots"
                ? "bg-cyan-500/20 border border-cyan-500/30 text-cyan-400"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <Bot className="w-5 h-5" />
            <span>Боты</span>
          </button>

          <button
            onClick={() => setActiveTab("admins")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "admins"
                ? "bg-purple-500/20 border border-purple-500/30 text-purple-400"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Админы</span>
          </button>

          <button
            onClick={() => setActiveTab("env")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "env"
                ? "bg-green-500/20 border border-green-500/30 text-green-400"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <Key className="w-5 h-5" />
            <span>Env Variables</span>
          </button>

          <button
            onClick={() => setActiveTab("logs")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "logs"
                ? "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <FileText className="w-5 h-5" />
            <span>Логи</span>
          </button>

          <button
            onClick={() => setActiveTab("settings")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              activeTab === "settings"
                ? "bg-pink-500/20 border border-pink-500/30 text-pink-400"
                : "text-gray-400 hover:bg-gray-800/50"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span>Настройки</span>
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {activeTab === "dashboard" && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Dashboard
              </h2>
              <button
                onClick={loadDashboardData}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-900/60 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-blue-400/50 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Activity className="w-8 h-8 text-blue-400" />
                    <TrendingUp className="w-5 h-5 text-green-400" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.totalRequests}</div>
                  <div className="text-gray-400 text-sm">Всего запросов</div>
                </div>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-purple-400/50 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Users className="w-8 h-8 text-purple-400" />
                    <div className="flex gap-1">
                      <div className="w-2 h-6 bg-purple-400 rounded animate-pulse" />
                      <div className="w-2 h-4 bg-purple-400/60 rounded animate-pulse delay-100" />
                      <div className="w-2 h-5 bg-purple-400/40 rounded animate-pulse delay-200" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.activeBots}</div>
                  <div className="text-gray-400 text-sm">Активных ботов</div>
                </div>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-green-400/50 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl group-hover:bg-green-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Zap className="w-8 h-8 text-green-400" />
                    <div className="text-green-400 text-sm font-semibold">+12%</div>
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.successRate}%</div>
                  <div className="text-gray-400 text-sm">Success Rate</div>
                </div>
              </div>

              <div className="bg-gray-900/60 backdrop-blur-xl border border-pink-500/30 rounded-xl p-6 relative overflow-hidden group hover:border-pink-400/50 transition-all">
                <div className="absolute top-0 right-0 w-24 h-24 bg-pink-500/10 rounded-full blur-2xl group-hover:bg-pink-500/20 transition-all" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <Server className="w-8 h-8 text-pink-400" />
                    <Eye className="w-5 h-5 text-gray-400" />
                  </div>
                  <div className="text-3xl font-bold mb-1">{stats.uptime}</div>
                  <div className="text-gray-400 text-sm">Uptime</div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Requests Chart */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                  Активность запросов
                </h3>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(217, 91%, 20%)" />
                      <XAxis dataKey="time" stroke="hsl(217, 91%, 40%)" />
                      <YAxis stroke="hsl(217, 91%, 40%)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Area
                        type="monotone"
                        dataKey="requests"
                        stroke="hsl(217, 91%, 60%)"
                        fill="url(#colorRequests)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>

              {/* Success vs Errors Chart */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-green-400" />
                  Успешные vs Ошибки
                </h3>
                <ChartContainer config={chartConfig} className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(142, 76%, 20%)" />
                      <XAxis dataKey="time" stroke="hsl(142, 76%, 40%)" />
                      <YAxis stroke="hsl(142, 76%, 40%)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <ChartLegend content={<ChartLegendContent />} />
                      <Bar dataKey="success" fill="hsl(142, 76%, 36%)" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="errors" fill="hsl(0, 84%, 60%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>

            {/* Active Connections */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Database className="w-6 h-6 text-blue-400" />
                <h3 className="text-2xl font-bold">Подключенные боты</h3>
                <div className="ml-auto px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-sm">
                  {connections.length} активных
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-400 rounded-full animate-spin" />
                    <div className="absolute inset-0 bg-blue-500/20 blur-xl" />
                  </div>
                </div>
              ) : connections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <Globe className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Нет активных подключений</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 hover:border-blue-500/30 transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                conn.status === "active"
                                  ? "bg-green-400 animate-pulse"
                                  : conn.status === "idle"
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                              }`}
                            />
                            <div
                              className={`absolute inset-0 blur-md ${
                                conn.status === "active"
                                  ? "bg-green-400"
                                  : conn.status === "idle"
                                    ? "bg-yellow-400"
                                    : "bg-red-400"
                              }`}
                            />
                          </div>

                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-white">Chat ID: {conn.chatId}</span>
                              <span className="text-xs px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
                                {conn.country}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-400">
                              <span className="flex items-center gap-1">
                                <Globe className="w-3 h-3" />
                                {conn.ip}
                              </span>
                              <span>{conn.requestCount} запросов</span>
                              <span>Активность: {conn.lastActivity}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-lg text-sm transition-all">
                            Детали
                          </button>
                          <button className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm transition-all">
                            Отключить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "bots" && (
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-8">
              Управление ботами
            </h2>

            {/* Add New Bot */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-cyan-400" />
                Добавить нового бота
              </h3>
              <form onSubmit={handleCreateBot} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Название бота</label>
                    <input
                      type="text"
                      placeholder="My Telegram Bot"
                      value={newBot.name}
                      onChange={(e) => setNewBot({ ...newBot, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Chat ID</label>
                    <input
                      type="text"
                      placeholder="123456789"
                      value={newBot.chatId}
                      onChange={(e) => setNewBot({ ...newBot, chatId: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Bot Token</label>
                  <input
                    type="text"
                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                    value={newBot.token}
                    onChange={(e) => setNewBot({ ...newBot, token: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-2">Webhook URL (опционально)</label>
                  <input
                    type="url"
                    placeholder="https://your-domain.com/api/webhook"
                    value={newBot.webhookUrl}
                    onChange={(e) => setNewBot({ ...newBot, webhookUrl: e.target.value })}
                    className="w-full px-4 py-2 bg-gray-800/50 border border-cyan-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-600 transition-all transform hover:scale-[1.01]"
                >
                  Добавить бота
                </button>
              </form>
            </div>

            {/* Bots List */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-cyan-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Bot className="w-5 h-5 text-cyan-400" />
                Список ботов ({bots.length})
              </h3>
              <div className="space-y-3">
                {bots.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bot className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p>Нет добавленных ботов</p>
                  </div>
                ) : (
                  bots.map((bot) => (
                    <div
                      key={bot.id}
                      className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Bot className="w-5 h-5 text-cyan-400" />
                            <span className="font-semibold text-white text-lg">{bot.name}</span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded ${
                                bot.status === "active"
                                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                  : "bg-gray-500/20 text-gray-400 border border-gray-500/30"
                              }`}
                            >
                              {bot.status === "active" ? "Активен" : "Неактивен"}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400 mb-2">
                            <div className="flex items-center gap-2">
                              <Key className="w-3 h-3" />
                              <span className="font-mono text-xs">{bot.token.slice(0, 20)}...</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Users className="w-3 h-3" />
                              <span>Chat ID: {bot.chatId}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Globe className="w-3 h-3" />
                              <span className="truncate">{bot.webhookUrl || "Webhook не настроен"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="w-3 h-3" />
                              <span>{bot.requestCount} запросов</span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500">Создан: {bot.createdAt}</div>
                        </div>
                        <div className="flex flex-col gap-2 ml-4">
                          <div className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-lg">
                            <span className="text-sm text-gray-300">Прием запросов:</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={bot.status === "active"}
                                onChange={() =>
                                  handleToggleBot(bot.id, bot.status === "active" ? "inactive" : "active")
                                }
                              />
                              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-cyan-400/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500" />
                            </label>
                          </div>
                          <button
                            onClick={() => handleDeleteBot(bot.id)}
                            className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 justify-center"
                          >
                            <Trash2 className="w-3 h-3" />
                            Удалить
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "admins" && (
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-8">
              Управление админами
            </h2>

            {/* Create New Admin */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                Создать нового админа
              </h3>
              <form onSubmit={handleCreateAdmin} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Username"
                  value={newAdmin.username}
                  onChange={(e) => setNewAdmin({ ...newAdmin, username: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  required
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400"
                  required
                />
                <select
                  value={newAdmin.role}
                  onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as Admin["role"] })}
                  className="px-4 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2 rounded-lg font-semibold hover:from-purple-600 hover:to-pink-600 transition-all"
                >
                  Создать
                </button>
              </form>
            </div>

            {/* Admins List */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Список админов</h3>
              <div className="space-y-3">
                {admins.map((admin) => (
                  <div
                    key={admin.id}
                    className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-semibold text-white">{admin.username}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded ${
                            admin.role === "super_admin"
                              ? "bg-red-500/20 text-red-400"
                              : admin.role === "admin"
                                ? "bg-purple-500/20 text-purple-400"
                                : "bg-blue-500/20 text-blue-400"
                          }`}
                        >
                          {admin.role}
                        </span>
                        {admin.active && (
                          <span className="flex items-center gap-1 text-xs text-green-400">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            Active
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-400">
                        Создан: {admin.createdAt} | Последний вход: {admin.lastLogin}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Права: {admin.permissions.join(", ")}</div>
                    </div>
                    <button
                      onClick={() => handleToggleAdmin(admin.id, !admin.active)}
                      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                        admin.active
                          ? "bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400"
                          : "bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400"
                      }`}
                    >
                      {admin.active ? "Деактивировать" : "Активировать"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "env" && (
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent mb-8">
              Environment Variables
            </h2>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-blue-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-400" />
                Режим подключения (Connection Mode)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => handleUpdateEnv("CONNECTION_MODE", "MANUAL")}
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    // Check if envVars['CONNECTION_MODE'] is defined and matches 'MANUAL'
                    envVars.find((v) => v.key === "CONNECTION_MODE")?.value === "MANUAL"
                      ? "bg-blue-500/20 border-blue-500"
                      : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">Manual Endpoint</span>
                    {envVars.find((v) => v.key === "CONNECTION_MODE")?.value === "MANUAL" && (
                      <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Подключение к указанному API URL. Туннель НЕ запускается. Используйте для Vercel или удаленных
                    серверов.
                  </p>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-500 uppercase">Target API URL</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={envVars.find((v) => v.key === "API_URL")?.value || ""}
                        onChange={(e) => {
                          // Temporarily update state for immediate feedback, but rely on handleUpdateEnv for persistence
                          const updatedEnvVars = envVars.map((v) =>
                            v.key === "API_URL" ? { ...v, value: e.target.value } : v,
                          )
                          // Ensure API_URL exists if not already present for temporary update
                          if (!envVars.some((v) => v.key === "API_URL")) {
                            updatedEnvVars.push({ key: "API_URL", value: e.target.value, description: "" })
                          }
                          setEnvVars(updatedEnvVars)
                        }}
                        onBlur={(e) => handleUpdateEnv("API_URL", e.target.value)}
                        className="flex-1 bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                        placeholder="https://your-app.vercel.app"
                      />
                      <button
                        onClick={() =>
                          handleUpdateEnv("API_URL", envVars.find((v) => v.key === "API_URL")?.value || "")
                        }
                        className="px-3 py-2 bg-blue-600 hover:bg-blue-500 rounded text-xs font-bold transition-colors"
                      >
                        SAVE
                      </button>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => handleUpdateEnv("CONNECTION_MODE", "TUNNEL")}
                  className={`cursor-pointer p-4 rounded-lg border transition-all ${
                    envVars.find((v) => v.key === "CONNECTION_MODE")?.value === "TUNNEL"
                      ? "bg-green-500/20 border-green-500"
                      : "bg-gray-800/30 border-gray-700 hover:border-gray-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white">Auto Tunnel (Tuna)</span>
                    {envVars.find((v) => v.key === "CONNECTION_MODE")?.value === "TUNNEL" && (
                      <div className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-4">
                    Бот автоматически запустит Tuna туннель для локального порта 3000. Идеально для локальной
                    разработки.
                  </p>
                  <div className="text-xs text-yellow-400/80 bg-yellow-400/10 p-2 rounded border border-yellow-400/20">
                    ⚠️ При выборе этого режима, бот будет игнорировать API_URL и использовать localhost:3000
                  </div>
                </div>
              </div>
            </div>

            {/* Add New Env Var */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6 mb-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Key className="w-5 h-5 text-green-400" />
                Добавить переменную
              </h3>
              <form onSubmit={handleAddEnvVar} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="KEY"
                  value={newEnvVar.key}
                  onChange={(e) => setNewEnvVar({ ...newEnvVar, key: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newEnvVar.value}
                  onChange={(e) => setNewEnvVar({ ...newEnvVar, value: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400 font-mono"
                  required
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={newEnvVar.description}
                  onChange={(e) => setNewEnvVar({ ...newEnvVar, description: e.target.value })}
                  className="px-4 py-2 bg-gray-800/50 border border-green-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-green-400"
                />
                <button
                  type="submit"
                  className="bg-gradient-to-r from-green-500 to-blue-500 text-white py-2 rounded-lg font-semibold hover:from-green-600 hover:to-blue-600 transition-all"
                >
                  Добавить
                </button>
              </form>
            </div>

            {/* Env Vars List */}
            <div className="bg-gray-900/60 backdrop-blur-xl border border-green-500/30 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Переменные окружения</h3>
              <div className="space-y-3">
                {envVars.map((envVar) => (
                  <div
                    key={envVar.key}
                    className="bg-gray-800/40 border border-gray-700/50 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="font-mono text-green-400 font-semibold mb-1">{envVar.key}</div>
                      <div className="font-mono text-sm text-gray-400 mb-2">{envVar.value}</div>
                      {envVar.description && <div className="text-xs text-gray-500">{envVar.description}</div>}
                    </div>
                    <button
                      onClick={() => handleDeleteEnvVar(envVar.key)}
                      className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-all"
                    >
                      Удалить
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "logs" && (
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-8">
              Системные логи
            </h2>

            <div className="bg-gray-900/60 backdrop-blur-xl border border-yellow-500/30 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-yellow-400" />
                  Последние события
                </h3>
                <button
                  onClick={loadDashboardData}
                  className="px-3 py-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm transition-all"
                >
                  Обновить
                </button>
              </div>

              <div className="bg-gray-950/50 rounded-lg p-4 font-mono text-sm space-y-1 max-h-96 overflow-y-auto">
                {logs.length === 0 ? (
                  <div className="text-gray-500 text-center py-8">Нет доступных логов</div>
                ) : (
                  logs.map((log, index) => (
                    <div key={index} className="text-gray-300 hover:bg-gray-800/30 px-2 py-1 rounded">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "settings" && (
          <div>
            <h2 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-8">
              Настройки системы
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Security Settings */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-pink-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-pink-400" />
                  Безопасность
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Двухфакторная аутентификация</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">IP Whitelist</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Auto-logout (30min)</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                </div>
              </div>

              {/* Notification Settings */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-pink-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-pink-400" />
                  Уведомления
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Email уведомления</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Push уведомления</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Критические ошибки</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500" />
                    </label>
                  </div>
                </div>
              </div>

              {/* System Info */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-pink-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Server className="w-5 h-5 text-pink-400" />
                  Системная информация
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Версия:</span>
                    <span className="text-white font-mono">v2.1.4</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Node.js:</span>
                    <span className="text-white font-mono">v20.10.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Database:</span>
                    <span className="text-white font-mono">PostgreSQL 15.3</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Memory:</span>
                    <span className="text-white font-mono">1.2 GB / 4 GB</span>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-gray-900/60 backdrop-blur-xl border border-red-500/30 rounded-xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 text-red-400">
                  <Shield className="w-5 h-5" />
                  Опасная зона
                </h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 rounded-lg text-sm font-semibold transition-all">
                    Очистить логи
                  </button>
                  <button className="w-full px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 text-orange-400 rounded-lg text-sm font-semibold transition-all">
                    Перезапустить систему
                  </button>
                  <button className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 rounded-lg text-sm font-semibold transition-all">
                    Сбросить все настройки
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
