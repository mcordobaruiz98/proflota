const test = require("node:test");
const assert = require("node:assert/strict");

const functions = require("../index.js");

test("BE-01: validarAltaUsuario debe estar definida y exportada como Cloud Function callable", () => {
  assert.ok(functions.validarAltaUsuario, "validarAltaUsuario debe estar exportada");
  assert.equal(typeof functions.validarAltaUsuario, "function", "validarAltaUsuario debe ser una función");
  assert.ok(functions.validarAltaUsuario.__endpoint, "Debe tener manifest de endpoint");
});

test("BE-01: validarAltaUsuario debe rechazar solicitudes sin autenticación con error unauthenticated", async () => {
  const requestSinAuth = {
    auth: null,
    data: { codigoBeta: "BETA2026V1", aceptoTerminos: true },
  };

  await assert.rejects(
    async () => {
      // Invocamos el handler callable
      await functions.validarAltaUsuario.run(requestSinAuth);
    },
    (err) => {
      assert.ok(err.code === "unauthenticated" || err.message?.includes("unauthenticated") || err.message?.includes("iniciar sesión"), "Debe requerir autenticación");
      return true;
    }
  );
});

test("BE-01: validarAltaUsuario debe rechazar si no se aceptaron los términos y condiciones", async () => {
  const requestSinTerminos = {
    auth: { uid: "test-user-123", token: { email: "test@navira.co" } },
    data: { codigoBeta: "BETA2026V1", aceptoTerminos: false },
  };

  await assert.rejects(
    async () => {
      await functions.validarAltaUsuario.run(requestSinTerminos);
    },
    (err) => {
      assert.ok(err.code === "failed-precondition" || err.message?.includes("términos"), "Debe exigir términos");
      return true;
    }
  );
});
