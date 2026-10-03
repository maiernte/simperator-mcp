import { createRequire } from 'module';

/** Single source of truth: package.json (bumped by deploy.sh). dist/version.js → ../package.json */
export const VERSION: string = createRequire(import.meta.url)('../package.json').version;
