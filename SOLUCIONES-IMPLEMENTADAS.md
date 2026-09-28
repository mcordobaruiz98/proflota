# Registro Oficial de Soluciones Técnicas Implementadas — NAVIRA

**Repositorio:** `mcordobaruiz98/proflota.git`  
**Rama de Desarrollo:** `Cambios-Dev-Caliche` *(Producción `main` protegida e intacta)*  
**Fecha de Actualización:** 28 de septiembre de 2026  
**Auditor / Implementador:** Especialista en Ciberseguridad, Bases de Datos e Infraestructura Cloud (Vortex Labs)

---

## Índice General de Tareas Resueltas (27 Tareas)

| ID | Bloque | Severidad | Área | Título de la Solución | Commit Git | Estado Notion |
|:---:|:---:|:---:|:---:|---|:---:|:---:|
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

## Verificación de Repositorio
* **Rama de trabajo:** `Cambios-Dev-Caliche`
* **Rama de producción:** `main` (intacta, 0 commits fusionados)
* **Verificación remota:** Todos los commits respaldados en GitHub:  
  👉 https://github.com/mcordobaruiz98/proflota/tree/Cambios-Dev-Caliche
