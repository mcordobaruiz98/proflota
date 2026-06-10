import { Navigate } from "react-router-dom";
import { useAuth }  from "../hooks/useAuth";

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={styles.cargando}>
        <p style={{ fontSize: "32px", marginBottom: "12px" }}>🚛</p>
        <p style={styles.texto}>Cargando MoVia...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

const styles = {
  cargando: {
    maxWidth:       "430px",
    margin:         "0 auto",
    minHeight:      "100vh",
    display:        "flex",
    flexDirection:  "column",
    alignItems:     "center",
    justifyContent: "center",
    background:     "#f2f4f7",
  },
  texto: {
    fontSize:   "15px",
    color:      "#aaa",
    fontWeight: "500",
  },
};

export default RutaProtegida;