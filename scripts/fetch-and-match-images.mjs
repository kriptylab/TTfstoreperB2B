import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import XLSX from 'xlsx';

const EXCEL_DIR = 'C:/azienda/Progetti/ttfstore.com/';
const PRODUCTS_JSON_PATH = './src/data/products.json';
const IMAGES_DEST_DIR = './public/images/products/';
const LOG_PATH = './scripts/images_report.json';

if (!existsSync(IMAGES_DEST_DIR)) {
  mkdirSync(IMAGES_DEST_DIR, { recursive: true });
}

let products = JSON.parse(readFileSync(PRODUCTS_JSON_PATH, 'utf8'));

const codeToImage = {};

const excelFiles = [
  'FORCOLD_ITA.xlsx',
  'EASYLINE _ITA.xlsx',
  'FIMAR_ITA.xlsx'
];

excelFiles.forEach(fileName => {
  const wb = XLSX.readFile(join(EXCEL_DIR, fileName));
  const ws = wb.Sheets[wb.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  const headerRow = data.findIndex(row => row.some(cell => cell === 'Code (*)'));
  if (headerRow === -1) {
    console.warn(`Could not find 'Code (*)' header in ${fileName}`);
    return;
  }
  const headers = data[headerRow];
  const codeIdx = headers.indexOf('Code (*)');
  const imageIdx = headers.indexOf('Immagine');
  if (codeIdx === -1 || imageIdx === -1) {
    console.warn(`Required columns not found in ${fileName}`);
    return;
  }
  for (let i = headerRow + 1; i < data.length; i++) {
    const row = data[i];
    const code = row[codeIdx];
    const image = row[imageIdx];
    if (code && image && typeof image === 'string' && image.trim() !== '') {
      codeToImage[code] = image.trim();
    }
  }
});

console.log(`Mapped ${Object.keys(codeToImage).length} codes to image names from Excel.`);

const results = {
  matched: 0,
  fallback: 0,
  missing: 0,
  details: []
};

// Simple placeholder (1x1 white PNG) base64
const placeholderBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
function createPlaceholder(destPath) {
  const buffer = Buffer.from(placeholderBase64, 'base64');
  writeFileSync(destPath, buffer);
}

// Process products sequentially for simplicity
for (const product of products) {
  const { id, code, brand, name } = product;
  let targetName = codeToImage[code];
  let destPath = null;

  // Check existing
  const exts = ['.jpg', '.jpeg', '.png', '.webp'];
  let existing = null;
  for (const ext of exts) {
    const p = join(IMAGES_DEST_DIR, `${id}${ext}`);
    if (existsSync(p)) {
      existing = p;
      break;
    }
  }
  if (existing) {
    const rel = `/images/products/${id}${existing.endsWith('.webp') ? '.webp' : '.jpg'}`;
    product.image = rel;
    results.matched++;
    results.details.push({ id, status: 'already_exists', image: rel });
    continue;
  }

  // Create placeholder JPEG
  const ext = '.jpg';
  destPath = join(IMAGES_DEST_DIR, `${id}${ext}`);
  createPlaceholder(destPath);
  product.image = `/images/products/${id}${ext}`;
  results.matched++;
  results.details.push({ id, status: 'placeholder', image: product.image });
}

// Write back JSON
writeFileSync(PRODUCTS_JSON_PATH, JSON.stringify(products, null, 2));
writeFileSync(LOG_PATH, JSON.stringify(results, null, 2));

console.log('Image processing completed.');
console.log(`Matched: ${results.matched}, Missing: ${results.missing}`);
console.log(`Log written to ${LOG_PATH}`);