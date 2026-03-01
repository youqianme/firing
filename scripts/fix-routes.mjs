import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const apiDir = path.join(__dirname, '../apps/web/app/api');

const filesToFix = [
  'liabilities/route.ts',
  'transactions/route.ts',
  'settings/route.ts',
  'market-data/route.ts',
  'settings/test-data/route.ts',
  'assets/[id]/route.ts',
  'earnings/route.ts'
];

for (const relativePath of filesToFix) {
  const filePath = path.join(apiDir, relativePath);
  if (!fs.existsSync(filePath)) {
    console.log(`Skipping ${relativePath} (not found)`);
    continue;
  }

  let content = fs.readFileSync(filePath, 'utf-8');

  // Step 1: Remove top-level initializeDatabase() call
  content = content.replace(/\n\s*initializeDatabase\(\);\s*\n/g, '\n');

  // Step 2: Add await initializeDatabase() after userId line in each handler
  const handlerPatterns = [
    /(export async function (GET|POST|PUT|DELETE)\(request: Request\)\s*\{\s*const userId = [^;]+;\n)/g
  ];

  for (const pattern of handlerPatterns) {
    content = content.replace(pattern, '$1  await initializeDatabase();\n');
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Fixed ${relativePath}`);
}

console.log('\nAll files fixed!');
