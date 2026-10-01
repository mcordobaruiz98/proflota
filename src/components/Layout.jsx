// Hecho por JESUS COSSIO DEV
/**
 * Layout.jsx — Contenedor Principal con Indicador de Conexión, Barra Ergonómica y Breakpoints
 * Implementa:
 * - Indicador visual de conexión online/offline (FE-15)
 * - Breakpoint responsivo y tokens de layout (FE-42, FE-37)
 * - Navegación accesible con safe-areas
 */
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Truck, Calculator, TrendingUp, WifiOff } from "lucide-react";
import { theme as t } from "../styles/theme";

function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const ruta      = location.pathname;

  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const tabs = [
    { path: "/",            label: "Inicio",      Icono: Home       },
    { path: "/vehiculos",   label: "Vehículos",   Icono: Truck      },
    { path: "/viajes",      label: "Viajes",      Icono: Calculator },
    { path: "/cuentas",     label: "Cuentas",     Icono: TrendingUp },
  ];

  return (
    <div style={styles.contenedor}>
      <a href="#main-content" className="skip-link">
        Saltar al contenido principal
      </a>

      {/* Indicador de conexión offline (FE-15) */}
      {!online && (
        <div style={styles.bannerOffline} role="status" aria-live="polite">
          <WifiOff size={15} color="#FFFFFF" />
          <span>Modo sin conexión — Los cambios se guardarán localmente</span>
        </div>
      )}

      <main id="main-content" style={styles.pantalla}>
        {children}
      </main>

      <nav style={styles.navbar} aria-label="Navegación principal">
        {tabs.map((tab) => {
          const activo = ruta === tab.path;
          return (
            <button
              key={tab.path}
              style={styles.navBtn}
              onClick={() => navigate(tab.path)}
              aria-label={tab.label}
            >
              {/* Indicador de pestaña activa */}
              <span style={{
                ...styles.navIndicador,
                background: activo ? t.colors.blue : "transparent",
              }} />
              <tab.Icono
                size={22}
                color={activo ? t.colors.blueText : t.colors.textTertiary}
                strokeWidth={activo ? 2.5 : 1.8}
              />
              <span style={{
                ...styles.navLabel,
                color: activo ? t.colors.blueText : t.colors.textTertiary,
                fontWeight: activo ? "800" : "600",
              }}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </nav>

    </div>
  );
}

const styles = {
  contenedor: {
    maxWidth: "480px",
    margin: "0 auto",
    minHeight: "100vh",
    position: "relative",
    background: t.colors.bgPrimary,
  },
  bannerOffline: {
    position: "sticky",
    top: 0,
    zIndex: 999,
    background: t.colors.red,
    color: "#FFFFFF",
    padding: "8px 12px",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
  },
  pantalla: {
    paddingBottom: "84px",
  },
  navbar: {
    position: "fixed",
    bottom: 0,
    left: "50%",
    transform: "translateX(-50%)",
    width: "100%",
    maxWidth: "480px",
    background: "rgba(15, 35, 64, 0.96)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    borderTop: `1px solid ${t.colors.borderLight}`,
    display: "flex",
    zIndex: 100,
    boxShadow: "0 -4px 16px rgba(0,0,0,0.35)",
    paddingBottom: "env(safe-area-inset-bottom, 6px)",
  },
  navBtn: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "10px 4px 10px",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    position: "relative",
  },
  navIndicador: {
    position: "absolute",
    top: 0,
    width: "28px",
    height: "3px",
    borderRadius: "0 0 3px 3px",
    transition: "background 0.2s ease",
  },
  navLabel: {
    fontSize: "11px",
    textTransform: "capitalize",
    letterSpacing: "0.02em",
    transition: "color 0.2s ease",
  },
};

export default Layout;