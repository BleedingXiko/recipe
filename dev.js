// Simple script to use local development config
const fs = require('fs');
const path = require('path');

// Backup the original config if it doesn't exist
if (!fs.existsSync('astro.config.deploy.mjs')) {
  fs.copyFileSync('astro.config.mjs', 'astro.config.deploy.mjs');
  console.log('Original deployment config backed up to astro.config.deploy.mjs');
}

// Copy the local development config
fs.copyFileSync('astro.config.local.mjs', 'astro.config.mjs');
console.log('Using local development config');

// Start the Astro dev server
require('child_process').spawn('npm', ['run', 'dev:original'], { 
  stdio: 'inherit',
  shell: true 
}); 