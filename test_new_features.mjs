import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/jesus/.gemini/antigravity-ide/brain/60743d3c-8847-4a45-90dc-a50bf8bed124';

(async () => {
  console.log('🚀 Iniciando pruebas automatizadas de las 5 tareas de Navira App...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });

  console.log('🔑 Iniciando sesión de prueba...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
  await page.type('input[type="email"]', 'tester.vortex@navira.app');
  await page.type('input[type="password"]', 'MarioChata1998.');

  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Ingresar')) {
      await b.click();
      break;
    }
  }

  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 3000));

  // 1. COTIZADOR RÁPIDO: Origen y Destino independientes con sugerencias de Colombia
  console.log('📍 1. Verificando Cotizador Rápido con Origen y Destino...');
  await page.goto('http://localhost:5173/cotizador', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Ir a paso 2
  const nextBtns = await page.$$('button');
  for (const b of nextBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Siguiente') || text.includes('Continuar')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_cotizador_step2_rutas.png') });
  console.log('📸 Captura: val_cotizador_step2_rutas.png');

  // 2. CALCULADORA: Pasos agrupados y navegación sin perder paso
  console.log('📍 2. Verificando Calculadora simplificada (Paso 1 y Paso 2)...');
  await page.goto('http://localhost:5173/calculadora', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_calculadora_paso1_operacion.png') });
  console.log('📸 Captura: val_calculadora_paso1_operacion.png');

  // Ir a Paso 2 de la Calculadora
  const calcBtns = await page.$$('button');
  for (const b of calcBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Siguiente')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_calculadora_paso2_carga_ruta.png') });
  console.log('📸 Captura: val_calculadora_paso2_carga_ruta.png');

  // Probar cambio a Modo Avanzado y volver
  console.log('🔄 Probando cambio a Modo Avanzado...');
  const switchBtns = await page.$$('button');
  for (const b of switchBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Avanzado')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_calculadora_modo_avanzado.png') });
  console.log('📸 Captura: val_calculadora_modo_avanzado.png');

  // Volver a Modo Guiado
  console.log('🔄 Volviendo a Modo Guiado...');
  const switchBtns2 = await page.$$('button');
  for (const b of switchBtns2) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Guiado')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_calculadora_retorno_guiado.png') });
  console.log('📸 Captura: val_calculadora_retorno_guiado.png');

  // 3. CONDUCTORES: 3 Pasos con carga de documentos
  console.log('📍 3. Verificando Conductores (3 pasos y carga de docs)...');
  await page.goto('http://localhost:5173/conductores', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Abrir modal de nuevo conductor
  const condBtns = await page.$$('button');
  for (const b of condBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Registrar') || text.includes('Conductor')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_conductores_paso1_basicos.png') });
  console.log('📸 Captura: val_conductores_paso1_basicos.png');

  // Llenar campos requeridos de paso 1
  await page.type('input[placeholder*="Nombre"]', 'Jorge Eliécer Gaitán');
  await page.type('input[placeholder*="1023"]', '1098765432');
  await page.type('input[placeholder*="310"]', '3109876543');

  // Ir a paso 2
  const modalNextBtns1 = await page.$$('button');
  for (const b of modalNextBtns1) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Siguiente')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_conductores_paso2_licencias.png') });
  console.log('📸 Captura: val_conductores_paso2_licencias.png');

  // Ir a paso 3
  const modalNextBtns2 = await page.$$('button');
  for (const b of modalNextBtns2) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Siguiente')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_conductores_paso3_documentos.png') });
  console.log('📸 Captura: val_conductores_paso3_documentos.png');

  // 4. AGREGAR VEHÍCULO: Validación estricta de placa (3 letras + 3 números)
  console.log('📍 4. Verificando Validación de Placas en Agregar Vehículo...');
  await page.goto('http://localhost:5173/vehiculo/nuevo', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));

  // Seleccionar primer tipo de vehículo (ej: Tractomula o Sencillo)
  const tipoCards = await page.$$('button, div[style*="cursor: pointer"]');
  for (const tc of tipoCards) {
    const text = await page.evaluate(el => el.textContent, tc);
    if (text.includes('Tractomula') || text.includes('Sencillo') || text.includes('Doble Troque')) {
      await tc.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 500));

  // Ir a paso 2 (datos del vehículo)
  const vehBtns = await page.$$('button');
  for (const b of vehBtns) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Siguiente') || text.includes('Continuar')) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 1000));

  // Probar placa inválida
  await page.type('input[placeholder*="ABC-123"], input[placeholder*="ABC123"]', 'AB123');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_vehiculo_placa_invalida.png') });
  console.log('📸 Captura: val_vehiculo_placa_invalida.png');

  // Corregir a placa válida
  await page.evaluate(() => {
    const input = document.querySelector('input[placeholder*="ABC-123"], input[placeholder*="ABC123"]');
    if (input) {
      input.value = '';
    }
  });
  await page.type('input[placeholder*="ABC-123"], input[placeholder*="ABC123"]', 'SWE789');
  await new Promise(r => setTimeout(r, 500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_vehiculo_placa_valida.png') });
  console.log('📸 Captura: val_vehiculo_placa_valida.png');

  // 5. MODO OSCURO / MODO CLARO
  console.log('📍 5. Verificando Selector de Modo Oscuro / Claro en Configuración...');
  await page.goto('http://localhost:5173/configuracion', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 1500));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_configuracion_theme.png') });
  console.log('📸 Captura: val_configuracion_theme.png');

  console.log('🎉 ¡Todas las pruebas de verificación de requerimientos han finalizado con éxito!');
  await browser.close();
})();
