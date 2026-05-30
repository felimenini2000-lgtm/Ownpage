'use client'

import React, { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
}

type MaskRect = {
  left: number
  top: number
  right: number
  bottom: number
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationId: number
    let particles: Particle[] = []
    let width = 0
    let height = 0

    const resize = () => {
      width = window.innerWidth
      height = window.innerHeight
      canvas.width = width
      canvas.height = height

      const count = Math.floor((width * height) / 7200)
      particles = Array.from({ length: Math.min(Math.max(count, 75), 165) }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.22,
        vy: (Math.random() - 0.5) * 0.22,
        size: Math.random() * 2.15 + 1.05,
        opacity: Math.random() * 0.42 + 0.16,
      }))
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height)
      const accentRaw =
        getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '189 100% 50%'
      const isDark = document.documentElement.classList.contains('dark')
      const masks: MaskRect[] = Array.from(document.querySelectorAll<HTMLElement>('[data-particle-mask="true"]')).map(
        (el) => {
          const rect = el.getBoundingClientRect()
          return {
            left: rect.left,
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
          }
        },
      )
      const pointInMask = (x: number, y: number) =>
        masks.some((rect) => x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom)
      const ccw = (ax: number, ay: number, bx: number, by: number, cx: number, cy: number) =>
        (cy - ay) * (bx - ax) > (by - ay) * (cx - ax)
      const segmentsIntersect = (
        ax: number,
        ay: number,
        bx: number,
        by: number,
        cx: number,
        cy: number,
        dx: number,
        dy: number,
      ) => ccw(ax, ay, cx, cy, dx, dy) !== ccw(bx, by, cx, cy, dx, dy) && ccw(ax, ay, bx, by, cx, cy) !== ccw(ax, ay, bx, by, dx, dy)
      const lineHitsMask = (x1: number, y1: number, x2: number, y2: number) =>
        masks.some(
          (rect) =>
            pointInMask(x1, y1) ||
            pointInMask(x2, y2) ||
            segmentsIntersect(x1, y1, x2, y2, rect.left, rect.top, rect.right, rect.top) ||
            segmentsIntersect(x1, y1, x2, y2, rect.right, rect.top, rect.right, rect.bottom) ||
            segmentsIntersect(x1, y1, x2, y2, rect.right, rect.bottom, rect.left, rect.bottom) ||
            segmentsIntersect(x1, y1, x2, y2, rect.left, rect.bottom, rect.left, rect.top),
        )

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0) p.x = width
        if (p.x > width) p.x = 0
        if (p.y < 0) p.y = height
        if (p.y > height) p.y = 0

        if (pointInMask(p.x, p.y)) continue

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `hsl(${accentRaw} / ${p.opacity * (isDark ? 1 : 0.95)})`
        ctx.fill()
      }

      ctx.strokeStyle = `hsl(${accentRaw} / ${isDark ? 0.06 : 0.16})`
      ctx.lineWidth = 1
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 145 && !lineHitsMask(particles[i].x, particles[i].y, particles[j].x, particles[j].y)) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      }

      animationId = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    animationId = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950" />
      
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      
      <div className="absolute inset-0 opacity-70 dark:opacity-30">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-cyan-300/30 dark:bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-sky-300/25 dark:bg-cyan-400/8 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[400px] bg-purple-300/20 dark:bg-purple-500/8 rounded-full blur-[120px]" />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(8,145,178,0.08)_100%)] dark:bg-[radial-gradient(ellipse_at_center,transparent_0%,#020617_100%)]" />
    </div>
  )
}
