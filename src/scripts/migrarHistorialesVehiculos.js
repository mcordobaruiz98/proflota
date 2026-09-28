/**
 * NAVIRA — Script de Migración de Base de Datos (CR-16)
 * Desacoplamiento de arrays históricos embebidos en vehiculos hacia subcolecciones.
 *
 * Transforma:
 *   usuarios/{uid}/vehiculos/{id} [tanqueosHistorial, aceiteHistorial, llantasData]
 * Hacia:
 *   usuarios/{uid}/vehiculos/{id}/tanqueos/{tanqueoId}
 *   usuarios/{uid}/vehiculos/{id}/aceite/{aceiteId}
 *   usuarios/{uid}/vehiculos/{id}/llantas/{posicion}
 *
 * Evita la saturación del límite de 1 MiB por documento en Firestore.
 */

import { db } from "../firebase.js";
import {
  collection, doc, getDocs, writeBatch, deleteField, serverTimestamp
} from "firebase/firestore";

export async function migrarHistorialesDeVehiculos(uid) {
  if (!uid) throw new Error("UID de usuario requerido");
  console.log(`[Migración CR-16] Iniciando para usuario: ${uid}...`);

  const vehiculosRef = collection(db, `usuarios/${uid}/vehiculos`);
  const snap = await getDocs(vehiculosRef);

  let vehiculosProcesados = 0;
  let totalTanqueosMigrados = 0;
  let totalAceitesMigrados = 0;
  let totalLlantasMigradas = 0;

  for (const docVeh of snap.docs) {
    const data = docVeh.data();
    const vehId = docVeh.id;
    const batch = writeBatch(db);
    let requiereUpdate = false;

    // 1. Migrar Tanqueos
    if (Array.isArray(data.tanqueosHistorial) && data.tanqueosHistorial.length > 0) {
      for (const t of data.tanqueosHistorial) {
        const tanqueoId = String(t.id || Date.now() + Math.random());
        const tRef = doc(db, `usuarios/${uid}/vehiculos/${vehId}/tanqueos`, tanqueoId);
        batch.set(tRef, {
          ...t,
          migradoEn: serverTimestamp(),
        });
        totalTanqueosMigrados++;
      }
      requiereUpdate = true;
    }

    // 2. Migrar Aceite
    if (Array.isArray(data.aceiteHistorial) && data.aceiteHistorial.length > 0) {
      for (const a of data.aceiteHistorial) {
        const aceiteId = String(a.id || Date.now() + Math.random());
        const aRef = doc(db, `usuarios/${uid}/vehiculos/${vehId}/aceite`, aceiteId);
        batch.set(aRef, {
          ...a,
          migradoEn: serverTimestamp(),
        });
        totalAceitesMigrados++;
      }
      requiereUpdate = true;
    }

    // 3. Migrar Llantas
    if (data.llantasData && typeof data.llantasData === "object" && Object.keys(data.llantasData).length > 0) {
      for (const [pos, ll] of Object.entries(data.llantasData)) {
        const llRef = doc(db, `usuarios/${uid}/vehiculos/${vehId}/llantas`, String(pos));
        batch.set(llRef, {
          posicion: pos,
          ...ll,
          migradoEn: serverTimestamp(),
        });
        totalLlantasMigradas++;
      }
      requiereUpdate = true;
    }

    // 4. Si se migraron registros, limpiar arrays del documento padre manteniendo un resumen ligero
    if (requiereUpdate) {
      const vehRef = doc(db, `usuarios/${uid}/vehiculos`, vehId);
      const updates = {
        migradoSubcolecciones: true,
        migradoEn: serverTimestamp(),
      };

      // Limpiar campos pesados
      if (data.tanqueosHistorial) updates.tanqueosHistorial = deleteField();
      if (data.aceiteHistorial) updates.aceiteHistorial = deleteField();
      if (data.llantasData) updates.llantasData = deleteField();

      batch.update(vehRef, updates);
      await batch.commit();
      vehiculosProcesados++;
      console.log(`[Migración CR-16] Vehículo ${vehId} (${data.placa}) migrado exitosamente.`);
    }
  }

  console.log(`[Migración CR-16] Finalizada. Resumen:`);
  console.log(`- Vehículos procesados: ${vehiculosProcesados}`);
  console.log(`- Tanqueos migrados: ${totalTanqueosMigrados}`);
  console.log(`- Aceites migrados: ${totalAceitesMigrados}`);
  console.log(`- Llantas migradas: ${totalLlantasMigradas}`);

  return {
    vehiculosProcesados,
    totalTanqueosMigrados,
    totalAceitesMigrados,
    totalLlantasMigradas,
  };
}
