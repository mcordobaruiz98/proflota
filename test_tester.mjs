import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/jesus/.gemini/antigravity-ide/brain/60743d3c-8847-4a45-90dc-a50bf8bed124';

async function run() {
  console.log('🚀 Iniciando navegador de prueba...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });

  console.log('📍 Navegando a http://localhost:5173/login...');
  await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });

  console.log('🔑 Introduciendo credenciales de tester...');
  await page.type('input[type="email"]', 'tester.vortex@navira.app');
  await page.type('input[type="password"]', 'MarioChata1998.');

  console.log('👆 Clic en Ingresar...');
  const buttons = await page.$$('button');
  for (const b of buttons) {
    const text = await page.evaluate(el => el.textContent, b);
    if (text.includes('Ingresar')) {
      await b.click();
      break;
    }
  }

  console.log('⏳ Esperando inicio de sesión y sincronización...');
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
  await new Promise(r => setTimeout(r, 4000));

  console.log('📍 URL actual tras login:', page.url());
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_home.png') });
  console.log('📸 Captura guardada: tester_home.png');

  // Visitar Calculadora
  console.log('📍 Navegando a Calculadora...');
  await page.goto('http://localhost:5173/calculadora', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_calculadora.png'), fullPage: false });
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_calculadora_full.png'), fullPage: true });
  console.log('📸 Captura guardada: tester_calculadora.png');

  // Visitar AgregarVehiculo
  console.log('📍 Navegando a Agregar Vehículo...');
  await page.goto('http://localhost:5173/vehiculo/nuevo', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_agregar_vehiculo.png'), fullPage: false });
  console.log('📸 Captura guardada: tester_agregar_vehiculo.png');

  // Visitar Vehiculos
  console.log('📍 Navegando a Vehiculos...');
  await page.goto('http://localhost:5173/vehiculos', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_vehiculos.png') });
  console.log('📸 Captura guardada: tester_vehiculos.png');

  // Visitar Viajes
  console.log('📍 Navegando a Viajes...');
  await page.goto('http://localhost:5173/viajes', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_viajes.png') });
  console.log('📸 Captura guardada: tester_viajes.png');

  // Visitar Cartera
  console.log('📍 Navegando a Cartera...');
  await page.goto('http://localhost:5173/cartera', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_cartera.png') });
  console.log('📸 Captura guardada: tester_cartera.png');

  // Visitar Conductores
  console.log('📍 Navegando a Conductores...');
  await page.goto('http://localhost:5173/conductores', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_conductores.png') });
  console.log('📸 Captura guardada: tester_conductores.png');

  // Visitar Perfil
  console.log('📍 Navegando a Perfil...');
  await page.goto('http://localhost:5173/perfil', { waitUntil: 'networkidle2' });
  await new Promise(r => setTimeout(r, 2000));
  await page.screenshot({ path: path.join(ARTIFACT_DIR, 'tester_perfil.png') });
  console.log('📸 Captura guardada: tester_perfil.png');

  console.log('✅ Todas las capturas guardadas exitosamente.');
  await browser.close();
}

run().catch(console.error);
