import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

// Directories
const excelDir = path.join('C:', 'azienda', 'Progetti', 'ttfstore.com');
const outputFile = path.join(process.cwd(), 'src', 'data', 'products.json');

// Ensure the output directory exists
const outputDir = path.dirname(outputFile);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Columns that are known technical specs
const specColumns = [
  'Volt', 'Fasi', 'Frequenza (Hz)', 'Spina elettrica', 'Paese origine', 'KW',
  'Potenza (Watt)', 'Peso netto (Kg)', 'Peso lordo (Kg)', 
  'Dimensioni imballo (mm.)', 'Volume Imballo (m3)',
  'Timer', 'Dimens. Camera Cottura (mm.)', 'Lunghezza Macchina (Cm.)',
  'Larghezza Macchina (Cm.)', 'Altezza Macchina (Cm.)', 'Velocità (rpm)',
  'Capacità del Bicchiere (L)', 'Produzione Oraria (Kg/h)-(h/N)',
  'Capacità e/o Dimensioni Vasca', 'Temperatura di Lavoro (°C)',
  'Numero di Bruciatori (N°)', 'Capacità del Cestello (Kg.)',
  'Capacità Olio (L)', 'Numero Piani', 'Accessori in Dotazione',
  'Numero di Vassoi-Teglie', 'Dimensioni Piano Cottura (mm.)',
  'Barra Saldante (mm.)', 'Pompa Vuoto (m3/h)', 'Vuoto Max Ottenibile (%)',
  'Dimens. Interne Macchina (mm.)', 'Numero di Teglie (N°)', 'Capacità della Pentola',
  'Dotazione', 'Carico Massimo (Kg.)', 'Piastre', 'Dimensioni Piano Lavoro (mm.)',
  'Tipo di Gas Refrigerante', 'Numero Piatti', 'Finitura', 'Impasto per Ciclo (Kg.)',
  'Rulli: diametro, dimens. (mm.)', 'Apertura Rulli (mm.)', 'Pompa Lavaggio (Kw)',
  'Consumo a ciclo (L)', 'Resistenza Boiler (Kw)', 'Capacità Boiler (L)',
  'Dimensioni Interne (mm.)', "Capacita' Nominale (L.)", 'Temperatura Massima di Lavoro',
  'Tipo di Refrigerazione', 'Tipo di Sbrinamento', 'Evaporazione Acqua di Condensa',
  'Controllo della Temperatura', 'Isolamento (mm.)', 'Materiale di Costruzione',
  'Inversione Porta', 'Luce Interna', 'Classe Energetica', 'Lunghezza Macchina (mm.)',
  'Larghezza Macchina (mm.)', 'Altezza Macchina (mm.)', 'Struttura'
];

function normalizeProduct(row, headerMap, brand, sourceFile) {
  if (!row || row.length === 0) return null;

  const getVal = (colName) => {
    const idx = headerMap[colName];
    if (idx !== undefined && row[idx] !== undefined && row[idx] !== null) {
      return String(row[idx]).trim();
    }
    return '';
  };

  const code = getVal('Code (*)');
  const name = getVal('Descrizione articolo') || getVal('Titolo');
  if (!code || !name) return null;

  // Parse original list price
  let rawPrice = getVal('Prezzo 1');
  if (!rawPrice) rawPrice = getVal('Prezzo');
  let originalListPrice = 0;
  if (rawPrice) {
    const cleanPrice = rawPrice.replace(/\./g, '').replace(',', '.');
    originalListPrice = parseFloat(cleanPrice) || 0;
  }

  // Prezzo base = Listino con 30% in meno
  // Prezzo scontato sbarrato = Ulteriore 10% di sconto (Totale 40% di sconto dal listino)
  const baseDiscountedPrice = originalListPrice > 0 ? Math.round(originalListPrice * 0.70 * 100) / 100 : 0;
  const finalPrice = originalListPrice > 0 ? Math.round(originalListPrice * 0.60 * 100) / 100 : 0;

  // Gather specifications
  const specs = [];
  for (const specCol of specColumns) {
    const val = getVal(specCol);
    if (val && val !== '0' && val !== '0,000' && val !== '0.0' && val !== 'N' && val !== 'no') {
      specs.push({
        label: specCol,
        value: val
      });
    }
  }

  // Sanitize ID so it works nicely in URLs
  const cleanCode = code.replace(/[\/\\]/g, '-').trim();
  const id = `${brand}_${cleanCode}`;

  return {
    id: id,
    code: code,
    brand: brand,
    category: getVal('Categoria') || 'Attrezzature Ho.Re.Ca.',
    subCategory: getVal('Sottocategoria1') || '',
    name: name,
    description: getVal('Descrizione lunga') || name,
    image: getVal('Immagine') || '',
    specifications: specs,
    originalListPrice: originalListPrice, // Prezzo listino originale
    comparePrice: baseDiscountedPrice,     // Prezzo sbarrato (-30%)
    price: finalPrice,                     // Prezzo finale di vendita (-40% totale)
    discountPctTotal: 40,
    discountPctExtra: 10,
    sourceFile: sourceFile
  };
}

function processExcelFile(filePath, brand) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
    if (rows.length < 2) return [];

    const headers = rows[0];
    const headerMap = {};
    headers.forEach((h, idx) => {
      if (h && typeof h === 'string') {
        const clean = h.trim();
        if (!headerMap[clean]) {
          headerMap[clean] = idx;
        }
      }
    });

    const products = [];
    const seenIds = new Set();

    for (let i = 1; i < rows.length; i++) {
      const prod = normalizeProduct(rows[i], headerMap, brand, path.basename(filePath));
      if (prod && !seenIds.has(prod.id)) {
        seenIds.add(prod.id);
        products.push(prod);
      }
    }

    console.log(`✓ Processed ${products.length} products from ${path.basename(filePath)} (${brand})`);
    return products;
  } catch (error) {
    console.error(`✗ Error processing ${filePath}:`, error.message);
    return [];
  }
}

function main() {
  console.log('Parsing catalogs with TTF STORE 30% + 10% discount pricing model...');
  const filesToProcess = [
    { file: 'FORCOLD_ITA.xlsx', brand: 'FORCOLD' },
    { file: 'EASYLINE _ITA.xlsx', brand: 'EASYLINE' },
    { file: 'FIMAR_ITA.xlsx', brand: 'FIMAR' }
  ];

  let allProducts = [];
  for (const { file, brand } of filesToProcess) {
    const filePath = path.join(excelDir, file);
    const prods = processExcelFile(filePath, brand);
    allProducts = [...allProducts, ...prods];
  }

  fs.writeFileSync(outputFile, JSON.stringify(allProducts, null, 2), 'utf8');
  console.log(`\n🎉 Total products parsed: ${allProducts.length}`);
  console.log(`Sample product pricing:`);
  const sample = allProducts.find(p => p.originalListPrice > 100);
  if (sample) {
    console.log({
      name: sample.name,
      originalListPrice: sample.originalListPrice,
      comparePrice_minus30pct: sample.comparePrice,
      finalPrice_minus40pctTotal: sample.price
    });
  }
}

main();
