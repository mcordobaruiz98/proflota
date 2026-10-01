/**
 * WizardForm — Formulario guiado por pasos integrado con la colorimetría original NAVIRA
 * Hecho por JESUS COSSIO DEV
 */
import { theme as t } from "../styles/theme";

export function WizardPantalla({ children, style }) {
  return (
    <div style={{
      minHeight: "100vh",
      background: t.colors.bgPrimary,
      maxWidth: "430px",
      margin: "0 auto",
      paddingBottom: "32px",
      boxSizing: "border-box",
      ...style,
    }}>
      {children}
    </div>
  );
}

export function WizardHeader({ titulo, onVolver, labelVolver = "Volver", badge }) {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      background: t.colors.bgCard,
      borderBottom: `1px solid ${t.colors.borderLight}`,
      boxShadow: t.shadows.card,
    }}>
      <button
        type="button"
        onClick={onVolver}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          background: "none",
          border: "none",
          color: t.colors.blueText,
          fontWeight: 700,
          fontSize: "15px",
          cursor: "pointer",
          padding: 0,
        }}
      >
        ← {labelVolver}
      </button>
      <span style={{ fontSize: "17px", fontWeight: 800, color: t.colors.textPrimary }}>{titulo}</span>
      {badge || <span style={{ width: "60px" }} />}
    </div>
  );
}

export function WizardProgress({ total = 1, actual = 1, etiquetas = [] }) {
  return (
    <div style={{ padding: "16px 20px 0" }}>
      <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: "5px",
              borderRadius: "3px",
              background: i < actual ? t.colors.blue : t.colors.border,
              transition: "background 0.35s",
            }}
          />
        ))}
      </div>
      {etiquetas[actual - 1] && (
        <p style={{
          fontSize: "11px",
          fontWeight: 700,
          color: t.colors.blueText,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          margin: 0,
        }}>
          Paso {actual} de {total} · {etiquetas[actual - 1]}
        </p>
      )}
    </div>
  );
}

export function WizardBanner({ icono, titulo, mensaje }) {
  return (
    <div style={{
      margin: "12px 20px 4px",
      background: t.colors.bgCard,
      border: `1px solid ${t.colors.borderLight}`,
      borderLeft: `4px solid ${t.colors.blue}`,
      borderRadius: t.radius.md,
      padding: "14px 16px",
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      boxShadow: t.shadows.card,
    }}>
      <span style={{ fontSize: "28px", flexShrink: 0, lineHeight: 1 }}>{icono}</span>
      <div>
        <p style={{ fontSize: "17px", fontWeight: 800, color: t.colors.textPrimary, margin: "0 0 3px" }}>{titulo}</p>
        <p style={{ fontSize: "14px", color: t.colors.textSecondary, margin: 0, lineHeight: 1.5 }}>{mensaje}</p>
      </div>
    </div>
  );
}

export function WizardCampo({ label, obligatorio, ayuda, children, error }) {
  return (
    <div style={{ marginBottom: "18px" }}>
      <label style={{
        display: "block",
        fontSize: "15px",
        fontWeight: 700,
        color: t.colors.textSecondary,
        marginBottom: "8px",
        letterSpacing: "0.01em",
      }}>
        {label}{obligatorio && <span style={{ color: t.colors.blueText, marginLeft: "3px" }}>*</span>}
      </label>
      {children}
      {ayuda && !error && <p style={{ fontSize: "12px", color: t.colors.textTertiary, margin: "5px 0 0" }}>{ayuda}</p>}
      {error && <p style={{ fontSize: "12px", color: t.colors.redText, margin: "5px 0 0", fontWeight: 600 }}>{error}</p>}
    </div>
  );
}

export function WizardInput({ value, onChange, placeholder, type = "text", maxLength, min, max, style, id, inputMode, list }) {
  const baseStyle = {
    width: "100%",
    boxSizing: "border-box",
    padding: "14px 16px",
    fontSize: "16px",
    borderRadius: t.radius.sm,
    border: `1.5px solid ${t.colors.border}`,
    background: t.colors.bgSection,
    color: t.colors.textPrimary,
    outline: "none",
    fontWeight: 600,
    ...style,
  };
  return (
    <input
      id={id}
      type={type}
      inputMode={inputMode}
      list={list}
      value={value ?? ""}
      onChange={onChange}
      placeholder={placeholder}
      maxLength={maxLength}
      min={min}
      max={max}
      style={baseStyle}
      onFocus={e => {
        e.target.style.borderColor = t.colors.blue;
        e.target.style.boxShadow = `0 0 0 3px ${t.colors.blue}33`;
      }}
      onBlur={e => {
        e.target.style.borderColor = t.colors.border;
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

export function WizardSelect({ value, onChange, children, id }) {
  return (
    <select
      id={id}
      value={value ?? ""}
      onChange={onChange}
      style={{
        width: "100%",
        boxSizing: "border-box",
        padding: "14px 44px 14px 16px",
        fontSize: "16px",
        borderRadius: t.radius.sm,
        border: `1.5px solid ${t.colors.border}`,
        background: t.colors.bgSection,
        color: value ? t.colors.textPrimary : t.colors.textTertiary,
        outline: "none",
        fontWeight: 600,
        cursor: "pointer",
        appearance: "none",
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23ADC2DE' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 14px center",
      }}
    >
      {children}
    </select>
  );
}

/**
 * WizardOpciones — Tarjetas de selección polimórficas y accesibles.
 * Soporta { value/valor/id, label/titulo/nombre, sub/desc/descripcion, icono/icon }
 */
export function WizardOpciones({ opciones = [], valor, onChange, columnas = 2 }) {
  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: `repeat(${columnas}, 1fr)`,
      gap: "10px",
      margin: "4px 0"
    }}>
      {opciones.map((op, idx) => {
        const opVal = op.value !== undefined ? op.value : (op.valor !== undefined ? op.valor : op.id);
        const opLabel = op.label || op.titulo || op.nombre || op.texto || String(opVal);
        const opSub = op.sub || op.desc || op.descripcion || "";
        const opIcono = op.icono || op.icon || null;
        const sel = String(valor) === String(opVal);

        return (
          <button
            key={opVal !== undefined ? opVal : idx}
            type="button"
            onClick={() => onChange(opVal)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px",
              padding: "14px 10px",
              minHeight: "78px",
              background: sel ? t.colors.blueSoft : t.colors.bgCard,
              border: `2px solid ${sel ? t.colors.blue : t.colors.border}`,
              borderRadius: t.radius.md,
              cursor: "pointer",
              transition: "all 0.18s ease-in-out",
              boxShadow: sel ? `0 0 0 3px ${t.colors.blue}33` : t.shadows.card,
              textAlign: "center",
              boxSizing: "border-box"
            }}
          >
            {opIcono && <span style={{ fontSize: "24px", lineHeight: 1, marginBottom: "2px" }}>{opIcono}</span>}
            <span style={{
              fontSize: "14px",
              fontWeight: sel ? 800 : 700,
              color: sel ? t.colors.blueText : t.colors.textPrimary,
              lineHeight: 1.25
            }}>
              {opLabel}
            </span>
            {opSub && (
              <span style={{
                fontSize: "11px",
                color: sel ? t.colors.blueText : t.colors.textTertiary,
                fontWeight: 500,
                lineHeight: 1.2
              }}>
                {opSub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function WizardCard({ children, style }) {
  return (
    <div style={{
      background: t.colors.bgCard,
      borderRadius: t.radius.lg,
      margin: "12px 20px",
      padding: "20px 18px",
      boxShadow: t.shadows.card,
      border: `1px solid ${t.colors.borderLight}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

/**
 * WizardNav — Botones de navegación polimórficos para cualquier Wizard.
 */
export function WizardNav({
  pasoActual,
  subPaso,
  totalPasos,
  totalSubPasos,
  onAtras,
  onAnterior,
  onSiguiente,
  onGuardar,
  guardando = false,
  labelGuardar = "Guardar",
  labelSiguiente = "Siguiente →",
  deshabilitarSiguiente = false,
}) {
  const actual = pasoActual !== undefined ? pasoActual : (subPaso !== undefined ? subPaso : 1);
  const total = totalPasos !== undefined ? totalPasos : (totalSubPasos !== undefined ? totalSubPasos : 1);
  const retroceder = onAtras || onAnterior;
  const avanzar = onSiguiente;
  const guardar = onGuardar;
  const esUltimo = actual >= total;

  return (
    <div style={{ display: "flex", gap: "12px", margin: "8px 20px 0" }}>
      {actual > 1 && retroceder && (
        <button
          type="button"
          onClick={retroceder}
          style={{
            flex: 1,
            minHeight: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            background: t.colors.bgCard,
            border: `1.5px solid ${t.colors.border}`,
            borderRadius: t.radius.md,
            fontSize: "15px",
            fontWeight: 700,
            color: t.colors.textSecondary,
            cursor: "pointer",
            boxShadow: t.shadows.card,
          }}
        >
          ← Anterior
        </button>
      )}

      {!esUltimo && avanzar && (
        <button
          type="button"
          onClick={avanzar}
          disabled={deshabilitarSiguiente}
          style={{
            flex: 2,
            minHeight: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: deshabilitarSiguiente ? t.colors.border : t.colors.blue,
            border: "none",
            borderRadius: t.radius.md,
            fontSize: "16px",
            fontWeight: 800,
            color: "#FFFFFF",
            cursor: deshabilitarSiguiente ? "not-allowed" : "pointer",
            boxShadow: deshabilitarSiguiente ? "none" : "0 6px 20px rgba(21,101,255,0.35)",
            opacity: deshabilitarSiguiente ? 0.6 : 1,
          }}
        >
          {labelSiguiente}
        </button>
      )}

      {esUltimo && guardar && (
        <button
          type="button"
          onClick={guardar}
          disabled={guardando}
          style={{
            flex: 2,
            minHeight: "52px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
            background: guardando ? t.colors.border : t.colors.green,
            border: "none",
            borderRadius: t.radius.md,
            fontSize: "16px",
            fontWeight: 800,
            color: "#FFFFFF",
            cursor: guardando ? "not-allowed" : "pointer",
            boxShadow: guardando ? "none" : "0 6px 20px rgba(34,197,94,0.35)",
            opacity: guardando ? 0.7 : 1,
          }}
        >
          {guardando ? "⏳ Guardando..." : `✓ ${labelGuardar}`}
        </button>
      )}
    </div>
  );
}

export function WizardStepDots({ total, actual }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "8px", padding: "12px 0 4px" }}>
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          style={{
            width: i === actual - 1 ? "24px" : "8px",
            height: "8px",
            borderRadius: "4px",
            background: i < actual ? t.colors.blue : t.colors.border,
            transition: "all 0.25s",
          }}
        />
      ))}
    </div>
  );
}
