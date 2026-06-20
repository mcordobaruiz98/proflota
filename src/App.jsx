import { BrowserRouter, Routes, Route } from "react-router-dom";

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
import Objetivos        from "./pages/Objetivos";
import Empresas         from "./pages/Empresas";
import Perfil           from "./pages/Perfil";
import Login            from "./pages/Login";
import Registro         from "./pages/Registro";
import OlvideContrasena from "./pages/OlvideContrasena";
import Configuracion    from "./pages/Configuracion";
import AyudaSoporte     from "./pages/AyudaSoporte";
import AcercaDe         from "./pages/AcercaDe";
import Cartera          from "./pages/Cartera";
import Comparativo      from "./pages/Comparativo";
import Conductores      from "./pages/Conductores";
import Conductores      from "./pages/Conductores";
import Toast            from "./components/Toast";
import Llantas          from "./pages/mantenimiento/Llantas";
import Aceite           from "./pages/mantenimiento/Aceite";
import Filtros          from "./pages/mantenimiento/Filtros";
import Frenos           from "./pages/mantenimiento/Frenos";
import HistorialMant    from "./pages/mantenimiento/HistorialMant";
import Tanqueos         from "./pages/mantenimiento/Tanqueos";

import { useAuth }      from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { useToast } from "./hooks/useToast";

function AppContenido() {
  const { usuario } = useAuth();
  const { toasts, mostrar, cerrar } = useToast();

 const {
  vehiculos, viajes, empresas, rutas, mantenimientos, configMant, peajes, gastosVehiculo, gastosFijos, conductores, cargando,
  agregarVehiculo, eliminarVehiculo, editarVehiculo,
  agregarViaje,    eliminarViaje,    editarViaje,
  agregarEmpresa,  eliminarEmpresa,
  agregarRuta,     eliminarRuta,
  agregarMantenimiento, eliminarMantenimiento,
  agregarConfigMant,    eliminarConfigMant,
  agregarGasto, eliminarGasto,
  agregarGastoFijo, eliminarGastoFijo,
  agregarConductor, editarConductor, eliminarConductor,
} = useFirestore(usuario?.uid);

  return (
    <>
    <Routes>

      {/* ── PÚBLICAS ── */}
      <Route path="/login"    element={<Login />} />
      <Route path="/registro" element={<Registro />} />
      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />
      {/* ── PROTEGIDAS CON BARRA INFERIOR ── */}
      <Route path="/" element={
        <RutaProtegida>
          <Layout>
            <Home vehiculos={vehiculos} viajes={viajes} configMant={configMant} mantenimientos={mantenimientos} conductores={conductores} gastosFijos={gastosFijos} cargando={cargando}/>
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
              mostrarToast ={mostrar}
              cargando={cargando}
            />
          </Layout>
        </RutaProtegida>
      } />

      <Route path="/cuentas" element={
        <RutaProtegida>
          <Layout>
            <Cuentas vehiculos={vehiculos} viajes={viajes} gastosFijos={gastosFijos} gastosVehiculo={gastosVehiculo} cargando={cargando} />
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
  conductores={conductores}
  onAgregarMant={agregarMantenimiento}
  onEliminarMant={eliminarMantenimiento}
  onAgregarConfig={agregarConfigMant}
  onEliminarConfig={eliminarConfigMant}
  onEditarVehiculo={editarVehiculo}
  onAgregarGasto={agregarGasto}
  onEliminarGasto={eliminarGasto}
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
          <Perfil
            mostrarToast={mostrar} />
        </RutaProtegida>
      } />

      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />

      <Route path="/configuracion" element={
        <RutaProtegida><Configuracion mostrarToast = {mostrar} /></RutaProtegida>
      } />
      
      <Route path="/ayuda" element={
        <RutaProtegida><AyudaSoporte /></RutaProtegida>
      } />  

      <Route path="/acerca" element={
        <RutaProtegida><AcercaDe /></RutaProtegida>
      } />

      <Route path="/cartera" element={
        <RutaProtegida>
          <Cartera
            viajes={viajes}
            vehiculos={vehiculos}
            onEditar={editarViaje}
            mostrarToast={mostrar}
          />
        </RutaProtegida>
      } />

      <Route path="/comparativo" element={
        <RutaProtegida>
          <Comparativo
            vehiculos={vehiculos}
            viajes={viajes}
            gastosFijos={gastosFijos}
            gastosVehiculo={gastosVehiculo}
          />
        </RutaProtegida>
      } />

      <Route path="/conductores" element={
        <RutaProtegida>
          <Conductores
            conductores={conductores}
            onAgregar={agregarConductor}
            onEditar={editarConductor}
            onEliminar={eliminarConductor}
            mostrarToast={mostrar}
          />
        </RutaProtegida>
      } />

      <Route path="/conductores" element={
        <RutaProtegida>
          <Conductores
            conductores={conductores}
            vehiculos={vehiculos}
            onAgregar={agregarConductor}
            onEditar={editarConductor}
            onEliminar={eliminarConductor}
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

    <Route path="/vehiculo/:id/llantas" element={
  <RutaProtegida>
    <Llantas vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} onEditarVehiculo={editarVehiculo} mostrarToast={mostrar}/>
  </RutaProtegida>
} />

<Route path="/vehiculo/:id/aceite" element={
  <RutaProtegida>
    <Aceite vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} onEditarVehiculo={editarVehiculo} mostrarToast={mostrar}/>
  </RutaProtegida>
} />

<Route path="/vehiculo/:id/filtros" element={
  <RutaProtegida>
    <Filtros vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} onEditarVehiculo={editarVehiculo} mostrarToast={mostrar}/>
  </RutaProtegida>
} />

<Route path="/vehiculo/:id/frenos" element={
  <RutaProtegida>
    <Frenos vehiculos={vehiculos} mantenimientos={mantenimientos} onAgregar={agregarMantenimiento} onEditarVehiculo={editarVehiculo} mostrarToast={mostrar}/>
  </RutaProtegida>
} />

<Route path="/vehiculo/:id/tanqueos" element={
  <RutaProtegida>
    <Tanqueos vehiculos={vehiculos} onEditarVehiculo={editarVehiculo} mostrarToast={mostrar}/>
  </RutaProtegida>
} />

<Route path="/vehiculo/:id/historial-mant" element={
  <RutaProtegida>
    <HistorialMant vehiculos={vehiculos} mantenimientos={mantenimientos} onEliminar={eliminarMantenimiento} mostrarToast={mostrar}/>
  </RutaProtegida>
} />

    </Routes>

    {/*TOASTS - fuera de Routes*/}
    {toasts.map(toast => (
      <Toast
      key = {toast.id}
      mensaje = {toast.mensaje}
      tipo = {toast.tipo}
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