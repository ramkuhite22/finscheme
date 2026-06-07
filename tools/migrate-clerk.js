import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

async function processFile(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  
  // 1. Match Clerk CDN script tag (multi-line or single-line)
  const clerkCdnRegex = /<script\s+[^>]*clerk-js[^>]*>([\s\S]*?)<\/script>/gi;
  
  // 2. Match clerk-init.js script tag
  const clerkInitRegex = /<script\s+src="([^"]*?)clerk-init\.js"([^>]*)><\/script>/gi;
  
  let updated = content;
  
  if (clerkCdnRegex.test(content)) {
    updated = updated.replace(clerkCdnRegex, '<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>');
  }
  
  if (clerkInitRegex.test(content)) {
    updated = updated.replace(clerkInitRegex, '<script src="$1supabase-init.js"$2></script>');
  }
  
  if (content !== updated) {
    await fs.writeFile(filePath, updated, 'utf8');
    console.log(`Migrated: ${path.relative(projectRoot, filePath)}`);
    return true;
  }
  
  return false;
}

async function scanDirectory(dirPath) {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'graphify-out') {
        continue;
      }
      await scanDirectory(fullPath);
    } else if (entry.isFile() && entry.name.endsWith('.html')) {
      // Don't modify login.html and signup.html as we already rewrote them manually
      if (entry.name === 'login.html' || entry.name === 'signup.html') {
        continue;
      }
      await processFile(fullPath);
    }
  }
}

async function main() {
  console.log('Starting Clerk-to-Supabase script migration...');
  await scanDirectory(projectRoot);
  console.log('Migration complete!');
}

main().catch(console.error);
