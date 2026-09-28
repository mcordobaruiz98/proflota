const test = require("node:test");
const assert = require("node:assert/strict");

const functions = require("../index.js");

test("CR-08 / BE-11: generarTokenVinculacionTelegram debe estar exportada como callable", () => {
  assert.ok(functions.generarTokenVinculacionTelegram, "Debe estar exportada");
  assert.equal(typeof functions.generarTokenVinculacionTelegram, "function", "Debe ser función");
  assert.ok(functions.generarTokenVinculacionTelegram.__endpoint, "Debe tener manifest de endpoint callable");
});

test("CR-08 / BE-11: generarTokenVinculacionTelegram debe rechazar llamadas sin autenticación", async () => {
  const reqSinAuth = {
    auth: null,
    data: {},
  };

  await assert.rejects(
    async () => {
      await functions.generarTokenVinculacionTelegram.run(reqSinAuth);
    },
    (err) => {
      assert.ok(
        err.code === "unauthenticated" || err.message?.includes("iniciar sesión"),
        "Debe rechazar con error de autenticación"
      );
      return true;
    }
  );
});

test("CR-08 / BE-12: manejarVinculacion debe rechazar tokens vencidos (> 15 minutos) y eliminarlos", async () => {
  let docBorrado = false;

  const mockDb = {
    doc: (path) => {
      if (path.includes("telegram_vinculos/TOKEN_EXPIRADO")) {
        return {
          get: async () => ({
            exists: true,
            data: () => ({
              uid: "usr-123",
              expiraEn: new Date(Date.now() - 60 * 1000), // Expiró hace 1 minuto
            }),
            ref: {
              delete: async () => {
                docBorrado = true;
              },
            },
          }),
        };
      }
      return {
        get: async () => ({ exists: false }),
      };
    },
  };

  await functions.manejarVinculacion(99999, "TOKEN_EXPIRADO", mockDb);
  assert.ok(docBorrado, "El token expirado debe ser eliminado de Firestore");
});

test("CR-08 / BE-11: manejarVinculacion debe vincular exitosamente y borrar el token de un solo uso", async () => {
  let tokenBorrado = false;
  let usuarioActualizado = null;
  let sesionActualizada = null;

  const mockDb = {
    doc: (path) => {
      if (path.includes("telegram_vinculos/UUID-TOKEN-VALIDO")) {
        return {
          get: async () => ({
            exists: true,
            data: () => ({
              uid: "usr-456",
              expiraEn: new Date(Date.now() + 10 * 60 * 1000), // Válido por 10 minutos más
            }),
            ref: {
              delete: async () => {
                tokenBorrado = true;
              },
            },
          }),
        };
      }
      if (path === "usuarios/usr-456") {
        return {
          set: async (datos) => {
            usuarioActualizado = datos;
          },
        };
      }
      if (path === "telegram_sesiones/123456") {
        return {
          set: async (datos) => {
            sesionActualizada = datos;
          },
        };
      }
      return {
        get: async () => ({ exists: false }),
        set: async () => {},
      };
    },
  };

  await functions.manejarVinculacion(123456, "UUID-TOKEN-VALIDO", mockDb);

  assert.ok(tokenBorrado, "El token debe borrarse inmediatamente tras ser consumido");
  assert.ok(usuarioActualizado, "El usuario debe ser actualizado");
  assert.equal(usuarioActualizado.telegramChatId, "123456", "El telegramChatId debe ser guardado");
  assert.ok(sesionActualizada, "La sesión de Telegram debe inicializarse");
  assert.equal(sesionActualizada.uid, "usr-456", "El uid en la sesión debe coincidir");
});
