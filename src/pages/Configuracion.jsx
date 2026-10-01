/**
 * Hecho por JESUS COSSIO DEV
 * Optimizaciones de arquitectura, accesibilidad y experiencia de usuario
 */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Bell, Volume2, MessageCircle, Trash2, Check, Moon, Sun, MapPin, Phone, Landmark, AlertTriangle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useTheme } from "../hooks/useTheme";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { httpsCallable } from "firebase/functions";
import { db, storage, functions } from "../firebase";
import { theme as t } from "../styles/theme";
import FirmaCanvas from "../components/FirmaCanvas";
import { useUid } from "../lib/useUid";
import { leer, escribir, borrarEspacioUsuario } from "../lib/userStorage";
import { purgarCacheFirestore } from "../lib/purgarCache";
import { ConfirmarModal } from "../components/ConfirmarModal";

function Configuracion({mostrarToast}) {
  const navigate = useNavigate();
  const { usuario, eliminarCuenta } = useAuth();
  const { tema, cambiarTema } = useTheme();
  const [confirmaEliminar, setConfirmaEliminar] = useState(false);
  const [textoConfirm, setTextoConfirm] = useState("");
  const [eliminando, setEliminando] = useState(false);
  const [vinculoData, setVinculoData] = useState(null);
  const [generandoCodigo, setGenerandoCodigo] = useState(false);
  const [modalLimpiarCache, setModalLimpiarCache] = useState(false);
  const [perfilFact, setPerfilFact] = useState({
    nombreCompleto: "", tipoDoc: "CC", numeroDoc: "",
    direccion: "", ciudad: "", telefono: "", correo: "",
    banco: "", tipoCuenta: "Ahorros", numeroCuenta: "", titularCuenta: "",
  });
  const [, setGuardandoPerfil] = useState(false);
  const [guardandoFirma, setGuardandoFirma] = useState(false);

  const manejarEliminarCuenta = async () => {
    if (textoConfirm !== "ELIMINAR") {
      mostrarToast("Escribe ELIMINAR para confirmar", "error");
      return;
    }
    setEliminando(true);
    try {
      await eliminarCuenta();
    } catch (err) {
      // La baja la hace el servidor, así que el "vuelve a iniciar sesión" llega
      // como functions/failed-precondition desde la callable. El código de
      // cliente auth/requires-recent-login se conserva por si el SDK de Firebase
      // lo emite antes de llegar al servidor.
      console.error(err);
      const pideReautenticacion =
        err.code === "auth/requires-recent-login" ||
        err.code === "functions/failed-precondition";
      if (pideReautenticacion) {
        mostrarToast("Por seguridad, cierra sesión, vuelve a entrar y repite la eliminación", "error");
      } else {
        mostrarToast("Error al eliminar la cuenta. Contáctanos por soporte", "error");
      }
    } finally {
      setEliminando(false);
    }
  };

  // FE-17: las preferencias viven en el espacio de localStorage del uid, no en
  // claves globales. Con dos cuentas en el mismo navegador, la clave global
  // hacía que la segunda heredara y pisara los ajustes de la primera.
  const uid = useUid();

  const [notificaciones, setNotificaciones] = useState(() => leer(uid, "cfg_notif", true) !== false);
  const [sonido, setSonido] = useState(() => leer(uid, "cfg_sonido", true) !== false);

  // El uid llega asíncrono; cuando ya lo sabemos releemos las preferencias de
  // esa cuenta para no mostrar los valores por defecto de la anterior. Se hace
  // durante el render (patrón documentado por React) y no en un efecto, para no
  // pintar un frame con los ajustes de la cuenta anterior.
  const [uidCargado, setUidCargado] = useState(uid);
  if (uid !== uidCargado) {
    setUidCargado(uid);
    setNotificaciones(leer(uid, "cfg_notif", true) !== false);
    setSonido(leer(uid, "cfg_sonido", true) !== false);
  }

  const toggleNotif = () => {
    const nuevo = !notificaciones;
    setNotificaciones(nuevo);
    escribir(uid, "cfg_notif", nuevo);
  };

  const toggleSonido = () => {
    const nuevo = !sonido;
    setSonido(nuevo);
    escribir(uid, "cfg_sonido", nuevo);
  };

  const opciones = [
    {
      Icono:   Bell,
      label:   "Notificaciones",
      sub:     "Alertas de viajes y metas",
      toggle:  true,
      valor:   notificaciones,
      accion:  toggleNotif,
    },
    {
      Icono:   Volume2,
      label:   "Sonido",
      sub:     "Sonidos de la aplicación",
      toggle:  true,
      valor:   sonido,
      accion:  toggleSonido,
    },
  ];

  const [diaLiq, setDiaLiq] = useState("");

  // Cargar día de liquidación y perfil de facturación
  useEffect(() => {
    if (!usuario?.uid) return;
    getDoc(doc(db, "usuarios", usuario.uid)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.diaLiquidacion !== undefined) setDiaLiq(String(data.diaLiquidacion));
        if (data.perfilFacturacion) setPerfilFact(prev => ({ ...prev, ...data.perfilFacturacion }));
      }
    }).catch(()=>{});
  }, [usuario?.uid]);

  const guardarDiaLiq = async (valor) => {
    setDiaLiq(valor);
    try {
      await setDoc(doc(db, "usuarios", usuario.uid), {
        diaLiquidacion: valor === "" ? null : Number(valor),
      }, { merge: true });
      mostrarToast("Día de liquidación guardado", "exito");
    } catch {
      mostrarToast("Error al guardar", "error");
    }
  };

  const generarTokenTelegram = async () => {
    setGenerandoCodigo(true);
    try {
      const fn = httpsCallable(functions, "generarTokenVinculacionTelegram");
      const res = await fn();
      setVinculoData(res.data);
      mostrarToast("Enlace de vinculación generado con éxito", "exito");
    } catch (err) {
      console.error("Error generando token de Telegram:", err);
      mostrarToast("Error generando enlace de vinculación", "error");
    } finally {
      setGenerandoCodigo(false);
    }
  };

  const guardarPerfilFact = async (campo, valor) => {
    const nuevo = { ...perfilFact, [campo]: valor };
    if (campo === "nombreCompleto" && !perfilFact.titularCuenta) {
      nuevo.titularCuenta = valor;
    }
    setPerfilFact(nuevo);
    setGuardandoPerfil(true);
    try {
      await setDoc(doc(db, "usuarios", usuario.uid), {
        perfilFacturacion: nuevo,
      }, { merge: true });
    } catch {
      mostrarToast("Error al guardar", "error");
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const guardarFirma = async (dataUrl) => {
    setGuardandoFirma(true);
    try {
      let finalFirmaUrl = dataUrl;
      try {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const firmaRef = ref(storage, `usuarios/${usuario.uid}/firma_${Date.now()}.png`);
        await uploadBytes(firmaRef, blob, { contentType: "image/png" });
        finalFirmaUrl = await getDownloadURL(firmaRef);
      } catch (storageErr) {
        console.warn("Firma Storage upload fallback:", storageErr);
      }

      const nuevo = { ...perfilFact, firmaUrl: finalFirmaUrl };
      setPerfilFact(nuevo);
      await setDoc(doc(db, "usuarios", usuario.uid), {
        perfilFacturacion: nuevo,
      }, { merge: true });
      mostrarToast("Firma guardada correctamente", "exito");
    } catch (err) {
      console.error(err);
      mostrarToast("Error al guardar la firma", "error");
    } finally {
      setGuardandoFirma(false);
    }
  };

  const perfilCompleto = perfilFact.nombreCompleto && perfilFact.numeroDoc && perfilFact.ciudad && perfilFact.telefono;
  

  return (
    <div style={styles.pantalla}>

      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={16} color={t.colors.blueText} strokeWidth={2.5}/>
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Configuración</h1>
        <div style={{ width: "60px" }} />
      </div>

      {/* CUENTA */}
      <div style={styles.seccionTitulo}>Cuenta</div>
      <div style={styles.seccion}>
        <div style={styles.fila}>
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}><User size={18} color={t.colors.blueText} strokeWidth={2}/></span>
            <div>
              <p style={styles.filaLabel}>Nombre</p>
              <p style={styles.filaSub}>{usuario?.displayName || "Usuario"}</p>
            </div>
          </div>
        </div>
        <div style={{ ...styles.fila, borderBottom: "none" }}>
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}><Mail size={18} color={t.colors.blueText} strokeWidth={2}/></span>
            <div>
              <p style={styles.filaLabel}>Correo</p>
              <p style={styles.filaSub}>{usuario?.email || "—"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PREFERENCIAS */}
      <div style={styles.seccionTitulo}>Apariencia y Preferencias</div>
      <div style={styles.seccion}>
        {/* TEMA OSCURO / CLARO */}
        <div style={{ ...styles.fila, borderBottom: `1px solid ${t.colors.borderLight}` }}>
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}>
              {tema === "dark" ? <Moon size={18} color={t.colors.blueText} strokeWidth={2}/> : <Sun size={18} color="#F59E0B" strokeWidth={2}/>}
            </span>
            <div>
              <p style={styles.filaLabel}>Tema de la aplicación</p>
              <p style={styles.filaSub}>{tema === "dark" ? "Modo Oscuro (Predeterminado)" : "Modo Claro"}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "6px", background: t.colors.bgInput, padding: "4px", borderRadius: "10px", border: `1px solid ${t.colors.borderLight}` }}>
            <button
              type="button"
              onClick={() => cambiarTema("dark")}
              style={{
                display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px",
                borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                background: tema === "dark" ? t.colors.blue : "transparent",
                color: tema === "dark" ? "#FFFFFF" : t.colors.textSecondary,
                transition: "all 0.2s"
              }}
            >
              <Moon size={13} /> Oscuro
            </button>
            <button
              type="button"
              onClick={() => cambiarTema("light")}
              style={{
                display: "flex", alignItems: "center", gap: "5px", padding: "6px 10px",
                borderRadius: "8px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: 700,
                background: tema === "light" ? t.colors.blue : "transparent",
                color: tema === "light" ? "#FFFFFF" : t.colors.textSecondary,
                transition: "all 0.2s"
              }}
            >
              <Sun size={13} /> Claro
            </button>
          </div>
        </div>

        {opciones.map((op, i, arr) => (
          <div
            key={op.label}
            style={{
              ...styles.fila,
              borderBottom: i === arr.length - 1 ? "none" : `1px solid ${t.colors.borderLight}`,
            }}
          >
            <div style={styles.filaIzq}>
              <span style={styles.filaIcono}><op.Icono size={18} color={t.colors.textSecondary} strokeWidth={2}/></span>
              <div>
                <p style={styles.filaLabel}>{op.label}</p>
                <p style={styles.filaSub}>{op.sub}</p>
              </div>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={Boolean(op.valor)}
              aria-label={op.label}
              style={{
                ...styles.toggle,
                background: op.valor ? t.colors.blue : t.colors.border,
              }}
              onClick={op.accion}
            >
              <div style={{
                ...styles.toggleCircle,
                transform: op.valor ? "translateX(20px)" : "translateX(2px)",
              }} />
            </button>
          </div>
        ))}
      </div>

      {/* VINCULAR TELEGRAM */}
      <div style={styles.seccionTitulo}>Registro por chat</div>
      <div style={{...styles.seccion, padding:"16px 20px"}}>
        <p style={{fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:"0 0 4px", display:"flex", alignItems:"center", gap:"6px"}}>
          <MessageCircle size={16} color={t.colors.blueText} strokeWidth={2}/> Registrar viajes por Telegram
        </p>
        <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 12px", lineHeight:1.5}}>
          Registre sus viajes escribiéndole al bot de NAVIRA, sin abrir la app.
          El bot conoce sus vehículos y rutas, y le calcula la ganancia al instante.
        </p>

        {!vinculoData ? (
          <button
            style={{width:"100%", padding:"12px", background:t.colors.blue, color:"#fff", border:"none", borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer"}}
            onClick={generarTokenTelegram}
            disabled={generandoCodigo}
          >
            {generandoCodigo ? "Generando enlace seguro..." : "Generar enlace de vinculación"}
          </button>
        ) : (
          <div>
            <div style={{textAlign:"center", padding:"16px", background:t.colors.bgSection, borderRadius:t.radius.md, marginBottom:"12px", border:`1px solid ${t.colors.borderLight}`}}>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 10px"}}>
                Conecte su cuenta en Telegram con 1 solo clic:
              </p>
              <a
                href={vinculoData.linkTelegram}
                target="_blank" rel="noreferrer"
                style={{
                  display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px",
                  width:"100%", padding:"13px", background:t.colors.blue, color:"#fff",
                  borderRadius:t.radius.md, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold,
                  textDecoration:"none", boxSizing:"border-box"
                }}
              >
                <MessageCircle size={18} /> Abrir Telegram y Vincular
              </a>
              <p style={{fontSize:"11px", color:t.colors.textTertiary, margin:"8px 0 0"}}>
                ⏱️ Este enlace es personal y expira en 15 minutos por seguridad.
              </p>
            </div>

            <div style={{padding:"12px", background:t.colors.bgSurface, borderRadius:t.radius.md, border:`1px dashed ${t.colors.border}`}}>
              <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 6px"}}>
                ¿Prefiere escribir el comando manualmente en el bot?
              </p>
              <div style={{display:"flex", alignItems:"center", gap:"8px"}}>
                <code style={{flex:1, fontSize:"11px", padding:"6px 8px", background:t.colors.bgSection, borderRadius:t.radius.sm, color:t.colors.textPrimary, overflowX:"auto", whiteSpace:"nowrap"}}>
                  /vincular {vinculoData.token}
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(`/vincular ${vinculoData.token}`);
                    mostrarToast("Comando copiado al portapapeles", "exito");
                  }}
                  style={{padding:"6px 10px", background:t.colors.borderLight, border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeXs, cursor:"pointer", color:t.colors.textPrimary}}
                >
                  Copiar
                </button>
              </div>
            </div>
            <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 10px", lineHeight:1.5}}>
              ¿Ya lo había vinculado desde otro chat? Escríbale <b style={{color:t.colors.textPrimary}}>/desvincular</b> al bot para liberar ese chat antes de usar este enlace.
            </p>
          </div>
        )}
      </div>

      {/* PERFIL DE FACTURACIÓN */}
      <div style={styles.seccionTitulo}>Datos de facturación</div>
      <div style={{...styles.seccion, padding:"16px 20px"}}>
        <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textSecondary, margin:"0 0 12px", lineHeight:1.5}}>
          Estos datos se usarán para generar sus cuentas de cobro. Se llenan una sola vez.
        </p>

        <div style={{
          padding:"9px 12px",
          background: perfilCompleto ? t.colors.greenSoft : t.colors.amberSoft,
          border: `1.5px solid ${perfilCompleto ? t.colors.greenBorder : t.colors.amberBorder}`,
          borderRadius: t.radius.sm,
          marginBottom: "16px",
          fontSize: t.fonts.sizeXs,
          color: perfilCompleto ? t.colors.green : t.colors.amber,
          fontWeight: t.fonts.weightSemibold,
          display:"flex", alignItems:"center", gap:"6px",
        }}>
          {perfilCompleto
            ? <><Check size={14} color={t.colors.green} strokeWidth={3}/> Listo para generar cuentas de cobro</>
            : <><AlertTriangle size={14} color={t.colors.amber} strokeWidth={2.5}/> Complete los campos obligatorios (*) para poder generar cuentas de cobro</>}
        </div>

        <p style={styles.subSeccion}><User size={12} color={t.colors.textTertiary} strokeWidth={2}/> Identificación</p>

        <div style={{marginBottom:"12px"}}>
          <label htmlFor="a11y-Configuracion-330" style={styles.label}>Nombre completo *</label>
          <input id="a11y-Configuracion-330" type="text" placeholder="Mario Córdoba Ruiz"
            value={perfilFact.nombreCompleto}
            onChange={(e)=>setPerfilFact({...perfilFact, nombreCompleto: e.target.value})}
            onBlur={(e)=>guardarPerfilFact("nombreCompleto", e.target.value)}
            style={styles.inputPerfil}/>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px"}}>
          <div>
            <label htmlFor="a11y-Configuracion-340" style={styles.label}>Tipo doc.</label>
            <select id="a11y-Configuracion-340"
              value={perfilFact.tipoDoc}
              onChange={(e)=>guardarPerfilFact("tipoDoc", e.target.value)}
              style={styles.inputPerfil}
            >
              <option value="CC">Cédula de Ciudadanía</option>
              <option value="CE">Cédula de Extranjería Col.</option>
              <option value="CX">Cédula Extranjera</option>
              <option value="DE">Documento Extranjero</option>
              <option value="PA">Pasaporte</option>
              <option value="RC">Registro Civil</option>
              <option value="TI">Tarjeta de Identidad</option>
              <option value="NIT">NIT</option>
            </select>
          </div>
          <div>
            <label htmlFor="a11y-Configuracion-357" style={styles.label}>Número *</label>
            <input id="a11y-Configuracion-357" type="text" placeholder="1234567890"
              value={perfilFact.numeroDoc}
              onChange={(e)=>setPerfilFact({...perfilFact, numeroDoc: e.target.value})}
              onBlur={(e)=>guardarPerfilFact("numeroDoc", e.target.value)}
              style={styles.inputPerfil}/>
          </div>
        </div>

        <p style={styles.subSeccion}><MapPin size={12} color={t.colors.textTertiary} strokeWidth={2}/> Ubicación</p>

        <div style={{marginBottom:"12px"}}>
          <label htmlFor="a11y-Configuracion-369" style={styles.label}>Dirección</label>
          <input id="a11y-Configuracion-369" type="text" placeholder="Cra 45 #10-20"
            value={perfilFact.direccion}
            onChange={(e)=>setPerfilFact({...perfilFact, direccion: e.target.value})}
            onBlur={(e)=>guardarPerfilFact("direccion", e.target.value)}
            style={styles.inputPerfil}/>
        </div>

        <div style={{marginBottom:"12px"}}>
          <label htmlFor="a11y-Configuracion-378" style={styles.label}>Ciudad *</label>
          <input id="a11y-Configuracion-378" type="text" placeholder="Barranquilla"
            value={perfilFact.ciudad}
            onChange={(e)=>setPerfilFact({...perfilFact, ciudad: e.target.value})}
            onBlur={(e)=>guardarPerfilFact("ciudad", e.target.value)}
            style={styles.inputPerfil}/>
        </div>

        <p style={styles.subSeccion}><Phone size={12} color={t.colors.textTertiary} strokeWidth={2}/> Contacto</p>

        <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px", marginBottom:"12px"}}>
          <div>
            <label htmlFor="a11y-Configuracion-390" style={styles.label}>Teléfono *</label>
            <input id="a11y-Configuracion-390" type="tel" placeholder="3005551234"
              value={perfilFact.telefono}
              onChange={(e)=>setPerfilFact({...perfilFact, telefono: e.target.value})}
              onBlur={(e)=>guardarPerfilFact("telefono", e.target.value)}
              style={styles.inputPerfil}/>
          </div>
          <div>
            <label htmlFor="a11y-Configuracion-398" style={styles.label}>Correo</label>
            <input id="a11y-Configuracion-398" type="email" placeholder="correo@ejemplo.com"
              value={perfilFact.correo}
              onChange={(e)=>setPerfilFact({...perfilFact, correo: e.target.value})}
              onBlur={(e)=>guardarPerfilFact("correo", e.target.value)}
              style={styles.inputPerfil}/>
          </div>
        </div>

        <p style={styles.subSeccion}><Landmark size={12} color={t.colors.textTertiary} strokeWidth={2}/> Cuenta bancaria</p>

        <div style={{marginBottom:"12px"}}>
          <label htmlFor="a11y-Configuracion-410" style={styles.label}>Banco</label>
          <input id="a11y-Configuracion-410" type="text" placeholder="Bancolombia, Davivienda, Nequi..."
            value={perfilFact.banco}
            onChange={(e)=>setPerfilFact({...perfilFact, banco: e.target.value})}
            onBlur={(e)=>guardarPerfilFact("banco", e.target.value)}
            style={styles.inputPerfil}/>
        </div>

        <div style={{display:"grid", gridTemplateColumns:"1fr 2fr", gap:"10px", marginBottom:"12px"}}>
          <div>
            <label htmlFor="a11y-Configuracion-420" style={styles.label}>Tipo</label>
            <select id="a11y-Configuracion-420"
              value={perfilFact.tipoCuenta}
              onChange={(e)=>guardarPerfilFact("tipoCuenta", e.target.value)}
              style={styles.inputPerfil}
            >
              <option value="Ahorros">Ahorros</option>
              <option value="Corriente">Corriente</option>
            </select>
          </div>
          <div>
            <label htmlFor="a11y-Configuracion-431" style={styles.label}>Número de cuenta</label>
            <input id="a11y-Configuracion-431" type="text" placeholder="12345678901"
              value={perfilFact.numeroCuenta}
              onChange={(e)=>setPerfilFact({...perfilFact, numeroCuenta: e.target.value})}
              onBlur={(e)=>guardarPerfilFact("numeroCuenta", e.target.value)}
              style={styles.inputPerfil}/>
          </div>
        </div>

        <div style={{marginBottom:"6px"}}>
          <label htmlFor="a11y-Configuracion-441" style={styles.label}>Titular de la cuenta</label>
          <input id="a11y-Configuracion-441" type="text" placeholder="Nombre del titular"
            value={perfilFact.titularCuenta}
            onChange={(e)=>setPerfilFact({...perfilFact, titularCuenta: e.target.value})}
            onBlur={(e)=>guardarPerfilFact("titularCuenta", e.target.value)}
            style={styles.inputPerfil}/>
        </div>

                <p style={styles.subSeccion}>✍️ Firma para cuentas de cobro</p>
        <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 10px"}}>
          Esta firma aparecerá en todas sus cuentas de cobro. Fírmela una sola vez.
        </p>
        <FirmaCanvas
          firmaActual={perfilFact.firmaUrl}
          onGuardar={guardarFirma}
          guardando={guardandoFirma}
        />
        
      </div>

      {/* DÍA DE LIQUIDACIÓN */}
      <div style={styles.seccionTitulo}>Liquidación de conductores</div>
      <div style={styles.seccion}>
        <div style={{padding:"12px 16px"}}>
          <p style={{fontSize:t.fonts.sizeSm,color:t.colors.textPrimary,fontWeight:t.fonts.weightSemibold,margin:"0 0 4px"}}>Día de pago semanal</p>
          <p style={{fontSize:t.fonts.sizeXs,color:t.colors.textTertiary,margin:"0 0 10px"}}>Ese día aparecerá un recordatorio de liquidación en el inicio</p>
          <select
            value={diaLiq}
            onChange={e=>guardarDiaLiq(e.target.value)}
            style={styles.inputPerfil}
          >
            <option value="">Sin recordatorio</option>
            <option value="1">Lunes</option>
            <option value="2">Martes</option>
            <option value="3">Miércoles</option>
            <option value="4">Jueves</option>
            <option value="5">Viernes</option>
            <option value="6">Sábado</option>
            <option value="0">Domingo</option>
          </select>
        </div>
      </div>

      {/* DATOS */}
      <div style={styles.seccionTitulo}>Datos</div>
      <div style={styles.seccion}>
        <button
          style={{ ...styles.filaBtn, borderBottom: "none" }}
          onClick={() => setModalLimpiarCache(true)}
        >
          <div style={styles.filaIzq}>
            <span style={styles.filaIcono}><Trash2 size={18} color={t.colors.redText} strokeWidth={2}/></span>
            <div>
              <p style={{ ...styles.filaLabel, color: t.colors.redText }}>
                Limpiar caché local
              </p>
              <p style={styles.filaSub}>Borra datos temporales del dispositivo</p>
            </div>
          </div>
        </button>
      </div>

      {/* ZONA DE PELIGRO */}
      <div style={{...styles.seccionTitulo, color:t.colors.redText}}>Zona de peligro</div>
      <div style={{...styles.seccion, border:`1.5px solid ${t.colors.redBorder}`}}>
        {!confirmaEliminar ? (
          <button
            style={{ ...styles.filaBtn, borderBottom: "none" }}
            onClick={() => setConfirmaEliminar(true)}
          >
            <div style={styles.filaIzq}>
              <span style={{...styles.filaIcono, background:t.colors.redSoft}}><AlertTriangle size={18} color={t.colors.redText} strokeWidth={2}/></span>
              <div>
                <p style={{ ...styles.filaLabel, color: t.colors.redText }}>Eliminar mi cuenta</p>
                <p style={styles.filaSub}>Borra permanentemente todos tus datos: vehículos, viajes, conductores y archivos</p>
              </div>
            </div>
          </button>
        ) : (
          <div style={{padding:"14px 16px"}}>
            <p style={{fontSize:t.fonts.sizeSm, color:t.colors.redText, fontWeight:t.fonts.weightBold, margin:"0 0 6px"}}>
              Esta acción es permanente e irreversible
            </p>
            <p style={{fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"0 0 12px", lineHeight:1.5}}>
              Se eliminarán todos tus vehículos, viajes, conductores, gastos, rutas frecuentes, archivos adjuntos y tu cuenta de acceso. Escribe <strong style={{color:t.colors.redText}}>ELIMINAR</strong> para confirmar.
            </p>
            <input
              type="text"
              placeholder="Escribe ELIMINAR"
              value={textoConfirm}
              onChange={e=>setTextoConfirm(e.target.value.toUpperCase())}
              style={{...styles.inputPerfil, border:`1.5px solid ${t.colors.redBorder}`, fontWeight:t.fonts.weightBold, letterSpacing:"2px", textAlign:"center", marginBottom:"10px"}}
            />
            <div style={{display:"flex",gap:"8px"}}>
              <button
                style={{flex:1, padding:"11px", background: textoConfirm==="ELIMINAR" ? t.colors.red : `${t.colors.red}55`, color:"#fff", border:"none", borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightBold, cursor:"pointer", opacity:eliminando?0.6:1}}
                onClick={manejarEliminarCuenta}
                disabled={eliminando}
              >
                {eliminando ? <><span className="navira-spinner" /> Eliminando...</> : "Eliminar definitivamente"}
              </button>
              <button
                style={{padding:"11px 16px", background:"none", border:`1px solid ${t.colors.border}`, borderRadius:t.radius.sm, fontSize:t.fonts.sizeSm, color:t.colors.textSecondary, cursor:"pointer"}}
                onClick={()=>{setConfirmaEliminar(false); setTextoConfirm("");}}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmarModal
        abierto={modalLimpiarCache}
        titulo="¿Limpiar caché local?"
        mensaje="Se eliminarán los datos temporales del dispositivo. Esta acción no se puede deshacer."
        textoConfirmar="Sí, limpiar"
        textoCancelar="Cancelar"
        esPeligro={true}
        onCancelar={() => setModalLimpiarCache(false)}
        onConfirmar={async () => {
          setModalLimpiarCache(false);
          if (uid) borrarEspacioUsuario(uid);
          try { await purgarCacheFirestore(); } catch { void 0; }
          window.location.reload();
        }}
      />
    </div>
  );
}

const styles = {
  pantalla:      { maxWidth:"430px", margin:"0 auto", minHeight:"100vh", background:t.colors.bgPrimary, paddingBottom:"30px" },
  header:        { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 20px 12px", background:t.colors.bgCard, borderBottom:`1px solid ${t.colors.borderLight}` },
  btnVolver:     { display:"flex", alignItems:"center", gap:"4px", background:"none", border:"none", fontSize:t.fonts.sizeSm, color:t.colors.blueText, cursor:"pointer", padding:0, fontWeight:t.fonts.weightSemibold },
  titulo:        { fontSize:"20px", fontWeight:t.fonts.weightBold, color:t.colors.textPrimary, margin:0 },
  seccionTitulo: { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", padding:"16px 20px 8px" },
  seccion:       { background:t.colors.bgCard, borderRadius:t.radius.lg, margin:"0 16px 4px", overflow:"hidden", boxShadow:t.shadows.card, border:`1px solid ${t.colors.borderLight}` },
  subSeccion:    { fontSize:"10px", fontWeight:t.fonts.weightBold, color:t.colors.textTertiary, textTransform:"uppercase", letterSpacing:"0.08em", margin:"14px 0 8px", display:"flex", alignItems:"center", gap:"5px" },
  fila:          { display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", borderBottom:`1px solid ${t.colors.borderLight}` },
  filaBtn:       { width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"14px 16px", background:"none", border:"none", cursor:"pointer", textAlign:"left", borderBottom:`1px solid ${t.colors.borderLight}` },
  filaIzq:       { display:"flex", alignItems:"center", gap:"12px" },
  filaIcono:     { width:"38px", height:"38px", background:t.colors.bgSection, borderRadius:t.radius.sm, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 },
  filaLabel:     { fontSize:t.fonts.sizeSm, fontWeight:t.fonts.weightSemibold, color:t.colors.textPrimary, margin:0 },
  filaSub:       { fontSize:t.fonts.sizeXs, color:t.colors.textTertiary, margin:"2px 0 0" },
  label:         { fontSize:t.fonts.sizeXs, fontWeight:t.fonts.weightSemibold, color:t.colors.textSecondary, display:"block", marginBottom:"4px" },
  inputPerfil:   { width:"100%", boxSizing:"border-box", padding:"10px 12px", borderRadius:t.radius.sm, border:`1.5px solid ${t.colors.border}`, background:t.colors.bgPrimary, color:t.colors.textPrimary, fontSize:t.fonts.sizeSm },
  toggle:        { width:"44px", height:"24px", borderRadius:"12px", border:"none", cursor:"pointer", position:"relative", transition:"background 0.2s", flexShrink:0 },
  toggleCircle:  { width:"20px", height:"20px", background:"white", borderRadius:"50%", position:"absolute", top:"2px", transition:"transform 0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" },
};

export default Configuracion;