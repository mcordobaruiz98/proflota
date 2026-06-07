import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const mostrar = (mensaje, tipo = "exito") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
  };

  const cerrar = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, mostrar, cerrar };
}