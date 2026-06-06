import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Search, Trash2, Save, Handshake } from "lucide-react";
import { theme as t } from "../styles/theme";

const TIPOS = ["Transportadora","Generadora de carga","Operador logístico","Comercializadora","Otra"];

function Empresas({ empresas = [], onAgregar, onEliminar }) {
  const navigate = useNavigate();
  const [vista,    setVista]    = useState("lista");
  const [busqueda, setBusqueda] = useState("");
  const [errores,  setErrores]  = useState({});
  const [guardando,setGuardando]= useState(false);

  const [tipo,       setTipo]       = useState("");
  const [razonSocial,setRazonSocial]= useState("");
  const [nit,        setNit]        = useState("");
  const [ciudad,     setCiudad]     = useState("");
  const [contacto,   setContacto]   = useState("");
  const [telefono,   setTelefono]   = useState("");
  const [correo,     setCorreo]     = useState("");

  const limpiar = () => {
    setTipo("");setRazonSocial("");setNit("");
    setCiudad("");setContacto("");setTelefono("");
    setCorreo("");setErrores({});
  };

  const validar = () => {
    const e={};
    if (!tipo)               e.tipo        = "Selecciona el tipo";
    if (!razonSocial.trim()) e.razonSocial = "La razón social es obligatoria";
    return e;
  };

  const guardar = async () => {
    const e=validar();
    if (Object.keys(e).length>0){setErrores(e);return;}
    setGuardando(true);
    await onAgregar({tipo,razonSocial:razonSocial.trim(),nit:nit.trim(),ciudad:ciudad.trim(),contacto:contacto.trim(),telefono:telefono.trim(),correo:correo.trim()});
    limpiar();setVista("lista");setGuardando(false);
  };

  const eliminar = async (emp) => {
    if (!window.confirm("¿Eliminar esta empresa?")) return;
    await onEliminar(emp.firestoreId);
  };

  const filtradas = empresas.filter(e=>
    e.razonSocial.toLowerCase().includes(busqueda.toLowerCase())||
    (e.ciudad||"").toLowerCase().includes(busqueda.toLowerCase())
  );

  if (vista==="agregar") {
    return (
      <div style={styles.pantalla}>
        <div style={styles.header}>
          <button style={styles.btnVolver} onClick={()=>{limpiar();setVista("lista");}}>
            <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
            <span>Empresas</span>
          </button>
          <h1 style={styles.titulo}>Agregar empresa</h1>
        </div>

        <div style={styles.seccionLabel}>Datos de la empresa</div>
        <div style={styles.card}>
          <div style={styles.campo}>
            <label style={styles.label}>Tipo *</label>
            <select value={tipo} onChange={e=>{setTipo(e.target.value);setErrores({...errores,tipo:null});}}
              style={{...styles.input,color:tipo?t.colors.textPrimary:t.colors.textTertiary}}>
              <option value="">Seleccionar...</option>
              {TIPOS.map(tp=><option key={tp} value={tp}>{tp}</option>)}
            </select>
            {errores.tipo&&<p style={styles.error}>{errores.tipo}</p>}
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Razón social *</label>
            <input type="text" placeholder="Nombre de la empresa" value={razonSocial}
              onChange={e=>{setRazonSocial(e.target.value);setErrores({...errores,razonSocial:null});}}
              style={styles.input} />
            {errores.razonSocial&&<p style={styles.error}>{errores.razonSocial}</p>}
          </div>
          <div style={styles.fila2}>
            <div style={styles.campo}>
              <label style={styles.label}>NIT</label>
              <input type="text" placeholder="900.123.456-7" value={nit} onChange={e=>setNit(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Ciudad</label>
              <input type="text" placeholder="Barranquilla" value={ciudad} onChange={e=>setCiudad(e.target.value)} style={styles.input} />
            </div>
          </div>
        </div>

        <div style={styles.seccionLabel}>Contacto</div>
        <div style={styles.card}>
          <div style={styles.campo}>
            <label style={styles.label}>Persona de contacto</label>
            <input type="text" placeholder="Nombre completo" value={contacto} onChange={e=>setContacto(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Teléfono</label>
            <input type="tel" placeholder="+57 300 000 0000" value={telefono} onChange={e=>setTelefono(e.target.value)} style={styles.input} />
          </div>
          <div style={styles.campo}>
            <label style={styles.label}>Correo</label>
            <input type="email" placeholder="correo@empresa.com" value={correo} onChange={e=>setCorreo(e.target.value)} style={styles.input} />
          </div>
        </div>

        <div style={{padding:"0 16px"}}>
          <button style={{...styles.btnGuardar,opacity:guardando?0.75:1}} onClick={guardar} disabled={guardando}>
            <Save size={18} color="#fff" strokeWidth={2} />
            {guardando?"Guardando...":"Guardar empresa"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <div>
          <p style={styles.headerSub}>Directorio</p>
          <h1 style={styles.titulo}>Empresas</h1>
        </div>
        <button style={styles.btnAgregar} onClick={()=>setVista("agregar")}>
          <Plus size={16} color="#fff" strokeWidth={2.5} />
          Agregar
        </button>
      </div>

      <div style={styles.buscadorWrap}>
        <Search size={16} color={t.colors.textTertiary} style={{flexShrink:0}} />
        <input type="text" placeholder="Buscar empresa o ciudad..." value={busqueda}
          onChange={e=>setBusqueda(e.target.value)} style={styles.buscadorInput} />
      </div>

      {empresas.length===0&&(
        <div style={styles.vacio}>
          <div style={styles.vacioIconoWrap}>
            <Handshake size={40} color={t.colors.blue} strokeWidth={1.5} />
          </div>
          <p style={styles.vacioTexto}>Sin empresas registradas</p>
          <p style={styles.vacioSub}>Registra las empresas con las que trabajas.</p>
          <button style={styles.btnAgregarVacio} onClick={()=>setVista("agregar")}>
            <Plus size={16} color="#fff" /> Agregar empresa
          </button>
        </div>
      )}

      {empresas.length>0&&filtradas.length===0&&(
        <div style={styles.vacio}>
          <p style={styles.vacioTexto}>Sin resultados</p>
          <p style={styles.vacioSub}>No hay empresas con "{busqueda}"</p>
        </div>
      )}

      <div style={styles.lista}>
        {filtradas.map(emp=>(
          <div key={emp.firestoreId} style={styles.tarjeta}>
            <div style={styles.tarjetaFranja} />
            <div style={styles.tarjetaContenido}>
              <div style={styles.tarjetaIconoWrap}>
                <Handshake size={22} color={t.colors.blue} strokeWidth={1.8} />
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={styles.tarjetaNombre}>{emp.razonSocial}</p>
                <p style={styles.tarjetaTipo}>{emp.tipo}{emp.ciudad?` · ${emp.ciudad}`:""}</p>
                {emp.contacto&&(
                  <p style={styles.tarjetaContacto}>
                    {emp.contacto}{emp.telefono?` · ${emp.telefono}`:""}
                  </p>
                )}
              </div>
            </div>
            <button style={styles.btnEliminar} onClick={()=>eliminar(emp)}>
              <Trash2 size={16} color={t.colors.red} strokeWidth={1.8} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  pantalla:          { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"20px" },
  header:            { display:"flex", justifyContent:"space-between", alignItems:"flex-end", padding:"20px 20px 16px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  headerSub:         { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 2px", fontWeight:t.fonts.weightMedium, textTransform:"uppercase", letterSpacing:"0.06em" },
  titulo:            { fontSize:"22px", fontWeight:t.fonts.weightBlack, color:t.colors.textPrimary, margin:0, letterSpacing:"-0.3px" },
  btnVolver:         { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  btnAgregar:        { display:"flex", alignItems:"center", gap:"6px", padding:"10px 16px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  buscadorWrap:      { display:"flex", alignItems:"center", gap:"10px", margin:"12px 16px 8px", background:t.colors.bgCard, border:`1.5px solid ${t.colors.border}`, borderRadius:t.radius.md, padding:"11px 14px", boxShadow:t.shadows.card },
  buscadorInput:     { flex:1, border:"none", outline:"none", fontSize:t.fonts.sizeSm, color:t.colors.textPrimary, background:"transparent" },
  vacio:             { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"48px 24px", textAlign:"center", margin:"8px 16px", boxShadow:t.shadows.card },
  vacioIconoWrap:    { width:"72px", height:"72px", background:t.colors.blueSoft, borderRadius:t.radius.xl, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px" },
  vacioTexto:        { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 6px" },
  vacioSub:          { fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, margin:"0 0 20px" },
  btnAgregarVacio:   { display:"inline-flex", alignItems:"center", gap:"6px", padding:"12px 24px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer" },
  lista:             { padding:"0 16px", display:"flex", flexDirection:"column", gap:"10px" },
  tarjeta:           { background:t.colors.bgCard, borderRadius:t.radius.lg, display:"flex", alignItems:"center", overflow:"hidden", boxShadow:t.shadows.card },
  tarjetaFranja:     { width:"4px", alignSelf:"stretch", background:t.colors.blue, flexShrink:0 },
  tarjetaContenido:  { display:"flex", alignItems:"center", gap:"12px", flex:1, padding:"14px 12px" },
  tarjetaIconoWrap:  { width:"42px", height:"42px", background:t.colors.blueSoft, borderRadius:t.radius.sm, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  tarjetaNombre:     { fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  tarjetaTipo:       { fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0" },
  tarjetaContacto:   { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"3px 0 0" },
  btnEliminar:       { padding:"14px", background:"none", border:"none", cursor:"pointer", borderLeft:`1px solid ${t.colors.borderLight}` },
  seccionLabel:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"16px 20px 8px" },
  card:              { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", margin:"0 16px 4px", boxShadow:t.shadows.card },
  campo:             { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"12px" },
  fila2:             { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:             { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:             { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
  error:             { fontSize:t.fonts.sizeXs, color:t.colors.red, margin:"3px 0 0", fontWeight:t.fonts.weightMedium },
  btnGuardar:        { width:"100%", padding:"15px", background:t.colors.green, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginTop:"8px" },
};

export default Empresas;