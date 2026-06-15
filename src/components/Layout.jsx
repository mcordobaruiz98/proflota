import { useNavigate, useLocation } from "react-router-dom";
import {Home, Truck, Calculator, TrendingUp} from "lucide-react";
import {theme as t} from "../styles/theme";

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
        style={{
          ...styles.navBtn,
          background: activo ? "#1E3A5F" : "transparent",
          borderTop: activo ? `2px solid #22C55E` : "2px solid transparent",
        }}
        onClick={() => navigate(tab.path)}
      >
        <tab.Icono
          size={22}
          color={activo ? "#22C55E" : "#475569"}
          strokeWidth={activo ? 2.5 : 1.8}
        />
        <span style={{
          ...styles.navLabel,
          color:      activo ? "#22C55E" : "#475569",
          fontWeight: activo ? t.fonts.weightBold : t.fonts.weightNormal,
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
    background: "#0A1A2F",
  },
  pantalla: {
    paddingBottom: "72px",
  },
  navbar: {
    position:        "fixed",
    bottom:          0,
    left:            "50%",
    transform:       "translateX(-50%)",
    width:           "100%",
    maxWidth:        "430px",
    background:      "#0A1A2F",
    borderTop:       '1px solid #1E3A5F',
    display:         "flex",
    zIndex:          100,
    boxShadow:       "0 -2px 10px rgba(0,0,0,0.15)",
  },
  navBtn: {
    flex:            1,
    display:         "flex",
    flexDirection:   "column",
    alignItems:      "center",
    gap:             "3px",
    padding:         "10px 4px 8px",
    border:          "none",
    transition:      "background 0.15s",
    cursor:          "pointer",
  },
  navLabel: {
    fontSize:      "9px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
};

export default Layout;