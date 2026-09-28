# Registro Oficial de Soluciones Técnicas Implementadas — NAVIRA

**Repositorio:** `mcordobaruiz98/proflota.git`  
**Rama de Desarrollo:** `Cambios-Dev-Caliche` *(Producción `main` protegida e intacta)*  
**Fecha de Actualización:** 28 de septiembre de 2026  
**Auditor / Implementador:** Especialista en Ciberseguridad, Bases de Datos e Infraestructura Cloud (Vortex Labs)

---

## Índice General de Tareas Resueltas (23 Tareas)

| ID | Bloque | Severidad | Área | Título de la Solución | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
| **BE-02** | Paralelo / Backlog | `P0 - Bloqueante` | Reglas / Despliegue | Versionar `firestore.rules` y `storage.rules` vinculados en `firebase.json` | `d6a95bc` | `Done` |
| **BE-08** | Paralelo / Backlog | `P1 - Alta` | Storage / Seguridad | Reglas de Storage con validación estricta de `contentType` (MIME) y tamaño (10 MiB) | `d6a95bc` | `Done` |
| **BE-07** | Paralelo / Backlog | `P1 - Alta` | Cloud Functions / DB | Ingesta programada y callable de peajes con Admin SDK y loteo atómico (`db.batch`) | `d6a95bc` | `Done` |
| **BE-27** | Bloque 8 | `P1 - Alta` | Back / Telegram Bot | Búsquedas indexadas con claves normalizadas (`placaNorm`, `rutaNorm`, `razonSocialNorm`) | `d27db99` | `Done` |
| **BE-26** | Bloque 8 | `P1 - Alta` | Hosting / DB | Declaración y versionado de índices compuestos y TTL en `firestore.indexes.json` | `d27db99` | `Done` |
| **CR-01** | Bloque 2 | `P1 - Alta` | Cruces / Auth | Escalonar alta de cuenta centralizada con Cloud Function (unificación Email y Google) | `cbd206b` | `Done` |
| **BE-01** | Bloque 2 | `P1 - Alta` | Back / Auth | Cloud Function callable `validarAltaUsuario` con Admin SDK, Custom Claims y términos | `cbd206b` | `Done` |
| **BE-03** | Bloque 2 | `P1 - Alta` | Reglas / Seguridad | Validación simétrica de esquema y límites en `update` y `create` en `firestore.rules` | `cbd206b` | `Done` |
| **BE-16** | Bloque 2 | `P0 - Bloqueante` | Hosting / CDN | CSP en modo reporte (`Content-Security-Policy-Report-Only`) y fix COOP en Vercel/Firebase | `cbd206b` | `Done` |
| **BE-06** | Bloque 1 | `P0 - Bloqueante` | Back / Seguridad | Invertir a fail-closed en webhook `botNavira` (403 si falta secret, 405 en no-POST, `cors: false`) | `71ee5d6` | `Done` |
| **BE-05** | Bloque 1 | `P0 - Bloqueante` | Back / Infra | Montaje explícito de secretos en Cloud Run (`botNavira`), manejo dinámico y tests unitarios | `71ee5d6` | `Done` |
| **BE-04** | Bloque 1 | `P0 - Bloqueante` | Reglas / Seguridad | `allow get` en vez de `read` para `codigos_beta` en `firestore.rules` (evita filtración REST) | `71ee5d6` | `Done` |
| **BE-25** | Bloque 6 | `P0 - Bloqueante` | Back / Infra | Corrección de runtime Node.js 20 LTS en `functions/package.json` | `f74ca3d` | `Done` |
| **BE-31** | Bloque 6 | `P2 - Media` | Back / Infra | Contención y límites de recursos en `botNavira` (`maxInstances`, memoria, timeout) | `6678c69` | `Done` |
| **BE-32** | Bloque 6 | `P1 - Alta` | Back / Telegram | Control de idempotencia atómico con `update_id` en webhook | `45cd505` | `Done` |
| **BE-28** | Bloque 8 | `P2 - Media` | Back / DB | Campo `expiraEn` con política de TTL nativo de Cloud Firestore para sesiones | `50cdaa8` | `Done` |
| **BE-30** | Bloque 9 | `P2 - Media` | Front / Infra | Optimización de empaquetado Vite con `manualChunks` (división de vendors) | `a3d8434` | `Done` |
| **BE-34** | Bloque 9 | `P3 - Baja` | Back / CDN | Cabeceras de cache inmutable y compresión en CDN (Vercel y Firebase Hosting) | `58c04f3` | `Done` |
| **BE-29** | Bloque 7 | `P1 - Alta` | Back / DB | Generación atómica transaccional de consecutivos de cobro en servidor | `a6f1ea8` | `Done` |
| **CR-20** | Bloque 7 | `P1 - Alta` | Cruces / Cobros | Emisión atómica de cuentas de cobro coordinada con transacción de Firestore | `a6f1ea8` | `Done` |
| **BE-33** | Bloque 7 | `P1 - Alta` | Back / DB | Escrituras atómicas (`writeBatch`) en sincronización de mantenimiento y vehículo | `a6f1ea8` | `Done` |
| **CR-17** | Bloque 7 | `P1 - Alta` | Cruces / Back | Actualización centralizada de odómetro mediante Cloud Function Trigger | `0541415` | `Done` |
| **CR-16** | Bloque 7 | `P0 - Bloqueante` | Cruces / DB | Desacople y migración de arrays embebidos a subcolecciones (evita tope de 1 MiB) | `0541415` | `Done` |

---

## Detalle Técnico de las Nuevas Soluciones Implementadas

### Reglas y Control de Acceso (Paralelo / Backlog)

#### 1. [BE-02] Versionar `firestore.rules` y `storage.rules` en el Repositorio y Vincular en `firebase.json`
* **Problema:** Las reglas de seguridad de Firestore y Storage se desplegaban manualmente o no estaban referenciadas formalmente en `firebase.json`. Esto generaba riesgo de sobreescritura accidental o discrepancia entre el código local y producción en un despliegue vía CLI.
* **Archivos Modificados:** [`firebase.json`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/firebase.json), [`storage.rules`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/storage.rules), [`firestore.rules`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/firestore.rules).
* **Solución Técnica:**
  * Se configuró en `firebase.json` el bloque `"storage": { "rules": "storage.rules" }` junto al bloque existente `"firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" }`.
  * Se versionaron ambos archivos en Git bajo la rama `Cambios-Dev-Caliche`, habilitando el despliegue íntegro y auditable de seguridad con `firebase deploy --only firestore:rules,storage`.
* **Commit:** `d6a95bc` | **Notion:** `Done`

#### 2. [BE-08] Reglas de Storage con Aislamiento de Usuario y Validación de `contentType` y `size`
* **Problema:** En Firebase Cloud Storage no existían reglas de validación a nivel de backend: la validación de tamaño y formato ocurría exclusivamente en el cliente navegador, dejando abierta la posibilidad de que clientes maliciosos o peticiones directas subieran ejecutables, scripts dañinos o archivos gigantescos (>100MB) consumiendo cuota y vulnerando la seguridad.
* **Archivos Modificados:** [`storage.rules`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/storage.rules).
* **Solución Técnica:**
  * Se implementó [`storage.rules`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/storage.rules) con:
    1. Aislamiento estricto por usuario: `match /usuarios/{uid}/{allPaths=**}` donde solo el propietario autenticado (`request.auth.uid == uid`) tiene permisos de lectura, creación, edición y borrado.
    2. Validación obligatoria de tipo MIME (`esTipoPermitido`): solo se autorizan `image/jpeg`, `image/png`, `image/webp` y `application/pdf`.
    3. Límite estricto de tamaño (`esTamanoPermitido`): archivos `<= 10 * 1024 * 1024` (10 MiB).
    4. Regla general *fail-closed* al final: `match /{allPaths=**} { allow read, write: if false; }`.
* **Commit:** `d6a95bc` | **Notion:** `Done`

#### 3. [BE-07] Ingesta Programada y Segura de Peajes vía Cloud Function (`ingestarPeajes`)
* **Problema:** El catálogo de 166 peajes colombianos era administrado por un script de frontend (`subirPeajes.js`) que borraba toda la colección con `deleteDoc` y creaba documentos en bucle desde el cliente con credenciales de usuario. Como la colección global `peajes` quedó protegida con `allow write: if false;`, la ingesta desde el cliente fallaba y era insegura.
* **Archivos Modificados:**
  * [`functions/data/peajesData.js`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/functions/data/peajesData.js) *(nuevo)*
  * [`functions/index.js`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/functions/index.js)
  * [`functions/test/peajes.test.js`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/functions/test/peajes.test.js) *(nuevo)*
  * [`src/scripts/subirPeajes.js`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/src/scripts/subirPeajes.js)
* **Solución Técnica:**
  * Se extrajo el catálogo oficial de 166 peajes a `functions/data/peajesData.js`.
  * Se creó la Cloud Function programada `ingestarPeajesProgramada` (`onSchedule("0 3 1 * *", ...)`, zona `America/Bogota`) que sincroniza periódicamente las tarifas sin intervención manual.
  * Se creó el endpoint callable `ingestarPeajes` (`onCall`) que valida autenticación en backend y ejecuta un `db.batch()` atómico e idempotente con IDs deterministas (`PE001`, `PE002`, etc.) y `merge: true`.
  * Se refactorizó `src/scripts/subirPeajes.js` en el frontend para invocar `httpsCallable(functions, "ingestarPeajes")`, eliminando por completo cualquier intento de escritura directa desde el navegador.
  * Se añadieron 4 pruebas unitarias que validan el endpoint programado, el callable fail-closed y el procesamiento por lotes.
* **Commit:** `d6a95bc` | **Notion:** `Done`

---

## Verificación de Repositorio
* **Rama de trabajo:** `Cambios-Dev-Caliche`
* **Rama de producción:** `main` (intacta, 0 commits fusionados)
* **Verificación remota:** Todos los commits respaldados en GitHub:  
  👉 https://github.com/mcordobaruiz98/proflota/tree/Cambios-Dev-Caliche
