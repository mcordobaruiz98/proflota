import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { subirPeajes } from "../scripts/subirPeajes";

function Configuracion({mostrarToast}) {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const [notificaciones, setNotificaciones] = useState(() =>
    localStorage.getItem("cfg_notif") !== "false"
  );
  const [sonido, setSonido] = useState(() =>
    localStorage.getItem("cfg_sonido") !== "false"
  );

  const toggleNotif = () => {
    const nuevo = !notificaciones;
    setNotificaciones(nuevo);
    localStorage.setItem("cfg_notif", nuevo);
  };

  const toggleSonido = () => {
    const nuevo = !sonido;
    setSonido(nuevo);
    localStorage.setItem("cfg_sonido", nuevo);
  };

  const opciones = [
    {
      icono:   "🔔",
      label:   "Notificaciones",
      sub:     "Alertas de viajes y metas",
      toggle:  true,
      valor:   notificaciones,
      accion:  toggleNotif,
    },
    {
      icono:   "🔊",
      label:   "Sonido",
      sub:     "Sonidos de la aplicación",
      toggle:  true,
      valor:   sonido,
      accion:  toggleSonido,
    },
  ];

  return (
    <div style={styles.pantalla}>

      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1 style={styles.titulo}>Configuración</h1>
        <div style={{ width: "60px" }} />
      </div>

      {/* CUENTA */}
      <div style={styles.seccionTitulo}>Cuenta</div>
      <div style={styles.seccion}>
        <div style={styles.fila}>
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}>👤</span>
            <div>
              <p style={styles.filaLabel}>Nombre</p>
              <p style={styles.filaSub}>{usuario?.displayName || "Usuario"}</p>
            </div>
          </div>
        </div>
        <div style={{ ...styles.fila, borderBottom: "none" }}>
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}>📧</span>
            <div>
              <p style={styles.filaLabel}>Correo</p>
              <p style={styles.filaSub}>{usuario?.email || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PREFERENCIAS */}
      <div style={styles.seccionTitulo}>Preferencias</div>
      <div style={styles.seccion}>
        {opciones.map((op, i, arr) => (
          <div
            key={op.label}
            style={{
              ...styles.fila,
              borderBottom: i === arr.length - 1 ? "none" : "1px solid #f5f5f5",
            }}
          >
            <div style={styles.filaIzq}>
              <span style={styles.filaIcono}>{op.icono}</span>
              <div>
                <p style={styles.filaLabel}>{op.label}</p>
                <p style={styles.filaSub}>{op.sub}</p>
              </div>
            </div>
            <button
              style={{
                ...styles.toggle,
                background: op.valor ? "#2563eb" : "#e5e7eb",
              }}
              onClick={op.accion}
            >
              <div style={{
                ...styles.toggleCircle,
                transform: op.valor ? "translateX(20px)" : "translateX(2px)",
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* DATOS */}
      <div style={styles.seccionTitulo}>Datos</div>
      <div style={styles.seccion}>
        <button
          style={{ ...styles.filaBtn, borderBottom: "none" }}
          onClick={() => {
            if (window.confirm("¿Estás seguro? Esto no se puede deshacer.")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
        >
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}>🗑️</span>
            <div>
              <p style={{ ...styles.filaLabel, color: "#ef4444" }}>
                Limpiar caché local
              </p>
              <p style={styles.filaSub}>Borra datos temporales del dispositivo</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

import { theme as t } from "../styles/theme";

const styles = {
  pantalla:      { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:     { background:"none", border:"none", fontSize:t.fonts.sizeSm, color:t.colors.blue, cursor:"pointer", padding:0, fontWeight:t.fonts.weightSemibold },
  titulo:        { fontSize:"20px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  seccionTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"16px 20px 8px" },
  seccion:       { background:t.colors.bgCard, borderRadius:t.radius.lg, margin:"0 16px 4px", overflow:"hidden", boxShadow:t.shadows.card },
  fila:          { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:`1px solid ${t.colors.borderLight}` },
  filaBtn:       { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer", textAlign:"left", borderBottom:`1px solid ${t.colors.borderLight}` },
  filaIzq:       { display:"flex", alignItems:"center", gap:"12px" },
  filaIcono:     { fontSize:"20px", width:"38px", height:"38px", background:t.colors.bgSection, borderRadius:t.radius.sm, display:"flex", alignItems:"center", justifyContent:"center" },
  filaLabel:     { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0 },
  filaSub:       { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0" },
  toggle:        { width:"44px", height:"24px", borderRadius:"12px", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 },
  toggleCircle:  { width:"20px", height:"20px", background:"white", borderRadius:"50%", position:"absolute", top:"2px", transition:"transform 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" },
};

export default Configuracion;