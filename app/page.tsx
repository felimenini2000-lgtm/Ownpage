"use client";

import React, { useState, useTransition, useEffect, useRef } from "react";
import {
  ArrowRight,
  Zap,
  Code2,
  Lock,
  Server,
  Cloud,
  Video,
  Shield,
  Users,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CommandCenter } from "@/components/command-center";

type Service = {
  icon: React.ElementType;
  title: string;
  pitch: string;
  bullets: string[];
};

export default function Home() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const FORMSPREE_ENDPOINT = "https://formspree.io/f/xrerrqqj";

  const scrollToId =
    (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    document.querySelectorAll(".reveal-section").forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es requerido";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "El email es requerido";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Ingresa un email válido";
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = "El asunto es requerido";
    }
    
    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es requerido";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

    startTransition(async () => {
      try {
        const response = await fetch(FORMSPREE_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setSubmitted(true);
          setFormData({ name: "", email: "", subject: "", message: "" });
          setTimeout(() => setSubmitted(false), 2500);
        } else {
          const data = await response.json();
          setError(data.error || "Error al enviar el mensaje");
        }
      } catch {
        setError("Error de conexión. Intenta de nuevo.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground overflow-hidden relative">
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-cyan-500/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-cyan-300 bg-clip-text text-transparent cursor-pointer"
              aria-label="Ir al inicio"
            >
              NETIDIA
            </button>

            <div className="hidden md:flex gap-8 items-center">
              <a
                href="#services"
                onClick={scrollToId("services")}
                className="text-sm text-cyan-100/70 hover:text-cyan-400 transition-colors"
              >
                Servicios
              </a>
              <a
                href="#about"
                onClick={scrollToId("about")}
                className="text-sm text-cyan-100/70 hover:text-cyan-400 transition-colors"
              >
                Nosotros
              </a>
              <a
                href="#contact"
                onClick={scrollToId("contact")}
                className="text-sm text-cyan-100/70 hover:text-cyan-400 transition-colors"
              >
                Contacto
              </a>
              <button
                onClick={() =>
                  document
                    .getElementById("contact")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                aria-label="Ir a contacto para diagnóstico IT sin costo"
                className="relative inline-flex items-center justify-center px-6 py-2.5 text-sm font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/40 backdrop-blur-sm transition-all duration-300 ease-out hover:border-cyan-300/60 hover:text-white hover:bg-cyan-500/20 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] active:scale-95"
              >
                Diagnóstico IT sin costo
              </button>
            </div>
          </div>
        </nav>

        {/* ── HERO ── */}
        <section className="relative pt-32 pb-24 px-4 reveal-section">
          <div className="max-w-7xl mx-auto w-full">
            {/* Texto + CTAs */}
            <div className="max-w-3xl animate-fade-in-up">
              <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full">
                <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                <span className="text-sm text-cyan-400 font-medium">Protección y modernización</span>
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="text-white">
                  Protegemos y modernizamos
                </span>{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-300">
                  la tecnología de tu empresa.
                </span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-md">
                Ciberseguridad, infraestructura, cloud y desarrollo web.
                <br />
                <span className="text-accent font-semibold">
                  Soporte local real para PYMES en Uruguay.
                </span>
              </p>

              {/* ✅ CTAs visibles en hero — mobile-first */}
              <div
                className="flex flex-col sm:flex-row gap-4 animate-fade-in-up"
                style={{ animationDelay: "0.15s" }}
              >
                <button
                  onClick={() =>
                    document
                      .getElementById("contact")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-900 font-bold text-sm transition-all duration-300 hover:brightness-110 hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 active:scale-95"
                >
                  Diagnóstico IT sin costo
                  <ArrowRight className="w-5 h-5" />
                </button>

                <a
                  href="#services"
                  onClick={scrollToId("services")}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-cyan-500/40 text-cyan-400 font-semibold text-sm transition-all duration-300 hover:bg-cyan-500/10 hover:border-cyan-400/60 active:scale-95"
                >
                  Ver servicios
                </a>
              </div>
            </div>

{/* CommandCenter — altura original h-[420px] md:h-[520px] */}
            <div className="mt-12 animate-fade-in-up delay-300">
              <div className="relative w-full max-w-7xl mx-auto">
                <div className="relative w-full h-[420px] md:h-[520px] lg:h-[520px]">
                  <CommandCenter />
                </div>
                <div className="absolute inset-0 z-[-1] opacity-60 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_55%_55%_at_50%_50%,#000_70%,transparent_100%)]" />
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>
          </div>
        </section>

        {/* ── ABOUT ── */}
        <section id="about" className="relative py-32 md:py-40 lg:py-32 px-4 reveal-section">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Texto */}
              <div className="animate-fade-in-up">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  ¿Quiénes Somos?
                </h2>
                <div className="space-y-4 text-cyan-100/70 leading-relaxed">
                  <p>
                    NETIDIA es una empresa de tecnología enfocada en el diseño,
                    implementación y evolución de infraestructura digital
                    moderna. Nuestro nombre surge de tres pilares fundamentales:{" "}
                    <span className="text-cyan-400 font-semibold">
                      Network · Identity · Architecture
                    </span>
                  </p>
                  <p>
                    Creemos que toda organización necesita una base tecnológica
                    segura, ordenada y escalable para poder crecer.
                  </p>
                  <p>
                    Por eso trabajamos en construir soluciones que conecten
                    redes, protejan identidades digitales y sostengan
                    arquitecturas preparadas para el futuro.
                  </p>
                </div>
              </div>

              {/* ✅ About visual: tarjetas de propuesta de valor en lugar del placeholder */}
              <div
                className="relative animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="grid grid-cols-2 gap-4">
                  {aboutCards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                      <div
                        key={card.label}
                        className="group relative rounded-2xl border border-border/60 bg-card/20 backdrop-blur-sm p-5 overflow-hidden hover:border-primary/40 transition-all duration-300"
                        style={{ animationDelay: `${0.2 + i * 0.08}s` }}
                      >
                        {/* glow sutil en hover */}
                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                          style={{
                            background:
                              "radial-gradient(circle at 30% 30%, rgba(6,182,212,0.15), transparent 60%)",
                          }}
                        />
                        <div className="relative z-10">
                          <div className="grid place-items-center w-10 h-10 rounded-xl border border-cyan-500/30 bg-cyan-500/10 mb-3">
                            <Icon className="w-5 h-5 text-cyan-400" />
                          </div>
                          <p className="text-2xl font-bold text-white tabular-nums">
                            {card.stat}
                          </p>
                          <p className="text-sm text-cyan-100/60 mt-1 leading-snug">
                            {card.label}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Glow de fondo decorativo */}
                <div className="absolute -bottom-8 -right-8 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -top-8 -left-8 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
              </div>
            </div>
            <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </section>

        {/* ── CONTACT ── */}
        <section
          id="contact"
          className="scroll-mt-24 relative py-32 md:py-40 px-4 pb-32 reveal-section"
        >
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12 animate-fade-in-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Contacta con Nosotros
              </h2>
              <p className="text-cyan-400/70 text-lg">
                ¿Listo para modernizar tu empresa? Déjanos un mensaje.
              </p>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-6 animate-fade-in-up p-8 rounded-2xl border border-cyan-500/20 bg-slate-900/60 backdrop-blur-md"
              style={{ animationDelay: "0.2s" }}
            >
              {error && (
                <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg">
                  {error}
                </div>
              )}
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Tu Nombre"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-6 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-cyan-100/40 focus:outline-none transition-colors focus:ring-1 focus:ring-cyan-400/50 ${errors.name ? 'border-red-500' : 'border-cyan-500/20 focus:border-cyan-400'}`}
                />
                {errors.name && <p className="mt-1 text-xs text-red-400">{errors.name}</p>}
              </div>
              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Tu Email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-6 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-cyan-100/40 focus:outline-none transition-colors focus:ring-1 focus:ring-cyan-400/50 ${errors.email ? 'border-red-500' : 'border-cyan-500/20 focus:border-cyan-400'}`}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email}</p>}
              </div>
              <div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Asunto"
                  value={formData.subject}
                  onChange={handleChange}
                  className={`w-full px-6 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-cyan-100/40 focus:outline-none transition-colors focus:ring-1 focus:ring-cyan-400/50 ${errors.subject ? 'border-red-500' : 'border-cyan-500/20 focus:border-cyan-400'}`}
                />
                {errors.subject && <p className="mt-1 text-xs text-red-400">{errors.subject}</p>}
              </div>
              <div>
                <textarea
                  name="message"
                  placeholder="Tu Mensaje"
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  className={`w-full px-6 py-3 bg-slate-800/50 border rounded-lg text-white placeholder:text-cyan-100/40 focus:outline-none transition-colors focus:ring-1 focus:ring-cyan-400/50 resize-none ${errors.message ? 'border-red-500' : 'border-cyan-500/20 focus:border-cyan-400'}`}
                />
                {errors.message && <p className="mt-1 text-xs text-red-400">{errors.message}</p>}
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-cyan-500 to-cyan-400 hover:from-cyan-400 hover:to-cyan-300 text-slate-900 font-bold disabled:opacity-50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]"
              >
                {submitted
                  ? "✓ Mensaje Enviado!"
                  : isPending
                    ? "Enviando..."
                    : "Enviar Mensaje"}
              </Button>
            </form>
          </div>
        </section>

        {/* ── Footer ── */}
        <footer className="py-10 px-4">
          <div className="pointer-events-none mb-10 h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
            <p className="text-cyan-100/50 text-sm text-center md:text-left mb-4 md:mb-0">
              © {new Date().getFullYear()} NETIDIA. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a
                href="#"
                className="text-cyan-100/50 hover:text-cyan-400 transition-colors text-sm"
              >
                Privacy
              </a>
              <a
                href="#"
                className="text-cyan-100/50 hover:text-cyan-400 transition-colors text-sm"
              >
                Terms
              </a>
              <a
                href="https://www.linkedin.com/company/netidiauy"
                className="text-cyan-100/50 hover:text-cyan-400 transition-colors text-sm"
              >
                Social
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

// ── DATA ──

const services: Service[] = [
  {
    icon: Lock,
    title: "Ciberseguridad",
    pitch:
      "Reducimos el riesgo y evitamos interrupciones por ataques o pérdida de datos.",
    bullets: [
      "Firewall + hardening + MFA",
      "Backups y protección ransomware",
      "Monitoreo y respuesta ante incidentes",
    ],
  },
  {
    icon: Server,
    title: "Infraestructura",
    pitch: "Redes y servidores estables para que tu operación no se detenga.",
    bullets: [
      "Red segura y segmentación",
      "Acceso remoto confiable (VPN/ZTNA)",
      "Continuidad operativa y soporte",
    ],
  },
  {
    icon: Cloud,
    title: "Cloud",
    pitch: "Modernizamos tu stack para escalar con orden y pagar lo justo.",
    bullets: [
      "Microsoft 365 / Google Workspace",
      "Backups en nube y recuperación",
      "Migración y administración",
    ],
  },
  {
    icon: Code2,
    title: "Desarrollo Web",
    pitch: "Web rápida, moderna y lista para generar oportunidades.",
    bullets: [
      "Sitios corporativos de alto rendimiento",
      "Hosting administrado y seguridad",
      "Integración con herramientas",
    ],
  },
  {
    icon: Video,
    title: "CCTV",
    pitch: "Vigilancia profesional con acceso remoto y grabación segura.",
    bullets: [
      "Cámaras IP y puesta a punto",
      "Acceso remoto seguro",
      "Grabación local o en nube",
    ],
  },
];

// ✅ About cards: propuesta de valor concreta en lugar del placeholder Zap+bounce
const aboutCards = [
  {
    icon: Shield,
    stat: "100%",
    label: "Foco en seguridad desde el día uno",
  },
  {
    icon: MapPin,
    stat: "UY",
    label: "Soporte local en Uruguay",
  },
  {
    icon: Zap,
    stat: "<4h",
    label: "Tiempo de respuesta ante incidentes",
  },
  {
    icon: Users,
    stat: "PYME",
    label: "Soluciones a escala de tu empresa",
  },
];
