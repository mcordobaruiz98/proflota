const test = require("node:test");
const assert = require("node:assert/strict");

const functions = require("../index.js");
const { PEAJES_CO } = require("../data/peajesData.js");

test("BE-07: ingestarPeajesProgramada debe estar exportada como Cloud Function programada", () => {
  assert.ok(functions.ingestarPeajesProgramada, "ingestarPeajesProgramada debe estar exportada");
  assert.equal(typeof functions.ingestarPeajesProgramada, "function", "Debe ser una función");
  assert.ok(functions.ingestarPeajesProgramada.__endpoint, "Debe incluir manifest de endpoint Cloud Functions v2");
  assert.ok(
    functions.ingestarPeajesProgramada.__endpoint.scheduleTrigger ||
    functions.ingestarPeajesProgramada.__endpoint.platform,
    "Debe ser de tipo schedule"
  );
});

test("BE-07: ingestarPeajes callable debe estar exportada", () => {
  assert.ok(functions.ingestarPeajes, "ingestarPeajes debe estar exportada");
  assert.equal(typeof functions.ingestarPeajes, "function", "Debe ser una función callable");
  assert.ok(functions.ingestarPeajes.__endpoint, "Debe incluir manifest callable");
});

test("BE-07: ingestarPeajes callable debe rechazar llamadas sin autenticación (fail-closed)", async () => {
  const reqSinAuth = {
    auth: null,
    data: {},
  };

  await assert.rejects(
    async () => {
      await functions.ingestarPeajes.run(reqSinAuth);
    },
    (err) => {
      assert.ok(
        err.code === "unauthenticated" || err.message?.includes("iniciar sesión"),
        "Debe rechazar con unauthenticated"
      );
      return true;
    }
  );
});

test("BE-07: sincronizarCatalogoPeajes procesa por lotes deterministas e idempotentes con Admin SDK", async () => {
  const batches = [];
  let currentBatchOps = [];

  const mockDb = {
    collection: (name) => {
      assert.equal(name, "peajes", "Debe escribir en la colección peajes");
      return {
        doc: (id) => ({
          id,
          path: `peajes/${id}`,
        }),
      };
    },
    batch: () => {
      const ops = [];
      const batchObj = {
        set: (docRef, data, options) => {
          assert.ok(options?.merge, "Debe usar merge: true para idempotencia");
          ops.push({ docId: docRef.id, data });
          return batchObj;
        },
        commit: async () => {
          batches.push(ops);
        },
      };
      return batchObj;
    },
  };

  const resultado = await functions.sincronizarCatalogoPeajes(mockDb);

  assert.equal(resultado.total, PEAJES_CO.length, "El total debe coincidir con el catálogo de peajes");
  assert.equal(resultado.actualizados, 166, "Debe haber procesado los 166 peajes");
  assert.ok(resultado.timestamp, "Debe incluir marca temporal");

  const totalOps = batches.reduce((sum, b) => sum + b.length, 0);
  assert.equal(totalOps, 166, "Se debieron registrar 166 operaciones en los batches");

  // Verificar que el primer peaje tiene el ID determinista
  const primerOp = batches[0][0];
  assert.equal(primerOp.docId, "PE001");
  assert.equal(primerOp.data.n, "ABURRA");
});
