import { theme as t } from "../styles/theme";

/**
 * EstadoVacio — componente reutilizable para pantallas sin datos.
 * Muestra el camioncito NAVIRA + mensaje + botón de acción opcional.
 *
 * Props:
 *   titulo    — texto principal (ej: "Sin viajes registrados")
 *   sub       — texto secundario (ej: "Calcule su primer viaje...")
 *   btnLabel  — texto del botón (opcional, sin él no muestra botón)
 *   onBtnClick— callback del botón
 *   icono     — "camion" (default) | "buscar" | "cuentas" | "llave"
 *   compacto  — true para tabs internos (menos padding)
 */
function EstadoVacio({ titulo, sub, btnLabel, onBtnClick, icono = "camion", compacto = false }) {
  return (
    <div style={{
      background: t.colors.bgCard,
      borderRadius: t.radius.lg,
      padding: compacto ? "24px 16px" : "40px 20px",
      textAlign: "center",
      margin: compacto ? "0" : "0 16px",
      boxShadow: compacto ? "none" : t.shadows.card,
    }}>
      <div style={{ marginBottom: "12px", display: "flex", justifyContent: "center" }}>
        {icono === "buscar" ? (
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="24" cy="24" r="16" stroke={t.colors.blue} strokeWidth="2.5" fill="none" opacity="0.3"/>
            <circle cx="24" cy="24" r="16" stroke={t.colors.blue} strokeWidth="2.5" fill="none" strokeDasharray="100" strokeDashoffset="60"/>
            <line x1="36" y1="36" x2="48" y2="48" stroke={t.colors.blue} strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
          </svg>
        ) : icono === "cuentas" ? (
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <rect x="10" y="14" width="36" height="28" rx="4" stroke={t.colors.blue} strokeWidth="2" fill="none" opacity="0.3"/>
            <line x1="10" y1="24" x2="46" y2="24" stroke={t.colors.blue} strokeWidth="2" opacity="0.3"/>
            <line x1="28" y1="24" x2="28" y2="42" stroke={t.colors.blue} strokeWidth="2" opacity="0.3"/>
            <circle cx="19" cy="33" r="3" fill={t.colors.green} opacity="0.5"/>
            <circle cx="37" cy="33" r="3" fill={t.colors.blue} opacity="0.5"/>
          </svg>
        ) : icono === "llave" ? (
          <svg width="56" height="56" viewBox="0 0 56 56" fill="none">
            <circle cx="22" cy="22" r="10" stroke={t.colors.amber || "#F59E0B"} strokeWidth="2.5" fill="none" opacity="0.3"/>
            <line x1="30" y1="30" x2="46" y2="46" stroke={t.colors.amber || "#F59E0B"} strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
            <line x1="40" y1="40" x2="44" y2="36" stroke={t.colors.amber || "#F59E0B"} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
            <line x1="36" y1="36" x2="40" y2="32" stroke={t.colors.amber || "#F59E0B"} strokeWidth="2" strokeLinecap="round" opacity="0.4"/>
          </svg>
        ) : (
          /* Camioncito NAVIRA simplificado */
          <svg width="80" height="48" viewBox="0 0 180 70" fill="none">
            <rect x="8" y="12" width="100" height="30" rx="3" stroke={t.colors.blue} strokeWidth="2" fill="none" opacity="0.25"/>
            <rect x="10" y="14" width="96" height="26" rx="2" fill={t.colors.blue} opacity="0.08"/>
            <path d="M112 42 L112 22 Q112 18 116 18 L132 18 Q134 18 136 20 L144 30 Q145 32 145 34 L145 42 Z" fill={t.colors.blue} opacity="0.15"/>
            <path d="M118 22 L130 22 Q132 22 133 24 L138 30 L118 30 Z" fill={t.colors.bgPrimary} opacity="0.6"/>
            <rect x="6" y="42" width="141" height="3" rx="1.5" fill={t.colors.blue} opacity="0.15"/>
            <circle cx="28" cy="48" r="6" fill="none" stroke={t.colors.blue} strokeWidth="2" opacity="0.3"/>
            <circle cx="28" cy="48" r="2.5" fill={t.colors.blue} opacity="0.3"/>
            <circle cx="46" cy="48" r="6" fill="none" stroke={t.colors.blue} strokeWidth="2" opacity="0.3"/>
            <circle cx="46" cy="48" r="2.5" fill={t.colors.blue} opacity="0.3"/>
            <circle cx="122" cy="48" r="6" fill="none" stroke={t.colors.green} strokeWidth="2" opacity="0.3"/>
            <circle cx="122" cy="48" r="2.5" fill={t.colors.green} opacity="0.3"/>
            <circle cx="138" cy="48" r="6" fill="none" stroke={t.colors.green} strokeWidth="2" opacity="0.3"/>
            <circle cx="138" cy="48" r="2.5" fill={t.colors.green} opacity="0.3"/>
          </svg>
        )}
      </div>

      <p style={{
        fontSize: compacto ? t.fonts.sizeSm : t.fonts.sizeMd,
        fontWeight: t.fonts.weightBold,
        color: t.colors.textPrimary,
        margin: "0 0 6px",
      }}>{titulo}</p>

      <p style={{
        fontSize: t.fonts.sizeXs,
        color: t.colors.textSecondary,
        margin: btnLabel ? "0 0 16px" : 0,
        lineHeight: "1.5",
      }}>{sub}</p>

      {btnLabel && onBtnClick && (
        <button
          style={{
            padding: "11px 24px",
            background: t.colors.blue,
            color: "#fff",
            border: "none",
            borderRadius: t.radius.md,
            fontSize: t.fonts.sizeSm,
            fontWeight: t.fonts.weightBold,
            cursor: "pointer",
          }}
          onClick={onBtnClick}
        >{btnLabel}</button>
      )}
    </div>
  );
}

export default EstadoVacio;