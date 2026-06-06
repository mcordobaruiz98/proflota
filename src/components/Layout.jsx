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

      {/* Contenido de la pantalla */}
      <div style={styles.pantalla}>
        {children}
      </div>

      {/* Barra de navegación inferior */}
      <nav style={styles.navbar}>
  {tabs.map((tab) => {
    const activo = ruta === tab.path;
    return (
      <button
        key={tab.path}
        style={{
          ...styles.navBtn,
          background: activo ? t.colors.blueSoft : "transparent",
          borderTop: activo ? `2px solid ${t.colors.blue}` : "2px solid transparent",
        }}
        onClick={() => navigate(tab.path)}
      >
        <tab.Icono
          size={22}
          color={activo ? t.colors.blue : t.colors.textTertiary}
          strokeWidth={activo ? 2.5 : 1.8}
        />
        <span style={{
          ...styles.navLabel,
          color:      activo ? t.colors.blue : t.colors.textTertiary,
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
    background: "#f2f4f7",
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
    background:      t.colors.bgCard,
    borderTop:       '1px solid ${tcolors.border}',
    display:         "flex",
    zIndex:          100,
    boxShadow:       "0 -2px 10px rgba(0,0,0,0.06)",
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
  navBtnActivo: {
    background: "#eff6ff",
  },
  navIcono: {
    fontSize: "20px",
  },
  navLabel: {
    fontSize:      "9px",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
};

export default Layout;