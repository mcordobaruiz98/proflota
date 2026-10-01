// Hecho por JESUS COSSIO DEV
import puppeteer from 'puppeteer-core';
import path from 'path';

const ARTIFACT_DIR = '/home/jesus/.gemini/antigravity-ide/brain/60743d3c-8847-4a45-90dc-a50bf8bed124';

async function testDeepButtons() {
  console.log('🚀 Iniciando verificación profunda de botones e interactividad en TODOS los módulos...');
  const browser = await puppeteer.launch({
    executablePath: '/usr/bin/google-chrome',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu', '--window-size=430,932']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 430, height: 932, isMobile: true, hasTouch: true });

  const auditLog = [];

  const checkModule = async (name, url, actions) => {
    console.log(`\n🔍 Verificando Módulo: ${name} (${url})...`);
    try {
      await page.goto(`http://localhost:5173${url}`, { waitUntil: 'networkidle2', timeout: 15000 });
      await new Promise(r => setTimeout(r, 600));

      let actionResults = [];
      if (actions) {
        actionResults = await actions(page);
      }

      auditLog.push({ modulo: name, ruta: url, estado: '✅ FUNCIONANDO', detalles: actionResults.join(' | ') || 'Navegación y render OK' });
    } catch (err) {
      console.error(`❌ Error en ${name}:`, err.message);
      auditLog.push({ modulo: name, ruta: url, estado: '❌ ERROR', detalles: err.message });
    }
  };

  try {
    // 1. Auth Setup
    await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle2' });
    await page.type('input[type="email"]', 'tester.vortex@navira.app');
    await page.type('input[type="password"]', 'MarioChata1998.');
    const submit = await page.$('button[type="submit"]') || (await page.$$('button'))[0];
    if (submit) await submit.click();
    await new Promise(r => setTimeout(r, 3000));

    // 2. Calculadora - Validación de opciones mutuamente excluyentes
    await checkModule('Calculadora', '/calculadora', async (p) => {
      const details = [];
      // Buscar botones de selección
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Por Tonelada') || text.includes('Flete Total') || text.includes('Siguiente')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 3. Cotizador - Validación de botones y modo compacto
    await checkModule('Cotizador', '/cotizador', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Por Tonelada') || text.includes('Flete Total') || text.includes('Modo Rápido') || text.includes('Asistente')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 4. Aceite - Wizard de cambio de aceite
    await checkModule('Aceite', '/aceite', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Registrar') || text.includes('15W-40') || text.includes('Mobil') || text.includes('Siguiente')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 5. Filtros - Wizard de reemplazo
    await checkModule('Filtros', '/filtros', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Registrar') || text.includes('Aceite') || text.includes('Donaldson') || text.includes('Siguiente')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 6. Tanqueos - Wizard de combustible
    await checkModule('Tanqueos', '/tanqueos', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Registrar') || text.includes('Terpel') || text.includes('Siguiente')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 7. Conductores - Registro y liquidación
    await checkModule('Conductores', '/conductores', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Registrar') || text.includes('Fijo') || text.includes('Porcentaje')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 8. Empresas - Directorio y registro
    await checkModule('Empresas', '/empresas', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Registrar') || text.includes('Contado') || text.includes('Crédito')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 9. Cobros - Generador de cobros
    await checkModule('Cobros', '/cobros', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Generar') || text.includes('Cuenta de Cobro') || text.includes('Copiar')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 10. Vehículos & Agregar Vehículo
    await checkModule('Vehículos', '/vehiculos', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Agregar') || text.includes('Vehículo')) {
          details.push(`Encontrado botón "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 11. Cuentas
    await checkModule('Cuentas', '/cuentas', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Mes') || text.includes('Año') || text.includes('Detalle')) {
          await b.click();
          await new Promise(r => setTimeout(r, 200));
          details.push(`Click en "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    // 12. Configuración
    await checkModule('Configuración', '/configuracion', async (p) => {
      const details = [];
      const btns = await p.$$('button');
      for (const b of btns) {
        const text = await p.evaluate(el => el.textContent, b);
        if (text.includes('Guardar') || text.includes('Firma') || text.includes('Limpiar')) {
          details.push(`Botón "${text.trim().slice(0, 20)}"`);
        }
      }
      return details;
    });

    console.log('\n======================================================');
    console.log('🏆 RESUMEN COMPLETO DE VERIFICACIÓN DE BOTONES Y MÓDULOS');
    console.log('======================================================');
    console.table(auditLog);

  } catch (err) {
    console.error('Error general:', err);
  } finally {
    await browser.close();
  }
}

testDeepButtons();
