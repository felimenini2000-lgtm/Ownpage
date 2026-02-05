'use client'

import React, { useState } from 'react'
import { ArrowRight, Zap, Code2, Lock, Server, Cloud, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CommandCenter } from '@/components/command-center'
import { BackgroundParticles } from '@/components/background-particles'

type Service = {
  icon: React.ElementType
  title: string
  pitch: string
  bullets: string[]
}

export default function Home() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 3000)
    setFormData({ name: '', email: '', message: '' })
  }

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* 1) Partículas (fondo vivo) */}
      <BackgroundParticles />

      {/* 2) Fondo global continuo (radials + grid + vignette) */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--accent)/0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_20%_45%,hsl(var(--primary)/0.10),transparent_65%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_85%_70%,hsl(var(--accent)/0.10),transparent_65%)]" />

        <div className="absolute inset-0 opacity-25 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:28px_28px]" />

        {/* Bajé de 60 a 50 para que NO tape partículas */}
        <div className="absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_60%,transparent_100%)] bg-black/50" />
      </div>

      {/* Floating animation */}
      <style jsx global>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .delay-0 {
          animation-delay: 0s;
        }
        .delay-1000 {
          animation-delay: 1s;
        }
        .delay-2000 {
          animation-delay: 2s;
        }
        .delay-3000 {
          animation-delay: 3s;
        }
        .delay-4000 {
          animation-delay: 4s;
        }
      `}</style>

      {/* 3) CONTENIDO arriba de todo */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <div className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              VYRON
            </div>

            <div className="hidden md:flex gap-8 items-center">
              <a href="#services" className="text-sm hover:text-primary transition-colors">
                Servicios
              </a>
              <a href="#about" className="text-sm hover:text-primary transition-colors">
                Nosotros
              </a>
              <a href="#contact" className="text-sm hover:text-primary transition-colors">
                Contacto
              </a>

              <button
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                className="relative px-5 py-2 text-sm font-semibold text-primary-foreground bg-primary rounded-lg overflow-hidden group animate-glow"
              >
                <span className="relative z-10">Diagnóstico IT sin costo</span>
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
              </button>
            </div>
          </div>
        </nav>

        {/* HERO + dashboard (todo se siente UNO) */}
        <section className="relative pt-24 pb-10 px-4">
          <div className="max-w-7xl mx-auto w-full">
            {/* Top content */}
            <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-block mb-6 animate-fade-in-down">
                <span className="px-4 py-2 bg-primary/10 border border-primary/30 rounded-full text-sm text-primary">
                  Protección y modernización
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Protegemos y modernizamos
                </span>{' '}
                <span className="text-foreground">la tecnología de tu empresa.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Ciberseguridad, infraestructura, cloud y desarrollo web.
                <br />
                <span className="text-accent font-semibold">Soporte local real para PYMES en Uruguay.</span>
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground group w-fit"
                  onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Empezar Ahora <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <Button
                  size="lg"
                  variant="outline"
                  className="border-accent/50 hover:border-accent hover:bg-accent/10 bg-transparent w-fit"
                  onClick={() => document.getElementById('services')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Más Información
                </Button>
              </div>
            </div>

            {/* Dashboard below */}
            <div className="mt-12 animate-fade-in-up delay-300">
              <div className="relative w-full max-w-7xl mx-auto">
                <div className="relative w-full h-[420px] md:h-[520px] lg:h-[520px]">
                  <CommandCenter />
                </div>

                {/* Grid sutil detrás */}
                <div className="absolute inset-0 z-[-1] opacity-60 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,#000_70%,transparent_100%)]" />
              </div>
            </div>
          </div>
        </section>

        {/* SERVICES (sin corte duro) */}
        <section id="services" className="relative py-16 md:py-20 lg:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-14 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Nuestros Servicios</h2>
              <p className="text-muted-foreground text-lg">Soluciones tecnológicas diseñadas para tu empresa</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
              {services.map((service, index) => {
                const Icon = service.icon

                return (
                  <div
                    key={service.title}
                    className="group relative rounded-2xl border border-border/60 bg-card/10 backdrop-blur-md p-6 overflow-hidden hover:border-primary/50 hover:shadow-[0_0_45px_rgba(0,0,0,0.35)] transition-all duration-300 animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.08}s` }}
                  >
                    <div
                      className="absolute -inset-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl"
                      style={{
                        background: 'radial-gradient(circle at 30% 20%, hsl(var(--accent) / 0.22), transparent 55%)',
                      }}
                    />
                    <div className="absolute inset-0 opacity-70 pointer-events-none">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
                    </div>
                    <div
                      className="absolute left-0 right-0 top-0 h-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      style={{
                        background: 'linear-gradient(90deg, transparent, hsl(var(--accent) / 0.9), transparent)',
                      }}
                    />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-start justify-between gap-3">
                        <div className="grid place-items-center rounded-xl border border-border/60 bg-background/25 p-3">
                          <Icon className="w-7 h-7 text-primary group-hover:text-accent transition-colors" />
                        </div>
                      </div>

                      <h3 className="mt-4 text-lg font-semibold leading-tight">{service.title}</h3>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{service.pitch}</p>

                      <ul className="mt-4 space-y-2 text-sm">
                        {service.bullets.map((b, i) => (
                          <li key={`${service.title}-${i}`} className="flex items-start gap-2 text-foreground/90">
                            <span
                              className="mt-[6px] h-1.5 w-1.5 rounded-full"
                              style={{
                                background: 'hsl(var(--accent))',
                                boxShadow: '0 0 12px hsl(var(--accent) / 0.35)',
                              }}
                            />
                            <span className="leading-snug">{b}</span>
                          </li>
                        ))}
                      </ul>

                      <div className="mt-6 pt-4 border-t border-border/60 text-xs text-muted-foreground flex items-center justify-between">
                        <span className="group-hover:text-foreground/80 transition-colors">Respuesta y soporte local</span>
                        <span className="opacity-60 group-hover:opacity-100 transition-opacity">✓</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="pointer-events-none mt-16 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" className="relative py-16 md:py-20 lg:py-24 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">¿Quiénes Somos?</h2>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    VYRON es una empresa de tecnología enfocada en proteger y modernizar la tecnología de empresas en
                    Uruguay. Con un equipo de expertos apasionados por la innovación, entregamos soluciones integrales
                    en ciberseguridad, infraestructura, cloud y desarrollo web.
                  </p>
                  <p>
                    Nuestra misión es ser el socio tecnológico de confianza para las PYMES uruguayas. No solo brindamos
                    servicios, sino que construimos relaciones de largo plazo basadas en resultados medibles y soporte
                    local real.
                  </p>
                  <p>
                    En VYRON creemos que la tecnología debe ser accesible y potente. Cada solución está diseñada
                    específicamente para las necesidades de tu empresa, con atención personalizada y costos justos.
                  </p>
                </div>
              </div>

              <div className="relative h-96 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Zap className="w-24 h-24 text-primary mx-auto mb-4 animate-bounce" />
                    <p className="text-muted-foreground">Innovation at the core</p>
                  </div>
                </div>
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent/20 rounded-full blur-2xl" />
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />
              </div>
            </div>

            <div className="pointer-events-none mt-16 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </section>

        {/* CONTACT */}
        <section id="contact" className="relative py-16 md:py-20 lg:py-24 px-4 pb-28">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Contacta con Nosotros</h2>
              <p className="text-muted-foreground text-lg">¿Listo para modernizar tu empresa? Déjanos un mensaje.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  placeholder="Tu Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 bg-input border border-border rounded-lg focus:border-primary focus:outline-none transition-colors focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  name="email"
                  placeholder="Tu Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-3 bg-input border border-border rounded-lg focus:border-primary focus:outline-none transition-colors focus:ring-1 focus:ring-primary/50"
                />
              </div>

              <div className="relative">
                <textarea
                  name="message"
                  placeholder="Tu Mensaje"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-6 py-3 bg-input border border-border rounded-lg focus:border-primary focus:outline-none transition-colors focus:ring-1 focus:ring-primary/50 resize-none"
                />
              </div>

              <Button type="submit" size="lg" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {submitted ? '✓ Mensaje Enviado!' : 'Enviar Mensaje'}
              </Button>
            </form>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 px-4">
          <div className="pointer-events-none mb-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />

          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-muted-foreground text-sm">© 2024 VYRON. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Privacy
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Terms
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                Social
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

const services: Service[] = [
  {
    icon: Lock,
    title: 'Ciberseguridad',
    pitch: 'Reducimos el riesgo y evitamos interrupciones por ataques o pérdida de datos.',
    bullets: ['Firewall + hardening + MFA', 'Backups y protección ransomware', 'Monitoreo y respuesta ante incidentes'],
  },
  {
    icon: Server,
    title: 'Infraestructura',
    pitch: 'Redes y servidores estables para que tu operación no se detenga.',
    bullets: ['Red segura y segmentación', 'Acceso remoto confiable (VPN/ZTNA)', 'Continuidad operativa y soporte'],
  },
  {
    icon: Cloud,
    title: 'Cloud',
    pitch: 'Modernizamos tu stack para escalar con orden y pagar lo justo.',
    bullets: ['Microsoft 365 / Google Workspace', 'Backups en nube y recuperación', 'Migración y administración'],
  },
  {
    icon: Code2,
    title: 'Desarrollo Web',
    pitch: 'Web rápida, moderna y lista para generar oportunidades.',
    bullets: ['Sitios corporativos de alto rendimiento', 'Hosting administrado y seguridad', 'Integración con herramientas'],
  },
  {
    icon: Video,
    title: 'CCTV',
    pitch: 'Vigilancia profesional con acceso remoto y grabación segura.',
    bullets: ['Cámaras IP y puesta a punto', 'Acceso remoto seguro', 'Grabación local o en nube'],
  },
]
