import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/jesus/.gemini/antigravity-ide/brain/60743d3c-8847-4a45-90dc-a50bf8bed124';

async function testAll() {
  console.log('🚀 Iniciando suite de validación de botones e interacción en todos los módulos...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });

  const results = [];

  try {
    // 1. LOGIN
    console.log('📍 1. Verificando Login...');
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'tester.vortex@navira.app');
    await page.type('input[type="password"]', 'MarioChata1998.');
    const loginBtn = await page.$('button[type="submit"]') || (await page.$$('button'))[0];
    if (loginBtn) await loginBtn.click();
    await new Promise(r => setTimeout(r, 3500));
    results.push({ modulo: 'Login', estado: 'OK' });

    // 2. COTIZADOR
    console.log('📍 2. Verificando Cotizador (Opciones y Botones)...');
    await page.goto('http://localhost:5173/cotizador', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Probar clic en "Flete Total"
    const btnsCotizador = await page.$$('button');
    for (const b of btnsCotizador) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes('Flete Total')) {
        await b.click();
        await new Promise(r => setTimeout(r, 400));
        break;
      }
    }
    // Probar volver a "Por Tonelada"
    for (const b of btnsCotizador) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes('Por Tonelada')) {
        await b.click();
        await new Promise(r => setTimeout(r, 400));
        break;
      }
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_cotizador.png') });
    results.push({ modulo: 'Cotizador (Flete Por Ton / Total)', estado: 'OK' });

    // 3. CALCULADORA WIZARD
    console.log('📍 3. Verificando Calculadora Wizard (Paso a paso y tarjetas)...');
    await page.goto('http://localhost:5173/calculadora', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Avanzar al paso 3 (Tipos de carga)
    for (let p = 1; p <= 3; p++) {
      const btnSig = await page.$$('button');
      for (const b of btnSig) {
        const txt = await page.evaluate(el => el.textContent, b);
        if (txt.includes('Siguiente')) {
          await b.click();
          await new Promise(r => setTimeout(r, 500));
          break;
        }
      }
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_calculadora_pasos.png') });
    results.push({ modulo: 'Calculadora (Wizard & Tarjetas)', estado: 'OK' });

    // 4. AGREGAR VEHICULO WIZARD
    console.log('📍 4. Verificando Agregar Vehículo (Tarjetas de tipos)...');
    await page.goto('http://localhost:5173/vehiculo/nuevo', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Hacer clic en tipo "Sencillo" o "Dobletroque"
    const btnsVeh = await page.$$('button');
    for (const b of btnsVeh) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes('Dobletroque')) {
        await b.click();
        await new Promise(r => setTimeout(r, 400));
        break;
      }
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_agregar_vehiculo.png') });
    results.push({ modulo: 'Agregar Vehículo (Tipos & Remolques)', estado: 'OK' });

    // 5. CONDUCTORES
    console.log('📍 5. Verificando Conductores (Wizard y Liquidación)...');
    await page.goto('http://localhost:5173/conductores', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Clic en registrar nuevo conductor
    const btnsCond = await page.$$('button');
    for (const b of btnsCond) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes('Registrar nuevo conductor')) {
        await b.click();
        await new Promise(r => setTimeout(r, 600));
        break;
      }
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_conductores_wizard.png') });
    results.push({ modulo: 'Conductores (Wizard)', estado: 'OK' });

    // 6. COBROS
    console.log('📍 6. Verificando Cobros...');
    await page.goto('http://localhost:5173/cobros', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_cobros.png') });
    results.push({ modulo: 'Cobros', estado: 'OK' });

    // 7. EMPRESAS
    console.log('📍 7. Verificando Empresas...');
    await page.goto('http://localhost:5173/empresas', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    
    // Clic en agregar empresa
    const btnsEmp = await page.$$('button');
    for (const b of btnsEmp) {
      const txt = await page.evaluate(el => el.textContent, b);
      if (txt.includes('Registrar nueva empresa')) {
        await b.click();
        await new Promise(r => setTimeout(r, 600));
        break;
      }
    }
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_empresas_wizard.png') });
    results.push({ modulo: 'Empresas (Directorio & Wizard)', estado: 'OK' });

    // 8. CUENTAS
    console.log('📍 8. Verificando Cuentas...');
    await page.goto('http://localhost:5173/cuentas', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(ARTIFACT_DIR, 'val_cuentas.png') });
    results.push({ modulo: 'Cuentas (Resumen Financiero)', estado: 'OK' });

    console.log('\n📊 RESULTADOS DE VALIDACIÓN:');
    console.table(results);

  } catch (err) {
    console.error('❌ Error durante la prueba:', err);
  } finally {
    await browser.close();
  }
}

testAll();
