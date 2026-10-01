/**
 * Datos maestros de logística y transporte en Colombia
 * Hecho por JESUS COSSIO DEV para Navira App
 */

export const CIUDADES_COLOMBIA = [
  "Bogotá D.C.",
  "Medellín",
  "Cali",
  "Barranquilla",
  "Cartagena",
  "Bucaramanga",
  "Buenaventura",
  "Santa Marta",
  "Pereira",
  "Manizales",
  "Cúcuta",
  "Ibagué",
  "Villavicencio",
  "Pasto",
  "Montería",
  "Neiva",
  "Armenia",
  "Popayán",
  "Sincelejo",
  "Valledupar",
  "Tunja",
  "Riohacha",
  "Florencia",
  "Yopal",
  "Quibdó",
  "Duitama",
  "Sogamoso",
  "Barrancabermeja",
  "Buga",
  "Tuluá",
  "Cartago",
  "Palmira",
  "Girardot",
  "Espinal",
  "Ipiales",
  "Maicao",
  "Tumaco",
  "Turbo",
  "Apartadó",
  "Aguazul",
  "La Dorada",
  "Facatativá",
  "Zipaquirá",
  "Mosquera",
  "Funza",
  "Soacha",
  "Madrid",
  "Chía",
  "Cota",
  "Rionegro",
  "Itagüí",
  "Bello",
  "Envigado",
  "Pamplona",
  "Ocaña",
  "Bosconia",
  "Aguachica",
  "San Gil",
  "Chiquinquirá",
  "Puerto Boyacá",
  "Puerto Carreño",
  "Inírida",
  "Mitú",
  "Leticia",
  "Mocoa",
  "San José del Guaviare",
  "Arauca"
];

export const PRODUCTOS_TRANSPORTE_TOP10 = [
  "Café pergamino / trillado",
  "Carbón mineral",
  "Cemento y Materiales de construcción",
  "Granos y Cereales (Maíz, Arroz, Soya)",
  "Alimentos procesados y Abarrotes",
  "Acero, Varilla y Perfilería",
  "Fertilizantes y Agroquímicos",
  "Carga General / Paquetería",
  "Combustibles y Líquidos (Hidrocarburos)",
  "Bebidas y Cerveza"
];

const STORAGE_CUSTOM_PRODUCTS_KEY = "navira_productos_personalizados";

export function obtenerListaProductos() {
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY) || "[]");
    const set = new Set([...PRODUCTOS_TRANSPORTE_TOP10, ...(Array.isArray(custom) ? custom : [])]);
    return Array.from(set);
  } catch {
    return PRODUCTOS_TRANSPORTE_TOP10;
  }
}

export function guardarProductoPersonalizado(nuevoProducto) {
  if (!nuevoProducto || typeof nuevoProducto !== "string") return;
  const prod = nuevoProducto.trim();
  if (!prod) return;
  try {
    const custom = JSON.parse(localStorage.getItem(STORAGE_CUSTOM_PRODUCTS_KEY) || "[]");
    if (!PRODUCTOS_TRANSPORTE_TOP10.includes(prod) && !custom.includes(prod)) {
      custom.push(prod);
      localStorage.setItem(STORAGE_CUSTOM_PRODUCTS_KEY, JSON.stringify(custom));
    }
  } catch (e) {
    console.error("Error guardando producto personalizado:", e);
  }
}
