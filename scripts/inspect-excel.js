
import XLSX from 'xlsx';
import path from 'path';

const filePath = path.join(process.cwd(), 'Progetti', 'ttfstore.com', 'FORCOLD_ITA.xlsx');

try {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  console.log('Sheet name:', sheetName);
  console.log('Available sheets:', workbook.SheetNames);
  
  // Get the range of the worksheet
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  console.log('Range:', range);
  
  // Show first few rows as JSON
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
  console.log('First 5 rows:');
  for (let i = 0; i < Math.min(5, data.length); i++) {
    console.log('Row ' + i + ':', data[i]);
  }
  
  // Show headers if present
  if (data.length > 0) {
    console.log('\\nHeaders (first row):', data[0]);
  }
} catch (error) {
  console.error('Error:', error.message);
}

