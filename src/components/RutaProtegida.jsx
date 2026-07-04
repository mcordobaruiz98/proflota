import { Navigate } from "react-router-dom";
import { useAuth }  from "../hooks/useAuth";
import PantallaCarga from "./PantallaCarga";

function RutaProtegida({ children }) {
  const { usuario, cargando } = useAuth();

  if (cargando) {
    return <PantallaCarga />;
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default RutaProtegida;