// src/utils/validar.js
// Utilidad de validación y sanitización para NAVIRA
// Importar en cualquier componente: import { sanitizar, validarViaje, validarVehiculo, ... } from "../utils/validar";

// ══════════════════════════════════════
// SANITIZACIÓN — limpia texto peligroso
// ══════════════════════════════════════

// Elimina caracteres que podrían ser código malicioso
export const sanitizar = (texto) => {
  if (typeof texto !== "string") return "";
  return texto
    .replace(/[<>]/g, "")           // elimina < > (previene HTML/script injection)
    .replace(/javascript:/gi, "")   // elimina javascript: en URLs
    .replace(/on\w+=/gi, "")        // elimina event handlers (onclick=, onerror=, etc.)
    .trim()
    .slice(0, 500);                 // máximo 500 caracteres por campo
};

// Escapa HTML para usar en document.write (export)
export const escaparHTML = (texto) => {
  if (typeof texto !== "string") return "";
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};

// Valida y limita un número
export const validarNumero = (valor, min = 0, max = 999999999) => {
  const n = parseFloat(valor);
  if (isNaN(n)) return 0;
  return Math.max(min, Math.min(max, n));
};

// Valida una placa colombiana (3 letras + 3 números, o variantes)
export const validarPlaca = (placa) => {
  const limpia = (placa || "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  return limpia.length >= 4 && limpia.length <= 8 ? limpia : null;
};

// Valida email básico
export const validarEmail = (email) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
};

// Valida teléfono colombiano
export const validarTelefono = (tel) => {
  const limpio = (tel || "").replace(/[^0-9+]/g, "");
  return limpio.length >= 7 && limpio.length <= 15 ? limpio : null;
};

// Valida fecha (no vacía, formato correcto)
export const validarFecha = (fecha) => {
  if (!fecha) return null;
  const d = new Date(fecha);
  return isNaN(d.getTime()) ? null : fecha;
};

// ══════════════════════════════════════
// VALIDADORES POR MÓDULO
// ══════════════════════════════════════

export const validarVehiculo = (datos) => {
  const errores = {};
  if (!validarPlaca(datos.placa)) errores.placa = "Placa inválida (mín 4 caracteres)";
  if (!datos.tipoVehiculo) errores.tipoVehiculo = "Selecciona el tipo de vehículo";
  if (!datos.propietario?.trim()) errores.propietario = "Ingresa el propietario";
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      ...datos,
      placa: validarPlaca(datos.placa) || "",
      placaRemolque: (datos.placaRemolque || "").trim().toUpperCase().slice(0, 8),
      marca: sanitizar(datos.marca).slice(0, 50),
      modelo: sanitizar(datos.modelo).slice(0, 50),
      propietario: sanitizar(datos.propietario).slice(0, 100),
      tenedor: sanitizar(datos.tenedor).slice(0, 100),
    }
  };
};

export const validarViaje = (datos) => {
  const errores = {};
  if (!datos.ruta?.trim()) errores.ruta = "Ingresa la ruta del viaje";
  if (!datos.vViaje || datos.vViaje <= 0) errores.flete = "Ingresa tonelaje y flete";
  if (datos.vViaje > 999999999) errores.flete = "Valor del viaje demasiado alto";
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      ...datos,
      ruta: sanitizar(datos.ruta).slice(0, 200),
      emp: sanitizar(datos.emp).slice(0, 100),
      condNom: sanitizar(datos.condNom).slice(0, 100),
      prod: sanitizar(datos.prod).slice(0, 100),
      mani: sanitizar(datos.mani).slice(0, 50),
      remesa: sanitizar(datos.remesa).slice(0, 50),
      observaciones: sanitizar(datos.observaciones).slice(0, 500),
      contactoEmpresa: sanitizar(datos.contactoEmpresa).slice(0, 100),
      celularEmpresa: sanitizar(datos.celularEmpresa).slice(0, 20),
      lugarCargue: sanitizar(datos.lugarCargue).slice(0, 200),
      lugarDescargue: sanitizar(datos.lugarDescargue).slice(0, 200),
      rutaRet: sanitizar(datos.rutaRet).slice(0, 200),
      empresaRet: sanitizar(datos.empresaRet).slice(0, 100),
      productoRet: sanitizar(datos.productoRet).slice(0, 100),
      contactoRet: sanitizar(datos.contactoRet).slice(0, 100),
      maniRet: sanitizar(datos.maniRet).slice(0, 50),
      remesaRet: sanitizar(datos.remesaRet).slice(0, 50),
      vViaje: validarNumero(datos.vViaje, 0, 999999999),
      kmCargado: validarNumero(datos.kmCargado, 0, 99999),
      kmVacio: validarNumero(datos.kmVacio, 0, 99999),
      ton: validarNumero(datos.ton, 0, 999),
      fleteTon: validarNumero(datos.fleteTon, 0, 999999999),
      pesoBascula: validarNumero(datos.pesoBascula, 0, 999),
      anticipoMonto: validarNumero(datos.anticipoMonto, 0, 999999999),
      anticipoFletePct: validarNumero(datos.anticipoFletePct, 0, 100),
      anticipoFleteMonto: validarNumero(datos.anticipoFleteMonto, 0, 999999999),
      anticipoFletePctRet: validarNumero(datos.anticipoFletePctRet, 0, 100),
      anticipoFleteMontoRet: validarNumero(datos.anticipoFleteMontoRet, 0, 999999999),
      saldoFlete: validarNumero(datos.saldoFlete, 0, 999999999),
    }
  };
};

export const validarConductor = (datos) => {
  const errores = {};
  if (!datos.nombre?.trim()) errores.nombre = "Ingresa el nombre";
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      nombre: sanitizar(datos.nombre).slice(0, 100),
      cedula: sanitizar(datos.cedula).slice(0, 20),
      telefono: (datos.telefono || "").replace(/[^0-9+\s-]/g, "").slice(0, 20),
      licencia: sanitizar(datos.licencia).slice(0, 30),
      licVence: validarFecha(datos.licVence),
      catLic: sanitizar(datos.catLic).slice(0, 5),
      arl: sanitizar(datos.arl).slice(0, 50),
      eps: sanitizar(datos.eps).slice(0, 50),
    }
  };
};

export const validarGasto = (datos) => {
  const errores = {};
  if (!datos.descripcion?.trim()) errores.descripcion = "Ingresa la descripción";
  if (!datos.monto || datos.monto <= 0) errores.monto = "Ingresa un monto válido";
  return {
    valido: Object.keys(errores).length === 0,
    errores,
    datos: {
      ...datos,
      descripcion: sanitizar(datos.descripcion).slice(0, 200),
      monto: validarNumero(datos.monto, 0, 999999999),
      taller: sanitizar(datos.taller).slice(0, 100),
      nit: sanitizar(datos.nit).slice(0, 20),
    }
  };
};

export const validarArchivo = (archivo) => {
  const TIPOS_PERMITIDOS = ["image/jpeg", "image/png", "application/pdf"];
  const MAX_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!archivo) return { valido: false, error: "No hay archivo" };
  if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
    return { valido: false, error: "Solo se permiten JPG, PNG o PDF" };
  }
  if (archivo.size > MAX_SIZE) {
    return { valido: false, error: "El archivo no puede superar 5 MB" };
  }
  return { valido: true, error: null };
};