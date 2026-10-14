
import fs from 'fs';
import path from 'path';

// Get the base directory (where this script is located)
const __filename = new URL(import.meta.url).pathname;
// Remove the leading slash that comes from file:// URL on Windows
let __dirname = path.dirname(__filename);
if (__dirname.startsWith('/') && __dirname.match(/^[a-zA-Z]:/)) {
  __dirname = __dirname.substring(1);
}

// The ecommerce project root is the parent directory of the scripts directory
let projectRoot = path.dirname(__dirname);
// Remove any leading slash
if (projectRoot.startsWith('/')) {
  projectRoot = projectRoot.substring(1);
}

const requiredFiles = [
  'src/components/Header.astro',
  'src/components/Hero.astro',
  'src/components/Footer.astro',
  'src/layouts/Layout.astro',
  'src/pages/index.astro',
  'src/pages/products/index.astro',
  'src/pages/products/[id].astro',
  'src/data/products.json',
  'scripts/parse-catalogs.js'
];

console.log('Verifying required files...');
console.log('Project root: ' + projectRoot);
let missingFiles = [];

requiredFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  if (!fs.existsSync(fullPath)) {
    missingFiles.push(file);
  }
});

if (missingFiles.length === 0) {
  console.log('All required files are present');
} else {
  console.log('Missing files:');
  missingFiles.forEach(file => {
    console.log('  - ' + file);
  });
  process.exit(1);
}

// Verify products.json has data
try {
  const productsPath = path.join(projectRoot, 'src', 'data', 'products.json');
  const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
  console.log('Products file contains ' + productsData.length + ' products');
} catch (error) {
  console.error('Error reading products.json: ' + error.message);
  process.exit(1);
}

console.log('');
console.log('All verifications passed!');

