// src/components/PantallaCarga.jsx
// Pantalla de carga NAVIRA — tractomula cuyo trailer se llena como barra de progreso
// Uso: mostrar mientras cargando === true en App.jsx (reemplaza el spinner actual)

import { theme as t } from "../styles/theme";

function PantallaCarga() {
  return (
    <div style={styles.contenedor}>
      <style>{`
        @keyframes llenarTrailer {
          0%   { width: 0; }
          70%  { width: 100%; }
          100% { width: 100%; }
        }
        @keyframes avanzar {
          0%   { transform: translateX(0); }
          70%  { transform: translateX(0); }
          100% { transform: translateX(140vw); }
        }
        @keyframes lineasVia {
          from { transform: translateX(0); }
          to   { transform: translateX(-64px); }
        }
        @keyframes pulso {
          0%, 100% { opacity: 1; }
          50%      { opacity: 0.5; }
        }
        .navira-camion { animation: avanzar 2.8s ease-in-out infinite; }
        .navira-carga  { animation: llenarTrailer 2.8s ease-in-out infinite; }
        .navira-via    { animation: lineasVia 0.6s linear infinite; }
        .navira-texto  { animation: pulso 1.6s ease-in-out infinite; }
      `}</style>

      {/* Logo */}
      <p style={styles.logo}>NAVIRA</p>

      {/* Camión SVG */}
      <div style={styles.escena}>
        <div className="navira-camion" style={styles.camionWrapper}>
          <svg width="220" height="80" viewBox="0 0 220 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Trailer (contenedor del progreso) */}
            <rect x="10" y="14" width="130" height="38" rx="3" stroke="#1E3A5F" strokeWidth="2.5" fill="#0F2340"/>
            {/* Carga que se llena (clip dentro del trailer) */}
            <foreignObject x="12" y="16" width="126" height="34">
              <div style={{width:"100%",height:"100%",overflow:"hidden",borderRadius:"2px"}}>
                <div className="navira-carga" style={{height:"100%",background:"linear-gradient(90deg, #1565FF 0%, #22C55E 100%)",borderRadius:"2px"}} />
              </div>
            </foreignObject>
            {/* Cabezote */}
            <path d="M145 52 L145 26 Q145 22 149 22 L168 22 Q171 22 173 25 L182 38 Q183 40 183 42 L183 52 Z" fill="#1565FF"/>
            {/* Ventana */}
            <path d="M152 27 L166 27 Q168 27 169.5 29 L176 38 L152 38 Z" fill="#0A1A2F"/>
            {/* Chasis */}
            <rect x="8" y="52" width="177" height="4" rx="2" fill="#1E3A5F"/>
            {/* Llantas trailer */}
            <circle cx="34" cy="60" r="8" fill="#0F2340" stroke="#1E3A5F" strokeWidth="2.5"/>
            <circle cx="34" cy="60" r="3" fill="#1565FF"/>
            <circle cx="56" cy="60" r="8" fill="#0F2340" stroke="#1E3A5F" strokeWidth="2.5"/>
            <circle cx="56" cy="60" r="3" fill="#1565FF"/>
            {/* Llantas cabezote */}
            <circle cx="155" cy="60" r="8" fill="#0F2340" stroke="#1E3A5F" strokeWidth="2.5"/>
            <circle cx="155" cy="60" r="3" fill="#22C55E"/>
            <circle cx="174" cy="60" r="8" fill="#0F2340" stroke="#1E3A5F" strokeWidth="2.5"/>
            <circle cx="174" cy="60" r="3" fill="#22C55E"/>
          </svg>
        </div>

        {/* Vía con líneas en movimiento */}
        <div style={styles.via}>
          <div className="navira-via" style={styles.lineasVia}>
            {Array.from({length: 20}).map((_,i)=>(
              <div key={i} style={styles.lineaVia} />
            ))}
          </div>
        </div>
      </div>

      <p className="navira-texto" style={styles.cargando}>Cargando su flota...</p>
    </div>
  );
}

const styles = {
  contenedor: {
    position: "fixed", inset: 0, background: "#0A1A2F",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
    zIndex: 9999, gap: "8px", overflow: "hidden",
  },
  logo: {
    fontSize: "28px", fontWeight: 900, letterSpacing: "6px",
    background: "linear-gradient(90deg, #1565FF, #22C55E)",
    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    margin: "0 0 20px",
  },
  escena: { width: "260px", overflow: "hidden", position: "relative" },
  camionWrapper: { width: "220px" },
  via: { width: "100%", height: "3px", marginTop: "2px", overflow: "hidden" },
  lineasVia: { display: "flex", gap: "24px", width: "200%" },
  lineaVia: { width: "40px", height: "3px", background: "#1E3A5F", borderRadius: "2px", flexShrink: 0 },
  cargando: {
    fontSize: "12px", color: "#8B9CB3", margin: "24px 0 0",
    letterSpacing: "1px", textTransform: "uppercase",
  },
};

export default PantallaCarga;
