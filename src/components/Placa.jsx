// src/components/Placa.jsx
// Chip visual de placa colombiana — fondo amarillo, letras negras, borde
// Uso: <Placa valor="SSZ731" /> o <Placa valor="SSZ731" size="sm" />

function Placa({ valor, size = "md" }) {
  if (!valor) return null;

  const dims = {
    sm: { fontSize: "10px", padding: "1px 6px",  borderRadius: "3px", borderWidth: "1px" },
    md: { fontSize: "12px", padding: "2px 8px",  borderRadius: "4px", borderWidth: "1.5px" },
    lg: { fontSize: "15px", padding: "3px 12px", borderRadius: "5px", borderWidth: "2px" },
  }[size];

  return (
    <span style={{
      display: "inline-block",
      background: "#FFC107",
      color: "#0A0A0A",
      fontWeight: 800,
      fontFamily: "'Arial Narrow', Arial, sans-serif",
      letterSpacing: "1px",
      border: `${dims.borderWidth} solid #0A0A0A`,
      borderRadius: dims.borderRadius,
      padding: dims.padding,
      fontSize: dims.fontSize,
      lineHeight: 1.4,
      textTransform: "uppercase",
      whiteSpace: "nowrap",
    }}>
      {valor}
    </span>
  );
}

export default Placa;

