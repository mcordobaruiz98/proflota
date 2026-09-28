/**
 * Hecho por JESUS COSSIO DEV
 * Optimizaciones de arquitectura, accesibilidad y experiencia de usuario
 */
import { useState } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const mostrar = (mensaje, tipo = "exito") => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts(prev => [...prev, { id, mensaje, tipo }]);
  };

  const cerrar = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return { toasts, mostrar, cerrar };
}