'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { ShieldCheck, Server, Cloud, Activity, Lock, ArrowUpRight } from 'lucide-react'

type Metric = {
  key: string
  label: string
  value: number
  unit?: string
  icon: React.ElementType
  sub: string
}

type LogItem = {
  id: string
  ts: string
  level: 'INFO' | 'WARN' | 'BLOCK'
  msg: string
  meta?: string
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n))
}

function fmtInt(n: number) {
  return n.toLocaleString('en-US')
}

function nowHHMMSS() {
  const d = new Date()
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function INIT_CLOCK() {
  return '--:--:--'
}

// ✅ Sparkline con color accent en lugar de blanco puro → más legible y coherente
function Sparkline({ values }: { values: number[] }) {
  const ref = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const c = ref.current
    if (!c) return
    const ctx = c.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const w = 120
    const h = 36
    c.width = w * dpr
    c.height = h * dpr
    c.style.width = `${w}px`
    c.style.height = `${h}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, w, h)

    if (!values || values.length < 2) return

    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = Math.max(1e-6, max - min)
    const padX = 2
    const padY = 4

    // ✅ Leer el color accent desde la CSS variable del documento
    const accentRaw =
      getComputedStyle(document.documentElement)
        .getPropertyValue('--accent')
        .trim() || '189 100% 50%'

    const accentColor = `hsl(${accentRaw})`

    const drawPath = () => {
      ctx.beginPath()
      values.forEach((v, i) => {
        const x = padX + (i / (values.length - 1)) * (w - padX * 2)
        const y = padY + (1 - (v - min) / span) * (h - padY * 2)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
    }

    // Glow layer
    ctx.lineWidth = 4
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = `hsl(${accentRaw} / 0.18)`
    drawPath()
    ctx.stroke()

    // Main line
    ctx.lineWidth = 1.5
    ctx.strokeStyle = `hsl(${accentRaw} / 0.65)`
    drawPath()
    ctx.stroke()

    // Fill under the line
    const lastX = padX + ((values.length - 1) / (values.length - 1)) * (w - padX * 2)
    const baseY = h - padY
    ctx.lineTo(lastX, baseY)
    ctx.lineTo(padX, baseY)
    ctx.closePath()
    const grad = ctx.createLinearGradient(0, padY, 0, h)
    grad.addColorStop(0, `hsl(${accentRaw} / 0.18)`)
    grad.addColorStop(1, `hsl(${accentRaw} / 0.0)`)
    ctx.fillStyle = grad
    ctx.fill()

    void accentColor // suppress unused warning
  }, [values])

  return <canvas ref={ref} className="block" />
}

// ✅ Tipo para el estado unificado de UI (métricas + series en un solo objeto)
type UIState = {
  metrics: Metric[]
  series: Record<string, number[]>
}

const INITIAL_METRICS: Metric[] = [
  { key: 'blocked', label: 'Threats blocked', value: 1284, icon: ShieldCheck, sub: 'Active mitigation' },
  { key: 'uptime', label: 'Uptime', value: 99.98, unit: '%', icon: Activity, sub: 'SLA monitoring' },
  { key: 'endpoints', label: 'Endpoints protected', value: 42, icon: Lock, sub: 'Policy enforced' },
  { key: 'backups', label: 'Backups verified', value: 14, icon: Server, sub: 'Integrity checks' },
  { key: 'cloud', label: 'Cloud services', value: 7, icon: Cloud, sub: 'Service health' },
]

export const CommandCenter = () => {
  const rand = useMemo(() => mulberry32(20260205), [])

  // ✅ Reloj como estado propio con su intervalo dedicado → siempre actualizado
  const [clock, setClock] = useState(INIT_CLOCK)
  useEffect(() => {
    setClock(nowHHMMSS())
    const id = setInterval(() => setClock(nowHHMMSS()), 1000)
    return () => clearInterval(id)
  }, [])

  // ✅ Métricas + series en un solo setState → un solo re-render por tick
  const [ui, setUI] = useState<UIState>({
    metrics: INITIAL_METRICS,
    series: {},
  })

  const [logTick, setLogTick] = useState(0)

  // ✅ Logs con timestamps fijos para evitar hydration mismatch
  const [logs, setLogs] = useState<LogItem[]>(() => [
    { id: 'l0', ts: '--:--:--', level: 'INFO', msg: 'SOC online', meta: 'NETIDIA Core' },
    { id: 'l1', ts: '--:--:--', level: 'INFO', msg: 'Backup verified OK', meta: 'Storage' },
    { id: 'l2', ts: '--:--:--', level: 'BLOCK', msg: 'Ransomware signature blocked', meta: 'Endpoint-12' },
    { id: 'l3', ts: '--:--:--', level: 'INFO', msg: 'MFA policy enforced', meta: 'Identity' },
    { id: 'l4', ts: '--:--:--', level: 'WARN', msg: 'Endpoint missing update', meta: 'Endpoint-07' },
    { id: 'l5', ts: '--:--:--', level: 'INFO', msg: 'VPN health check OK', meta: 'Remote Access' },
    { id: 'l6', ts: '--:--:--', level: 'INFO', msg: 'Service health OK', meta: 'Cloud' },
    { id: 'l7', ts: '--:--:--', level: 'INFO', msg: 'Policy sync completed', meta: 'Gateway' },
    { id: 'l8', ts: '--:--:--', level: 'INFO', msg: 'Integrity checks scheduled', meta: 'Storage' },
    { id: 'l9', ts: '--:--:--', level: 'INFO', msg: 'Telemetry heartbeat OK', meta: 'NETIDIA Core' },
    { id: 'l10', ts: '--:--:--', level: 'INFO', msg: 'Threat intel updated', meta: 'Secure Web' },
    { id: 'l11', ts: '--:--:--', level: 'INFO', msg: 'SOC ruleset loaded', meta: 'NETIDIA Core' },
    { id: 'l12', ts: '--:--:--', level: 'INFO', msg: 'Backup snapshot created', meta: 'Storage' },
    { id: 'l13', ts: '--:--:--', level: 'INFO', msg: 'Baseline established', meta: 'Ops' },
  ])

  const [lastLogId, setLastLogId] = useState<string | null>(null)

  // Init series una sola vez
  useEffect(() => {
    setUI((prev) => ({
      ...prev,
      series: {
        blocked: Array.from({ length: 24 }, () => 70 + rand() * 20),
        uptime: Array.from({ length: 24 }, () => 90 + rand() * 5),
        endpoints: Array.from({ length: 24 }, () => 40 + rand() * 10),
        backups: Array.from({ length: 24 }, () => 55 + rand() * 15),
        cloud: Array.from({ length: 24 }, () => 50 + rand() * 20),
      },
    }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ✅ Un solo intervalo para métricas + series → un re-render cada 900ms
  useEffect(() => {
    const id = setInterval(() => {
      setUI((prev) => {
        const nextMetrics = prev.metrics.map((m) => {
          if (m.key === 'blocked') {
            const inc = rand() < 0.75 ? 1 + Math.floor(rand() * 4) : 0
            return { ...m, value: m.value + inc }
          }
          if (m.key === 'uptime') {
            const v = clamp(m.value + (rand() - 0.5) * 0.01, 99.92, 100)
            return { ...m, value: Math.round(v * 100) / 100 }
          }
          if (m.key === 'endpoints') return { ...m, value: clamp(m.value + (rand() < 0.1 ? 1 : 0), 40, 80) }
          if (m.key === 'backups') return { ...m, value: clamp(m.value + (rand() < 0.2 ? 1 : 0), 10, 40) }
          if (m.key === 'cloud') return { ...m, value: clamp(m.value + (rand() < 0.08 ? 1 : 0), 5, 20) }
          return m
        })

        const nextSeries = { ...prev.series }
        const bump = (k: string, base: number, amp: number) => {
          const arr = nextSeries[k] ?? []
          if (arr.length === 0) return
          const last = arr[arr.length - 1] ?? base
          const v = last + (rand() - 0.5) * amp
          nextSeries[k] = [...arr.slice(1), clamp(v, base - amp * 2, base + amp * 2)]
        }
        bump('blocked', 80, 8)
        bump('uptime', 92, 1.5)
        bump('endpoints', 48, 2.5)
        bump('backups', 62, 3.5)
        bump('cloud', 60, 4)

        return { metrics: nextMetrics, series: nextSeries }
      })
    }, 900)
    return () => clearInterval(id)
  }, [rand])

  // Log tick separado (más lento)
  useEffect(() => {
    const id = setInterval(() => setLogTick((t) => t + 1), 4000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    const blocks = [
      ['BLOCK', 'Brute-force attempt blocked', 'Gateway'],
      ['BLOCK', 'Suspicious DNS query denied', 'Resolver'],
      ['BLOCK', 'Malware C2 connection stopped', 'Firewall'],
      ['BLOCK', 'Phishing URL blocked', 'Secure Web'],
    ] as const
    const infos = [
      ['INFO', 'Backup verified OK', 'Storage'],
      ['INFO', 'MFA policy enforced', 'Identity'],
      ['INFO', 'VPN health check OK', 'Remote Access'],
      ['INFO', 'Patch window scheduled', 'Ops'],
    ] as const
    const warns = [
      ['WARN', 'Unusual login pattern detected', 'Identity'],
      ['WARN', 'High CPU on VM node', 'Compute'],
      ['WARN', 'Endpoint missing update', 'Endpoint-07'],
    ] as const

    const roll = rand()
    const pick =
      roll < 0.55
        ? blocks[Math.floor(rand() * blocks.length)]
        : roll < 0.82
          ? infos[Math.floor(rand() * infos.length)]
          : warns[Math.floor(rand() * warns.length)]

    const n: LogItem = {
      id: `l${Date.now()}_${Math.floor(rand() * 1e6)}`,
      ts: nowHHMMSS(),
      level: pick[0],
      msg: pick[1],
      meta: pick[2],
    }

    setLogs((prev) => [n, ...prev].slice(0, 14))
    setLastLogId(n.id)

    const t = window.setTimeout(() => setLastLogId(null), 700)
    return () => window.clearTimeout(t)
  }, [logTick, rand])

  const { metrics, series } = ui
  const currentLevel = logs[0]?.level ?? 'INFO'

  return (
    <div className="relative w-full h-full">
      <div className="absolute inset-0 rounded-2xl border border-border/60 bg-card/10 backdrop-blur-md shadow-[0_0_80px_rgba(0,0,0,0.35)]" />
      <div
        className="absolute -inset-6 rounded-[28px] blur-2xl opacity-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 60% 40%, hsl(var(--accent) / 0.22), transparent 60%)' }}
      />

      <div className="relative h-full w-full p-4 sm:p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_16px_rgba(52,211,153,0.65)]" />
            <div className="text-xs sm:text-sm text-muted-foreground leading-tight">
              Netidia SOC • Live telemetry
            </div>
          </div>

          {/* ✅ clock es estado → siempre actualizado independientemente de otros renders */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Session:</span>
            <span className="w-[92px] text-center rounded-full border border-border/60 bg-background/30 px-2 py-1 tabular-nums">
              {clock}
            </span>
          </div>
        </div>

        {/* Layout */}
        <div className="mt-5 grid h-[calc(100%-44px)] grid-cols-12 gap-4 overflow-hidden relative">
          {/* MÉTRICAS */}
          <div className="col-span-12 lg:col-span-7">
            <div className="grid h-full grid-cols-2 gap-4 auto-rows-fr">
              {metrics.map((m, idx) => {
                const Icon = m.icon
                const v = m.unit === '%' ? `${m.value.toFixed(2)}${m.unit}` : fmtInt(Math.round(m.value))
                const span = idx === 4 ? 'col-span-2' : 'col-span-1'

                return (
                  <div
                    key={m.key}
                    className={[
                      'group relative overflow-hidden rounded-xl border border-border/60 bg-background/20 p-4',
                      'transition-colors duration-200',
                      'hover:border-border/80 hover:bg-background/25',
                      span,
                    ].join(' ')}
                  >
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        background: 'radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.10), transparent 55%)',
                      }}
                    />
                    <div
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                      style={{
                        background: 'radial-gradient(circle at 35% 25%, hsl(var(--accent) / 0.16), transparent 60%)',
                      }}
                    />

                    <div className="relative flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-muted-foreground">{m.label}</div>
                        <div className="mt-1 text-2xl font-semibold tracking-tight tabular-nums">{v}</div>
                        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                          <ArrowUpRight className="h-3.5 w-3.5" style={{ color: 'hsl(var(--accent))' }} />
                          <span>{m.sub}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2">
                        <div className="grid place-items-center rounded-lg border border-border/60 bg-background/30 p-2 transition-colors duration-200 group-hover:border-border/80">
                          <Icon className="h-5 w-5" style={{ color: 'hsl(var(--accent))' }} />
                        </div>
                        <div className="opacity-95">
                          <Sparkline values={series[m.key] ?? []} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* LOGS */}
          <div className="col-span-12 lg:col-span-5 rounded-xl border border-border/60 bg-background/20 overflow-hidden flex flex-col min-h-0">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/60 shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <div className="grid place-items-center rounded-lg border border-border/60 bg-background/30 p-2">
                  <ShieldCheck className="h-5 w-5" style={{ color: 'hsl(var(--accent))' }} />
                </div>
                <div className="min-w-0">
                  <div className="text-sm sm:text-base font-semibold leading-tight">Security activity</div>
                  <div className="text-xs text-muted-foreground truncate">Real-time events (simulated)</div>
                </div>
              </div>

              <div className="text-xs text-muted-foreground shrink-0">
                <span className="w-[68px] inline-flex justify-center rounded-full border border-border/60 bg-background/30 px-2 py-1 tabular-nums">
                  {currentLevel}
                </span>
              </div>
            </div>

            <div className="relative px-4 py-3 min-h-0 flex-1 overflow-hidden">
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background/40 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/50 to-transparent z-10" />

              <div className="h-full">
                {logs.map((l) => (
                  <div
                    key={l.id}
                    className={['py-2', l.id === lastLogId ? 'cc-new' : ''].join(' ')}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="mt-1 h-2 w-2 rounded-full shrink-0"
                        style={{
                          background:
                            l.level === 'BLOCK'
                              ? 'rgba(239,68,68,0.95)'
                              : l.level === 'WARN'
                                ? 'rgba(245,158,11,0.9)'
                                : 'hsl(var(--accent) / 0.9)',
                          boxShadow:
                            l.level === 'BLOCK'
                              ? '0 0 14px rgba(239,68,68,0.45)'
                              : l.level === 'WARN'
                                ? '0 0 14px rgba(245,158,11,0.35)'
                                : '0 0 14px hsl(var(--accent) / 0.25)',
                        }}
                      />

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-xs text-muted-foreground tabular-nums">{l.ts}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{l.meta}</div>
                        </div>
                        <div className="text-sm leading-snug">
                          <span
                            className="mr-2 text-xs font-semibold"
                            style={{
                              color:
                                l.level === 'BLOCK'
                                  ? 'rgb(239 68 68)'
                                  : l.level === 'WARN'
                                    ? 'rgb(245 158 11)'
                                    : 'hsl(var(--accent))',
                            }}
                          >
                            {l.level}
                          </span>
                          <span className="text-foreground/90">{l.msg}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cc-new {
          0% {
            transform: translateY(-6px);
            opacity: 0.55;
            background: hsl(var(--accent) / 0.12);
          }
          100% {
            transform: translateY(0);
            opacity: 1;
            background: hsl(var(--accent) / 0);
          }
        }

        .cc-new {
          border-radius: 10px;
          animation: cc-new 520ms ease-out;
        }

        @media (prefers-reduced-motion: reduce) {
          .cc-new {
            animation: none !important;
          }
        }
      `}</style>
    </div>
  )
}