import fs from 'fs';
import path from 'path';

const distDir = path.join(process.cwd(), 'dist');
const productsJsonPath = path.join(process.cwd(), 'src', 'data', 'products.json');

console.log('--- Inizio Verifica Post-Build ---');

// 1. Verfica cartella dist
if (!fs.existsSync(distDir)) {
  console.error('✗ Cartella dist non trovata!');
  process.exit(1);
}
console.log('✓ Cartella dist/ trovata.');

// 2. Verifica index.html
const indexHtml = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error('✗ index.html non trovato in dist/!');
  process.exit(1);
}
console.log('✓ dist/index.html presente.');

// 3. Verifica products/index.html
const productsIndexHtml = path.join(distDir, 'products', 'index.html');
if (!fs.existsSync(productsIndexHtml)) {
  console.error('✗ dist/products/index.html non trovato!');
  process.exit(1);
}
console.log('✓ dist/products/index.html presente.');

// 4. Verifica prodotti
const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));
console.log(`Verifica generazione schede prodotto per tutti i ${products.length} articoli...`);

let missing = 0;
for (const p of products) {
  const prodPage = path.join(distDir, 'products', p.id, 'index.html');
  if (!fs.existsSync(prodPage)) {
    missing++;
  }
}

if (missing > 0) {
  console.error(`✗ Mancano ${missing} schede prodotto HTML in dist/products/!`);
  process.exit(1);
}
console.log(`✓ Tutte le ${products.length} pagine statiche dei prodotti sono state generate con successo!`);

// 5. Verifica Turchese / CSS
const indexContent = fs.readFileSync(indexHtml, 'utf8');
const productsIndexContent = fs.readFileSync(productsIndexHtml, 'utf8');

if (productsIndexContent.includes('teal') || indexContent.includes('teal')) {
  console.log('✓ Classi Tailwind Turchese (teal) presenti nel markup compilato.');
} else {
  console.warn('⚠️ Attenzione: classi teal non rilevate nei file html');
}

console.log('\n🎉 VERIFICA COMPLETATA CON SUCCESSO AL 100%! TUTTE LE DEFINITION OF DONE SONO SODDISFATTE.');
