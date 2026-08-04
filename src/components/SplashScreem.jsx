// src/components/SplashScreen.jsx
// Animación de entrada: una tractomula recorre el trazo del logo NAVIRA (rayo) y desaparece
import { useState, useEffect } from "react";
import { theme as t } from "../styles/theme";
// Path del rayo del logo NAVIRA — simplificado para que el camión lo recorra suavemente
const RAYO_PATH = "M 90 10 L 30 100 L 60 100 L 50 115 L 55 130 L 55 175 L 120 92 L 90 92 L 140 25 L 110 25 Z";
function SplashScreen({ onFinish }) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  useEffect(() => {
    const timerFade = setTimeout(() => setFadeOut(true), 3000);
    const timerEnd  = setTimeout(() => {
      setVisible(false);
      if (onFinish) onFinish();
    }, 3500);
    return () => { clearTimeout(timerFade); clearTimeout(timerEnd); };
  }, [onFinish]);
  if (!visible) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "#0A1A2F",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      zIndex: 99999, gap: "0px",
      opacity: fadeOut ? 0 : 1,
      transition: "opacity 0.5s ease-out",
    }}>
      <style>{`
        @keyframes recorrerRayo {
          0%   { offset-distance: 0%;   opacity: 0; }
          5%   { opacity: 1; }
          80%  { offset-distance: 95%;  opacity: 1; }
          100% { offset-distance: 100%; opacity: 0; }
        }
        @keyframes dibujarRayo {
          0%   { stroke-dashoffset: 800; }
          60%  { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes rellenoRayo {
          0%   { opacity: 0; }
          100% { opacity: 0.85; }
        }
        @keyframes aparecer {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes brilloTexto {
          0%, 100% { opacity: 0.7; }
          50%      { opacity: 1; }
        }
        @keyframes brilloEstela {
          0%   { opacity: 0.4; }
          50%  { opacity: 1; }
          100% { opacity: 0.4; }
        }
        .splash-camion {
          offset-path: path("${RAYO_PATH}");
          offset-rotate: auto;
          animation: recorrerRayo 2.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        .splash-rayo-trazo {
          stroke-dasharray: 800;
          stroke-dashoffset: 800;
          animation: dibujarRayo 2.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
        }
        .splash-rayo-fill {
          animation: rellenoRayo 0.5s ease-out 1.8s both;
        }
        .splash-nombre {
          animation: aparecer 0.6s ease-out 1.0s both;
        }
        .splash-sub {
          animation: aparecer 0.6s ease-out 1.4s both, brilloTexto 2s ease-in-out 2s infinite;
        }
        .splash-estela {
          offset-path: path("${RAYO_PATH}");
          offset-rotate: auto;
          animation: recorrerRayo 2.6s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
          animation-delay: -0.15s;
          filter: blur(6px);
        }
      `}</style>
      {/* Contenedor del logo animado */}
      <div style={{ position: "relative", width: "160px", height: "200px", marginBottom: "8px" }}>
        {/* SVG del rayo */}
        <svg
          viewBox="0 0 170 190"
          width="160"
          height="200"
          style={{ position: "absolute", top: 0, left: 0 }}
        >
          {/* Rayo sombra de fondo */}
          <path
            d={RAYO_PATH}
            fill="none"
            stroke="#1E3A5F"
            strokeWidth="1.5"
            opacity="0.2"
          />
          {/* Rayo con trazo animado que se dibuja */}
          <path
            className="splash-rayo-trazo"
            d={RAYO_PATH}
            fill="none"
            stroke="url(#gradRayoStroke)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Rayo relleno que aparece después */}
          <path
            className="splash-rayo-fill"
            d={RAYO_PATH}
            fill="url(#gradRayoFill)"
          />
          {/* Gradientes */}
          <defs>
            <linearGradient id="gradRayoStroke" x1="0%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#1565FF" />
              <stop offset="50%" stopColor="#7C3AED" />
              <stop offset="100%" stopColor="#22C55E" />
            </linearGradient>
            <linearGradient id="gradRayoFill" x1="30%" y1="0%" x2="70%" y2="100%">
              <stop offset="0%" stopColor="#1565FF" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#7C3AED" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
        {/* Estela luminosa que sigue al camión */}
        <div
          className="splash-estela"
          style={{
            position: "absolute", top: 0, left: 0,
            width: "20px", height: "8px",
            background: "radial-gradient(ellipse, rgba(21,101,255,0.8) 0%, transparent 70%)",
            borderRadius: "50%",
          }}
        />
        {/* Mini tractomula que recorre el path del rayo */}
        <svg
          className="splash-camion"
          width="30"
          height="18"
          viewBox="0 0 30 18"
          style={{
            position: "absolute", top: 0, left: 0,
            filter: "drop-shadow(0 0 6px rgba(21, 101, 255, 0.7))",
          }}
        >
          {/* Tráiler */}
          <rect x="0" y="2" width="17" height="9" rx="1.5" fill="#1565FF" opacity="0.9" />
          {/* Carga (brillo interno del tráiler) */}
          <rect x="1" y="3" width="15" height="7" rx="1" fill="url(#gradCarga)" />
          {/* Cabezote */}
          <path d="M17 11 L17 4 Q17 3 18.5 3 L22 3 Q23 3 23.5 4 L25.5 8 Q26 9 26 9.5 L26 11 Z" fill="#22C55E" />
          {/* Ventana */}
          <path d="M18.5 4.5 L21.5 4.5 L24 8 L18.5 8 Z" fill="#0A1A2F" opacity="0.8" />
          {/* Chasis */}
          <rect x="0" y="11" width="26" height="1.5" rx="0.5" fill="#0F2340" />
          {/* Llantas traseras */}
          <circle cx="5" cy="14" r="2.2" fill="#0F2340" stroke="#1E3A5F" strokeWidth="0.8" />
          <circle cx="5" cy="14" r="0.9" fill="#1565FF" />
          <circle cx="12" cy="14" r="2.2" fill="#0F2340" stroke="#1E3A5F" strokeWidth="0.8" />
          <circle cx="12" cy="14" r="0.9" fill="#1565FF" />
          {/* Llantas delanteras */}
          <circle cx="22" cy="14" r="2.2" fill="#0F2340" stroke="#1E3A5F" strokeWidth="0.8" />
          <circle cx="22" cy="14" r="0.9" fill="#22C55E" />
          {/* Gradiente del tráiler */}
          <defs>
            <linearGradient id="gradCarga" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1565FF" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#22C55E" stopOpacity="0.5" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      {/* Texto NAVIRA */}
      <p className="splash-nombre" style={{
        fontSize: "34px", fontWeight: 900, letterSpacing: "10px",
        background: "linear-gradient(90deg, #1565FF, #7C3AED, #22C55E)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
        margin: "0",
        fontFamily: t.fonts.familyPrimary,
      }}>
        NAVIRA
      </p>
      {/* Subtítulo */}
      <p className="splash-sub" style={{
        fontSize: "9px", color: "#8B9CB3", margin: "10px 0 0",
        letterSpacing: "3px", textTransform: "uppercase",
        fontFamily: t.fonts.familyPrimary,
      }}>
        Inteligencia y precisión en movimiento
      </p>
    </div>
  );
}
export default SplashScreen;