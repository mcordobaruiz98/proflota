// Hecho por JESUS COSSIO DEV
/**
 * App.jsx — Enrutamiento con Code Splitting (React.lazy + Suspense) y TaskLayout Desacoplado
 * Optimizado para rendimiento de carga inicial y experiencia de usuario fluida
 */
import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

import Layout           from "./components/Layout";
import RutaProtegida    from "./components/RutaProtegida";
import PantallaCarga    from "./components/PantallaCarga";
import Toast            from "./components/Toast";

import { useAuth }      from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { useToast }     from "./hooks/useToast";

// ── Rutas Públicas (Lazy) ──
const Login            = lazy(() => import("./pages/Login"));
const Registro         = lazy(() => import("./pages/Registro"));
const OlvideContrasena = lazy(() => import("./pages/OlvideContrasena"));
const AcercaDe         = lazy(() => import("./pages/AcercaDe"));

// ── Rutas Principales de Gestión con Layout ──
const Home             = lazy(() => import("./pages/Home"));
const Vehiculos        = lazy(() => import("./pages/Vehiculos"));
const Cuentas          = lazy(() => import("./pages/Cuentas"));
const Viajes           = lazy(() => import("./pages/Viajes"));
const Cartera          = lazy(() => import("./pages/Cartera"));
const Conductores      = lazy(() => import("./pages/Conductores"));
const Empresas         = lazy(() => import("./pages/Empresas"));
const Comparativo      = lazy(() => import("./pages/Comparativo"));
const Objetivos        = lazy(() => import("./pages/Objetivos"));

// ── Rutas de Tarea / Wizards / Pantalla Completa (TaskLayout) ──
const Calculadora      = lazy(() => import("./pages/Calculadora"));
const Cotizador        = lazy(() => import("./pages/Cotizador"));
const Cobros           = lazy(() => import("./pages/Cobros"));
const AgregarVehiculo  = lazy(() => import("./pages/AgregarVehiculo"));
const DetalleVehiculo  = lazy(() => import("./pages/DetalleVehiculo"));
const DetalleViaje     = lazy(() => import("./pages/DetalleViaje"));
const Perfil           = lazy(() => import("./pages/Perfil"));
const Configuracion    = lazy(() => import("./pages/Configuracion"));
const AyudaSoporte     = lazy(() => import("./pages/AyudaSoporte"));

// ── Módulos de Mantenimiento ──
const Llantas          = lazy(() => import("./pages/mantenimiento/Llantas"));
const Aceite           = lazy(() => import("./pages/mantenimiento/Aceite"));
const Filtros          = lazy(() => import("./pages/mantenimiento/Filtros"));
const Frenos           = lazy(() => import("./pages/mantenimiento/Frenos"));
const HistorialMant    = lazy(() => import("./pages/mantenimiento/HistorialMant"));
const Tanqueos         = lazy(() => import("./pages/mantenimiento/Tanqueos"));

function AppContenido() {
  const { usuario } = useAuth();
  const { toasts, mostrar, cerrar } = useToast();

  const {
    vehiculos, viajes, empresas, rutas, mantenimientos, conductores,
    configMant, peajes, gastosVehiculo, gastosFijos, cuentasCobro, cargando,
    agregarVehiculo, eliminarVehiculo, editarVehiculo,
    agregarViaje, eliminarViaje, editarViaje,
    agregarEmpresa, eliminarEmpresa,
    agregarRuta, eliminarRuta,
    agregarMantenimiento, eliminarMantenimiento, registrarMantenimientoConVehiculo,
    agregarConfigMant, eliminarConfigMant,
    agregarGasto, eliminarGasto, editarGasto,
    agregarGastoFijo, eliminarGastoFijo,
    agregarConductor, editarConductor, eliminarConductor,
    agregarCuenta, editarCuenta, eliminarCuenta,
  } = useFirestore(usuario?.uid);

  // Perfil de facturación (vive en usuarios/{uid})
  const [perfilFacturacion, setPerfilFacturacion] = useState({});

  useEffect(() => {
    if (!usuario?.uid) return;
    getDoc(doc(db, "usuarios", usuario.uid)).then(snap => {
      if (snap.exists() && snap.data().perfilFacturacion) {
        setPerfilFacturacion(snap.data().perfilFacturacion);
      }
    }).catch(() => {});
  }, [usuario?.uid]);

  return (
    <>
      <Suspense fallback={<PantallaCarga />}>
        <Routes>
          {/* ── PÚBLICAS ── */}
          <Route path="/login" element={<Login />} />
          <Route path="/registro" element={<Registro />} />
          <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
          <Route path="/acerca" element={<AcercaDe />} />

          {/* ── PROTEGIDAS CON BARRA DE NAVEGACIÓN (Layout) ── */}
          <Route path="/" element={
            <RutaProtegida>
              <Layout>
                <Home
                  vehiculos={vehiculos}
                  viajes={viajes}
                  configMant={configMant}
                  mantenimientos={mantenimientos}
                  conductores={conductores}
                  gastosFijos={gastosFijos}
                  cargando={cargando}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/vehiculos" element={
            <RutaProtegida>
              <Layout>
                <Vehiculos
                  vehiculos={vehiculos}
                  viajes={viajes}
                  conductores={conductores}
                  onEliminar={eliminarVehiculo}
                  onEditarVehiculo={editarVehiculo}
                  mostrarToast={mostrar}
                  cargando={cargando}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/cuentas" element={
            <RutaProtegida>
              <Layout>
                <Cuentas
                  vehiculos={vehiculos}
                  viajes={viajes}
                  gastosFijos={gastosFijos}
                  gastosVehiculo={gastosVehiculo}
                  cargando={cargando}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/viajes" element={
            <RutaProtegida>
              <Layout>
                <Viajes viajes={viajes} cargando={cargando} />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/cartera" element={
            <RutaProtegida>
              <Layout>
                <Cartera
                  viajes={viajes}
                  onEditar={editarViaje}
                  mostrarToast={mostrar}
                  cargando={cargando}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/conductores" element={
            <RutaProtegida>
              <Layout>
                <Conductores
                  conductores={conductores}
                  viajes={viajes}
                  vehiculos={vehiculos}
                  onAgregar={agregarConductor}
                  onEditar={editarConductor}
                  onEliminar={eliminarConductor}
                  mostrarToast={mostrar}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/empresas" element={
            <RutaProtegida>
              <Layout>
                <Empresas
                  empresas={empresas}
                  onAgregar={agregarEmpresa}
                  onEliminar={eliminarEmpresa}
                  mostrarToast={mostrar}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/comparativo" element={
            <RutaProtegida>
              <Layout>
                <Comparativo
                  vehiculos={vehiculos}
                  viajes={viajes}
                  gastosFijos={gastosFijos}
                  gastosVehiculo={gastosVehiculo}
                />
              </Layout>
            </RutaProtegida>
          } />

          <Route path="/objetivos" element={
            <RutaProtegida>
              <Layout>
                <Objetivos viajes={viajes} />
              </Layout>
            </RutaProtegida>
          } />

          {/* ── TAREAS Y WIZARDS EN PANTALLA COMPLETA (TaskLayout) ── */}
          <Route path="/calculadora" element={
            <RutaProtegida>
              <Calculadora
                vehiculos={vehiculos}
                viajes={viajes}
                rutas={rutas}
                peajes={peajes}
                conductores={conductores}
                onGuardar={agregarViaje}
                onGuardarRuta={agregarRuta}
                onEliminarRuta={eliminarRuta}
                onEditarVehiculo={editarVehiculo}
                mostrarToast={mostrar}
              />
            </RutaProtegida>
          } />

          <Route path="/cotizador" element={
            <RutaProtegida>
              <Cotizador vehiculos={vehiculos} rutas={rutas} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/cobros" element={
            <RutaProtegida>
              <Cobros
                viajes={viajes}
                empresas={empresas}
                perfilFacturacion={perfilFacturacion}
                onGuardarCuenta={agregarCuenta}
                cuentasCobro={cuentasCobro}
                onEditarCuenta={editarCuenta}
                onEliminarCuenta={eliminarCuenta}
                mostrarToast={mostrar}
              />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/nuevo" element={
            <RutaProtegida>
              <AgregarVehiculo
                vehiculos={vehiculos}
                conductores={conductores}
                onGuardar={agregarVehiculo}
              />
            </RutaProtegida>
          } />

<Route path="/agregar-vehiculo" element={
            <RutaProtegida>
              <AgregarVehiculo
                vehiculos={vehiculos}
                conductores={conductores}
                onGuardar={agregarVehiculo}
              />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/:id" element={
            <RutaProtegida>
              <DetalleVehiculo
                vehiculos={vehiculos}
                viajes={viajes}
                conductores={conductores}
                mantenimientos={mantenimientos}
                configMant={configMant}
                gastosVehiculo={gastosVehiculo}
                gastosFijos={gastosFijos}
                onEditarVehiculo={editarVehiculo}
                onAgregarMant={agregarMantenimiento}
                onEliminarMant={eliminarMantenimiento}
                onAgregarConfig={agregarConfigMant}
                onEliminarConfig={eliminarConfigMant}
                onAgregarGasto={agregarGasto}
                onEliminarGasto={eliminarGasto}
                onEditarGasto={editarGasto}
                onAgregarGastoFijo={agregarGastoFijo}
                onEliminarGastoFijo={eliminarGastoFijo}
                mostrarToast={mostrar}
              />
            </RutaProtegida>
          } />

          <Route path="/viaje/:id" element={
            <RutaProtegida>
              <DetalleViaje
                viajes={viajes}
                vehiculos={vehiculos}
                onEliminar={eliminarViaje}
                onEditar={editarViaje}
                onEditarVehiculo={editarVehiculo}
                mostrarToast={mostrar}
              />
            </RutaProtegida>
          } />

          <Route path="/perfil" element={
            <RutaProtegida>
              <Perfil mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/configuracion" element={
            <RutaProtegida>
              <Configuracion mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/ayuda" element={
            <RutaProtegida>
              <AyudaSoporte />
            </RutaProtegida>
          } />

          {/* ── MANTENIMIENTO ── */}
          <Route path="/vehiculo/:id/llantas" element={
            <RutaProtegida>
              <Llantas vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} onAgregar={agregarMantenimiento} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/:id/aceite" element={
            <RutaProtegida>
              <Aceite vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} onAgregar={agregarMantenimiento} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/:id/filtros" element={
            <RutaProtegida>
              <Filtros vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} onAgregar={agregarMantenimiento} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/:id/frenos" element={
            <RutaProtegida>
              <Frenos vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} onAgregar={agregarMantenimiento} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/:id/historial-mant" element={
            <RutaProtegida>
              <HistorialMant vehiculos={vehiculos} mantenimientos={mantenimientos} onEliminar={eliminarMantenimiento} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/vehiculo/:id/tanqueos" element={
            <RutaProtegida>
              <Tanqueos vehiculos={vehiculos} viajes={viajes} onEditarVehiculo={editarVehiculo} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          {/* Rutas directas de mantenimiento para acceso rápido */}
          <Route path="/aceite" element={
            <RutaProtegida>
              <Aceite vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} onAgregar={agregarMantenimiento} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/filtros" element={
            <RutaProtegida>
              <Filtros vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} onAgregar={agregarMantenimiento} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

          <Route path="/tanqueos" element={
            <RutaProtegida>
              <Tanqueos vehiculos={vehiculos} viajes={viajes} onEditarVehiculo={editarVehiculo} onRegistrarMantenimientoConVehiculo={registrarMantenimientoConVehiculo} mostrarToast={mostrar} />
            </RutaProtegida>
          } />

        </Routes>
      </Suspense>

      {/* TOASTS */}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          mensaje={toast.mensaje}
          tipo={toast.tipo}
          onCerrar={() => cerrar(toast.id)}
        />
      ))}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContenido />
    </BrowserRouter>
  );
}

export default App;