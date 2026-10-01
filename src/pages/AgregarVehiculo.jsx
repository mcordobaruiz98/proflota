/**
 * Hecho por JESUS COSSIO DEV
 * FE-41 / FE-44: Wizard guiado 4 sub-pasos, fondo claro, opciones en tarjetas,
 *                targets táctiles ≥52px, tipografía grande para 30-70 años.
 */
import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Camera } from "lucide-react";
import { useSubirArchivo, sanearNombreArchivo } from "../hooks/useSubirArchivo";
import { useAuth } from "../hooks/useAuth";
import {
  WizardPantalla, WizardHeader, WizardProgress,
  WizardBanner, WizardCampo, WizardInput, WizardSelect,
  WizardOpciones, WizardCard, WizardNav, WizardStepDots,
} from "../components/WizardForm";

/* ── Opciones tipo tarjeta ──────────────────────────────────── */
const TIPOS_VEHICULO = [
  { value:"CUATRO MANOS",  label:"Cuatro Manos",  icono:"🚚" },
  { value:"DOBLETROQUE",   label:"Dobletroque",   icono:"🚛" },
  { value:"TRACTOMULA 3S3",label:"Tractomula 3S3",icono:"🚜" },
  { value:"TRACTOMULA 3S2",label:"Tractomula 3S2",icono:"🚜" },
  { value:"SENCILLO",      label:"Sencillo",      icono:"🚌" },
  { value:"TURBO",         label:"Turbo",         icono:"🚐" },
  { value:"PATINETA 2S2",  label:"Patineta 2S2",  icono:"🛻" },
  { value:"PATINETA 2S3",  label:"Patineta 2S3",  icono:"🛻" },
  { value:"VOLQUETA",      label:"Volqueta",      icono:"🏗️" },
  { value:"TURBO SENCILLO",label:"Turbo Sencillo",icono:"🚐" },
  { value:"OTRO",          label:"Otro",          icono:"🚛" },
];

const TIPOS_REMOLQUE = [
  { value:"",                   label:"Sin remolque",    icono:"❌" },
  { value:"CARROCERIA",         label:"Carrocería",      icono:"📦" },
  { value:"FURGON",             label:"Furgón",          icono:"🗃️" },
  { value:"FURGON REFRIGERADO", label:"Furgón frío",     icono:"🧊" },
  { value:"CISTERNA",           label:"Cisterna",        icono:"🛢️" },
  { value:"PLANCHA",            label:"Plancha",         icono:"⬛" },
  { value:"CONTENEDOR",         label:"Contenedor",      icono:"🟫" },
  { value:"CAMA BAJA",          label:"Cama baja",       icono:"⬇️" },
  { value:"VOLCO AUTODESCARGABLE",label:"Volco",         icono:"🏗️" },
  { value:"NIÑERA",             label:"Niñera",          icono:"🔗" },
  { value:"OTRO",               label:"Otro",            icono:"🚛" },
];

const BANNERS = [
  { icono:"🚛", titulo:"¿Qué tipo de camión es?",      mensaje:"Toca el tipo y el remolque que corresponde." },
  { icono:"🔤", titulo:"¿Cuál es la placa?",            mensaje:"Necesitamos placa, marca y modelo del vehículo." },
  { icono:"👤", titulo:"¿Quién es el propietario?",     mensaje:"El nombre del dueño del camión y el tenedor (si es diferente)." },
  { icono:"📸", titulo:"¡Casi listo!",                  mensaje:"Agrega una foto del camión (opcional) y confirma." },
];

const ETIQUETAS = ["Tipo", "Placa y Modelo", "Propietario", "Foto y Confirmar"];
const TOTAL_PASOS = 4;

function AgregarVehiculo({ vehiculos, conductores = [], onGuardar }) {
  const guardandoRef   = useRef(false);
  const navigate       = useNavigate();
  const { usuario }    = useAuth();
  const { subirArchivo, progreso, subiendo } = useSubirArchivo();

  const [subPaso,       setSubPaso]      = useState(1);
  const [tipoVehiculo,  setTipoVehiculo] = useState("");
  const [tipoRemolque,  setTipoRemolque] = useState("");
  const [placa,         setPlaca]        = useState("");
  const [placaRemolque, setPlacaRemolque]= useState("");
  const [marca,         setMarca]        = useState("");
  const [modelo,        setModelo]       = useState("");
  const [propietario,   setPropietario]  = useState("");
  const [tenedor,       setTenedor]      = useState("");
  const [conductorAsignado,setConductorAsignado]=useState("");
  const [fotoUrl,       setFotoUrl]      = useState("");
  const [guardando,     setGuardando]    = useState(false);
  const [errores,       setErrores]      = useState({});

  const PLACA_VEHICULO_REGEX = /^[A-Z]{3}[0-9]{3}$/;
  const PLACA_REMOLQUE_REGEX = /^([A-Z]{3}[0-9]{3}|[R-Z][0-9]{5}|[0-9]{6})$/;

  /* Validación por sub-paso */
  const validarPaso = () => {
    const e = {};
    if (subPaso === 1) {
      if (!tipoVehiculo) e.tipoVehiculo = "Elige el tipo de vehículo";
    }
    if (subPaso === 2) {
      const placaLimpia = placa.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
      if (!placaLimpia) {
        e.placa = "La placa es obligatoria";
      } else if (!PLACA_VEHICULO_REGEX.test(placaLimpia)) {
        e.placa = "Formato inválido: la placa debe tener exactamente 3 letras y 3 números (Ej: ABC123)";
      } else if (vehiculos.find(v => v.placa.toUpperCase().replace(/[^A-Z0-9]/g, "") === placaLimpia)) {
        e.placa = "Ya existe un vehículo con esa placa en tu flota";
      }

      if (placaRemolque.trim()) {
        const remolqueLimpio = placaRemolque.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
        if (!PLACA_REMOLQUE_REGEX.test(remolqueLimpio)) {
          e.placaRemolque = "Formato inválido (Ej: R12345 o ABC123)";
        }
      }
    }
    if (subPaso === 3) {
      if (!propietario.trim()) e.propietario = "El nombre del propietario es obligatorio";
    }
    return e;
  };

  const siguiente = () => {
    const e = validarPaso();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    setErrores({});
    setSubPaso(s => Math.min(s + 1, TOTAL_PASOS));
  };

  const anterior = () => {
    setErrores({});
    setSubPaso(s => Math.max(s - 1, 1));
  };

  const guardar = async () => {
    const e = validarPaso();
    if (Object.keys(e).length > 0) { setErrores(e); return; }
    if (guardandoRef.current || guardando) return;
    if (vehiculos && vehiculos.length >= 50) {
      setErrores({ general: "Máximo 50 vehículos por cuenta" }); return;
    }
    guardandoRef.current = true;
    setGuardando(true);
    try {
      await onGuardar({
        tipoVehiculo, tipoRemolque,
        placa: placa.trim().toUpperCase(),
        placaRemolque: placaRemolque.trim().toUpperCase(),
        marca, modelo,
        conductor: conductorAsignado,
        propietario: propietario.trim(),
        tenedor: tenedor.trim(),
        fotoUrl,
      });
      navigate("/vehiculos");
    } catch {
      setErrores({ general: "Error al guardar. Intenta de nuevo." });
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  const banner = BANNERS[subPaso - 1];

  return (
    <WizardPantalla>
      <WizardHeader titulo="Agregar vehículo" onVolver={() => navigate(-1)} labelVolver="Vehículos" />
      <WizardProgress total={TOTAL_PASOS} actual={subPaso} etiquetas={ETIQUETAS} />
      <WizardBanner icono={banner.icono} titulo={banner.titulo} mensaje={banner.mensaje} />

      {/* ── PASO 1: Tipo de vehículo y remolque ── */}
      {subPaso === 1 && (
        <WizardCard>
          <WizardCampo label="Tipo de vehículo" obligatorio error={errores.tipoVehiculo}>
            <WizardOpciones
              opciones={TIPOS_VEHICULO}
              valor={tipoVehiculo}
              onChange={(v) => { setTipoVehiculo(v); setErrores({}); }}
              columnas={3}
            />
          </WizardCampo>
          <WizardCampo label="Tipo de remolque" ayuda="Si el camión no tiene remolque, deja 'Sin remolque'.">
            <WizardOpciones
              opciones={TIPOS_REMOLQUE}
              valor={tipoRemolque}
              onChange={setTipoRemolque}
              columnas={3}
            />
          </WizardCampo>
        </WizardCard>
      )}

      {/* ── PASO 2: Placa, marca y modelo ── */}
      {subPaso === 2 && (
        <WizardCard>
          <WizardCampo label="Placa del vehículo" obligatorio error={errores.placa}>
            <WizardInput
              value={placa}
              onChange={e => { setPlaca(e.target.value.toUpperCase()); setErrores({}); }}
              placeholder="ABC123"
              maxLength={6}
            />
          </WizardCampo>
          <WizardCampo label="Placa del remolque" ayuda="Solo si tiene remolque">
            <WizardInput
              value={placaRemolque}
              onChange={e => setPlacaRemolque(e.target.value.toUpperCase())}
              placeholder="S-00000"
              maxLength={7}
            />
          </WizardCampo>
          <WizardCampo label="Marca">
            <WizardSelect value={marca} onChange={e => setMarca(e.target.value)}>
              <option value="">Seleccionar marca...</option>
              {["AUTOCAR","ASTRA","BYD","CATERPILLAR","CHEVROLET","DAEWOO","DONGFENG","FAW","FORD",
                "FOTON","FOTON AUMAN","FREIGHTLINER","GMC","HINO","HYUNDAI","INTERNATIONAL","ISUZU",
                "IVECO","JAC","KENWORTH","MACK","MAN","MERCEDES BENZ","MITSUBISHI","NISSAN",
                "PETERBILT","RENAULT","SCANIA","SHACMAN","SINOTRUK","VOLKSWAGEN","VOLVO",
                "WESTERN STAR","YUTONG","OTRO"].map(m=>(<option key={m} value={m}>{m}</option>))}
            </WizardSelect>
          </WizardCampo>
          <WizardCampo label="Modelo (año)">
            <WizardInput
              type="number"
              value={modelo}
              onChange={e => setModelo(e.target.value)}
              placeholder="2020"
              min="1970" max="2100"
            />
          </WizardCampo>
        </WizardCard>
      )}

      {/* ── PASO 3: Propietario, tenedor y conductor ── */}
      {subPaso === 3 && (
        <WizardCard>
          <WizardCampo label="Nombre del propietario" obligatorio error={errores.propietario}>
            <WizardInput
              value={propietario}
              onChange={e => { setPropietario(e.target.value); setErrores({}); }}
              placeholder="Nombre completo"
            />
          </WizardCampo>
          <WizardCampo label="Tenedor (si es diferente al propietario)" ayuda="El tenedor es quien tiene el vehículo a su cargo">
            <WizardInput
              value={tenedor}
              onChange={e => setTenedor(e.target.value)}
              placeholder="Nombre completo (opcional)"
            />
          </WizardCampo>
          <WizardCampo label="Conductor asignado" ayuda="Puedes asignarlo después si no está disponible">
            <WizardSelect value={conductorAsignado} onChange={e => setConductorAsignado(e.target.value)}>
              <option value="">Sin conductor asignado</option>
              {conductores.map(c => (
                <option key={c.firestoreId} value={c.nombre}>
                  {c.nombre}{c.catLic ? ` · Cat ${c.catLic}` : ""}
                </option>
              ))}
            </WizardSelect>
          </WizardCampo>
        </WizardCard>
      )}

      {/* ── PASO 4: Foto y confirmar ── */}
      {subPaso === 4 && (
        <WizardCard>
          {/* Resumen */}
          <div style={{
            background:"#F0F4FF", borderRadius:"12px",
            padding:"14px 16px", marginBottom:"20px",
          }}>
            <p style={{ fontSize:"13px",fontWeight:700,color:"#3B82F6",
              textTransform:"uppercase",letterSpacing:"0.08em",margin:"0 0 8px" }}>
              Resumen del vehículo
            </p>
            {[
              ["Tipo",      tipoVehiculo || "—"],
              ["Remolque",  tipoRemolque || "Sin remolque"],
              ["Placa",     placa || "—"],
              ["Marca",     marca || "—"],
              ["Modelo",    modelo || "—"],
              ["Propietario",propietario || "—"],
            ].map(([k,v])=>(
              <div key={k} style={{ display:"flex",justifyContent:"space-between",
                paddingBottom:"5px",marginBottom:"5px",
                borderBottom:"1px solid #E0E9FF" }}>
                <span style={{ fontSize:"14px",color:"#6B7280",fontWeight:600 }}>{k}</span>
                <span style={{ fontSize:"14px",color:"#111827",fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>

          {/* Foto */}
          <WizardCampo label="Foto del vehículo" ayuda="Opcional · Toca para subir desde tu galería">
            {fotoUrl ? (
              <div style={{ position:"relative" }}>
                <img src={fotoUrl} alt="Vehículo"
                  style={{ width:"100%",height:"180px",objectFit:"cover",borderRadius:"12px" }}/>
                <button
                  style={{ position:"absolute",top:"8px",right:"8px",
                    background:"rgba(255,255,255,0.9)",border:"1px solid #D1DCF0",
                    borderRadius:"8px",padding:"6px 12px",cursor:"pointer",
                    fontSize:"12px",color:"#EF4444",fontWeight:700 }}
                  onClick={() => setFotoUrl("")}>Cambiar</button>
              </div>
            ) : (
              <label style={{
                display:"flex",flexDirection:"column",alignItems:"center",
                justifyContent:"center",height:"130px",
                background:"#F8FAFF",borderRadius:"12px",
                border:"2px dashed #3B82F6",cursor:"pointer",gap:"10px",
              }}>
                <Camera size={32} color="#3B82F6" strokeWidth={1.5} />
                <span style={{ fontSize:"15px",color:"#3B82F6",fontWeight:600 }}>
                  {subiendo?.foto ? `Subiendo ${progreso?.foto||0}%...` : "Toca para subir foto"}
                </span>
                <input type="file" accept="image/*" style={{ display:"none" }}
                  onChange={async e => {
                    const archivo = e.target.files[0];
                    if (!archivo) return;
                    const nombreSaneado = sanearNombreArchivo(archivo.name);
                    const ruta = `usuarios/${usuario?.uid}/vehiculos/${Date.now()}_${nombreSaneado}`;
                    subirArchivo(archivo, ruta, "foto", url => setFotoUrl(url));
                  }}
                />
              </label>
            )}
          </WizardCampo>

          {errores.general && (
            <p style={{ fontSize:"14px",color:"#EF4444",fontWeight:600,
              textAlign:"center",margin:"8px 0" }}>
              {errores.general}
            </p>
          )}
        </WizardCard>
      )}

      <WizardStepDots total={TOTAL_PASOS} actual={subPaso} />
      <WizardNav
        subPaso={subPaso}
        totalSubPasos={TOTAL_PASOS}
        onAnterior={anterior}
        onSiguiente={siguiente}
        onGuardar={guardar}
        guardando={guardando}
        labelGuardar="Guardar vehículo"
      />
    </WizardPantalla>
  );
}

export default AgregarVehiculo;
