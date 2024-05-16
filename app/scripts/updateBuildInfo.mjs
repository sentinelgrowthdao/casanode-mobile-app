import { writeFileSync } from 'fs';
import { resolve } from 'path';

const buildInfoPath = resolve('src/build.json');
const packageJsonPath = resolve('package.json');

import packageJson from '../package.json' assert { type: 'json' };

const buildInfo = {
  version: packageJson.version,
  buildDate: new Date().toISOString(),
};

writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));

console.log('Build info updated:', buildInfo);