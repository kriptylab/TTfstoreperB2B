
import fs from 'fs';
import path from 'path';

const file = 'src/components/Header.astro';
const fullPath = path.join(process.cwd(), file);
console.log('Checking file: ' + file);
console.log('Process cwd: ' + process.cwd());
console.log('Full path: ' + fullPath);
console.log('File exists: ' + fs.existsSync(fullPath));

// Also try relative to current directory
const relativeExists = fs.existsSync('./' + file);
console.log('Relative exists: ' + relativeExists);

