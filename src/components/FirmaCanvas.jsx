import { useRef, useState, useEffect } from "react";
import { Eraser, Check } from "lucide-react";
import { theme as t } from "../styles/theme";

/**
 * FirmaCanvas — permite dibujar una firma con el dedo/mouse.
 * Props:
 *   firmaActual: URL o dataURL de la firma ya guardada (opcional)
 *   onGuardar: (dataUrl) => Promise  — recibe la firma como PNG base64
 *   guardando: boolean — muestra estado mientras sube
 */
function FirmaCanvas({ firmaActual, onGuardar, guardando }) {
  const canvasRef = useRef(null);
  const [dibujando, setDibujando] = useState(false);
  const [hayTrazo, setHayTrazo] = useState(false);
  const ultimo = useRef({ x: 0, y: 0 });

  // Preparar el canvas (fondo blanco, línea negra)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    // Fondo blanco (para que el PNG no salga transparente)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "#0A1A2F";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, []);

  // Coordenadas relativas al canvas (soporta mouse y touch)
  const getPos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const iniciar = (e) => {
    e.preventDefault();
    setDibujando(true);
    ultimo.current = getPos(e);
  };

  const mover = (e) => {
    if (!dibujando) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(ultimo.current.x, ultimo.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ultimo.current = pos;
    setHayTrazo(true);
  };

  const terminar = () => setDibujando(false);

  const limpiar = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHayTrazo(false);
  };

  const guardar = () => {
    if (!hayTrazo) return;
    const dataUrl = canvasRef.current.toDataURL("image/png");
    onGuardar(dataUrl);
  };

  return (
    <div>
      {/* Firma ya guardada */}
      {firmaActual && !hayTrazo && (
        <div style={{ marginBottom: "10px", textAlign: "center" }}>
          <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "0 0 6px" }}>Firma guardada:</p>
          <img src={firmaActual} alt="Firma" style={{ maxHeight: "80px", maxWidth: "100%", background: "#fff", borderRadius: t.radius.sm, padding: "4px" }} />
          <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "6px 0 0" }}>Dibuje abajo para reemplazarla.</p>
        </div>
      )}

      {/* Canvas para dibujar */}
      <div style={{ position: "relative", background: "#fff", borderRadius: t.radius.md, border: `2px dashed ${t.colors.border}`, overflow: "hidden" }}>
        <canvas
          ref={canvasRef}
          width={600}
          height={200}
          style={{ width: "100%", height: "160px", touchAction: "none", cursor: "crosshair", display: "block" }}
          onMouseDown={iniciar}
          onMouseMove={mover}
          onMouseUp={terminar}
          onMouseLeave={terminar}
          onTouchStart={iniciar}
          onTouchMove={mover}
          onTouchEnd={terminar}
        />
        {!hayTrazo && (
          <div style={{ position: "absolute", top: "50%", left: 0, right: 0, transform: "translateY(-50%)", textAlign: "center", pointerEvents: "none" }}>
            <p style={{ fontSize: t.fonts.sizeSm, color: "#9CA3AF", margin: 0 }}>✍️ Firme aquí con el dedo</p>
          </div>
        )}
      </div>

      {/* Botones */}
      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
        <button
          onClick={limpiar}
          style={{ flex: 1, padding: "10px", background: "none", border: `1.5px solid ${t.colors.border}`, borderRadius: t.radius.sm, fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, color: t.colors.textSecondary, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
        >
          <Eraser size={14} /> Limpiar
        </button>
        <button
          onClick={guardar}
          disabled={!hayTrazo || guardando}
          style={{ flex: 1, padding: "10px", background: hayTrazo ? t.colors.green : t.colors.bgSection, border: "none", borderRadius: t.radius.sm, fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: hayTrazo ? "#fff" : t.colors.textTertiary, cursor: hayTrazo ? "pointer" : "default", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", opacity: guardando ? 0.7 : 1 }}
        >
          <Check size={14} /> {guardando ? "Guardando..." : "Guardar firma"}
        </button>
      </div>
    </div>
  );
}

export default FirmaCanvas;