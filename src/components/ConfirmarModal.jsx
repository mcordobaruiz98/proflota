/**
 * Hecho por JESUS COSSIO DEV
 * Componente modal accesible de confirmación para reemplazar window.confirm() nativo (FE-09, FE-39)
 */
import { useEffect, useRef } from "react";
import { AlertTriangle } from "lucide-react";
import { theme as t } from "../styles/theme";

export function ConfirmarModal({
  abierto,
  titulo = "¿Estás seguro?",
  mensaje,
  textoConfirmar = "Sí, continuar",
  textoCancelar = "Cancelar",
  esPeligro = true,
  onConfirmar,
  onCancelar,
}) {
  const btnConfirmarRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      btnConfirmarRef.current?.focus();
      const manejarTeclas = (e) => {
        if (e.key === "Escape") onCancelar();
      };
      window.addEventListener("keydown", manejarTeclas);
      return () => window.removeEventListener("keydown", manejarTeclas);
    }
  }, [abierto, onCancelar]);

  if (!abierto) return null;

  return (
    <div style={styles.capa}>
      <button
        type="button"
        aria-label="Cerrar diálogo"
        tabIndex={-1}
        style={styles.overlay}
        onClick={onCancelar}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-modal-titulo"
        style={styles.modal}
      >
        <div style={styles.iconoWrap}>
          <AlertTriangle
            size={32}
            color={esPeligro ? t.colors.red : t.colors.amber}
            strokeWidth={2.2}
          />
        </div>

        <h2 id="confirmar-modal-titulo" style={styles.titulo}>
          {titulo}
        </h2>

        {mensaje && (
          <p style={styles.mensaje}>
            {mensaje}
          </p>
        )}

        <div style={styles.acciones}>
          <button
            ref={btnConfirmarRef}
            type="button"
            style={{
              ...styles.btnConfirmar,
              background: esPeligro
                ? `linear-gradient(135deg, ${t.colors.red}, #B91C1C)`
                : `linear-gradient(135deg, ${t.colors.blue}, #1D4ED8)`,
            }}
            onClick={onConfirmar}
          >
            {textoConfirmar}
          </button>

          <button
            type="button"
            style={styles.btnCancelar}
            onClick={onCancelar}
          >
            {textoCancelar}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  capa: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 9999,
    pointerEvents: "none",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    background: "rgba(3, 10, 20, 0.78)",
    backdropFilter: "blur(4px)",
    border: "none",
    padding: 0,
    cursor: "default",
    pointerEvents: "auto",
  },
  modal: {
    position: "relative",
    width: "100%",
    maxWidth: "380px",
    background: t.colors.bgCard,
    border: `1.5px solid ${t.colors.borderLight}`,
    borderRadius: t.radius.xl,
    padding: "24px 20px 20px",
    textAlign: "center",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75)",
    pointerEvents: "auto",
  },
  iconoWrap: {
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    background: t.colors.bgSection,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    margin: "0 auto 16px",
    border: `1.5px solid ${t.colors.border}`,
  },
  titulo: {
    fontSize: "19px",
    fontWeight: t.fonts.weightBold,
    color: t.colors.textPrimary,
    margin: "0 0 8px",
    lineHeight: 1.3,
  },
  mensaje: {
    fontSize: t.fonts.sizeSm,
    color: t.colors.textSecondary,
    margin: "0 0 22px",
    lineHeight: 1.5,
  },
  acciones: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  btnConfirmar: {
    width: "100%",
    minHeight: "48px",
    color: "#FFF",
    border: "none",
    borderRadius: t.radius.md,
    fontSize: t.fonts.sizeSm,
    fontWeight: t.fonts.weightBold,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: t.shadows.card,
  },
  btnCancelar: {
    width: "100%",
    minHeight: "46px",
    background: "none",
    color: t.colors.textSecondary,
    border: `1.5px solid ${t.colors.border}`,
    borderRadius: t.radius.md,
    fontSize: t.fonts.sizeSm,
    fontWeight: t.fonts.weightSemibold,
    cursor: "pointer",
  },
};

export default ConfirmarModal;
