import { Navigate } from "react-router-dom";
import { useAuth }  from "../hooks/useAuth";

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return (
      <div style={styles.cargando}>
        <img src="/icon-512.png" alt="Navira" style={{height: "50px", objectFit:"contain"}} />
        <p style={styles.texto}>Cargando Navira...</p>
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