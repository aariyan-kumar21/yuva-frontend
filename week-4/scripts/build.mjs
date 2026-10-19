import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

console.log('[build] Starting build...');

if (!fs.existsSync(srcDir)) {
  console.error(`[build] Error: src directory not found at ${srcDir}`);
  process.exit(1);
}

// Remove dist directory idempotently
if (fs.existsSync(distDir)) {
  fs.rmSync(distDir, { recursive: true, force: true });
}

fs.mkdirSync(distDir, { recursive: true });

// Copy all files and directories from src to dist
fs.cpSync(srcDir, distDir, { recursive: true });

console.log('[build] Successfully built dist/ from src/.');
