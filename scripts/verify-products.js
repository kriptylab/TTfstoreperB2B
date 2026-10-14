
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

const productsFile = path.join(projectRoot, 'src', 'data', 'products.json');

try {
  const data = JSON.parse(fs.readFileSync(productsFile, 'utf8'));
  
  console.log('Products file loaded successfully');
  console.log('Total products: ' + data.length);
  
  // Check brand distribution
  const brandCounts = {};
  data.forEach(product => {
    brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
  });
  
  console.log('Brand distribution:');
  for (const [brand, count] of Object.entries(brandCounts)) {
    console.log('  - ' + brand + ': ' + count + ' products');
  }
  
  // Check that all products have required fields
  const requiredFields = ['id', 'brand', 'name', 'price'];
  const missingFields = [];
  
  data.forEach((product, index) => {
    for (const field of requiredFields) {
      if (!(field in product) || product[field] === null || product[field] === undefined) {
        missingFields.push({ index: index, field: field });
      }
    }
  });
  
  if (missingFields.length === 0) {
    console.log('All products have required fields');
  } else {
    console.log('Some products are missing required fields:');
    missingFields.slice(0, 5).forEach(item => {
      console.log('  - Product at index ' + item.index + ' missing ' + item.field);
    });
    if (missingFields.length > 5) {
      console.log('  - And ' + (missingFields.length - 5) + ' more...');
    }
  }
  
  // Show first product as example
  console.log('');
  console.log('Example product (first item):');
  console.log(JSON.stringify(data[0], null, 2));
  
} catch (error) {
  console.error('Error loading or parsing products.json: ' + error.message);
  process.exit(1);
}

