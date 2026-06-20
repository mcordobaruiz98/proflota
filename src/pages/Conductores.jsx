import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, User, Trash2, Edit2, Save, AlertCircle } from "lucide-react";
import { theme as t } from "../styles/theme";

function Conductores({ conductores = [], onAgregar, onEditar, onEliminar, mostrarToast }) {
  const navigate = useNavigate();
  const [verForm, setVerForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [nombre, setNombre] = useState("");
  const [cedula, setCedula] = useState("");
  const [telefono, setTelefono] = useState("");
  const [licencia, setLicencia] = useState("");
  const [licVence, setLicVence] = useState("");
  const [catLic, setCatLic] = useState("");
  const [arl, setArl] = useState("");
  const [eps, setEps] = useState("");
  const [guardando, setGuardando] = useState(false);

  const hoy = new Date();

  const limpiar = () => {
    setNombre(""); setCedula(""); setTelefono("");
    setLicencia(""); setLicVence(""); setCatLic("");
    setArl(""); setEps("");
    setEditId(null); setVerForm(false);
  };

  const abrirEdicion = (c) => {
    setNombre(c.nombre || ""); setCedula(c.cedula || "");
    setTelefono(c.telefono || ""); setLicencia(c.licencia || "");
    setLicVence(c.licVence || ""); setCatLic(c.catLic || "");
    setArl(c.arl || ""); setEps(c.eps || "");
    setEditId(c.firestoreId); setVerForm(true);
  };

  const guardar = async () => {
    if (!nombre.trim()) { mostrarToast("Ingresa el nombre", "error"); return; }
    setGuardando(true);
    const datos = {
      nombre: nombre.trim(), cedula: cedula.trim(),
      telefono: telefono.trim(), licencia: licencia.trim(),
      licVence, catLic: catLic.trim(),
      arl: arl.trim(), eps: eps.trim(),
    };
    try {
      if (editId) {
        await onEditar(editId, datos);
        mostrarToast("Conductor actualizado", "exito");
      } else {
        await onAgregar(datos);
        mostrarToast("Conductor registrado", "exito");
      }
      limpiar();
    } catch (err) {
      mostrarToast("Error al guardar", "error");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.pantalla}>
      <div style={styles.header}>
        <button style={styles.btnVolver} onClick={() => navigate(-1)}>
          <ArrowLeft size={18} color={t.colors.blue} strokeWidth={2.5} />
          <span>Volver</span>
        </button>
        <h1 style={styles.titulo}>Conductores</h1>
      </div>

      <div style={styles.contenido}>

        {!verForm && (
          <button style={styles.btnAgregar} onClick={() => setVerForm(true)}>
            + Agregar conductor
          </button>
        )}

        {verForm && (
          <div style={styles.card}>
            <p style={styles.cardTitulo}>{editId ? "Editar conductor" : "Nuevo conductor"}</p>
            <div style={styles.campo}>
              <label style={styles.label}>Nombre completo</label>
              <input type="text" placeholder="Juan Pérez González" value={nombre}
                onChange={e => setNombre(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>Cédula</label>
                <input type="text" placeholder="1.023.456.789" value={cedula}
                  onChange={e => setCedula(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Teléfono</label>
                <input type="tel" placeholder="+57 300 000 0000" value={telefono}
                  onChange={e => setTelefono(e.target.value)} style={styles.input} />
              </div>
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>N° Licencia</label>
                <input type="text" placeholder="Número" value={licencia}
                  onChange={e => setLicencia(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>Categoría</label>
                <select value={catLic} onChange={e => setCatLic(e.target.value)} style={styles.input}>
                  <option value="">Seleccionar</option>
                  <option value="C1">C1</option>
                  <option value="C2">C2</option>
                  <option value="C3">C3</option>
                </select>
              </div>
            </div>
            <div style={styles.campo}>
              <label style={styles.label}>Vencimiento licencia</label>
              <input type="date" value={licVence}
                onChange={e => setLicVence(e.target.value)} style={styles.input} />
            </div>
            <div style={styles.fila2}>
              <div style={styles.campo}>
                <label style={styles.label}>ARL</label>
                <input type="text" placeholder="Sura, Positiva..." value={arl}
                  onChange={e => setArl(e.target.value)} style={styles.input} />
              </div>
              <div style={styles.campo}>
                <label style={styles.label}>EPS</label>
                <input type="text" placeholder="Salud Total..." value={eps}
                  onChange={e => setEps(e.target.value)} style={styles.input} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button style={styles.btnGuardar} onClick={guardar} disabled={guardando}>
                <Save size={16} color="#fff" strokeWidth={2} />
                {guardando ? "Guardando..." : editId ? "Actualizar" : "Guardar"}
              </button>
              <button style={styles.btnCancelar} onClick={limpiar}>Cancelar</button>
            </div>
          </div>
        )}

        {conductores.length === 0 && !verForm && (
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <User size={40} color={t.colors.textTertiary} strokeWidth={1.5} />
            <p style={{ fontSize: t.fonts.sizeSm, color: t.colors.textTertiary, margin: "12px 0 0" }}>
              No hay conductores registrados
            </p>
          </div>
        )}

        {conductores.map(c => {
          const diasLic = c.licVence ? Math.ceil((new Date(c.licVence) - hoy) / (1000 * 60 * 60 * 24)) : null;
          const licVencida = diasLic !== null && diasLic < 0;
          const licProxima = diasLic !== null && diasLic >= 0 && diasLic <= 30;

          return (
            <div key={c.firestoreId} style={styles.card}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div style={{ display: "flex", gap: "12px", flex: 1 }}>
                  <div style={styles.avatar}>
                    <User size={20} color={t.colors.blue} strokeWidth={2} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 }}>
                      {c.nombre}
                    </p>
                    <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textSecondary, margin: "3px 0 0" }}>
                      {c.cedula ? `CC ${c.cedula}` : ""}{c.telefono ? ` · ${c.telefono}` : ""}
                    </p>
                    {c.licencia && (
                      <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "3px 0 0" }}>
                        Lic. {c.licencia}{c.catLic ? ` · Cat ${c.catLic}` : ""}
                      </p>
                    )}
                    {diasLic !== null && (
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "4px" }}>
                        {(licVencida || licProxima) && <AlertCircle size={12} color={licVencida ? t.colors.red : t.colors.amber} strokeWidth={2} />}
                        <span style={{
                          fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold,
                          color: licVencida ? t.colors.red : licProxima ? t.colors.amber : t.colors.green,
                        }}>
                          {licVencida ? `Vencida hace ${Math.abs(diasLic)}d` : diasLic === 0 ? "Vence hoy" : `Vence en ${diasLic}d`}
                        </span>
                      </div>
                    )}
                    {(c.arl || c.eps) && (
                      <p style={{ fontSize: t.fonts.sizeXs, color: t.colors.textTertiary, margin: "3px 0 0" }}>
                        {c.arl ? `ARL: ${c.arl}` : ""}{c.arl && c.eps ? " · " : ""}{c.eps ? `EPS: ${c.eps}` : ""}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button style={styles.btnIcono} onClick={() => abrirEdicion(c)}>
                    <Edit2 size={14} color={t.colors.blue} strokeWidth={2} />
                  </button>
                  <button style={styles.btnIcono} onClick={() => onEliminar(c.firestoreId)}>
                    <Trash2 size={14} color={t.colors.red} strokeWidth={2} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  pantalla:    { maxWidth: "430px", margin: "0 auto", minHeight: "100vh", background: t.colors.bgPrimary, paddingBottom: "30px" },
  header:      { display: "flex", alignItems: "center", gap: "12px", padding: "16px 20px 12px", background: t.colors.bgCard, borderBottom: `1px solid ${t.colors.borderLight}` },
  btnVolver:   { display: "flex", alignItems: "center", gap: "4px", background: "none", border: "none", color: t.colors.blue, cursor: "pointer", padding: 0, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightSemibold },
  titulo:      { fontSize: "18px", fontWeight: t.fonts.weightBold, color: t.colors.textPrimary, margin: 0 },
  contenido:   { padding: "12px 16px 16px" },
  card:        { background: t.colors.bgCard, borderRadius: t.radius.lg, padding: "16px", marginBottom: "10px", boxShadow: t.shadows.card },
  cardTitulo:  { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightBold, color: t.colors.textTertiary, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" },
  campo:       { display: "flex", flexDirection: "column", gap: "5px", marginBottom: "10px" },
  fila2:       { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" },
  label:       { fontSize: t.fonts.sizeXs, fontWeight: t.fonts.weightSemibold, color: t.colors.textSecondary, textTransform: "uppercase", letterSpacing: "0.05em" },
  input:       { padding: "11px 12px", borderRadius: t.radius.sm, border: `1.5px solid ${t.colors.border}`, fontSize: t.fonts.sizeSm, background: t.colors.bgPrimary, color: t.colors.textPrimary, outline: "none", width: "100%", boxSizing: "border-box" },
  btnAgregar:  { width: "100%", padding: "13px", background: t.colors.green, color: "#fff", border: "none", borderRadius: t.radius.md, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer", marginBottom: "10px" },
  btnGuardar:  { flex: 1, padding: "12px", background: t.colors.blue, color: "#fff", border: "none", borderRadius: t.radius.sm, fontSize: t.fonts.sizeSm, fontWeight: t.fonts.weightBold, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" },
  btnCancelar: { padding: "12px 16px", background: "none", border: `1px solid ${t.colors.border}`, borderRadius: t.radius.sm, cursor: "pointer", color: t.colors.textSecondary, fontSize: t.fonts.sizeSm },
  btnIcono:    { background: "none", border: "none", cursor: "pointer", padding: "6px" },
  avatar:      { width: "42px", height: "42px", borderRadius: "50%", background: t.colors.blueSoft, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
};

export default Conductores;