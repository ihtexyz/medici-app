#!/usr/bin/env node
/*
Updates .env with VITE_CENT_ADDRESSES_JSON from a deployment-manifest.json
Usage: node scripts/update-cent-env.js /absolute/path/to/deployment-manifest.json [./.env]
*/

const fs = require('fs');
const path = require('path');

function main() {
  const manifestPath = process.argv[2];
  const envPath = process.argv[3] || path.resolve(process.cwd(), '.env');

  if (!manifestPath) {
    console.error('Usage: node scripts/update-cent-env.js /path/to/deployment-manifest.json [./.env]');
    process.exit(1);
  }

  const manifestRaw = fs.readFileSync(manifestPath, 'utf-8');
  const manifestJson = JSON.stringify(JSON.parse(manifestRaw)); // minified single line
  const quoted = `VITE_CENT_ADDRESSES_JSON="${manifestJson.replace(/"/g, '\\"')}"`;

  let envContent = '';
  try {
    envContent = fs.readFileSync(envPath, 'utf-8');
  } catch (_) {
    // file may not exist; will create
  }

  if (envContent.includes('VITE_CENT_ADDRESSES_JSON=')) {
    envContent = envContent.replace(/VITE_CENT_ADDRESSES_JSON=.*(?:\n|$)/, `${quoted}\n`);
  } else {
    envContent += (envContent.endsWith('\n') ? '' : '\n') + quoted + '\n';
  }

  fs.writeFileSync(envPath, envContent);
  console.log(`Updated ${envPath} with VITE_CENT_ADDRESSES_JSON from ${manifestPath}`);
}

main();





