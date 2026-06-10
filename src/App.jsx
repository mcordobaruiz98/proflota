import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout          from "./components/Layout";
import RutaProtegida   from "./components/RutaProtegida";
import Home            from "./pages/Home";
import Vehiculos       from "./pages/Vehiculos";
import AgregarVehiculo from "./pages/AgregarVehiculo";
import DetalleVehiculo from "./pages/DetalleVehiculo";
import DetalleViaje    from "./pages/DetalleViaje";
import Calculadora     from "./pages/Calculadora";
import Cuentas         from "./pages/Cuentas";
import Viajes          from "./pages/Viajes";
import Objetivos       from "./pages/Objetivos";
import Empresas        from "./pages/Empresas";
import Perfil          from "./pages/Perfil";
import Login           from "./pages/Login";
import Registro        from "./pages/Registro";
import OlvideContrasena from "./pages/OlvideContrasena";
import Configuracion    from "./pages/Configuracion";
import AyudaSoporte     from "./pages/AyudaSoporte";
import AcercaDe         from "./pages/AcercaDe";
import Toast            from "./components/Toast";

import { useAuth }      from "./hooks/useAuth";
import { useFirestore } from "./hooks/useFirestore";
import { useToast } from "./hooks/useToast";

function AppContenido() {
  const { usuario } = useAuth();
  const { toasts, mostrar, cerrar } = useToast();

  const {
    vehiculos, viajes, empresas, rutas, cargando,
    agregarVehiculo, eliminarVehiculo,
    agregarViaje,    eliminarViaje, editarViaje,
    agregarEmpresa,  eliminarEmpresa,
    agregarRuta,     eliminarRuta,
    agregarMantenimiento, eliminarMantenimiento,
  } = useFirestore(usuario?.uid);

    {toasts.map(toast => (
  <Toast
    key={toast.id}
    mensaje={toast.mensaje}
    tipo={toast.tipo}
    onCerrar={() => cerrar(toast.id)}
  />
))}

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
            <Home vehiculos={vehiculos} viajes={viajes} />
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
            />
          </Layout>
        </RutaProtegida>
      } />

      <Route path="/cuentas" element={
        <RutaProtegida>
          <Layout>
            <Cuentas vehiculos={vehiculos} viajes={viajes} />
          </Layout>
        </RutaProtegida>
      } />

      <Route path="/viajes" element={
        <RutaProtegida>
          <Layout>
            <Viajes viajes={viajes} />
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
      onAgregarMant={agregarMantenimiento}
      onEliminarMant={eliminarMantenimiento}
      mostrarToast={mostrar}
    />
  </RutaProtegida>
} />

      <Route path="/viaje/:id" element={
        <RutaProtegida>
          <DetalleViaje
            viajes={viajes}
            onEliminar={eliminarViaje}
            onEditar={editarViaje}
            mostrarToast={mostrar}
          />
        </RutaProtegida>
      } />

      <Route path="/perfil" element={
        <RutaProtegida>
          <Perfil />
        </RutaProtegida>
      } />

      <Route path="/olvide-contrasena" element={<OlvideContrasena />} />

      <Route path="/configuracion" element={
        <RutaProtegida><Configuracion /></RutaProtegida>
      } />
      
      <Route path="/ayuda" element={
        <RutaProtegida><AyudaSoporte /></RutaProtegida>
      } />  

      <Route path="/acerca" element={
        <RutaProtegida><AcercaDe /></RutaProtegida>
      } />

      <Route path="/calculadora" element={
  <RutaProtegida>
    <Layout>
      <Calculadora
        vehiculos={vehiculos}
        viajes={viajes}
        rutas={rutas}
        onGuardar={agregarViaje}
        onGuardarRuta={agregarRuta}
        onEliminarRuta={eliminarRuta}
        mostrarToast={mostrar}
      />
    </Layout>
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

