import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const getArgValue = (name) => {
  const idx = args.indexOf(name);
  if (idx === -1) return undefined;
  return args[idx + 1];
};

const mode = (getArgValue('--mode') ?? 'development').toLowerCase();
const requiredList = (getArgValue('--required') ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const prefix = getArgValue('--prefix') ?? 'NG_APP_';
const envFilePath = getArgValue('--env') ?? '.env';
const exampleEnvFilePath = getArgValue('--example') ?? '.env.example';
const outFile =
  getArgValue('--out') ??
  path.join(
    'src',
    'environments',
    mode === 'production'
      ? 'environment.production.ts'
      : mode === 'development'
        ? 'environment.development.ts'
        : 'environment.ts'
  );

const parseDotEnv = (content) => {
  const result = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    result[key] = value;
  }
  return result;
};

if (fs.existsSync(envFilePath)) {
  const parsed = parseDotEnv(fs.readFileSync(envFilePath, 'utf8'));
  for (const [k, v] of Object.entries(parsed)) {
    if (process.env[k] === undefined) process.env[k] = v;
  }
}

for (const key of requiredList) {
  if (!process.env[key]) {
    console.error(`Missing env: ${key}`);
    process.exit(1);
  }
}

const exampleKeys = new Set();
if (fs.existsSync(exampleEnvFilePath)) {
  const parsed = parseDotEnv(fs.readFileSync(exampleEnvFilePath, 'utf8'));
  for (const key of Object.keys(parsed)) {
    if (!key.startsWith(prefix)) continue;
    exampleKeys.add(key);
  }
}

const toCamel = (s) =>
  s
    .toLowerCase()
    .split('_')
    .filter(Boolean)
    .map((p, idx) => (idx === 0 ? p : p[0].toUpperCase() + p.slice(1)))
    .join('');

const env = {
  production: mode === 'production',
  apiBaseUrl: '',
  paypalClientId: ''
};

for (const key of exampleKeys) {
  const prop = toCamel(key.slice(prefix.length));
  if (env[prop] === undefined) env[prop] = '';
}

for (const [key, value] of Object.entries(process.env)) {
  if (!key.startsWith(prefix)) continue;
  const prop = toCamel(key.slice(prefix.length));
  env[prop] = value ?? '';
}

const keys = ['production', ...Object.keys(env).filter((k) => k !== 'production').sort()];
const lines = [
  'export const environment = {',
  ...keys.map((k) => `    ${k}: ${JSON.stringify(env[k])},`),
  '};',
  ''
];

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, lines.join('\n'), 'utf8');
