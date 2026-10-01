/**
 * Hecho por JESUS COSSIO DEV
 * Hook reactivo para control de Modo Oscuro / Modo Claro en Navira
 */
import { useState, useEffect } from "react";
import { aplicarTema, obtenerTemaActual } from "../styles/theme";

export function useTheme() {
  const [tema, setTema] = useState(obtenerTemaActual);

  // El tema inicial ya lo aplica main.jsx al arrancar (aplicarTema(obtenerTemaActual()));
  // aquí solo nos suscribimos a los cambios de tema que dispara aplicarTema en cualquier
  // punto de la app, para que todas las instancias del hook queden sincronizadas.
  useEffect(() => {
    const handleCambio = (e) => {
      setTema(e.detail);
    };

    window.addEventListener("navira-theme-change", handleCambio);
    return () => window.removeEventListener("navira-theme-change", handleCambio);
  }, []);

  const toggleTema = () => {
    const nuevo = tema === "dark" ? "light" : "dark";
    aplicarTema(nuevo);
    setTema(nuevo);
    return nuevo;
  };

  const cambiarTema = (nuevoTema) => {
    aplicarTema(nuevoTema);
    setTema(nuevoTema);
  };

  return {
    tema,
    esOscuro: tema === "dark",
    esClaro: tema === "light",
    toggleTema,
    cambiarTema,
  };
}
