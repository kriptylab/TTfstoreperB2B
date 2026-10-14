
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

const testFiles = [
  'src/products/index.astro',
  'src/products/[id].astro',
  'src/data/products.json'
];

console.log('Project root: ' + projectRoot);
testFiles.forEach(file => {
  const fullPath = path.join(projectRoot, file);
  const exists = fs.existsSync(fullPath);
  console.log(file + ': ' + exists + ' (full path: ' + fullPath + ')');
});

