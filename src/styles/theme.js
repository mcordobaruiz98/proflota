/**
 * Hecho por JESUS COSSIO DEV
 * Sistema de diseño accesible (WCAG AA/AAA) optimizado para transportistas (30-70 años)
 * Soporte dinámico para Modo Oscuro (predeterminado) y Modo Claro con colorimetría oficial NAVIRA
 */

export const darkPalette = {
  bgPrimary:   "#0A1A2F",  // Fondo principal (Azul Marino Navira)
  bgCard:      "#0F2340",  // Cards elevadas
  bgSection:   "#081527",  // Secciones secundarias / inputs sobre card

  textPrimary:   "#F8FAFC", // Títulos (blanco nítido)
  textSecondary: "#ADC2DE", // Labels legibles (>7:1 ratio)
  textTertiary:  "#8FAECF", // Hints y placeholders claros (>4.8:1 ratio)

  blue:        "#1565FF",  // Azul eléctrico Navira
  blueText:    "#60A5FA",  // Azul legible para TEXTO sobre fondo oscuro
  blueSoft:    "#132847",  // Fondo azul suave (tinte oscuro)
  blueBorder:  "#2A4E82",  // Borde azul suave
  blueDark:    "#0A1A2F",  // Azul oscuro para gradientes

  green:       "#22C55E",  // Verde esmeralda Navira (ganancia, éxito)
  greenDeep:   "#12A150",  // Verde profundo para gradientes
  greenSoft:   "#0F2C20",  // Fondo verde suave
  greenBorder: "#1E5138",  // Borde verde suave

  red:         "#EF4444",  // Gastos, alertas
  redText:     "#FF7B73",  // Rojo legible para texto sobre oscuro
  redSoft:     "#2C1517",  // Fondo rojo suave
  redBorder:   "#5A2A2C",  // Borde rojo suave

  amber:       "#F59E0B",  // Advertencia
  amberSoft:   "#2A2012",  // Fondo amber suave
  amberBorder: "#5A431A",  // Borde amber suave

  border:      "#213A5C",  // Borde general
  borderLight: "#193150",  // Borde suave
  cardShadow:  "0 10px 30px -18px rgba(0,0,0,0.55)",
  mdShadow:    "0 18px 40px -22px rgba(0,0,0,0.60)",
};

export const lightPalette = {
  bgPrimary:   "#EEF4FF",  // Fondo claro con tinte azul hielo Navira
  bgCard:      "#FFFFFF",  // Cards blancas limpias
  bgSection:   "#F1F5F9",  // Secciones secundarias / inputs

  textPrimary:   "#0A1A2F", // Títulos en Azul Marino Profundo (alto contraste)
  textSecondary: "#334155", // Labels en pizarra oscuro (>7:1 ratio)
  textTertiary:  "#64748B", // Hints y placeholders (>4.8:1 ratio)

  blue:        "#1565FF",  // Azul de marca Navira
  blueText:    "#1D4ED8",  // Azul profundo para texto sobre fondo claro
  blueSoft:    "#EFF6FF",  // Fondo azul suave
  blueBorder:  "#BFDBFE",  // Borde azul suave
  blueDark:    "#1E40AF",  // Azul oscuro para gradientes

  green:       "#16A34A",  // Verde Navira (ganancia)
  greenDeep:   "#15803D",  // Verde intenso
  greenSoft:   "#DCFCE7",  // Fondo verde suave
  greenBorder: "#86EFAC",  // Borde verde suave

  red:         "#DC2626",  // Gastos, pérdida
  redText:     "#B91C1C",  // Rojo oscuro para texto sobre fondo claro
  redSoft:     "#FEE2E2",  // Fondo rojo suave
  redBorder:   "#FCA5A5",  // Borde rojo suave

  amber:       "#D97706",  // Advertencia
  amberSoft:   "#FEF3C7",  // Fondo amber suave
  amberBorder: "#FCD34D",  // Borde amber suave

  border:      "#CBD5E1",  // Borde general
  borderLight: "#E2E8F0",  // Borde suave
  cardShadow:  "0 4px 20px -2px rgba(15, 23, 42, 0.08)",
  mdShadow:    "0 10px 25px -4px rgba(15, 23, 42, 0.12)",
};

export const theme = {
  // ── COLORES DINÁMICOS CON VARIABLES CSS ──
  colors: {
    bgPrimary:   "var(--bg-primary, #0A1A2F)",
    bgCard:      "var(--bg-card, #0F2340)",
    bgSection:   "var(--bg-section, #081527)",

    textPrimary:   "var(--text-primary, #F8FAFC)",
    textSecondary: "var(--text-secondary, #ADC2DE)",
    textTertiary:  "var(--text-tertiary, #8FAECF)",

    blue:        "var(--color-blue, #1565FF)",
    blueText:    "var(--color-blue-text, #60A5FA)",
    blueSoft:    "var(--color-blue-soft, #132847)",
    blueBorder:  "var(--color-blue-border, #2A4E82)",
    blueDark:    "var(--color-blue-dark, #0A1A2F)",

    green:       "var(--color-green, #22C55E)",
    greenDeep:   "var(--color-green-deep, #12A150)",
    greenSoft:   "var(--color-green-soft, #0F2C20)",
    greenBorder: "var(--color-green-border, #1E5138)",

    red:         "var(--color-red, #EF4444)",
    redText:     "var(--color-red-text, #FF7B73)",
    redSoft:     "var(--color-red-soft, #2C1517)",
    redBorder:   "var(--color-red-border, #5A2A2C)",

    amber:       "var(--color-amber, #F59E0B)",
    amberSoft:   "var(--color-amber-soft, #2A2012)",
    amberBorder: "var(--color-amber-border, #5A431A)",

    border:      "var(--color-border, #213A5C)",
    borderLight: "var(--color-border-light, #193150)",
  },

  // ── TIPOGRAFÍA ERGONÓMICA ──
  fonts: {
    sizeXs:   "12px",
    sizeSm:   "14px",
    sizeMd:   "16px",
    sizeLg:   "18px",
    sizeXl:   "22px",
    size2xl:  "28px",
    size3xl:  "34px",

    weightNormal:  "400",
    weightMedium:  "500",
    weightSemibold:"600",
    weightBold:    "700",
    weightBlack:   "800",
  },

  // ── NÚMEROS ──
  numeric: {
    fontVariantNumeric: "tabular-nums",
    fontFeatureSettings: '"tnum" 1',
    letterSpacing: "-0.3px",
  },

  // ── ESPACIADO ──
  spacing: {
    xs:  "4px",
    sm:  "8px",
    md:  "12px",
    lg:  "16px",
    xl:  "20px",
    xxl: "24px",
  },

  // ── BORDES ──
  radius: {
    sm:  "10px",
    md:  "12px",
    lg:  "16px",
    xl:  "20px",
    full:"9999px",
  },

  // ── SOMBRAS DINÁMICAS ──
  shadows: {
    card: "var(--shadow-card, 0 10px 30px -18px rgba(0,0,0,0.55))",
    md:   "var(--shadow-md, 0 18px 40px -22px rgba(0,0,0,0.60))",
  },
};

/**
 * Función global para aplicar y alternar el tema en tiempo de ejecución
 */
export function aplicarTema(modo) {
  const temaFinal = modo === "light" ? "light" : "dark";
  const p = temaFinal === "light" ? lightPalette : darkPalette;

  if (typeof document !== "undefined") {
    const root = document.documentElement;
    root.setAttribute("data-theme", temaFinal);

    // Inyectar variables CSS directamente en root para reactividad instantánea
    root.style.setProperty("--bg-primary", p.bgPrimary);
    root.style.setProperty("--bg-card", p.bgCard);
    root.style.setProperty("--bg-section", p.bgSection);
    root.style.setProperty("--text-primary", p.textPrimary);
    root.style.setProperty("--text-secondary", p.textSecondary);
    root.style.setProperty("--text-tertiary", p.textTertiary);
    root.style.setProperty("--color-blue", p.blue);
    root.style.setProperty("--color-blue-text", p.blueText);
    root.style.setProperty("--color-blue-soft", p.blueSoft);
    root.style.setProperty("--color-blue-border", p.blueBorder);
    root.style.setProperty("--color-blue-dark", p.blueDark);
    root.style.setProperty("--color-green", p.green);
    root.style.setProperty("--color-green-deep", p.greenDeep);
    root.style.setProperty("--color-green-soft", p.greenSoft);
    root.style.setProperty("--color-green-border", p.greenBorder);
    root.style.setProperty("--color-red", p.red);
    root.style.setProperty("--color-red-text", p.redText);
    root.style.setProperty("--color-red-soft", p.redSoft);
    root.style.setProperty("--color-red-border", p.redBorder);
    root.style.setProperty("--color-amber", p.amber);
    root.style.setProperty("--color-amber-soft", p.amberSoft);
    root.style.setProperty("--color-amber-border", p.amberBorder);
    root.style.setProperty("--color-border", p.border);
    root.style.setProperty("--color-border-light", p.borderLight);
    root.style.setProperty("--shadow-card", p.cardShadow);
    root.style.setProperty("--shadow-md", p.mdShadow);

    document.body.style.backgroundColor = p.bgPrimary;
    document.body.style.color = p.textPrimary;

    try {
      localStorage.setItem("navira_theme", temaFinal);
      window.dispatchEvent(new CustomEvent("navira-theme-change", { detail: temaFinal }));
    } catch {
      // Ignorar en entornos sin localStorage
    }
  }

  return temaFinal;
}

/**
 * Obtiene el tema guardado en localStorage o predeterminado oscuro
 */
export function obtenerTemaActual() {
  if (typeof window === "undefined") return "dark";
  const guardado = localStorage.getItem("navira_theme");
  if (guardado) return guardado;
  return "dark"; // Default dark Navira
}