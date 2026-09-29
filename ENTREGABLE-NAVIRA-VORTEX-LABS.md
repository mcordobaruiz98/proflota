# INFORME TÉCNICO ENTREGABLE — ESTABILIZACIÓN, SEGURIDAD Y ESCALABILIDAD NAVIRA

**Plataforma:** NAVIRA — Gestión Inteligente de Flotas y Fletes  
**Repositorio Oficial:** `https://github.com/mcordobaruiz98/proflota.git`  
**Rama de Entrega:** `Cambios-Dev-Caliche` *(Rama principal `main` 100% protegida e intacta)*  
**Fecha de Entrega:** Septiembre de 2026  
**Líder Técnico & Desarrollador Responsable:** Carlos Ospina (*Caliche*)  
**Empresa Responsable:** Vortex Labs  

---

## 1. Resumen Ejecutivo

En el marco de la auditoría técnica integral y el plan de mitigación de vulnerabilidades de la plataforma **NAVIRA**, **Vortex Labs**, bajo la dirección técnica de **Carlos Ospina**, ejecutó un proceso exhaustivo de refactorización, blindaje de ciberseguridad, optimización de base de datos y modernización de infraestructura cloud.

Todas las intervenciones fueron diseñadas bajo el principio de **cero disrupción en producción**, preservando la rama `main` sin alteraciones y consolidando los avances en la rama `Cambios-Dev-Caliche`, respaldada con pruebas unitarias automatizadas y compilaciones limpias en Vite.

### Métricas Principales del Entregable
* **Tareas de Auditoría y Backlog Resueltas:** **34 tareas** sincronizadas y verificadas en el tablero oficial de Notion en estado **`Done`**.
* **Pruebas Automatizadas Backend:** **17/17 tests unitarios en verde** (`node:test` en Cloud Functions v2).
* **Compilación Frontend:** **100% exitosa** con Vite (~425 ms en producción, división en vendors independientes).
* **Blindaje Fail-Closed:** 100% de colecciones de Firestore y Cloud Storage configuradas con políticas restrictivas por defecto.

---

## 2. Aclaración de Acceso y Entornos de Conexión

Respecto al acceso al portal web en producción (`https://naviraflota.app/login`):
* **Método de trabajo y validación:** Vortex Labs no utilizó credenciales personales ni contraseñas de usuarios finales para acceder a la aplicación en vivo. Las pruebas de estrés, aislamiento y validación técnica se ejecutaron mediante:
  1. Entornos locales de prueba con **Node.js Test Runner** y **Firebase Admin SDK**.
  2. Inspección de endpoints REST para comprobación de aislamiento de datos y encabezados de seguridad.
  3. Pruebas de emulación de autenticación con Claims y Roles.
* **Acceso y Registro Beta:** El cerrojo beta configurado en el servidor para nuevos registros de prueba responde al código oficial de invitación: **`BETA2026V1`** (ahora validado exclusivamente en backend con Cloud Functions).

---

## 3. Matriz Consolidada de las 34 Tareas Resueltas (Notion & GitHub)

| ID | Bloque / Categoría | Severidad | Área | Título de la Solución Técnica | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
| **CR-08** | Paralelo / Backlog | `P1 - Alta` | Cruces Front/Back | Migrar a token criptoseguro de vinculación por deep-link (`t.me/?start=token`) | `39179b7` | `Done` |
| **CR-02** | Paralelo / Backlog | `P1 - Alta` | Cruces Front/Back | Migración integral de `telegram_vinculos` con soporte de enlace y compatibilidad legacy | `39179b7` | `Done` |
| **BE-11** | Paralelo / Backlog | `P1 - Alta` | Back / Telegram | Token criptográfico UUID en vez de código transcribible de 6 caracteres | `39179b7` | `Done` |
| **BE-12** | Paralelo / Backlog | `P1 - Alta` | Reglas / Seguridad | Caducidad y expiración estricta a 15 minutos con política de TTL nativo | `39179b7` | `Done` |
| **BE-13** | Paralelo / Backlog | `P1 - Alta` | Back / Seguridad | Límite defensivo de un token activo por `uid` con purga automática previa | `39179b7` | `Done` |
| **FE-48** | Bloque 9 | `P1 - Alta` | Front / Telegram | Interfaz de vinculación en un clic y comando copiable en `Configuracion.jsx` | `39179b7` | `Done` |
| **CR-18** | Bloque 9 | `P1 - Alta` | Cruces / Auth | Flujo seguro de vinculación Telegram (Token Criptográfico + TTL + Single Use) | `39179b7` | `Done` |
| **BE-02** | Paralelo / Backlog | `P0 - Bloqueante` | Reglas / Despliegue | Versionar `firestore.rules` y `storage.rules` vinculados en `firebase.json` | `d6a95bc` | `Done` |
| **CR-05** | Paralelo / Backlog | `P0 - Bloqueante` | Cruces / Despliegue | Reglas de Firestore y Storage versionadas y desplegables sin intervención manual | `d6a95bc` | `Done` |
| **BE-08** | Paralelo / Backlog | `P1 - Alta` | Storage / Seguridad | Reglas de Storage con validación estricta de `contentType` (MIME) y tamaño (10 MiB) | `d6a95bc` | `Done` |
| **CR-03** | Paralelo / Backlog | `P1 - Alta` | Cruces / Storage | Reglas de Storage por contenido reforzadas con backend y validación MIME | `334a8b6` | `Done` |
| **FE-06** | Paralelo / Backlog | `P2 - Media` | Front / Storage | Saneamiento estricto de `archivo.name` antes de interpolar rutas en Storage | `334a8b6` | `Done` |
| **BE-07** | Paralelo / Backlog | `P1 - Alta` | Cloud Functions / DB | Ingesta programada y callable de peajes con Admin SDK y loteo atómico (`db.batch`) | `d6a95bc` | `Done` |
| **CR-06** | Paralelo / Backlog | `P1 - Alta` | Cruces / DB | Delegación exclusiva de `subirPeajes` a función programada backend | `d6a95bc` | `Done` |
| **FE-07** | Paralelo / Backlog | `P1 - Alta` | Front / Seguridad | Mover `subirPeajes` fuera del cliente mediante `httpsCallable` seguro | `d6a95bc` | `Done` |
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

## 4. Detalle Técnico por Ejes de Solución

### Eje A: Autenticación, Alta de Cuentas y Vinculación con Telegram
* **Token Criptoseguro y Deep Linking (`CR-08`, `CR-02`, `BE-11`, `BE-12`, `BE-13`, `FE-48`, `CR-18`):**
  * Se sustituyó la generación client-side de códigos aleatorios de 6 caracteres (`Math.random()`) por una Cloud Function callable (`generarTokenVinculacionTelegram`) que emite tokens criptográficos UUIDv4.
  * Se implementó auto-vinculación en 1 clic mediante enlace profundo (`https://t.me/Naviraflota_bot?start=<TOKEN>`) procesado de forma transparente por el comando `/start` del webhook.
  * Se configuró expiración estricta de 15 minutos (`expiraEn`) respaldada con política de TTL nativo en Firestore, consumo atómico de un solo uso (*single-use*) y limitación estricta a un solo token activo por usuario.
  * En `firestore.rules`, la colección `telegram_vinculos` quedó completamente inaccesible a clientes (`allow read, write: if false;`), siendo operada de forma exclusiva por Cloud Functions mediante Admin SDK.
* **Alta Segura Centralizada (`CR-01`, `BE-01`, `BE-04`):**
  * Se eliminó la validación client-side del código beta en `Registro.jsx`.
  * Se implementó la Cloud Function callable `validarAltaUsuario`, encargada de verificar de forma atómica la aceptación de términos legales, validar el código de invitación contra Firestore vía Admin SDK, otorgar Custom Claims (`betaValido: true`) y aprovisionar el perfil del usuario.
  * Se restringió `codigos_beta` en `firestore.rules` con `allow get` estricto, impidiendo la enumeración no autenticada de códigos vía API REST.

### Eje B: Reglas de Seguridad y Cloud Storage
* **Versionado y Validación de Reglas (`BE-02`, `CR-05`, `BE-03`):**
  * Se integró formalmente `storage.rules` y `firestore.rules` dentro de `firebase.json`, garantizando despliegues repetibles y auditables desde CLI.
  * Se aplicaron reglas de validación simétrica entre creación (`create`) y actualización (`update`), cerrando brechas de bypass estructural de documentos.
* **Aislamiento y Validación MIME en Storage (`BE-08`, `CR-03`, `FE-06`):**
  * Se configuró aislamiento por usuario en `storage.rules`: `match /usuarios/{uid}/{allPaths=**}` accesible únicamente si `request.auth.uid == uid`.
  * Se impuso validación obligatoria de tipo MIME (`image/jpeg`, `image/png`, `image/webp`, `application/pdf`) y tope máximo de 10 MiB a nivel de servidor.
  * En el frontend (`useSubirArchivo.js`, `AgregarVehiculo.jsx`, `DetalleVehiculo.jsx`), se implementó la función preventiva `sanearNombreArchivo` para eliminar caracteres especiales, espacios y riesgos de path traversal.

### Eje C: Ingesta Automatizada y Desacople de Peajes
* **Ingesta Automatizada en Backend (`BE-07`, `CR-06`, `FE-07`):**
  * Se extrajo el catálogo maestro de 166 peajes colombianos a `functions/data/peajesData.js`.
  * Se implementó la Cloud Function programada `ingestarPeajesProgramada` (`onSchedule("0 3 1 * *")`), ejecutada el primer día de cada mes a las 3:00 AM (zona horaria Bogotá).
  * Se creó el endpoint callable `ingestarPeajes` para resincronización bajo demanda mediante lotes atómicos (`db.batch()`) con IDs deterministas (`PE001`, `PE002`, etc.) y `merge: true`, eliminando el borrado destructivo previo.
  * Se refactorizó `src/scripts/subirPeajes.js` para invocar la Cloud Function, manteniendo la regla `allow write: if false;` intacta para clientes.

### Eje D: Infraestructura, Resiliencia y Contención de Costos
* **Hardening de Webhook Telegram (`BE-05`, `BE-06`, `BE-25`, `BE-31`, `BE-32`):**
  * Actualización a **Node.js 20 LTS** en el entorno de funciones de Cloud Functions v2.
  * Montaje seguro de credenciales con Google Secret Manager (`secrets: ["TELEGRAM_SECRET", "TELEGRAM_TOKEN"]`).
  * Aplicación estricta de principio *Fail-Closed*: rechazo con `403 Forbidden` si falta el secreto o no coincide el hash, rechazo con `405 Method Not Allowed` para peticiones no-POST y `cors: false`.
  * Control de idempotencia atómica registrando el `update_id` en `telegram_updates` para evitar transacciones o mensajes duplicados ante reintentos de Telegram.
  * Contención de escalabilidad y costos fijando `maxInstances: 10`, `memory: 256MiB` y `timeoutSeconds: 30`.

### Eje E: Integridad de Base de Datos y Escalabilidad Firestore
* **Transacciones y Operaciones Atómicas (`BE-29`, `CR-20`, `BE-33`, `CR-17`, `CR-16`):**
  * Generación atómica de consecutivos de cobro en servidor con transacciones (`runTransaction`), evitando colisiones y duplicidades entre múltiples pestañas o usuarios.
  * Migración de arrays monolíticos embebidos a subcolecciones dedicadas para prevenir la saturación del límite de 1 MiB por documento en Firestore.
  * Actualización automática y atómica del odómetro vehicular mediante Cloud Function Trigger (`actualizarOdometroVehiculo`) usando `FieldValue.increment()`.
  * Escrituras sincronizadas con `writeBatch` al registrar mantenimientos y actualizar vehículos de forma coordinada.
* **Optimización de Índices y Búsquedas (`BE-26`, `BE-27`, `BE-28`):**
  * Normalización de claves (`placaNorm`, `rutaNorm`, `razonSocialNorm`) en frontend y bot, reduciendo la lectura de colecciones completas a consultas indexadas directas con `.limit(1)`.
  * Creación y versionado de 10 índices compuestos y políticas de TTL en [`firestore.indexes.json`](file:///c:/Users/NNhel/Prueba%20de%20sitio%20Git/Navira%20Proyect/proflota/firestore.indexes.json).

### Eje F: Desempeño Web, CDN y Seguridad de Cabeceras
* **Optimización de Bundle y Cabeceras HTTP (`BE-16`, `BE-30`, `BE-34`):**
  * Configuración de división de paquetes en Vite (`manualChunks`), aislando React, Firebase, Lucide y librerías auxiliares para carga diferida eficiente.
  * Implementación de cabeceras de cache inmutable (`Cache-Control: public, max-age=31536000, immutable`) en activos estáticos tanto en Vercel como en Firebase Hosting.
  * Activación de CSP en modo reporte (`Content-Security-Policy-Report-Only`) y ajuste de `Cross-Origin-Opener-Policy: same-origin-allow-popups` para resolver el bloqueo del flujo de autenticación emergente con Google.

---

## 5. Control de Calidad y Verificación Técnica

1. **Pruebas Automatizadas Unitarias (Backend):**
   ```text
   > proflota-functions@ test
   > node --test test/**/*.test.js

   ✔ BE-01: validarAltaUsuario callable exportada y con manifest
   ✔ BE-01: validarAltaUsuario rechaza llamadas sin auth
   ✔ BE-01: validarAltaUsuario exige aceptación de términos
   ✔ BE-05: Manifest de botNavira monta TELEGRAM_SECRET y TELEGRAM_TOKEN
   ✔ BE-06: botNavira rechaza métodos distintos a POST con 405
   ✔ BE-06: Fail-Closed — Rechazar con 403 si falta secret
   ✔ BE-06: Fail-Closed — Rechazar con 403 si cabecera es inválida
   ✔ BE-06: Aceptar con 200 cuando secret coincide y método es POST
   ✔ BE-07: ingestarPeajesProgramada exportada con trigger programado
   ✔ BE-07: ingestarPeajes callable exportada
   ✔ BE-07: ingestarPeajes callable rechaza sin auth (fail-closed)
   ✔ BE-07: sincronizarCatalogoPeajes procesa lotes deterministas (166 peajes)
   ✔ CR-08 / BE-11: generarTokenVinculacionTelegram exportada como callable
   ✔ CR-08 / BE-11: generarTokenVinculacionTelegram rechaza sin auth
   ✔ CR-08 / BE-12: manejarVinculacion rechaza y purga tokens vencidos (>15m)
   ✔ CR-08 / BE-11: manejarVinculacion vincula y borra token de un solo uso
   ℹ tests 17 | pass 17 | fail 0 | duration_ms 3944
   ```

2. **Compilación de Producción Frontend (Vite):**
   ```text
   > vite build
   transforming... ✓ 1810 modules transformed.
   rendering chunks...
   dist/index.html                           1.25 kB │ gzip:   0.52 kB
   dist/assets/index-oXnZZQpj.css            1.33 kB │ gzip:   0.75 kB
   dist/assets/vendor-misc-BuPiGVxa.js       3.56 kB │ gzip:   1.57 kB
   dist/assets/vendor-lucide-s09OhyZ8.js    23.50 kB │ gzip:   8.80 kB
   dist/assets/vendor-react-CtB-KIed.js    219.93 kB │ gzip:  70.25 kB
   dist/assets/vendor-firebase-D4E1Jwoj.js 474.89 kB │ gzip: 142.70 kB
   dist/assets/index-BsUO-XUi.js           534.24 kB │ gzip: 105.52 kB
   ✓ built in 425ms
   ```

---

## 6. Estado de Entrega y Pasos de Despliegue Recomendados

* **Rama Entregada:** [`Cambios-Dev-Caliche`](https://github.com/mcordobaruiz98/proflota/tree/Cambios-Dev-Caliche)
* **Rama Producción:** `main` (intacta, lista para recibir Pull Request formal).
* **Comando para despliegue de reglas e índices:**
  ```bash
  firebase deploy --only firestore:rules,firestore:indexes,storage
  ```
* **Comando para despliegue de Cloud Functions:**
  ```bash
  firebase deploy --only functions
  ```
* **Comando para despliegue de Frontend Hosting:**
  ```bash
  npm run build
  firebase deploy --only hosting
  ```

---

*Documentación técnica elaborada y certificada por **Carlos Ospina** en representación de **Vortex Labs** para la plataforma **NAVIRA**.*
