import fs from 'node:fs';
import path from 'node:path';
import { TestFramework } from './types.js';

export function detectTestFramework(cwd = process.cwd(), isPython = false): TestFramework {
  if (isPython) {
    return 'pytest';
  }

  const pkgPath = path.join(cwd, 'package.json');
  if (fs.existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
      const deps = { ...pkg.dependencies, ...pkg.devDependencies };

      if (deps['vitest']) return 'vitest';
      if (deps['jest'] || deps['@types/jest']) return 'jest';
      if (deps['mocha']) return 'mocha';
    } catch {
      // Ignore
    }
  }

  // Check python files
  if (fs.existsSync(path.join(cwd, 'pytest.ini')) || fs.existsSync(path.join(cwd, 'requirements.txt'))) {
    return 'pytest';
  }

  // Default modern standard
  return 'vitest';
}
