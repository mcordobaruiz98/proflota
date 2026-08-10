import { useNavigate, useLocation } from "react-router-dom";
import { Home, Truck, Calculator, TrendingUp } from "lucide-react";
import { theme as t } from "../styles/theme";

function Layout({ children }) {
  const navigate  = useNavigate();
  const location  = useLocation();
  const ruta      = location.pathname;

  const tabs = [
    { path: "/",            label: "Inicio",      Icono: Home       },
    { path: "/vehiculos",   label: "Vehículos",   Icono: Truck      },
    { path: "/calculadora", label: "Calculadora", Icono: Calculator },
    { path: "/cuentas",     label: "Cuentas",     Icono: TrendingUp },
  ];

  return (
    <div style={styles.contenedor}>

      <div style={styles.pantalla}>
        {children}
      </div>

      <nav style={styles.navbar}>
        {tabs.map((tab) => {
          const activo = ruta === tab.path;
          return (
            <button
              key={tab.path}
              style={styles.navBtn}
              onClick={() => navigate(tab.path)}
            >
              {/* Indicador de pestaña activa: línea de acento superior */}
              <span style={{
                ...styles.navIndicador,
                background: activo ? t.colors.green : "transparent",
              }} />
              <tab.Icono
                size={22}
                color={activo ? t.colors.green : t.colors.textTertiary}
                strokeWidth={activo ? 2.4 : 1.9}
              />
              <span style={{
                ...styles.navLabel,
                color:      activo ? t.colors.green : t.colors.textTertiary,
                fontWeight: activo ? t.fonts.weightBold : t.fonts.weightMedium,
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
    maxWidth:   "430px",
    margin:     "0 auto",
    minHeight:  "100vh",
    position:   "relative",
    background: t.colors.bgPrimary,
  },
  pantalla: {
    paddingBottom: "76px",
  },
  navbar: {
    position:        "fixed",
    bottom:          0,
    left:            "50%",
    transform:       "translateX(-50%)",
    width:           "100%",
    maxWidth:        "430px",
    background:      "rgba(10,26,47,0.86)",
    backdropFilter:  "blur(14px)",
    WebkitBackdropFilter: "blur(14px)",
    borderTop:       `1px solid ${t.colors.border}`,
    display:         "flex",
    zIndex:          100,
    boxShadow:       "0 -8px 24px rgba(0,0,0,0.25)",
  },
  navBtn: {
    flex:            1,
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    gap:             "5px",
    padding:         "11px 4px 12px",
    border:          "none",
    background:      "transparent",
    cursor:          "pointer",
    position:        "relative",
  },
  navIndicador: {
    position:      "absolute",
    top:           0,
    width:         "26px",
    height:        "3px",
    borderRadius:  "0 0 3px 3px",
    transition:    "background 0.2s",
  },
  navLabel: {
    fontSize:      "9.5px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    transition:    "color 0.2s",
  },
};

export default Layout;