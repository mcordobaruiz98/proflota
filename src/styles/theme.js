export const theme = {

  // ── COLORES ──
  colors: {
    // Fondos (se mantiene tu identidad azul marino)
    bgPrimary:   "#0A1A2F",  // fondo principal
    bgCard:      "#0F2340",  // cards
    bgSection:   "#081527",  // secciones secundarias / inputs sobre card

    // Texto (un poco más legible sobre oscuro)
    textPrimary:   "#F4F7FC", // títulos (blanco cálido, menos duro que #FFF)
    textSecondary: "#9DB0C8", // labels
    textTertiary:  "#647C99", // hints, placeholders, metadatos

    // Acciones — azul
    blue:        "#1565FF",  // azul de marca (botones sólidos)
    blueText:    "#5AA0FF",  // azul legible para TEXTO sobre fondo oscuro
    blueSoft:    "#122540",  // fondo azul suave (tinte oscuro)
    blueBorder:  "#274A7D",  // borde azul suave
    blueDark:    "#0A1A2F",  // azul oscuro para gradientes

    // Ganancia — el color más importante
    green:       "#22C55E",  // ganancia, éxito
    greenSoft:   "#0F2C20",  // fondo verde suave (tinte oscuro)
    greenBorder: "#1E5138",  // borde verde suave

    // Gastos
    red:         "#EF4444",  // gastos, pérdida, eliminar (más legible sobre oscuro)
    redText:     "#FF7B73",  // rojo aún más legible para texto pequeño
    redSoft:     "#2C1517",  // fondo rojo suave (tinte oscuro)
    redBorder:   "#5A2A2C",  // borde rojo suave

    // Advertencia (unificado con el #F59E0B que ya usabas suelto en varias pantallas)
    amber:       "#F59E0B",  // margen bajo, advertencia
    amberSoft:   "#2A2012",  // fondo amber suave (tinte oscuro)
    amberBorder: "#5A431A",  // borde amber suave

    // Bordes
    border:      "#213A5C",  // borde general
    borderLight: "#193150",  // borde muy suave (hairline visible)
  },

  // ── TIPOGRAFÍA ──
  fonts: {
    sizeXs:   "11px",
    sizeSm:   "13px",
    sizeMd:   "15px",
    sizeLg:   "18px",
    sizeXl:   "22px",
    size2xl:  "28px",
    size3xl:  "36px",

    weightNormal:  "400",
    weightMedium:  "500",
    weightSemibold:"600",
    weightBold:    "700",
    weightBlack:   "800",
  },

  // ── NÚMEROS ──
  // Spread this en cualquier cifra de dinero para que los dígitos queden
  // alineados en columna: style={{ ...t.numeric }}
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

  // ── BORDES (un pelín más redondeados = más moderno) ──
  radius: {
    sm:  "10px",
    md:  "12px",
    lg:  "16px",
    xl:  "20px",
    full:"9999px",
  },

  // ── SOMBRAS (más profundas para que las cards "floten" sobre el oscuro) ──
  shadows: {
    card: "0 10px 30px -18px rgba(0,0,0,0.55)",
    md:   "0 18px 40px -22px rgba(0,0,0,0.60)",
  },
};