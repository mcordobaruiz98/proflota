import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Plus, Search, Trash2 } from "lucide-react";
import { theme as t } from "../styles/theme";
import { SkeletonCard, SkeletonKpi } from "../components/Skeleton";

function Vehiculos({ vehiculos, onEliminar, viajes = [], mostrarToast, cargando}) {
  const navigate = useNavigate();
  const [busqueda, setBusqueda] = useState("");

  const vehiculosFiltrados = vehiculos.filter((v) =>
    v.placa.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.tipoVehiculo.toLowerCase().includes(busqueda.toLowerCase())
  );

  const eliminarVehiculo = async (vehiculo) => {
    await onEliminar(vehiculo.firestoreId);
    mostrarToast("Vehiculo eliminado","info");
  };

  const fmt = (n) => "$" + Math.round(n).toLocaleString("es-CO");

  const [vehiculoAEliminar, setVehiculoAEliminar] = useState(null);

  if (cargando) return (
  <div style={styles.pantalla}>
    <div style={{padding:"16px"}}>
      <SkeletonCard filas={2}/>
      <SkeletonCard filas={2}/>
      <SkeletonCard filas={2}/>
    </div>
  </div>
);

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Gestiona tu flota</p>
          <h1 style={styles.titulo}>Vehículos</h1>
        </div>
        <button style={styles.btnAgregar} onClick={() => navigate("/agregar-vehiculo")}>
          <Plus size={16} color="#fff" strokeWidth={2.5} />
          Agregar
        </button>
      </div>

      {/* BUSCADOR */}
      <div style={styles.buscadorWrap}>
        <Search size={16} color={t.colors.textTertiary} style={{ flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Buscar por placa o tipo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          style={styles.buscadorInput}
        />
      </div>

      {/* ESTADO VACÍO */}
      {vehiculos.length === 0 && (
        <div style={styles.vacio}>
          <div style={styles.vacioIconoWrap}>
            <Truck size={40} color={t.colors.blue} strokeWidth={1.5} />
          </div>
          <p style={styles.vacioTexto}>Agrega tu primer vehículo</p>
          <p style={styles.vacioSub}>
            Registra tu flota para calcular fletes y llevar el historial de cada viaje.
          </p>
          <button style={styles.btnAgregarVacio} onClick={() => navigate("/agregar-vehiculo")}>
            <Plus size={16} color="#fff" strokeWidth={2.5} />
            Agregar vehículo
          </button>
        </div>
      )}

      {/* SIN RESULTADOS */}
      {vehiculos.length > 0 && vehiculosFiltrados.length === 0 && (
        <div style={styles.sinResultados}>
          <p style={{ color: t.colors.textSecondary, fontSize: t.fonts.sizeSm }}>
            No se encontró ningún vehículo con "{busqueda}"
          </p>
        </div>
      )}

      {/* LISTA */}
      <div style={styles.lista}>
        {vehiculosFiltrados.map((vehiculo) => {
          const viajesVeh  = viajes.filter((v) => v.placa === vehiculo.placa);
          const estado = vehiculo.estado || "disponible";
          const ESTADOS = {
            disponible:      { label:"Disponible",      color:t.colors.green,  bg:t.colors.greenSoft },
            en_viaje:        { label:"En viaje",         color:t.colors.blue,   bg:t.colors.blueSoft },
            en_taller:       { label:"En taller",        color:t.colors.amber,  bg:"#FEF3C7" },
            esperando_carga: { label:"Esperando carga",  color:t.colors.textTertiary, bg:t.colors.bgSection },
          };
          const est = ESTADOS[estado] || ESTADOS.disponible;
          return (
            <div key={vehiculo.firestoreId} style={styles.tarjeta}>

              {/* Franja lateral */}
              <div style={{...styles.tarjetaFranja, background:est.color}} />

              {/* Contenido */}
              <div
  style={styles.tarjetaContenido}
  onClick={() => navigate(`/vehiculo/${vehiculo.firestoreId}`)}
>
  {vehiculo.fotoUrl ? (
    <img src={vehiculo.fotoUrl} alt={vehiculo.placa}
      style={{width:"56px", height:"56px", objectFit:"cover", borderRadius:t.radius.md, flexShrink:0}}/>
  ) : (
    <div style={{...styles.tarjetaIconoWrap, background:est.bg}}>
      <Truck size={24} color={est.color} strokeWidth={1.8} />
    </div>
  )}
  <div style={styles.tarjetaInfo}>
    <p style={styles.tarjetaPlaca}>{vehiculo.placa}</p>
    <p style={styles.tarjetaTipo}>
      {vehiculo.tipoVehiculo}
      {vehiculo.tipoRemolque ? ` · ${vehiculo.tipoRemolque}` : ""}
    </p>
    <div style={styles.tarjetaStats}>
      <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightBold,color:est.color,background:est.bg,padding:"2px 8px",borderRadius:t.radius.full}}>
        {est.label}
      </span>
      <span style={styles.tarjetaStatDot}>·</span>
      <span style={styles.tarjetaStat}>
        {viajesVeh.length} viaje{viajesVeh.length !== 1 ? "s" : ""}
      </span>
    </div>
  </div>
</div>

              {/* Botón eliminar */}
              {vehiculoAEliminar?.firestoreId === vehiculo.firestoreId ? (
  <div style={{display:"flex", flexDirection:"column", gap:"4px", padding:"8px"}}>
    <button
      style={{padding:"6px 10px", background:t.colors.redSoft, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.red, cursor:"pointer"}}
      onClick={() => { eliminarVehiculo(vehiculo); setVehiculoAEliminar(null); }}
    >
      Confirmar
    </button>
    <button
      style={{padding:"6px 10px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, cursor:"pointer", color:t.colors.textSecondary}}
      onClick={() => setVehiculoAEliminar(null)}
    >
      Cancelar
    </button>
  </div>
) : (
  <button
    style={styles.btnEliminar}
    onClick={() => setVehiculoAEliminar(vehiculo)}
  >
    <Trash2 size={16} color={t.colors.red} strokeWidth={1.8} />
  </button>
)}

            </div>
          );
        })}
      </div>

    </div>
  );
}

const styles = {
  pantalla:          { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "20px" },
  header:            { display: "flex", justifyContent: "space-between", alignItems: "flex-end", padding: "20px 20px 16px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  headerSub:         { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "0 0 2px", fontWeight: t.fonts.weightMedium, textTransform: "uppercase", letterSpacing: "0.06em" },
  titulo:            { fontSize: "22px", fontWeight: t.fonts.weightBlack, color: t.colors.textPrimary, margin: 0, letterSpacing: "-0.3px" },
  btnAgregar:        { display: "flex", alignItems: "center", gap: "6px", padding: "10px 16px", background: t.colors.blue, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer" },
  buscadorWrap:      { display: "flex", alignItems: "center", gap: "10px", margin: "16px 16px 8px", background: t.colors.bgCard, border: `1.5px solid ${t.colors.border}`, borderRadius: t.radius.md, padding: "11px 14px", boxShadow: t.shadows.card },
  buscadorInput:     { flex: 1, border: "none", outline: "none", fontSize: t.fonts.sizeSm, color: t.colors.textPrimary, background: "transparent" },
  vacio:             { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "48px 24px", textAlign: "center", margin: "8px 16px", boxShadow: t.shadows.card },
  vacioIconoWrap:    { width: "72px", height: "72px", background: t.colors.blueSoft, borderRadius: t.radius.xl, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" },
  vacioTexto:        { fontSize: t.fonts.sizeLg, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: "0 0 8px" },
  vacioSub:          { fontSize: t.fonts.sizeSm, color: t.colors.textSecondary, margin: "0 0 24px", lineHeight: "1.5" },
  btnAgregarVacio:   { display: "inline-flex", alignItems: "center", gap: "6px", padding: "12px 24px", background: t.colors.blue, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer" },
  sinResultados:     { textAlign: "center", padding: "32px 20px" },
  lista:             { padding: "8px 16px", display: "flex", flexDirection: "column", gap: "10px" },
  tarjeta:           { background: t.colors.bgCard, borderRadius: t.radius.lg, display: "flex", alignItems: "center", overflow: "hidden", boxShadow: t.shadows.card },
  tarjetaFranja:     { width: "4px", alignSelf: "stretch", background: t.colors.blue, flexShrink: 0 },
  tarjetaContenido:  { display: "flex", alignItems: "center", gap: "12px", flex: 1, padding: "14px 12px", cursor: "pointer" },
  tarjetaIconoWrap:  { width: "44px", height: "44px", background: t.colors.blueSoft, borderRadius: t.radius.sm, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  tarjetaInfo:       { flex: 1, minWidth: 0 },
  tarjetaPlaca:      { fontSize: "16px", fontWeight: t.fonts.weightBlack, color: t.colors.textPrimary, margin: 0, letterSpacing: "0.04em" },
  tarjetaTipo:       { fontSize: t.fonts.sizeXs, color: t.colors.textSecondary, margin: "2px 0 4px" },
  tarjetaStats:      { display: "flex", alignItems: "center", gap: "6px" },
  tarjetaStat:       { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary },
  tarjetaStatDot:    { fontSize: t.fonts.sizeXs, color: t.colors.textTertiary },
  btnEliminar:       { padding: "14px 14px", background: "none", border: "none", cursor: "pointer", borderLeft: `1px solid ${t.colors.borderLight}` },
};

export default Vehiculos;