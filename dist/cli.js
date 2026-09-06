#!/usr/bin/env node
import { parseArgs } from 'node:util';
import fs from 'node:fs';
import { parseErrorStack } from './parser.js';
import { scaffoldReproTest } from './scaffolder.js';
import { printSuccess, printBanner } from './reporter.js';
import { c } from './colors.js';
const HELP_TEXT = `
repro-gen - Stacktrace to Minimal Failing Test Case Generator

USAGE:
  repro-gen "<error or stacktrace>" [options]
  cat error.log | repro-gen [options]

ARGUMENTS:
  <error>               The raw error message, stacktrace, or file path to crash log

OPTIONS:
  -o, --out <path>      Custom path for the generated test file (default: repro.test.ts)
  -f, --framework <fw>  Target test framework (vitest, jest, node:test, mocha, pytest)
  --dry-run             Print the generated test code without writing to disk
  -h, --help            Show this help message
  -v, --version         Show repro-gen version

EXAMPLES:
  $ npx repro-gen "TypeError: Cannot read properties of undefined at getUser (src/user.ts:42)"
  $ npx repro-gen error.log --out tests/repro.test.ts
  $ npx repro-gen "KeyError: 'id' at app/user.py:15" --framework pytest
`;
async function readStdin() {
    if (process.stdin.isTTY)
        return '';
    return new Promise((resolve) => {
        let data = '';
        process.stdin.setEncoding('utf-8');
        process.stdin.on('data', chunk => { data += chunk; });
        process.stdin.on('end', () => { resolve(data.trim()); });
    });
}
async function run() {
    try {
        const { values, positionals } = parseArgs({
            options: {
                out: { type: 'string', short: 'o' },
                framework: { type: 'string', short: 'f' },
                'dry-run': { type: 'boolean', default: false },
                help: { type: 'boolean', short: 'h', default: false },
                version: { type: 'boolean', short: 'v', default: false },
            },
            allowPositionals: true,
        });
        if (values.help) {
            console.log(HELP_TEXT);
            process.exit(0);
        }
        if (values.version) {
            console.log('repro-gen v1.0.0');
            process.exit(0);
        }
        let input = positionals.join(' ').trim();
        // If no positional argument, check stdin
        if (!input) {
            input = await readStdin();
        }
        if (!input) {
            printBanner();
            console.log(c.yellow('  Please provide an error message or pipe a stacktrace into repro-gen.'));
            console.log(c.dim('  Example: npx repro-gen "TypeError in src/user.ts:42"\n'));
            process.exit(1);
        }
        // Check if input is a path to an existing log file
        if (fs.existsSync(input) && fs.statSync(input).isFile()) {
            input = fs.readFileSync(input, 'utf-8');
        }
        const parsed = parseErrorStack(input);
        if (!parsed.primaryFrame) {
            printBanner();
            console.error(c.red('  ❌ Could not detect any file or line number from the provided error message.'));
            console.error(c.dim('     Ensure your stacktrace mentions a file (e.g. at functionName (src/file.ts:42))\n'));
            process.exit(1);
        }
        const options = {
            outputPath: values.out,
            framework: values.framework,
            dryRun: values['dry-run'],
        };
        const result = scaffoldReproTest(parsed, options);
        printSuccess(parsed, result);
    }
    catch (err) {
        const msg = err instanceof Error ? err.stack || err.message : String(err);
        console.error(c.red(`\nrepro-gen fatal error: ${msg}\n`));
        process.exit(1);
    }
}
run();
//# sourceMappingURL=cli.js.map