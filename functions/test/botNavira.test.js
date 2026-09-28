const test = require("node:test");
const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");

// Cargar la definición de las funciones
const functions = require("../index.js");

function createMockResponse() {
  const res = new EventEmitter();
  res.statusCode = 200;
  res.body = null;
  res.status = function (code) {
    this.statusCode = code;
    return this;
  };
  res.send = function (body) {
    this.body = body;
    this.emit("finish");
    return this;
  };
  return res;
}

test("BE-05: Manifest de botNavira debe montar TELEGRAM_SECRET y TELEGRAM_TOKEN en Cloud Run", () => {
  const endpoint = functions.botNavira.__endpoint;
  assert.ok(endpoint, "El endpoint de botNavira debe existir");

  const secrets = endpoint.secretEnvironmentVariables || [];
  const secretKeys = secrets.map((s) => s.key);

  assert.ok(
    secretKeys.includes("TELEGRAM_SECRET"),
    "botNavira debe declarar TELEGRAM_SECRET en secretEnvironmentVariables"
  );
  assert.ok(
    secretKeys.includes("TELEGRAM_TOKEN"),
    "botNavira debe declarar TELEGRAM_TOKEN en secretEnvironmentVariables"
  );
  assert.equal(endpoint.availableMemoryMb, 256, "Memoria configurada en 256MB");
  assert.equal(endpoint.timeoutSeconds, 30, "Timeout configurado en 30s");
  assert.equal(endpoint.maxInstances, 10, "Límite defensivo de 10 instancias");
});

test("BE-06: botNavira debe rechazar métodos HTTP distintos de POST con 405", async () => {
  const req = {
    method: "GET",
    get: () => "cualquiera",
    body: {},
  };
  const res = createMockResponse();

  await functions.botNavira(req, res);

  assert.equal(res.statusCode, 405, "Debe responder 405 Method Not Allowed ante peticiones GET");
  assert.equal(res.body, "Method Not Allowed");
});

test("BE-06: Fail-Closed — Rechazar con 403 si process.env.TELEGRAM_SECRET no está configurado", async () => {
  const originalSecret = process.env.TELEGRAM_SECRET;
  delete process.env.TELEGRAM_SECRET;

  const req = {
    method: "POST",
    get: (header) => (header.toLowerCase() === "x-telegram-bot-api-secret-token" ? "token-atacante" : null),
    body: {},
  };
  const res = createMockResponse();

  try {
    await functions.botNavira(req, res);
    assert.equal(res.statusCode, 403, "Debe rechazar con 403 si el servidor no tiene secreto configurado");
    assert.equal(res.body, "Forbidden");
  } finally {
    if (originalSecret !== undefined) {
      process.env.TELEGRAM_SECRET = originalSecret;
    }
  }
});

test("BE-06: Fail-Closed — Rechazar con 403 si la petición no incluye cabecera de secreto", async () => {
  const originalSecret = process.env.TELEGRAM_SECRET;
  process.env.TELEGRAM_SECRET = "secreto-seguro-navira-2026";

  const req = {
    method: "POST",
    get: () => null, // Sin cabecera
    body: {},
  };
  const res = createMockResponse();

  try {
    await functions.botNavira(req, res);
    assert.equal(res.statusCode, 403, "Debe rechazar con 403 si falta la cabecera del secreto");
    assert.equal(res.body, "Forbidden");
  } finally {
    if (originalSecret !== undefined) {
      process.env.TELEGRAM_SECRET = originalSecret;
    } else {
      delete process.env.TELEGRAM_SECRET;
    }
  }
});

test("BE-06: Fail-Closed — Rechazar con 403 si el token de la cabecera no coincide exactamente", async () => {
  const originalSecret = process.env.TELEGRAM_SECRET;
  process.env.TELEGRAM_SECRET = "secreto-seguro-navira-2026";

  const req = {
    method: "POST",
    get: (header) => (header.toLowerCase() === "x-telegram-bot-api-secret-token" ? "secreto-falso" : null),
    body: {},
  };
  const res = createMockResponse();

  try {
    await functions.botNavira(req, res);
    assert.equal(res.statusCode, 403, "Debe rechazar con 403 ante token no coincidente");
    assert.equal(res.body, "Forbidden");
  } finally {
    if (originalSecret !== undefined) {
      process.env.TELEGRAM_SECRET = originalSecret;
    } else {
      delete process.env.TELEGRAM_SECRET;
    }
  }
});

test("BE-06: Aceptar con 200 cuando el token coincide y el método es POST", async () => {
  const originalSecret = process.env.TELEGRAM_SECRET;
  process.env.TELEGRAM_SECRET = "secreto-seguro-navira-2026";

  const req = {
    method: "POST",
    get: (header) => (header.toLowerCase() === "x-telegram-bot-api-secret-token" ? "secreto-seguro-navira-2026" : null),
    body: {}, // update vacío para probar auth sin requerir credenciales de red de Firestore
  };
  const res = createMockResponse();

  try {
    await functions.botNavira(req, res);
    assert.equal(res.statusCode, 200, "Debe responder 200 OK cuando las credenciales son válidas");
  } finally {
    if (originalSecret !== undefined) {
      process.env.TELEGRAM_SECRET = originalSecret;
    } else {
      delete process.env.TELEGRAM_SECRET;
    }
  }
});
