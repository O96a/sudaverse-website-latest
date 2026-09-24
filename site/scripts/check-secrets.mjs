// Fails when a tracked file looks like it contains a credential. This repository is public.
//   node scripts/check-secrets.mjs   (run from anywhere inside the repository)
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const files = execFileSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8' }).split('\0').filter(Boolean);

const PATTERNS = [
  [/-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/, 'private key'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}\b/, 'GitHub token'],
  [/\bxox[baprs]-[A-Za-z0-9-]{10,}\b/, 'Slack token'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'AWS access key id'],
  [/\bsk-[A-Za-z0-9]{32,}\b/, 'API secret key'],
  [/\bre_[A-Za-z0-9]{24,}\b/, 'Resend API key'],
  [/\bxkeysib-[a-f0-9]{40,}/, 'Brevo API key'],
  [/\b\d{8,10}:[A-Za-z0-9_-]{35}\b/, 'Telegram bot token'],
  // A value that starts with < $ { or a backtick is a placeholder in documentation, not a credential.
  [/(?:SMTP|MAIL)_PASS(?:WORD)?\s*=\s*(?![<${`])[^\s#'"`]{4,}/, 'SMTP password assignment'],
];
const SKIP = /(\.(png|jpe?g|webp|avif|gif|ico|woff2?|pdf)$|package-lock\.json$|(^|\/)node_modules\/)/i;

const failures = [];
for (const f of files) {
  if (SKIP.test(f)) continue;
  const p = resolve(root, f);
  let size = 0;
  try {
    size = statSync(p).size;
  } catch {
    continue; // deleted in the working tree
  }
  if (size > 2_000_000) continue;
  const text = readFileSync(p, 'utf8');
  for (const [re, what] of PATTERNS) if (re.test(text)) failures.push(`${f}: looks like a ${what}`);
}
if (failures.length) {
  console.error(`Secret scan failed:\n - ${failures.join('\n - ')}`);
  process.exit(1);
}
console.log(`Secret scan passed: ${files.length} tracked files.`);
