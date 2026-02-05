'use client'

import React, { useEffect, useRef } from 'react'

type Particle = {
    x: number
    y: number
    vx: number
    vy: number
    r: number
    a: number
}

export function BackgroundParticles() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const wrapRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        const wrap = wrapRef.current
        const canvas = canvasRef.current
        if (!wrap || !canvas) return

        const ctx = canvas.getContext('2d')
        if (!ctx) return

        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reduce) return

        let raf = 0
        let particles: Particle[] = []
        let w = 0
        let h = 0
        let dpr = 1

        // 🔥 Ajustes de “visibilidad”
        const DENSITY = 6000 // menor = más partículas (antes ~14000)
        const MIN = 110
        const MAX = 240
        const MAX_DIST = 170 // líneas más largas
        const PARTICLE_ALPHA_BOOST = 1.9 // más brillo general
        const LINE_ALPHA_BOOST = 2.1

        const rand = (min: number, max: number) => min + Math.random() * (max - min)

        const resize = () => {
            dpr = Math.min(2, window.devicePixelRatio || 1)
            const rect = wrap.getBoundingClientRect()
            w = Math.floor(rect.width)
            h = Math.floor(rect.height)

            canvas.width = Math.floor(w * dpr)
            canvas.height = Math.floor(h * dpr)
            canvas.style.width = `${w}px`
            canvas.style.height = `${h}px`
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

            const count = Math.max(MIN, Math.min(MAX, Math.floor((w * h) / DENSITY)))
            particles = Array.from({ length: count }).map(() => ({
                x: rand(0, w),
                y: rand(0, h),
                vx: rand(-0.18, 0.18), // un poquito más de movimiento
                vy: rand(-0.12, 0.12),
                r: rand(0.9, 2.3),
                a: rand(0.10, 0.28) * PARTICLE_ALPHA_BOOST, // más opacidad
            }))
        }

        const ro = new ResizeObserver(resize)
        ro.observe(wrap)
        resize()

        const step = () => {
            ctx.clearRect(0, 0, w, h)

            // Un fog suave para que se note (sin “ensuciar”)
            ctx.globalCompositeOperation = 'source-over'
            ctx.fillStyle = 'rgba(0,0,0,0.10)'
            ctx.fillRect(0, 0, w, h)

            // Partículas con brillo
            ctx.globalCompositeOperation = 'lighter'

            for (const p of particles) {
                p.x += p.vx
                p.y += p.vy

                if (p.x < -10) p.x = w + 10
                if (p.x > w + 10) p.x = -10
                if (p.y < -10) p.y = h + 10
                if (p.y > h + 10) p.y = -10

                // Glow (halo)
                ctx.beginPath()
                ctx.fillStyle = `hsl(var(--accent) / ${Math.min(0.22, p.a * 0.65)})`
                ctx.arc(p.x, p.y, p.r + 2.8, 0, Math.PI * 2)
                ctx.fill()

                // Núcleo
                ctx.beginPath()
                ctx.fillStyle = `hsl(var(--accent) / ${Math.min(0.65, p.a)})`
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
                ctx.fill()
            }

            // Líneas sutiles (más visibles)
            ctx.lineWidth = 1
            for (let i = 0; i < particles.length; i++) {
                const a = particles[i]
                for (let j = i + 1; j < particles.length; j++) {
                    const b = particles[j]
                    const dx = a.x - b.x
                    const dy = a.y - b.y
                    const d2 = dx * dx + dy * dy

                    if (d2 < MAX_DIST * MAX_DIST) {
                        const dist = Math.sqrt(d2)
                        const t = 1 - dist / MAX_DIST
                        const alpha = Math.min(0.16, 0.055 * t * LINE_ALPHA_BOOST)

                        ctx.strokeStyle = `hsl(var(--accent) / ${alpha})`
                        ctx.beginPath()
                        ctx.moveTo(a.x, a.y)
                        ctx.lineTo(b.x, b.y)
                        ctx.stroke()
                    }
                }
            }

            ctx.globalCompositeOperation = 'source-over'
            raf = requestAnimationFrame(step)
        }

        raf = requestAnimationFrame(step)

        return () => {
            cancelAnimationFrame(raf)
            ro.disconnect()
        }
    }, [])

    return (
        <div ref={wrapRef} className="pointer-events-none absolute inset-0">
            <canvas ref={canvasRef} className="absolute inset-0 opacity-90" aria-hidden="true" />

            {/* Vignette (ayuda a que se note el celeste) */}
            <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_60%,transparent_100%)] bg-black/25" />
        </div>
    )
}
