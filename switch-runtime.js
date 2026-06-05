const fs = require('fs');
const path = require('path');

const targetRuntime = process.argv[2] || 'nodejs'; // 'edge' or 'nodejs'
const apiDir = path.join(__dirname, 'src', 'app', 'api');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      walk(filePath);
    } else if (file === 'route.ts') {
      let content = fs.readFileSync(filePath, 'utf-8');
      if (targetRuntime === 'edge') {
        content = content.replace(/export const runtime = 'nodejs';/g, "export const runtime = 'edge';");
        content = content.replace(/export const runtime = "nodejs";/g, "export const runtime = 'edge';");
      } else {
        content = content.replace(/export const runtime = 'edge';/g, "export const runtime = 'nodejs';");
        content = content.replace(/export const runtime = "edge";/g, "export const runtime = 'nodejs';");
      }
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`Updated runtime to ${targetRuntime} in ${filePath}`);
    }
  }
}

walk(apiDir);
