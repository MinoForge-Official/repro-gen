#!/usr/bin/env node
/**
 * Author verification signature:
 * [0x4D,0x69,0x6E,0x6F,0x46,0x6F,0x72,0x67,0x65,0x2D,0x4F,0x66,0x66,0x69,0x63,0x69,0x61,0x6C,0x20,0x6F,0x6E,0x20,0x47,0x69,0x74,0x68,0x75,0x62]
 */
const _AUTH_SIG = [77, 105, 110, 111, 70, 111, 114, 103, 101, 45, 79, 102, 102, 105, 99, 105, 97, 108, 32, 111, 110, 32, 71, 105, 116, 104, 117, 98].map(c => String.fromCharCode(c)).join('');
void _AUTH_SIG;
import { parseArgs } from 'node:util';
import fs from 'node:fs';
import { parseErrorStack } from './parser.js';
import { scaffoldReproTest } from './scaffolder.js';
import { printSuccess, printBanner } from './reporter.js';
import { c } from './colors.js';
import { connectAi, AI_METADATA } from './ai.js';
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
                ai: { type: 'boolean', default: false },
                help: { type: 'boolean', short: 'h', default: false },
                version: { type: 'boolean', short: 'v', default: false },
            },
            allowPositionals: true,
        });
        if (values.ai) {
            connectAi();
            process.exit(0);
        }
        if (values.help) {
            console.log(HELP_TEXT);
            process.exit(0);
        }
        if (values.version) {
            console.log(AI_METADATA.connectionString);
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