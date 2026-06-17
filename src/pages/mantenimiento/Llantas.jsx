import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { theme as t } from "../../styles/theme";

const CONFIGS_VEHICULO = {
  "TURBO SENCILLO":    { total: 4,  label: "Turbo 4 llantas" },
  "SENCILLO":          { total: 6,  label: "Sencillo" },
  "TURBO":             { total: 6,  label: "Turbo" },
  "DOBLETROQUE":       { total: 10, label: "Dobletroque" },
  "PATINETA 2S2":      { total: 14, label: "Patineta 2S2" },
  "PATINETA 2S3":      { total: 18, label: "Patineta 2S3" },
  "TRACTOMULA 3S2":    { total: 18, label: "Tractomula 3S2" },
  "TRACTOMULA 3S3":    { total: 22, label: "Tractomula 3S3" },
};

const POSICIONES = {
  4:  ["Del. izq","Del. der","Tras. izq","Tras. der"],
  6:  ["Del. izq","Del. der","Tras. izq int","Tras. izq ext","Tras. der int","Tras. der ext"],
  10: ["Del. izq","Del. der","Med. izq int","Med. izq ext","Med. der int","Med. der ext","Tras. izq int","Tras. izq ext","Tras. der int","Tras. der ext"],
  14: ["Del. izq","Del. der","Trac. izq int","Trac. izq ext","Trac. der int","Trac. der ext","Trac2 izq int","Trac2 izq ext","Trac2 der int","Trac2 der ext","Rem. izq int","Rem. izq ext","Rem. der int","Rem. der ext"],
  18: ["Del. izq","Del. der","Trac. izq int","Trac. izq ext","Trac. der int","Trac. der ext","Trac2 izq int","Trac2 izq ext","Trac2 der int","Trac2 der ext","Trac3 izq int","Trac3 izq ext","Trac3 der int","Trac3 der ext","Rem. izq int","Rem. izq ext","Rem. der int","Rem. der ext"],
  22: ["Del. izq","Del. der","Trac. izq int","Trac. izq ext","Trac. der int","Trac. der ext","Trac2 izq int","Trac2 izq ext","Trac2 der int","Trac2 der ext","Trac3 izq int","Trac3 izq ext","Trac3 der int","Trac3 der ext","Rem1 izq int","Rem1 izq ext","Rem1 der int","Rem1 der ext","Rem2 izq int","Rem2 izq ext","Rem2 der int","Rem2 der ext"],
};

function estadoColor(e) {
  return e==="nueva"?"#0E7490":e==="ok"?"#16A34A":e==="warn"?"#D97706":"#DC2626";
}

function DiagramaLlantas({ total, llantas, onSelect, llantaActiva, tipoVehiculo }) {
  const tipo = (tipoVehiculo || "").toUpperCase();
  const esTractomula = tipo.includes("TRACTOMULA") || tipo.includes("PATINETA");

  // Definir ejes por cuerpo
  const ejesCabezote = {
    "TRACTOMULA 3S3": [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}] ],
    "TRACTOMULA 3S2": [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}] ],
    "PATINETA 2S3":   [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}] ],
    "PATINETA 2S2":   [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}] ],
  };
  const ejesTrailer = {
    "TRACTOMULA 3S3": [ [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}], [{n:15,x:18},{n:16,x:35},{n:17,x:165},{n:18,x:182}], [{n:19,x:18},{n:20,x:35},{n:21,x:165},{n:22,x:182}] ],
    "TRACTOMULA 3S2": [ [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}], [{n:15,x:18},{n:16,x:35},{n:17,x:165},{n:18,x:182}] ],
    "PATINETA 2S3":   [ [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}], [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}], [{n:15,x:18},{n:16,x:35},{n:17,x:165},{n:18,x:182}] ],
    "PATINETA 2S2":   [ [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}], [{n:11,x:18},{n:12,x:35},{n:13,x:165},{n:14,x:182}] ],
  };

  // Vehículo sencillo (un solo cuerpo)
  const ejesSencillo = {
    4:  [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:30},{n:4,x:170}] ],
    6:  [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}] ],
    10: [ [{n:1,x:30},{n:2,x:170}], [{n:3,x:18},{n:4,x:35},{n:5,x:165},{n:6,x:182}], [{n:7,x:18},{n:8,x:35},{n:9,x:165},{n:10,x:182}] ],
  };

  const renderLlanta = (l, y) => {
    const datos  = llantas[l.n] || {};
    const color  = estadoColor(datos.estado || "ok");
    const activo = llantaActiva === l.n;
    const lw     = l.n <= 2 ? 12 : 10;
    const lh     = l.n <= 2 ? 24 : 22;
    return (
      <g key={l.n} onClick={()=>onSelect(l.n)} style={{cursor:"pointer"}}>
        <rect x={l.x-lw/2} y={y-lh/2} width={lw} height={lh} rx="3"
          fill={color} stroke={activo?"#fff":"#00000033"} strokeWidth={activo?2.5:1}
          filter={activo?"drop-shadow(0 0 4px rgba(255,255,255,0.4))":"none"} />
        <line x1={l.x-lw/2+2} x2={l.x+lw/2-2} y1={y} y2={y} stroke="rgba(0,0,0,0.2)" strokeWidth="1"/>
        <text x={l.x>100?l.x+lw/2+4:l.x-lw/2-4} y={y+3.5}
          textAnchor={l.x>100?"start":"end"} fontSize="9" fontWeight="600" fill="#94A3B8">{l.n}</text>
      </g>
    );
  };

  const renderEjes = (ejes, yBase, paso) => ejes.map((eje, ei) => {
    const y = yBase + ei * paso;
    return (
      <g key={ei}>
        <line x1="14" x2="186" y1={y} y2={y} stroke="#2A5A8F" strokeWidth="1.5"/>
        {eje.map(l => renderLlanta(l, y))}
      </g>
    );
  });

  if (esTractomula && ejesCabezote[tipo]) {
    const cab = ejesCabezote[tipo];
    const trl = ejesTrailer[tipo];
    const paso = 55;
    const cabAltura = 30 + cab.length * paso + 10;
    const enganY = cabAltura + 20;
    const trlStartY = enganY + 30;
    const trlAltura = trl.length * paso + 20;
    const totalAltura = trlStartY + trlAltura + 10;

    return (
      <svg width="200" height={totalAltura} viewBox={`0 0 200 ${totalAltura}`} style={{display:"block",margin:"0 auto"}}>
        <defs>
          <linearGradient id="cabGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#0F2340"/>
          </linearGradient>
          <linearGradient id="trlGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#162D4A"/><stop offset="100%" stopColor="#0D1B2F"/>
          </linearGradient>
        </defs>

        {/* CABEZOTE */}
        <rect x="68" y="8" width="64" height={cabAltura-8} rx="8"
          fill="url(#cabGrad)" stroke="#2A5A8F" strokeWidth="1.5"/>
        {/* Cabina */}
        <rect x="72" y="10" width="56" height="24" rx="6"
          fill="#1565FF" fillOpacity="0.15" stroke="#1565FF" strokeWidth="0.8"/>
        <rect x="82" y="15" width="36" height="10" rx="3"
          fill="none" stroke="#1565FF" strokeWidth="0.5" opacity="0.4"/>
        {/* Espejos */}
        <rect x="58" y="14" width="8" height="4" rx="1.5" fill="#2A5A8F"/>
        <rect x="134" y="14" width="8" height="4" rx="1.5" fill="#2A5A8F"/>
        {/* Label */}
        <text x="100" y={cabAltura-4} textAnchor="middle" fontSize="8" fill="#4A6A8F" fontWeight="600">CABEZOTE</text>

        {renderEjes(cab, 50, paso)}

        {/* ENGANCHE / QUINTA RUEDA */}
        <line x1="90" x2="110" y1={enganY} y2={enganY} stroke="#2A5A8F" strokeWidth="2"/>
        <circle cx="100" cy={enganY} r="6" fill="#0F2340" stroke="#1565FF" strokeWidth="1.5"/>
        <circle cx="100" cy={enganY} r="2" fill="#1565FF"/>

        {/* TRAILER */}
        <rect x="62" y={trlStartY-10} width="76" height={trlAltura+10} rx="6"
          fill="url(#trlGrad)" stroke="#2A5A8F" strokeWidth="1.5"/>
        {/* Label */}
        <text x="100" y={trlStartY} textAnchor="middle" fontSize="8" fill="#4A6A8F" fontWeight="600">TRAILER</text>

        {renderEjes(trl, trlStartY + 18, paso)}
      </svg>
    );
  }

  // Vehículo sencillo
  const ejes = ejesSencillo[total] || ejesSencillo[6];
  const altura = 60 + ejes.length * 60;

  return (
    <svg width="200" height={altura} viewBox={`0 0 200 ${altura}`} style={{display:"block",margin:"0 auto"}}>
      <defs>
        <linearGradient id="chasisGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1E3A5F"/><stop offset="100%" stopColor="#0F2340"/>
        </linearGradient>
      </defs>
      <rect x="68" y="10" width="64" height={altura-20} rx="8"
        fill="url(#chasisGrad)" stroke="#2A5A8F" strokeWidth="1.5"/>
      <line x1="100" y1="20" x2="100" y2={altura-20} stroke="#2A5A8F" strokeWidth="0.5" strokeDasharray="4 4"/>
      <rect x="75" y="12" width="50" height="20" rx="4"
        fill="#1565FF" fillOpacity="0.15" stroke="#1565FF" strokeWidth="0.8"/>
      <circle cx="100" cy="22" r="4" fill="none" stroke="#1565FF" strokeWidth="0.8" opacity="0.5"/>
      {renderEjes(ejes, 40, 60)}
    </svg>
  );
}

function Llantas({ vehiculos, onAgregar, mostrarToast, onEditarVehiculo }) {
  const navigate = useNavigate();
  const { id }   = useParams();

  const vehiculo   = vehiculos.find(v => String(v.firestoreId) === String(id));
  const tipoVeh    = vehiculo?.tipoVehiculo?.toUpperCase() || "";
  const cfgVeh     = CONFIGS_VEHICULO[tipoVeh] || { total: 6, label: tipoVeh };
  const totalLl    = cfgVeh.total;
  const posiciones = POSICIONES[totalLl] || [];

  const [llantas,   setLlantas]   = useState(vehiculo?.llantasData || {});
  const [seleccionada, setSeleccionada] = useState(null);
  const [guardando,    setGuardando]    = useState(false);

  const [marca,  setMarca]  = useState("");
  const [ref,    setRef]    = useState("");
  const [prof,   setProf]   = useState("");
  const [kmMont, setKmMont] = useState("");
  const [fechaMont, setFechaMont] = useState(new Date().toISOString().slice(0,10));
  const [valor,    setValor]    = useState("");
  const [estado, setEstado] = useState("ok");
  const [obs,    setObs]    = useState("");

  const guardarLocal = (nuevas) => {
    onEditarVehiculo(vehiculo.firestoreId, { llantasData: nuevas }).catch(()=>{});
  };

  const abrirDetalle = (n) => {
    setSeleccionada(n);
    const d = llantas[n] || {};
    setMarca(d.marca||""); setRef(d.ref||"");
    setProf(d.prof||""); setKmMont(d.km||"");
    setFechaMont(d.fecha || new Date().toISOString().slice(0,10));
    setValor(d.valor || "");
    setEstado(d.estado||"ok"); setObs(d.obs||"");
  };

  const guardarLlanta = () => {
    const nuevas = {
      ...llantas,
      [seleccionada]: { marca, ref, prof, km: kmMont, fecha: fechaMont, valor: Number(valor) || 0, estado, obs }
    };
    setLlantas(nuevas);
    guardarLocal(nuevas);
    setSeleccionada(null);
    mostrarToast("Llanta guardada","exito");
  };

  if (!vehiculo) return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
      </div>
      <p style={{textAlign:"center",padding:"40px",color:t.colors.textSecondary}}>Vehículo no encontrado.</p>
    </div>
  );

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={()=>navigate(`/vehiculo/${id}`, { state: { tab: "mant" } })}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Llantas</h1>
      </div>

      <div style={styles.contenido}>

        {/* INFO VEHÍCULO */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Vehículo</p>
          <p style={{fontSize:t.fonts.sizeMd, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0}}>{vehiculo.placa}</p>
          <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"2px 0 0"}}>{cfgVeh.label} · {totalLl} llantas</p>
        </div>

        {/* DIAGRAMA */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Toca una llanta para editar</p>
          <DiagramaLlantas
            total={totalLl}
            llantas={llantas}
            onSelect={abrirDetalle}
            llantaActiva={seleccionada}
            tipoVehiculo={vehiculo?.tipoVehiculo}
          />
          <div style={{display:"flex", gap:"12px", marginTop:"12px", flexWrap:"wrap", justifyContent:"center"}}>
            {[{e:"nueva",l:"Nueva",c:"#0E7490"},{e:"ok",l:"Buena",c:"#16A34A"},{e:"warn",l:"Desgastada",c:"#D97706"},{e:"bad",l:"Cambiar",c:"#DC2626"}].map(s=>(
              <span key={s.e} style={{display:"flex",alignItems:"center",gap:"4px",fontSize:t.fonts.sizeXs,color:t.colors.textSecondary}}>
                <span style={{width:"10px",height:"10px",borderRadius:"50%",background:s.c,display:"inline-block"}}/>
                {s.l}
              </span>
            ))}
          </div>
        </div>

        {/* DETALLE LLANTA */}
        {seleccionada && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>
              Llanta {seleccionada} — {posiciones[seleccionada-1]||""}
            </p>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Marca</label>
                <input type="text" placeholder="Michelin, Bridgestone..." value={marca}
                  onChange={e=>setMarca(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Referencia</label>
                <input type="text" placeholder="295/80 R22.5" value={ref}
                  onChange={e=>setRef(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Profundidad (mm)</label>
                <input type="text" placeholder="15mm" value={prof}
                  onChange={e=>setProf(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Km al montar</label>
                <input type="number" placeholder="120000" value={kmMont}
                  onChange={e=>setKmMont(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Fecha de montaje</label>
                <input type="date" value={fechaMont}
                  onChange={e=>setFechaMont(e.target.value)} style={styles.input}/>
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Valor llanta ($)</label>
                <input type="number" placeholder="1200000" value={valor}
                  onChange={e=>setValor(e.target.value)} style={styles.input}/>
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Estado</label>
                <select value={estado} onChange={e=>setEstado(e.target.value)} style={styles.input}>
                  <option value="nueva">Nueva</option>
                  <option value="ok">Buena</option>
                  <option value="warn">Desgastada</option>
                  <option value="bad">Cambiar — requiere reemplazo</option>
                </select>
              </div>
            </div>

            {/* Vida útil y costo/km calculados */}
            {kmMont && (vehiculo?.kmOdometro || 0) > 0 && (()=>{
              const vidaUtil = (vehiculo?.kmOdometro || 0) - Number(kmMont);
              const costoKm = vidaUtil > 0 && Number(valor) > 0 ? Number(valor) / vidaUtil : 0;
              if (vidaUtil <= 0) return null;
              return (
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginBottom:"10px"}}>
                  <div style={{background:t.colors.bgSection,borderRadius:t.radius.sm,padding:"10px",textAlign:"center"}}>
                    <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"0 0 2px"}}>Vida útil</p>
                    <p style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBlack,color:t.colors.green,margin:0}}>
                      {vidaUtil.toLocaleString("es-CO")} km
                    </p>
                  </div>
                  {costoKm > 0 && (
                    <div style={{background:t.colors.bgSection,borderRadius:t.radius.sm,padding:"10px",textAlign:"center"}}>
                      <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"0 0 2px"}}>Costo/km</p>
                      <p style={{fontSize:t.fonts.sizeMd,fontWeight:t.fonts.weightBlack,color:t.colors.amber,margin:0}}>
                        ${costoKm.toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              );
            })()}
            <div style={styles.campo}>
              <label style={styles.label}>Observaciones</label>
              <input type="text" placeholder="Reparada, pinchada, etc." value={obs}
                onChange={e=>setObs(e.target.value)} style={styles.input}/>
            </div>
            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1,padding:"12px",background:t.colors.green,color:"#fff",border:"none",borderRadius:t.radius.md,fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightBold,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:"6px"}}
                onClick={guardarLlanta}
              >
                <Save size={16} color="#fff" strokeWidth={2}/>
                Guardar
              </button>
              <button
                style={{padding:"12px 16px",background:"none",border:`1px solid ${t.colors.border}`,borderRadius:t.radius.md,cursor:"pointer",color:t.colors.textSecondary,fontSize:t.fonts.sizeSm}}
                onClick={()=>setSeleccionada(null)}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* TABLA RESUMEN */}
        <div style={styles.card}>
          <p style={styles.cardTitulo}>Resumen de llantas</p>
          {Array.from({length:totalLl},(_,i)=>i+1).map((n,i,arr)=>{
            const d = llantas[n]||{};
            const color = estadoColor(d.estado||"ok");
            const estadoLabel = d.estado==="nueva"?"Nueva":d.estado==="warn"?"Desgastada":d.estado==="bad"?"Cambiar":"Buena";
            return (
              <div key={n}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:i===arr.length-1?"none":`1px solid ${t.colors.borderLight}`,cursor:"pointer"}}
                onClick={()=>abrirDetalle(n)}
              >
                <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                  <div style={{width:"10px",height:"10px",borderRadius:"50%",background:color,flexShrink:0}}/>
                  <div>
                    <p style={{fontSize:t.fonts.sizeSm,fontWeight:t.fonts.weightSemibold,color:t.colors.textPrimary,margin:0}}>
                      Llanta {n} — {posiciones[n-1]||""}
                    </p>
                    {d.marca&&<p style={{fontSize:t.fonts.sizeXs,color:t.colors.textSecondary,margin:"2px 0 0"}}>
                      {d.marca}{d.ref?` · ${d.ref}`:""}{d.fecha?` · ${d.fecha}`:""}
                    </p>}
                    {d.km && (vehiculo?.kmOdometro||0) > Number(d.km) && (()=>{
                      const vida = (vehiculo?.kmOdometro||0) - Number(d.km);
                      const cKm = vida > 0 && d.valor > 0 ? d.valor / vida : 0;
                      return (
                        <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"2px 0 0"}}>
                          {vida.toLocaleString("es-CO")} km rodados
                          {cKm > 0 ? ` · $${cKm.toFixed(1)}/km` : ""}
                        </p>
                      );
                    })()}
                  </div>
                </div>
                <span style={{fontSize:t.fonts.sizeXs,fontWeight:t.fonts.weightSemibold,color,whiteSpace:"nowrap"}}>{estadoLabel}</span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

const styles = {
  pantalla:   { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:     { display:"flex", alignItems:"center", gap:"12px", padding:"16px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:  { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", color:t.colors.blue, cursor:"pointer", padding:0, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold },
  titulo:     { fontSize:"18px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  contenido:  { padding:"12px 16px 16px" },
  card:       { background:t.colors.bgCard, borderRadius:t.radius.lg, padding:"16px", marginBottom:"10px", boxShadow:t.shadows.card },
  cardTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 12px" },
  campo:      { display:"flex", flexDirection:"column", gap:"5px", marginBottom:"10px" },
  fila2:      { display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" },
  label:      { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, textTransform:"uppercase", letterSpacing:"0.05em" },
  input:      { padding:"11px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, fontSize:t.fonts.sizeSm, background:t.colors.bgPrimary, color:t.colors.textPrimary, outline:"none", width:"100%", boxSizing:"border-box" },
};

export default Llantas;