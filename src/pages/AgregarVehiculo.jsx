import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Camera } from "lucide-react";
import { theme as t } from "../styles/theme";
import { useSubirArchivo } from "../hooks/useSubirArchivo";


function AgregarVehiculo({ vehiculos, onGuardar }) {
  const navigate = useNavigate();

  const [tipoVehiculo,  setTipoVehiculo]  = useState("");
  const [tipoRemolque,  setTipoRemolque]  = useState("");
  const [placa,         setPlaca]         = useState("");
  const [placaRemolque, setPlacaRemolque] = useState("");
  const [marca,         setMarca]         = useState("");
  const [modelo,        setModelo]        = useState("");
  const [propietario,   setPropietario]   = useState("");
  const [tenedor,       setTenedor]       = useState("");
  const [errores,       setErrores]       = useState({});
  const [guardando,     setGuardando]     = useState(false);
  const {subirArchivo, progreso, subiendo} = useSubirArchivo();
  const [fotoUrl,       setFotoUrl]       = useState("");

  
  
  const validar = () => {
    const e = {};
    if (!tipoVehiculo)       e.tipoVehiculo = "Selecciona el tipo de vehículo";
    if (!placa.trim())       e.placa        = "La placa es obligatoria";
    if (!propietario.trim()) e.propietario  = "El propietario es obligatorio";
    if (vehiculos.find((v) => v.placa.toLowerCase() === placa.trim().toLowerCase()))
      e.placa = "Ya existe un vehículo con esa placa";
    return e;
  };

  const guardarVehiculo = async () => {
    if (vehiculos && vehiculos.length >= 50) { setErrores({general:"Máximo 50 vehículos por cuenta"}); return; }
    const e = validar();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    setGuardando(true);
    await onGuardar({
      tipoVehiculo, tipoRemolque,
      placa:         placa.trim().toUpperCase(),
      placaRemolque: placaRemolque.trim().toUpperCase(),
      marca, modelo,
      propietario:   propietario.trim(),
      tenedor:       tenedor.trim(),
      fotoUrl,
    });
    navigate("/vehiculos");
  };

  return (
    <div style={styles.pantalla}>

      {/* HEADER */}
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Vehículos</span>
        </button>
        <h1 style={styles.titulo}>Agregar vehículo</h1>
      </div>

      {/* SECCIÓN DATOS */}
      <div style={styles.seccionLabel}>Datos del vehículo</div>
      <div style={styles.card}>

        <div style={styles.campo}>
          <label style={styles.label}>Tipo de vehículo *</label>
          <select
            value={tipoVehiculo}
            onChange={(e) => { setTipoVehiculo(e.target.value); setErrores({ ...errores, tipoVehiculo: null }); }}
            style={{ ...styles.input, color: tipoVehiculo ? t.colors.textPrimary : t.colors.textTertiary }}
          >
            <option value="">Seleccionar...</option>
            <option value="CUATRO MANOS">Cuatro manos</option>
            <option value="DOBLETROQUE">Dobletroque</option>
            <option value="PATINETA 2S2">Patineta 2S2</option>
            <option value="PATINETA 2S3">Patineta 2S3</option>
            <option value="SENCILLO">Sencillo</option>
            <option value="TRACTOMULA 3S2">Tractomula 3S2</option>
            <option value="TRACTOMULA 3S3">Tractomula 3S3</option>
            <option value="TURBO">Turbo</option>
            <option value="TURBO SENCILLO">Turbo sencillo</option>
            <option value="VOLQUETA">Volqueta</option>
            <option value="OTRO">Otro</option>
          </select>
          {errores.tipoVehiculo && <p style={styles.error}>{errores.tipoVehiculo}</p>}
        </div>

        <div style={styles.campo}>
          <label style={styles.label}>Tipo de remolque</label>
          <select
            value={tipoRemolque}
            onChange={(e) => setTipoRemolque(e.target.value)}
            style={{ ...styles.input, color: tipoRemolque ? t.colors.textPrimary : t.colors.textTertiary }}
          >
            <option value="">Sin remolque</option>
            <option value="BOTELLERO">Botellero</option>
            <option value="CAMA BAJA">Cama baja</option>
            <option value="CISTERNA">Cisterna</option>
            <option value="CONTENEDOR">Contenedor</option>
            <option value="CARROCERIA">Carrocería</option>
            <option value="FURGON">Furgón</option>
            <option value="FURGON REFRIGERADO">Furgón refrigerado</option>
            <option value="NIÑERA">Niñera</option>
            <option value="PLANCHA">Plancha</option>
            <option value="PORTA CONTENEDORES">Porta contenedores</option>
            <option value="VOLCO AUTODESCARGABLE">Volco autodescargable</option>
            <option value="OTRO">Otro</option>
          </select>
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Placa vehículo *</label>
            <input
              type="text"
              placeholder="ABC123"
              value={placa}
              onChange={(e) => { setPlaca(e.target.value.toUpperCase()); setErrores({ ...errores, placa: null }); }}
              maxLength={6}
              style={styles.input}
            />
            {errores.placa && <p style={styles.error}>{errores.placa}</p>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Placa remolque</label>
            <input
              type="text"
              placeholder="S-00000"
              value={placaRemolque}
              onChange={(e) => setPlacaRemolque(e.target.value.toUpperCase())}
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.fila2}>
          <div style={styles.campo}>
            <label style={styles.label}>Marca</label>
            <select
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              style={{ ...styles.input, color: marca ? t.colors.textPrimary : t.colors.textTertiary }}
            >
              <option value="">Seleccionar...</option>
              <option value="AUTOCAR">AUTOCAR</option>
              <option value="ASTRA">ASTRA</option>
              <option value="BERLIET">BERLIET</option>
              <option value="BARREIROS">BARREIROS</option>
              <option value="BElAZ">BElAZ</option>
              <option value="BYD">BYD</option>
              <option value="C.C.C">C.C.C</option>
              <option value="CATERPILLAR">CATERPILLAR</option>
              <option value="CARIBE">CARIBE</option>
              <option value="CHANGAN">CHANGAN</option>
              <option value="CHANGFENG">CHANGFENG</option>
              <option value="CITROEN">CITROEN</option>
              <option value="CHERY">CHERY</option>
              <option value="CHEVROLET">CHEVROLET</option>
              <option value="CMC">CMC</option>
              <option value="DAEWOO">DAEWOO</option>
              <option value="DAF">DAF</option>
              <option value="DAIHATSU">DAIHATSU</option>
              <option value="DFSK">DFSK</option>
              <option value="DONGFENG">DONGFENG</option>
              <option value="FAW">FAW</option>
              <option value="FORD">FORD</option>
              <option value="FOTON">FOTON</option>
              <option value="FOTON AUMAN">AUMAN</option>
              <option value="FIAT">FIAT</option>
              <option value="FREIGHTLINER">FREIGHTLINER</option>
              <option value="FUTONG">FUTONG</option>
              <option value="FWD">FWD</option>
              <option value="GMC">GMC</option>
              <option value="HINO">HINO</option>
              <option value="HITACHI">HITACHI</option>
              <option value="HYUNDAI">HYUNDAI</option>
              <option value="INTERNATIONAL">INTERNATIONAL</option>
              <option value="ISUZU">ISUZU</option>
              <option value="IVECO">IVECO</option>
              <option value="JAC">JAC</option>
              <option value="JMC">JMC</option>
              <option value="KAMAZ">KAMAZ</option>
              <option value="KENWORTH">KENWORTH</option>
              <option value="KIA">KIA</option>
              <option value="KING LONG">KING LONG</option>
              <option value="KOMATSU">KOMATSU</option>
              <option value="KRAZ">KRAZ</option>
              <option value="LIUGONG">LIUGONG</option>
              <option value="MACK">MACK</option>
              <option value="MAN">MAN</option>
              <option value="MARCOPOLO">MARCOPOLO</option>
              <option value="MASSEY FERGUSON">MASSEY FERGUSON</option>
              <option value="MAZDA">MAZDA</option>
              <option value="MERCEDES BENZ">MERCEDES BENZ</option>
              <option value="MITSUBISHI">MITSUBISHI</option>
              <option value="MG">MG</option>
              <option value="NISSAN">NISSAN</option>
              <option value="PEGASSO">PEGASSO</option>
              <option value="PEUGEOT">PEUGEOT</option>
              <option value="PETERBILT">PETERBILT</option>
              <option value="RAM">RAM</option>
              <option value="RENAULT">RENAULT</option>
              <option value="SCANIA">SCANIA</option>
              <option value="SHACMAN">SHACMAN</option>
              <option value="SINOTRUK">SINOTRUK</option>
              <option value="SITRACK">SITRACK</option>
              <option value="VOLKSWAGEN">VOLKSWAGEN</option>
              <option value="VOLVO">VOLVO</option>
              <option value="WESTERN STAR">WESTERN STAR</option>
              <option value="YUTONG">YUTONG</option>
              <option value="OTRO">OTRO</option>
            </select>
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Modelo (año)</label>
            <input
              type="number"
              placeholder="2020"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              min="1970" max="2100"
              style={styles.input}
            />
          </div>
        </div>

      </div>

      {/* SECCIÓN PROPIETARIO */}
      <div style={styles.seccionLabel}>Propietario y tenedor</div>
      <div style={styles.card}>
        <div style={styles.campo}>
          <label style={styles.label}>Propietario *</label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={propietario}
            onChange={(e) => { setPropietario(e.target.value); setErrores({ ...errores, propietario: null }); }}
            style={styles.input}
          />
          {errores.propietario && <p style={styles.error}>{errores.propietario}</p>}
        </div>
        <div style={styles.campo}>
          <label style={styles.label}>Tenedor (si aplica)</label>
          <input
            type="text"
            placeholder="Nombre completo"
            value={tenedor}
            onChange={(e) => setTenedor(e.target.value)}
            style={styles.input}
          />
        </div>
      </div>

      <div style={styles.campo}>
  <label style={styles.label}>Foto del vehículo</label>
  {fotoUrl ? (
    <div style={{position:"relative"}}>
      <img src={fotoUrl} alt="Vehículo" style={{width:"100%", height:"180px", objectFit:"cover", borderRadius:t.radius.md}}/>
      <button
        style={{position:"absolute", top:"8px", right:"8px", background:t.colors.redSoft, border:`1px solid ${t.colors.redBorder}`, borderRadius:t.radius.sm, padding:"4px 8px", cursor:"pointer", fontSize:t.fonts.sizeXs, color:t.colors.red}}
        onClick={()=>setFotoUrl("")}
      >
        Cambiar
      </button>
    </div>
  ) : (
    <label style={{display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:"120px", background:t.colors.bgSection, borderRadius:t.radius.md, border:`2px dashed ${t.colors.border}`, cursor:"pointer", gap:"8px"}}>
      <Camera size={28} color={t.colors.textTertiary} strokeWidth={1.5} />
      <span style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary}}>
        {subiendo ? `Subiendo ${progreso}%...` : "Toca para subir foto"}
      </span>
      <input type="file" accept="image/*" style={{display:"none"}}
        onChange={async (e) => {
          const archivo = e.target.files[0];
          if (!archivo) return;
          const ruta = `vehiculos/${Date.now()}_${archivo.name}`;
          subirArchivo(archivo, ruta, "foto", (url) => setFotoUrl(url));
        }}
      />
    </label>
  )}
</div>

      {/* BOTÓN GUARDAR */}
      <div style={{ padding: "0 16px" }}>
        <button
          style={{ ...styles.btnGuardar, opacity: guardando ? 0.75 : 1 }}
          onClick={guardarVehiculo}
          disabled={guardando}
        >
          <Save size={18} color="#fff" strokeWidth={2} />
          {guardando ? "Guardando..." : "Guardar vehículo"}
        </button>
      </div>

    </div>
  );
}

const styles = {
  pantalla:     { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:       { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:    { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold },
  titulo:       { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  seccionLabel: { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", padding: "16px 20px 8px" },
  card:         { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "16px", margin: "0 16px 4px", boxShadow: t.shadows.card },
  campo:        { display: "flex", flexDirection: "column", gap: "5px", marginBottom: "12px" },
  fila2:        { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  label:        { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, color: t.colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" },
  input:        { padding: "11px 12px", borderRadius: t.radius.sm, border: `1.5px solid ${t.colors.border}`, fontSize: t.fonts.sizeSm, background: t.colors.bgPrimary, color: t.colors.textPrimary, outline: "none", width: "100%", boxSizing: "border-box" },
  error:        { fontSize: t.fonts.sizeXs, color: t.colors.red, margin: "3px 0 0", fontWeight: t.fonts.weightMedium },
  btnGuardar:   { width: "100%", padding: "15px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeMd, fontWeight: t.fonts.weightBold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "8px" },
};

export default AgregarVehiculo;