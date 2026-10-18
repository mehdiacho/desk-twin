/* Wraps index.html (authored as an Artifact-compatible fragment) into a real
   HTML document and copies the source tree into dist/.
   The fragment stays the canonical page; this only adds what a browser needs
   when nobody else is supplying the <head>. */
import { readFile, writeFile, rm, mkdir, cp } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

import { metadata } from './seo/metadata.mjs';
import { pages } from './seo/pages.mjs';
import { writeServicePages } from './seo/static-pages.mjs';
const root = path.dirname(fileURLToPath(import.meta.url));
process.chdir(root);
const output = path.resolve(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Invalid build destination');

const FRAGMENT = await readFile('index.html', 'utf8');
const split = FRAGMENT.indexOf('<header id="sitebar">');
if (split < 0) throw new Error('Missing document boundary');

const DOC = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
${metadata({...pages[0],title:'Mehdi Acho’s Working Room | 3D Modeling & Web Development',description:'Explore Mehdi Acho’s interactive desk, software projects and design work. 3D modeling, CAD and website development from Gaborone, Botswana.'})}
<meta name="theme-color" content="#382c23">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' fill='%23F7F5F0'/%3E%3Cpath d='M5 22h22M5 22l6-12h10l6 12M11 10v12M21 10v12' stroke='%231C1C1A' stroke-width='2' fill='none'/%3E%3C/svg%3E">
<style>
  html, body { height: 100%; }
  body { margin: 0; }
  img { max-width: 100%; }
  [hidden] { display: none !important; }
</style>
${FRAGMENT.slice(0, split).replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta name="viewport"[^>]*>/,'')}
</head>
<body>
${FRAGMENT.slice(split)}
</body>
</html>
`;

// three.js is vendored under /vendor, so scripts come only from this origin.
const HEADERS = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  X-Frame-Options: SAMEORIGIN
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: blob:; connect-src 'self'; base-uri 'none'; form-action 'none'

/src/*
  Cache-Control: public, max-age=0, must-revalidate
`;

await rm(output, { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await writeFile('dist/index.html', DOC);
await writeFile('dist/_headers', HEADERS);
await cp('src', 'dist/src', { recursive: true });
await cp('covers', 'dist/covers', { recursive: true });
await cp('assets', 'dist/assets', { recursive: true });
await cp('vendor', 'dist/vendor', { recursive: true });
await cp('seo/services.css','dist/services.css');
await cp('seo/work-assets','dist/portfolio-3d',{recursive:true});
await writeServicePages('dist','/services.css',JSON.parse(await readFile('seo/work-samples.json','utf8')));
console.log('dist/ built, including crawlable service pages');
