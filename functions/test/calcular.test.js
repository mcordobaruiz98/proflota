const test = require("node:test");
const assert = require("node:assert/strict");

const { calcular } = require("../index.js");

// Comparación con tolerancia para resultados con punto flotante.
const aprox = (real, esperado, tol = 1e-6) =>
  assert.ok(
    Math.abs(real - esperado) <= tol,
    `Esperaba ${esperado}, obtuve ${real} (diferencia ${Math.abs(real - esperado)})`
  );

// ── Contrato de la API ──────────────────────────────────────

test("BE-15: calcular debe estar exportada y devolver todas las claves esperadas", () => {
  assert.equal(typeof calcular, "function", "calcular debe ser una función");

  const r = calcular({});
  const claves = [
    "kmT", "vViaje", "vIda", "vRet", "gTot", "galCargado", "galVacio",
    "cAcpm", "adlt", "cAdbl", "cComb", "peajes", "conductor", "gv2", "extras", "carp",
    "dRete", "dIca", "dFopat", "descTotal", "total", "neta", "margen", "cxk",
  ];

  for (const c of claves) {
    assert.ok(c in r, `Falta la clave "${c}" en el resultado`);
  }
});

test("BE-15: un objeto vacío produce todos los valores en cero, sin NaN ni Infinity", () => {
  const r = calcular({});

  for (const [clave, valor] of Object.entries(r)) {
    assert.ok(
      Number.isFinite(valor),
      `"${clave}" debe ser un número finito, obtuve ${valor}`
    );
  }
  assert.equal(r.kmT, 0);
  assert.equal(r.vViaje, 0);
  assert.equal(r.total, 0);
  assert.equal(r.neta, 0);
});

// ── Kilometraje ─────────────────────────────────────────────

test("BE-15: el kilometraje total solo suma el viaje de ida", () => {
  const r = calcular({ kmCargado: 100, kmVacio: 50 });
  assert.equal(r.kmT, 150);
});

test("BE-15: el kilometraje total incluye el recorrido de retorno", () => {
  const r = calcular({
    kmCargado: 100, kmCargadoRet: 40,
    kmVacio: 50, kmVacioRet: 25,
  });
  // El retorno también se contabiliza como combustible consumido.
  assert.equal(r.kmT, 215);
});

// ── Flete y retorno ─────────────────────────────────────────

test("BE-15: el flete de ida es toneladas por flete por tonelada", () => {
  const r = calcular({ ton: 10, fleteTon: 50000 });
  assert.equal(r.vIda, 500000);
  assert.equal(r.vViaje, 500000);
});

test("BE-15: sin retorno declarado el flete de retorno es cero", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    tonRet: 5, fleteRetTon: 40000, fleteRetFijo: 150000,
  });
  assert.equal(r.vRet, 0, "No debe cobrar retorno si tieneRetorno es falso");
  assert.equal(r.vViaje, 500000);
});

test("BE-15: el retorno se cobra por tonelada cuando no hay flete fijo", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    tieneRetorno: true, tonRet: 5, fleteRetTon: 40000,
  });
  assert.equal(r.vRet, 200000);
  assert.equal(r.vViaje, 700000);
});

test("BE-15: el flete fijo de retorno tiene prioridad sobre el precio por tonelada", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    tieneRetorno: true, tonRet: 5, fleteRetTon: 40000, fleteRetFijo: 150000,
  });
  assert.equal(r.vRet, 150000, "Debe ganar el flete fijo");
  assert.equal(r.vViaje, 650000);
});

test("BE-15: un flete fijo de retorno en cero se trata como ausente y cobra por tonelada", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    tieneRetorno: true, tonRet: 5, fleteRetTon: 40000, fleteRetFijo: 0,
  });
  assert.equal(r.vRet, 200000, "El 0 es falsy, por lo que cae al cálculo por tonelada");
});

// ── Combustible ─────────────────────────────────────────────

test("BE-15: el modo galones usa los galones directos e ignora los rendimientos", () => {
  const r = calcular({
    kmCargado: 100, rendCargado: 4,
    modoComb: "galones", galonesDirectos: 40,
  });
  assert.equal(r.gTot, 40, "Debe usar galonesDirectos, no km/rendimiento");
  assert.equal(r.galCargado, 0, "El desglose por rendimiento no aplica en modo galones");
  assert.equal(r.galVacio, 0);
});

test("BE-15: el combustible se calcula por rendimiento cargado y vacío", () => {
  const r = calcular({
    kmCargado: 100, kmVacio: 50,
    rendCargado: 4, rendVacio: 5,
  });
  assert.equal(r.galCargado, 25);
  assert.equal(r.galVacio, 10);
  assert.equal(r.gTot, 35);
});

test("BE-15: sin rendVacio propio se hereda el rendimiento de carga", () => {
  const r = calcular({ kmCargado: 100, kmVacio: 50, rendCargado: 4 });
  assert.equal(r.galVacio, 12.5, "Debe usar rendCargado como respaldo");
  assert.equal(r.gTot, 37.5);
});

test("BE-15: sin rendimiento definido el combustible es cero, no una división por cero", () => {
  const r = calcular({ kmCargado: 100, kmVacio: 50, precioGalon: 15000 });
  assert.equal(r.gTot, 0);
  assert.equal(r.cAcpm, 0);
  assert.ok(Number.isFinite(r.gTot), "No debe producir Infinity con rendimiento 0");
});

test("BE-15: un rendimiento de cero no genera Infinity en el consumo", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 0, precioGalon: 15000 });
  assert.equal(r.galCargado, 0);
  assert.equal(r.gTot, 0);
  assert.ok(Number.isFinite(r.cAcpm), "cAcpm debe seguir siendo finito");
});

test("BE-15: el costo del combustible es galones por precio del galón", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 4, precioGalon: 15000 });
  aprox(r.cAcpm, 375000);
  assert.equal(r.cComb, r.cAcpm, "Sin AdBlue, cComb es igual a cAcpm");
});

// ── AdBlue ──────────────────────────────────────────────────

test("BE-15: sin AdBlue configurado no se cobra el producto", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 4, precioGalon: 15000 });
  assert.equal(r.adlt, 0);
  assert.equal(r.cAdbl, 0);
});

test("BE-15: el AdBlue aplica la razón por defecto del 0.05 si no se indica otra", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 4, usaAdblue: true });
  assert.equal(r.gTot, 25);
  aprox(r.adlt, 4.73125, 1e-9);
  aprox(r.cAdbl, 4.73125 * 6000, 1e-6);
});

test("BE-15: el AdBlue respeta una razón personalizada", () => {
  const r = calcular({
    kmCargado: 80, rendCargado: 4, usaAdblue: true, adblueRatio: 0.1,
  });
  assert.equal(r.gTot, 20);
  aprox(r.adlt, 7.57, 1e-9);
});

test("BE-15: el precio por galón de AdBlue se puede sobreescribir", () => {
  const   r = calcular({
    kmCargado: 100, rendCargado: 4, usaAdblue: true, adblueRatio: 0.1, precioAdblue: 5000,
  });
  // 25 galones * 0.1 * 3.785 = 9.4625 litros de AdBlue
  aprox(r.adlt, 9.4625, 1e-9);
  aprox(r.cAdbl, 9.4625 * 5000, 1e-6);
});

test("BE-15: una razón de AdBlue en cero se sustituye por el valor por defecto", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 4, usaAdblue: true, adblueRatio: 0 });
  aprox(r.adlt, 4.73125, 1e-9, "El 0 es falsy, aplica el 0.05 por defecto");
});

test("BE-15: con usaAdblue desactivado la razón personalizada se ignora", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 4, usaAdblue: false, adblueRatio: 0.1 });
  assert.equal(r.adlt, 0);
  assert.equal(r.cAdbl, 0);
});

// ── Conductor ───────────────────────────────────────────────

test("BE-15: el conductor a porcentaje se cobra sobre el flete del viaje", () => {
  const r = calcular({ ton: 10, fleteTon: 50000, pcond: 10 });
  assert.equal(r.vViaje, 500000);
  assert.equal(r.conductor, 50000);
});

test("BE-15: el conductor fijo tiene prioridad sobre el porcentaje", () => {
  const r = calcular({ ton: 10, fleteTon: 50000, pcond: 10, condFijo: 30000 });
  assert.equal(r.conductor, 30000, "Debe ganar el valor fijo");
});

test("BE-15: un porcentaje de conductor en cero se trata como ausente", () => {
  const r = calcular({ ton: 10, fleteTon: 50000, pcond: 0 });
  assert.equal(r.conductor, 0);
});

// ── Descuentos de ley ───────────────────────────────────────

test("BE-15: los descuentos de ley se aplican como porcentaje del flete total", () => {
  const r = calcular({
    ton: 10, fleteTon: 500000,
    pctRete: 1, pctIca: 0.5, pctFopat: 0.5,
  });
  assert.equal(r.vViaje, 5000000);
  assert.equal(r.dRete, 50000);
  assert.equal(r.dIca, 25000);
  assert.equal(r.dFopat, 25000);
  assert.equal(r.descTotal, 100000);
});

test("BE-15: los descuentos de ley también se cobran sobre el flete de retorno", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    tieneRetorno: true, tonRet: 5, fleteRetTon: 40000,
    pctRete: 10,
  });
  // El 10% se aplica sobre 700.000 (ida + retorno), no solo sobre la ida.
  assert.equal(r.vViaje, 700000);
  assert.equal(r.dRete, 70000);
});

test("BE-15: el descuento adicional se suma a los descuentos de ley", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000, pctRete: 1, descOtro: 2500,
  });
  // El 1% de rete se calcula sobre los 500.000 del flete, no sobre el flete por tonelada.
  assert.equal(r.dRete, 5000);
  assert.equal(r.descTotal, 7500);
});

// ── Totales, neta, margen y costo por kilómetro ─────────────

test("BE-15: el total suma concepto por concepto", () => {
  const r = calcular({
    kmCargado: 100, rendCargado: 4, precioGalon: 15000,
    ton: 10, fleteTon: 50000,
    peajes: 30000, condFijo: 25000, gastosViaje: 10000, gastosAdic: 5000, carpado: 20000,
  });
  const esperado = r.cComb + 30000 + 25000 + 10000 + 5000 + 20000;
  assert.equal(r.total, esperado);
  assert.equal(r.peajes, 30000);
  assert.equal(r.gv2, 10000);
  assert.equal(r.extras, 5000);
  assert.equal(r.carp, 20000);
});

test("BE-15: la utilidad resta costos y descuentos de ley al flete", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    kmCargado: 100, rendCargado: 4, precioGalon: 15000,
    peajes: 10000, pctRete: 1,
  });
  // 500.000 flete - 10.000 peajes - 5.000 rete - 375.000 combustible
  assert.equal(r.cComb, 375000);
  assert.equal(r.total, 385000);
  assert.equal(r.descTotal, 5000);
  assert.equal(r.neta, 110000);
});

test("BE-15: el margen es el porcentaje de utilidad sobre el flete", () => {
  const r = calcular({ ton: 10, fleteTon: 50000 });
  assert.equal(r.neta, 500000);
  assert.equal(r.margen, 100);
});

test("BE-15: un margen negativo se reporta con signo", () => {
  const r = calcular({
    ton: 10, fleteTon: 50000,
    kmCargado: 100, kmVacio: 50, rendCargado: 4, precioGalon: 15000,
  });
  // 37.5 galones * 15.000 = 562.500 de combustible frente a 500.000 de flete.
  assert.equal(r.neta, -62500);
  assert.equal(r.margen, -12.5);
});

test("BE-15: sin flete el margen es cero en lugar de NaN", () => {
  const r = calcular({ kmCargado: 100, rendCargado: 4, precioGalon: 15000 });
  assert.equal(r.vViaje, 0);
  assert.equal(r.margen, 0);
  assert.ok(!Number.isNaN(r.margen), "No debe producir NaN con flete cero");
});

test("BE-15: el costo por kilómetro divide el total entre el kilometraje total", () => {
  const r = calcular({
    kmCargado: 100, kmVacio: 50, rendCargado: 4, precioGalon: 15000,
    ton: 10, fleteTon: 50000, peajes: 10000,
  });
  assert.equal(r.kmT, 150);
  assert.equal(r.total, 572500);
  aprox(r.cxk, 572500 / 150);
});

test("BE-15: sin kilometraje el costo por kilómetro es cero, no Infinity", () => {
  const r = calcular({ ton: 10, fleteTon: 50000, peajes: 10000 });
  assert.equal(r.kmT, 0);
  assert.equal(r.cxk, 0);
  assert.ok(Number.isFinite(r.cxk), "No debe producir Infinity con km 0");
});

test("BE-15: un viaje de ida completo mantiene la coherencia aritmética de todos los totales", () => {
  const v = {
    kmCargado: 180, kmVacio: 60, kmCargadoRet: 180, kmVacioRet: 60,
    ton: 22, fleteTon: 68000,
    tieneRetorno: true, tonRet: 18, fleteRetTon: 52000,
    rendCargado: 3.5, rendVacio: 4.5, precioGalon: 14800,
    usaAdblue: true, adblueRatio: 0.05,
    peajes: 84000, pcond: 9, gastosViaje: 45000, gastosAdic: 12000, carpado: 30000,
    pctRete: 0.75, pctIca: 0.4, pctFopat: 0.4, descOtro: 5000,
  };
  const r = calcular(v);

  // Kilometraje: el retorno también consume combustible.
  assert.equal(r.kmT, 480);
  // Flete de ida y de retorno.
  assert.equal(r.vIda, 22 * 68000);
  assert.equal(r.vRet, 18 * 52000);
  assert.equal(r.vViaje, r.vIda + r.vRet);

  // Combustible por rendimiento.
  assert.equal(r.galCargado, 360 / 3.5);
  assert.equal(r.galVacio, 120 / 4.5);
  aprox(r.gTot, r.galCargado + r.galVacio);
  aprox(r.cAcpm, r.gTot * 14800);
  aprox(r.adlt, r.gTot * 0.05 * 3.785, 1e-9);
  aprox(r.cComb, r.cAcpm + r.cAdbl);

  // Conductor por porcentaje sobre el flete ida + retorno.
  assert.equal(r.conductor, (9 / 100) * r.vViaje);

  // Descuentos de ley sobre el flete ida + retorno.
  aprox(r.dRete, (0.75 / 100) * r.vViaje);
  aprox(r.dIca, (0.4 / 100) * r.vViaje);
  aprox(r.dFopat, (0.4 / 100) * r.vViaje);
  assert.equal(r.descTotal, r.dRete + r.dIca + r.dFopat + 5000);

  // Consistencia de los agregados.
  assert.equal(r.total, r.cComb + r.peajes + r.conductor + r.gv2 + r.extras + r.carp);
  assert.equal(r.neta, r.vViaje - r.total - r.descTotal);
  assert.equal(r.margen, (r.neta / r.vViaje) * 100);
  assert.equal(r.cxk, r.total / r.kmT);
});
