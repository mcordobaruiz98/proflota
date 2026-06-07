import { useEffect, useState } from "react";
import { theme as t } from "../styles/theme";

function Toast({ mensaje, tipo = "exito", onCerrar }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onCerrar, 300);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  const colores = {
    exito: { bg: t.colors.greenSoft,  border: t.colors.greenBorder, color: t.colors.green },
    error: { bg: t.colors.redSoft,    border: t.colors.redBorder,   color: t.colors.red },
    info:  { bg: t.colors.blueSoft,   border: t.colors.blueBorder,  color: t.colors.blue },
  };

  const c = colores[tipo] || colores.exito;

  return (
    <div style={{
      position:     "fixed",
      top:          "20px",
      left:         "50%",
      transform:    "translateX(-50%)",
      zIndex:       9999,
      background:   c.bg,
      border:       `1.5px solid ${c.border}`,
      borderRadius: t.radius.lg,
      padding:      "14px 20px",
      boxShadow:    "0 4px 20px rgba(0,0,0,0.12)",
      display:      "flex",
      alignItems:   "center",
      gap:          "10px",
      minWidth:     "260px",
      maxWidth:     "360px",
      opacity:      visible ? 1 : 0,
      transition:   "opacity 0.3s ease",
    }}>
      <span style={{fontSize:"18px"}}>
        {tipo === "exito" ? "✅" : tipo === "error" ? "❌" : "ℹ️"}
      </span>
      <p style={{
        fontSize:   t.fonts.sizeSm,
        fontWeight: t.fonts.weightSemibold,
        color:      c.color,
        margin:     0,
        flex:       1,
      }}>
        {mensaje}
      </p>
      <button
        onClick={() => { setVisible(false); setTimeout(onCerrar, 300); }}
        style={{background:"none", border:"none", cursor:"pointer", fontSize:"16px", color:c.color, padding:0}}
      >
        ✕
      </button>
    </div>
  );
}

export default Toast;