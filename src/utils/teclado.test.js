import test from "node:test";
import assert from "node:assert/strict";

import { alPulsarEnterOEspacio } from "./teclado.js";

test("teclado: Enter y Espacio ejecutan la accion y cancelan el default", () => {
  for (const key of ["Enter", " ", "Spacebar"]) {
    let llamadas = 0;
    let evitado = false;
    const alPulsar = alPulsarEnterOEspacio(() => { llamadas++; });
    alPulsar({ key, preventDefault: () => { evitado = true; } });
    assert.equal(llamadas, 1, `debio ejecutarse con ${JSON.stringify(key)}`);
    assert.ok(evitado, `debia prevenir el default con ${JSON.stringify(key)}`);
  }
});

test("teclado: el resto de teclas no ejecutan la accion ni previenen nada", () => {
  for (const key of ["a", "Tab", "Escape", "ArrowDown", "Shift"]) {
    let llamadas = 0;
    let evitado = false;
    const alPulsar = alPulsarEnterOEspacio(() => { llamadas++; });
    alPulsar({ key, preventDefault: () => { evitado = true; } });
    assert.equal(llamadas, 0, `no debia ejecutarse con ${JSON.stringify(key)}`);
    assert.equal(evitado, false, `no debia prevenir con ${JSON.stringify(key)}`);
  }
});

test("teclado: la accion recibe el evento original", () => {
  const original = { key: "Enter", preventDefault: () => {} };
  let recibido = null;
  alPulsarEnterOEspacio((e) => { recibido = e; })(original);
  assert.equal(recibido, original);
});
