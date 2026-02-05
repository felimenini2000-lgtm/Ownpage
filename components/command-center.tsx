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

// Sparkline: blanco suave (como en la referencia)
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

    const min = Math.min(...values)
    const max = Math.max(...values)
    const span = Math.max(1e-6, max - min)

    const padX = 2
    const padY = 4

    const path = () => {
      ctx.beginPath()
      values.forEach((v, i) => {
        const x = padX + (i / (values.length - 1)) * (w - padX * 2)
        const y = padY + (1 - (v - min) / span) * (h - padY * 2)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
    }

    // Glow
    ctx.lineWidth = 4
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'
    path()
    ctx.stroke()

    // Main
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255,255,255,0.18)'
    path()
    ctx.stroke()
  }, [values])

  return <canvas ref={ref} className="block" />
}

export const CommandCenter = () => {
  const rand = useMemo(() => mulberry32(20260205), [])
  const [tick, setTick] = useState(0)

  const [metrics, setMetrics] = useState<Metric[]>([
    { key: 'blocked', label: 'Threats blocked', value: 1284, icon: ShieldCheck, sub: 'Active mitigation' },
    { key: 'uptime', label: 'Uptime', value: 99.98, unit: '%', icon: Activity, sub: 'SLA monitoring' },
    { key: 'endpoints', label: 'Endpoints protected', value: 42, icon: Lock, sub: 'Policy enforced' },
    { key: 'backups', label: 'Backups verified', value: 14, icon: Server, sub: 'Integrity checks' },
    { key: 'cloud', label: 'Cloud services', value: 7, icon: Cloud, sub: 'Service health' },
  ])

  const [series, setSeries] = useState<Record<string, number[]>>(() => ({}))
  const [logs, setLogs] = useState<LogItem[]>(() => [
    { id: 'l0', ts: nowHHMMSS(), level: 'INFO', msg: 'SOC online', meta: 'VYRON Core' },
    { id: 'l1', ts: nowHHMMSS(), level: 'INFO', msg: 'Backup verified OK', meta: 'Storage' },
    { id: 'l2', ts: nowHHMMSS(), level: 'BLOCK', msg: 'Ransomware signature blocked', meta: 'Endpoint-12' },
  ])

  // init series (una sola vez)
  useEffect(() => {
    setSeries({
      blocked: Array.from({ length: 24 }, () => 70 + rand() * 20),
      uptime: Array.from({ length: 24 }, () => 90 + rand() * 5),
      endpoints: Array.from({ length: 24 }, () => 40 + rand() * 10),
      backups: Array.from({ length: 24 }, () => 55 + rand() * 15),
      cloud: Array.from({ length: 24 }, () => 50 + rand() * 20),
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 900)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    // Metrics live (simulado)
    setMetrics((prev) =>
      prev.map((m) => {
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
    )

    // Sparklines
    setSeries((prev) => {
      const next: Record<string, number[]> = { ...prev }
      const bump = (k: string, base: number, amp: number) => {
        const arr = next[k] ?? []
        if (arr.length === 0) return
        const last = arr[arr.length - 1] ?? base
        const v = last + (rand() - 0.5) * amp
        next[k] = [...arr.slice(1), clamp(v, base - amp * 2, base + amp * 2)]
      }
      bump('blocked', 80, 8)
      bump('uptime', 92, 1.5)
      bump('endpoints', 48, 2.5)
      bump('backups', 62, 3.5)
      bump('cloud', 60, 4)
      return next
    })

    // Logs
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
      roll < 0.55 ? blocks[Math.floor(rand() * blocks.length)] :
        roll < 0.82 ? infos[Math.floor(rand() * infos.length)] :
          warns[Math.floor(rand() * warns.length)]

    setLogs((prev) => {
      const n: LogItem = {
        id: `l${Date.now()}_${Math.floor(rand() * 1e6)}`,
        ts: nowHHMMSS(),
        level: pick[0],
        msg: pick[1],
        meta: pick[2],
      }
      // Importante: suficiente cantidad para ticker, sin necesidad de scroll
      return [n, ...prev].slice(0, 14)
    })
  }, [tick, rand])

  const currentLevel = logs[0]?.level ?? 'INFO'

  // Duplicamos la lista para loop perfecto (sin scrollbar)
  const loopLogs = useMemo(() => [...logs, ...logs], [logs])

  return (
    <div className="relative w-full h-full">
      {/* Marco estable (NO cambia tamaño) */}
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
              VYRON SOC • Live telemetry
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="hidden sm:inline">Session:</span>
            <span className="w-[92px] text-center rounded-full border border-border/60 bg-background/30 px-2 py-1 tabular-nums">
              {nowHHMMSS()}
            </span>
          </div>
        </div>

        {/* Layout fijo */}
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
                    className={`relative overflow-hidden rounded-xl border border-border/60 bg-background/20 p-4 ${span}`}
                  >
                    <div
                      className="absolute inset-0 opacity-60"
                      style={{
                        background: 'radial-gradient(circle at 20% 20%, hsl(var(--accent) / 0.10), transparent 55%)',
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
                        <div className="grid place-items-center rounded-lg border border-border/60 bg-background/30 p-2">
                          <Icon className="h-5 w-5" style={{ color: 'hsl(var(--accent))' }} />
                        </div>
                        <div className="opacity-95">
                          <Sparkline values={series[m.key] ?? []} />
                        </div>
                      </div>
                    </div>

                    <div
                      className="absolute inset-x-0 top-0 h-[1px] opacity-40"
                      style={{
                        background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.75), transparent)',
                        animation: 'cc-scan 3.5s linear infinite',
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>

          {/* LOGS (SIN SCROLLBAR) */}
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

            {/* Ticker wrapper: NO scroll, NO barra */}
            <div className="relative px-4 py-3 min-h-0 flex-1 overflow-hidden">
              {/* Fade top/bottom */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-background/40 to-transparent z-10" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-background/50 to-transparent z-10" />

              {/* Ticker content (se pausa al hover) */}
              <div className="cc-ticker h-full">
                {loopLogs.map((l, idx) => (
                  <div key={`${l.id}-${idx}`} className="py-2">
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

              {/* Hover to pause hint (invisible, but functional) */}
              <div className="absolute inset-0" />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes cc-scan {
          0% { transform: translateX(-40%); }
          100% { transform: translateX(140%); }
        }

        /* Ticker: mueve la lista sin scroll real */
        @keyframes cc-ticker {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }

        .cc-ticker {
          display: block;
          will-change: transform;
          animation: cc-ticker 18s linear infinite;
        }

        /* Pausa al hover sobre el panel (comodísimo para leer) */
        .cc-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  )
}
