import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";

import Layout           from "./components/Layout";
import RutaProtegida    from "./components/RutaProtegida";
import Home             from "./pages/Home";
import Vehiculos        from "./pages/Vehiculos";
import AgregarVehiculo  from "./pages/AgregarVehiculo";
import DetalleVehiculo  from "./pages/DetalleVehiculo";
import DetalleViaje     from "./pages/DetalleViaje";
import Calculadora      from "./pages/Calculadora";
import Cuentas          from "./pages/Cuentas";
import Viajes           from "./pages/Viajes";
import Cartera          from "./pages/Cartera";
import Cobros           from "./pages/Cobros";
import Comparativo      from "./pages/Comparativo";
import Conductores      from "./pages/Conductores";
import Objetivos        from "./pages/Objetivos";
import Empresas         from "./pages/Empresas";
import Perfil           from "./pages/Perfil";
import Login            from "./pages/Login";
import Registro         from "./pages/Registro";
import OlvideContrasena from "./pages/OlvideContrasena";
import Configuracion    from "./pages/Configuracion";
import AyudaSoporte     from "./pages/AyudaSoporte";
import AcercaDe         from "./pages/AcercaDe";
import Toast            from "./components/Toast";
import Llantas          from "./pages/mantenimiento/Llantas";
import Aceite           from "./pages/mantenimiento/Aceite";
import Filtros          from "./pages/mantenimiento/Filtros";
import Frenos           from "./pages/mantenimiento/Frenos";
import HistorialMant    from "./pages/mantenimiento/HistorialMant";
import Cotizador        from "./pages/Cotizador";

import { useAuth }      from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { useToast }     from "./hooks/useToast";

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
    agregarMantenimiento, eliminarMantenimiento,
    agregarConfigMant, eliminarConfigMant,
    agregarGasto, eliminarGasto, editarGasto,
    agregarGastoFijo, eliminarGastoFijo,
    agregarConductor, editarConductor, eliminarConductor,
    agregarCuenta, editarCuenta, eliminarCuenta,
  } = useFirestore(usuario?.uid);

  // Perfil de facturación (vive en usuarios/{uid}, no en subcolección)
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
      <Routes>

        {/* ── PÚBLICAS ── */}
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
        <Route path="/acerca" element={<AcercaDe />} />

        {/* ── PROTEGIDAS CON BARRA INFERIOR ── */}
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
                onEliminar={eliminarVehiculo}
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

        <Route path="/objetivos" element={
          <RutaProtegida>
            <Layout>
              <Objetivos viajes={viajes} />
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

        {/* ── PROTEGIDAS SIN BARRA INFERIOR ── */}
        <Route path="/agregar-vehiculo" element={
          <RutaProtegida>
            <AgregarVehiculo
              vehiculos={vehiculos}
              onGuardar={agregarVehiculo}
            />
          </RutaProtegida>
        } />

        <Route path="/vehiculo/:id" element={
          <RutaProtegida>
            <DetalleVehiculo
              vehiculos={vehiculos}
              viajes={viajes}
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

        <Route path="/calculadora" element={
          <RutaProtegida>
            <Layout>
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
            </Layout>
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
            <Llantas vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} mostrarToast={mostrar} />
          </RutaProtegida>
        } />

        <Route path="/vehiculo/:id/aceite" element={
          <RutaProtegida>
            <Aceite vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} mostrarToast={mostrar} />
          </RutaProtegida>
        } />

        <Route path="/vehiculo/:id/filtros" element={
          <RutaProtegida>
            <Filtros vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} mostrarToast={mostrar} />
          </RutaProtegida>
        } />

        <Route path="/vehiculo/:id/frenos" element={
          <RutaProtegida>
            <Frenos vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} mostrarToast={mostrar} />
          </RutaProtegida>
        } />

        <Route path="/vehiculo/:id/historial-mant" element={
          <RutaProtegida>
            <HistorialMant vehiculos={vehiculos} mantenimientos={mantenimientos} onEliminar={eliminarMantenimiento} mostrarToast={mostrar} />
          </RutaProtegida>
        } />

        <Route path="/cotizador" element={
          <RutaProtegida>
            <Cotizador vehiculos={vehiculos} rutas={rutas} mostrarToast={mostrar} />
          </RutaProtegida>
        } />

      </Routes>

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