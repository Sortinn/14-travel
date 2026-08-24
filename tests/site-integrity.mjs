import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const guidePath = resolve(root, 'guides/2026-family-car-shortlist.html');
const retiredPdfPath = resolve(root, 'downloads/2026-family-car-shortlist.pdf');
const indexPath = resolve(root, 'index.html');
const readmePath = resolve(root, 'README.md');
const changelogPath = resolve(root, 'docs/更新日志.md');

assert.ok(existsSync(guidePath), 'missing family car guide HTML');
assert.ok(!existsSync(retiredPdfPath), 'family car guide should be shared through Pages, without a PDF copy');

const guide = readFileSync(guidePath, 'utf8');
assert.match(guide, /<title>家庭换车候选清单｜长途舒适版<\/title>/);
assert.match(guide, /id="drive-title"/);
assert.match(guide, /2026 款乐道 L90/);

const index = readFileSync(indexPath, 'utf8');
assert.match(index, /id="before-departure"/);
assert.match(index, /href="guides\/2026-family-car-shortlist\.html"/);
assert.doesNotMatch(index, /downloads\/2026-family-car-shortlist\.pdf/);
assert.match(index, /家庭长途用车候选清单/);

const readme = readFileSync(readmePath, 'utf8');
assert.match(readme, /guides\//);
assert.match(readme, /家庭长途用车候选清单/);
assert.match(readme, /https:\/\/sortinn\.github\.io\/14-travel\/guides\/2026-family-car-shortlist\.html/);

const changelog = readFileSync(changelogPath, 'utf8');
assert.match(changelog, /2026-08-24/);
assert.match(changelog, /出发之前/);

console.log('site integrity checks passed');
